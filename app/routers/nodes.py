import json
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import jwt, JWTError
from app.auth import token_required
from .. import crud, schemas, models
from ..database import get_db
import os
from ..ccsp import ccsp
from app.config import settings

router = APIRouter(
    prefix="/nodes",
    tags=["nodes"],
)

def get_user_id_from_token(auth_header: str) -> int:
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    scheme, _, atoken = auth_header.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=403, detail="Invalid authorization scheme")
    try:
        payload = jwt.decode(atoken, settings.JWT_SECRET_KEY, "HS256")
    except JWTError as exc:
        raise HTTPException(
            status_code=403, detail="Invalid token or expired token"
        ) from exc
    return payload.get("sub")

@router.post("/")
@token_required
def create_node(_request: Request, node: schemas.NodeCreate, db: Session = Depends(get_db)):
    user_id = get_user_id_from_token(_request.headers.get("Authorization"))
    node.user_id = user_id  # Set the user_id in the node schema

    if crud.create_node(db=db, node=node):
        return HTTPException(status_code=201, detail="Node created")
    return HTTPException(status_code=400, detail="Node not created")

@router.post("/ccsp/", response_model=schemas.NodeCCSP)
async def create_ccsp_node(
    _request: Request,
    cert_file: UploadFile = File(...),
    key_file: UploadFile = File(...),
    node: str = Form(...),  # Accept the node data as a string from multipart form
    db: Session = Depends(get_db)
):
    print("Creating CCSP node")
    user_id = get_user_id_from_token(_request.headers.get("Authorization"))
    print(user_id)
    try:
        node_data = json.loads(node)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON provided for node data")

    node_data["user_id"] = user_id  # Add user_id to node data
    node_schema = schemas.NodeCCSP(**node_data)  # Use Pydantic to validate the structure

    # Directory paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    certs_dir = os.path.join(base_dir, "certificates", node_schema.node_id)
    
    # Create the node_id directory inside certificates if it doesn't exist
    if not os.path.exists(certs_dir):
        os.makedirs(certs_dir)
    
    # Define file paths
    cert_file_path = os.path.join(certs_dir, cert_file.filename)
    key_file_path = os.path.join(certs_dir, key_file.filename)
    
    # Save the certificate and key files
    with open(cert_file_path, "wb") as cert_out:
        cert_out.write(await cert_file.read())    
    with open(key_file_path, "wb") as key_out:
        key_out.write(await key_file.read())
    
    # Example call to ccsp
    ccsp_id = ccsp(node_schema.node_id, node_schema.url, cert_file_path, key_file_path)
    if ccsp_id[1] == 201:
        created_node = crud.create_ccsp_node(
            db=db, 
            node=node_schema,  # Use the validated Pydantic model
            ccsp_id=ccsp_id[0], 
            cert_path=cert_file_path, 
            key_path=key_file_path
        )
        return schemas.NodeCCSP.from_orm(created_node)
    
    raise HTTPException(status_code=400, detail="Node not created")

@router.get("/{node_id}", response_model=schemas.Node)
@token_required
def read_node(_request: Request, node_id: str, db: Session = Depends(get_db)):
    user_id = get_user_id_from_token(_request.headers.get("Authorization"))
    db_node = crud.get_node(db=db, node_id=node_id, user_id=user_id)
    if db_node is None:
        raise HTTPException(status_code=404, detail="Node not found")
    return db_node

@router.get("/all/{node_id}", response_model=schemas.NodeWithDetails)
@token_required
def get_node_with_details(_request: Request, node_id: str, db: Session = Depends(get_db)):
    user_id = get_user_id_from_token(_request.headers.get("Authorization"))
    db_node = db.query(models.Node).filter(models.Node.node_id == node_id, models.Node.user_id == user_id).first()

    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Use eval() to convert the string 'parameter_id' into a list
    try:
        parameter_ids = eval(db_node.parameter_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid parameter_id format{e}")

    # Ensure that the result is a list
    if not isinstance(parameter_ids, list):
        raise HTTPException(status_code=400, detail="parameter_id should be a list")

    # Query each parameter by ID and collect the results
    db_parameters = []
    for param_id in parameter_ids:
        param = db.query(models.Parameter).filter(models.Parameter.id == param_id).first()
        if param:
            db_parameters.append(param)

    # Fetch vertical name
    vertical_name = db_node.vertical.name if db_node.vertical else None

    # Prepare the response data
    response_data = {
        "node_id": db_node.node_id,
        "platform": db_node.platform,
        "protocol": db_node.protocol,
        "frequency": db_node.frequency,
        "status": db_node.services,  # Ensure 'status' matches 'services' in the schema
        "vertical_name": vertical_name,
        "parameters": db_parameters  # Return the list of parameters
    }
    return response_data

@router.get("/", response_model=List[schemas.Node])
@token_required
def read_nodes(_request: Request, skip: int = 0, limit: int = 10, platform: Optional[str] = None, db: Session = Depends(get_db)):
    user_id = get_user_id_from_token(_request.headers.get("Authorization"))
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_nodes(db=db, skip=skip, limit=limit, platforms=[platform] if platform else user.platform_access, verticals=user.verticals, user_id=user_id)

@router.put("/{node_id}", response_model=schemas.Node)
@token_required
def update_node(_request: Request, node_id: str, node_update: schemas.NodeUpdate, db: Session = Depends(get_db)):
    user_id = get_user_id_from_token(_request.headers.get("Authorization"))
    return crud.update_node(db=db, node_id=node_id, node_update=node_update, user_id=user_id)

@router.delete("/{node_id}")
@token_required
def delete_node(_request: Request, node_id: str, db: Session = Depends(get_db)):
    user_id = get_user_id_from_token(_request.headers.get("Authorization"))
    return crud.delete_node(db=db, node_id=node_id, user_id=user_id)

@router.get("/vertical/{vertical_id}", response_model=List[schemas.Node])
@token_required
def get_nodes_by_vertical(_request: Request, vertical_id: int, platform: Optional[str] = None, db: Session = Depends(get_db)):
    user_id = get_user_id_from_token(_request.headers.get("Authorization"))
    db_nodes = db.query(models.Node).filter(models.Node.vertical_id == vertical_id, models.Node.user_id == user_id)
    if platform:
        db_nodes = db_nodes.filter(models.Node.platform.ilike(f"%{platform.lower()}%"))
    db_nodes = db_nodes.all()

    if not db_nodes:
        raise HTTPException(status_code=404, detail="No nodes found for the specified vertical")

    return db_nodes