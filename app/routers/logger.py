from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
from datetime import datetime
from app.auth import token_required
from jose import jwt, JWTError
from app.config import settings
router = APIRouter(prefix="/logger", tags=["logger"])
base_dir = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(base_dir,"logs")

class TimestampRequest(BaseModel):
    timestamp: str

def get_user_id_from_request(request: Request):
    authorization = request.headers.get("Authorization")
    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization scheme")  
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        print("User ID", user_id)
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/")
async def get_latest_log(request: Request, db: Session = Depends(get_db)):
    user_id = get_user_id_from_request(request)
    latest_simulation = db.query(models.Simulation).filter(models.Simulation.user_id == user_id).order_by(models.Simulation.timestamp.desc()).first()
    if not latest_simulation:
        raise HTTPException(status_code=404, detail="No simulations found for the user")
        
    timestamp = latest_simulation.timestamp
    file_name = f"{timestamp}.json"
    file_path = os.path.join(LOGS_DIR, user_id, file_name)
        
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        raise HTTPException(status_code=404, detail="File not found")


@router.post("/")
async def get_log_by_timestamp(request: Request, timestamp_request: TimestampRequest, db: Session = Depends(get_db)):    
    user_id = get_user_id_from_request(request)
    
    file_name = f"{timestamp_request.timestamp}.json"
    file_path = os.path.join(LOGS_DIR, user_id, file_name)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        raise HTTPException(status_code=404, detail="File not found")