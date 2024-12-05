from fastapi import APIRouter, HTTPException, Depends, Request, Header, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..database import get_db
from ..auth import decode_jwt  # Assuming you have a decode_jwt function to decode the JWT token
from sqlalchemy import func
from jose import jwt, JWTError
from ..config import settings

router = APIRouter(prefix="/simulations", tags=["simulations"])

def validate_token(authorization: str = Header(None)):
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
    return user_id

@router.post("/", response_model=schemas.Simulation)
def create_simulation(simulation: schemas.SimulationCreate, db: Session = Depends(get_db)):
    return crud.create_simulation(db=db, simulation=simulation)

@router.get("/", response_model=List[schemas.Simulation])
def read_simulations(authorization: str = Header(None), db: Session = Depends(get_db)):
    user_id = validate_token(authorization)
    simulations = crud.get_simulations(db, user_id=user_id)
    return simulations

@router.get("/{simulation_id}", response_model=schemas.Simulation)
def read_simulation(simulation_id: int, authorization: str = Header(None), db: Session = Depends(get_db)):
    user_id = validate_token(authorization)
    db_simulation = crud.get_simulation(db, simulation_id=simulation_id, user_id=user_id)
    if db_simulation is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return db_simulation

@router.put("/{simulation_id}", response_model=schemas.Simulation)
def update_simulation(simulation_id: int, simulation: schemas.SimulationUpdate, authorization: str = Header(None), db: Session = Depends(get_db)):
    user_id = validate_token(authorization)
    db_simulation = crud.get_simulation(db, simulation_id=simulation_id, user_id=user_id)
    if db_simulation is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return crud.update_simulation(db=db, simulation_id=simulation_id, simulation=simulation)

@router.delete("/{simulation_id}", response_model=schemas.Simulation)
def delete_simulation(simulation_id: int, authorization: str = Header(None), db: Session = Depends(get_db)):
    user_id = validate_token(authorization)
    db_simulation = crud.get_simulation(db, simulation_id=simulation_id, user_id=user_id)
    if db_simulation is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return crud.delete_simulation(db=db, simulation_id=simulation_id)

@router.get("/analytic/statistics", response_model=dict)
def get_simulation_statistics(db: Session = Depends(get_db), authorization: str = Header(None)):
    print("get_simulation_statistics")
    user_id = validate_token(authorization)
    simulations = crud.get_simulations(db, user_id=user_id)
    print("Simulations", simulations)
    total_success = sum(sim.success for sim in simulations)
    total_failure = sum(sim.failure for sim in simulations)
    total = total_success + total_failure

    total_success_ccsp = sum(sim.success for sim in simulations if sim.platform == 'ccsp')
    total_failure_ccsp = sum(sim.failure for sim in simulations if sim.platform == 'ccsp')
    total_ccsp = total_success_ccsp + total_failure_ccsp

    total_success_om2m = sum(sim.success for sim in simulations if sim.platform == 'om2m')
    total_failure_om2m = sum(sim.failure for sim in simulations if sim.platform == 'om2m')
    total_om2m = total_success_om2m + total_failure_om2m
    total_success_mobius = sum(sim.success for sim in simulations if sim.platform == 'mobius')
    total_failure_mobius = sum(sim.failure for sim in simulations if sim.platform == 'mobius')
    total_mobius = total_success_mobius + total_failure_mobius
    return {
        "total_success": total_success,
        "total_failure": total_failure,
        "total": total,
        "total_success_ccsp": total_success_ccsp,
        "total_failure_ccsp": total_failure_ccsp,
        "total_ccsp": total_ccsp,
        "total_success_om2m": total_success_om2m,
        "total_failure_om2m": total_failure_om2m,
        "total_om2m": total_om2m,
        "total_success_mobius": total_success_mobius,
        "total_failure_mobius": total_failure_mobius,
        "total_mobius": total_mobius
    }