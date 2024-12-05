from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from ..database import get_db
router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
)

# Dependency

@router.post("/", response_model=schemas.Alerts)
def create_alert(alert: schemas.AlertsCreate,request: Request,db: Session = Depends(get_db)):
    db_alert = models.Alerts(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    username = request.cookies.get("username")
    if not username:
        raise HTTPException(status_code=401, detail="Unauthorized - no session found")
    
    # Print the username (or handle it as needed)
    print("Authenticated username:", username)
    return db_alert

@router.get("/", response_model=List[schemas.Alerts])
def read_alerts( db: Session = Depends(get_db)):
    alerts = db.query(models.Alerts).order_by(models.Alerts.timestamp.desc()).all()
    return alerts

@router.get("/{timestamp}", response_model=schemas.Alerts)
def read_alert(timestamp: int, db: Session = Depends(get_db)):
    alert = db.query(models.Alerts).filter(models.Alerts.timestamp == timestamp).first()
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.put("/{timestamp}", response_model=schemas.Alerts)
def update_alert(timestamp: int, alert: schemas.AlertsUpdate, db: Session = Depends(get_db)):
    db_alert = db.query(models.Alerts).filter(models.Alerts.timestamp == timestamp).first()
    if db_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    for key, value in alert.dict(exclude_unset=True).items():
        setattr(db_alert, key, value)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.delete("/{timestamp}", response_model=schemas.Alerts)
def delete_alert(timestamp: int, db: Session = Depends(get_db)):
    db_alert = db.query(models.Alerts).filter(models.Alerts.timestamp == timestamp).first()
    if db_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(db_alert)
    db.commit()
    return db_alert
