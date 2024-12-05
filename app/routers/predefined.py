from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from ..models import predefined
from ..schemas import PredefinedBase, PredefinedCreate, PredefinedUpdate, Predefined, RequestBody
from ..database import get_db
from ..config import settings
from ..auth import token_required

router = APIRouter(
    prefix="/config",
    tags=["config"],
)

# Test Body for Postman:
# {
#     "configuration": [
#         {
#             "node_id": "node_1",
#             "frequency": 10,
#             "parameters": [
#                 {
#                     "name": "param1",
#                     "min": 0.1,
#                     "max": 1.0
#                 }
#             ],
#             "platform": "platform_1",
#             "protocol": "protocol_1"
#         }
#     ],
#     "sim_type": "type_1",
#     "user_id": 1
# }

@router.post("/predefined", response_model=dict)
async def create_predefined(
    predefined_data: PredefinedCreate,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload missing 'sub' field",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print("Step 1 passed")
    configuration_dict = [request_body.dict() for request_body in predefined_data.configuration]
    new_predefined = predefined(
        configuration=configuration_dict,
        sim_type=predefined_data.sim_type,
        user_id=user_id
    )
    print("Step 2 passed")
    db.add(new_predefined)
    print("Step 3 passed")
    db.commit()
    print("Step 4 passed")
    db.refresh(new_predefined)
    print("Step 5 passed")
    return {"message": "Predefined configuration created successfully", "status": 200}

@router.get("/predefined", response_model=list[Predefined])
async def get_predefined(db: Session = Depends(get_db)):
    
    predefined_item = db.query(predefined).all()
    print(len(predefined_item))
    if not predefined_item:
        raise HTTPException(status_code=404, detail="Predefined configuration not found")
    return predefined_item

@router.put("/predefined/{predefined_id}", response_model=Predefined)
async def update_predefined(predefined_id: int, predefined_data: PredefinedUpdate, db: Session = Depends(get_db)):
    predefined_item = db.query(predefined).filter(predefined.id == predefined_id).first()
    if not predefined_item:
        raise HTTPException(status_code=404, detail="Predefined configuration not found")
    
    for key, value in predefined_data.dict(exclude_unset=True).items():
        setattr(predefined_item, key, value)
    
    db.commit()
    db.refresh(predefined_item)
    return predefined_item

@router.delete("/predefined/{predefined_id}", response_model=dict)
async def delete_predefined(
    predefined_id: int,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload missing 'sub' field",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    predefined_item = db.query(predefined).filter(predefined.id == predefined_id).first()
    if not predefined_item:
        raise HTTPException(status_code=404, detail="Predefined configuration not found")
    
    db.delete(predefined_item)
    db.commit()
    return {"message": "Predefined configuration deleted successfully", "status": 200}

@router.get("/predefined/single", response_model=list[Predefined])
async def get_single_predefined(
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    print("Authenticated")
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload missing 'sub' field",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    predefined_item = db.query(predefined).filter(predefined.user_id == user_id, predefined.sim_type == "single").all()
    if not predefined_item:
        raise HTTPException(status_code=404, detail="Predefined configuration not found")
    return predefined_item

@router.get("/predefined/multiple", response_model=list[Predefined])
async def get_multiple_predefined(
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload missing 'sub' field",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    predefined_items = db.query(predefined).filter(predefined.user_id == user_id, predefined.sim_type == "multiple").all()
    if not predefined_items:
        raise HTTPException(status_code=404, detail="Predefined configurations not found")
    return predefined_items


