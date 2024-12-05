from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas
from ..database import get_db
from ..auth import token_required

router = APIRouter(
    prefix="/parameters",
    tags=["parameters"],
)

@router.post("/", response_model=schemas.Parameter)
@token_required
def create_parameter(_request: Request,parameter: schemas.ParameterCreate, db: Session = Depends(get_db)):
    return crud.create_parameter(db=db, parameter=parameter)

@router.get("/")
@token_required
def read_parameters(_request: Request,skip: int = 0, limit: int = 10, vertical_id: Optional[int] = None, db: Session = Depends(get_db)):
    print("Enter")
    if vertical_id is not None:
        parameters = crud.get_parameters_by_vertical(db=db, vertical_id=vertical_id)
    else:
        parameters = crud.get_parameters(db=db, skip=skip, limit=limit)
    
    if not parameters:
        raise HTTPException(status_code=404, detail="No parameters found")
    
    # Convert parameters to human-readable format and filter out _sa_instance_state
    readable_parameters = [{k: v for k, v in parameter.__dict__.items() if k != '_sa_instance_state'} for parameter in parameters]
    print("Parameters", readable_parameters)
    return readable_parameters

@router.get("/{parameter_id}", response_model=schemas.Parameter)
@token_required
def read_parameter(_request: Request,parameter_id: int, db: Session = Depends(get_db)):
    parameter = crud.get_parameter(db, parameter_id=parameter_id)
    if parameter is None:
        raise HTTPException(status_code=404, detail="Parameter not found")
    
    # Convert parameter to human-readable format and filter out _sa_instance_state
    readable_parameter = {k: v for k, v in parameter.__dict__.items() if k != '_sa_instance_state'}
    
    return readable_parameter

@router.put("/{parameter_id}", response_model=schemas.Parameter)
@token_required
def update_parameter(_request: Request,parameter_id: int, parameter: schemas.ParameterCreate, db: Session = Depends(get_db)):
    updated_parameter = crud.update_parameter(db=db, parameter_id=parameter_id, parameter_update=parameter)
    if updated_parameter is None:
        raise HTTPException(status_code=404, detail="Parameter not found")
    return updated_parameter

@router.delete("/{parameter_id}", response_model=schemas.Parameter)
@token_required
def delete_parameter(_request: Request,parameter_id: int, db: Session = Depends(get_db)):
    deleted_parameter = crud.delete_parameter(db=db, parameter_id=parameter_id)
    if deleted_parameter is None:
        raise HTTPException(status_code=404, detail="Parameter not found")
    return deleted_parameter
