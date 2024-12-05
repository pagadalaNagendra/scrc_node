from fastapi import APIRouter, Depends, HTTPException, status, Request, Response

from sqlalchemy.orm import Session

from sqlalchemy.orm import Session

from .. import schemas, crud

from ..models import User, TokenTable, Vertical
from ..schemas import UserCreate, RequestDetails, AuthResponse, logout, platformUpdate, deleteUser

from ..database import get_db

from ..auth import decode_refresh_jwt, create_refresh_token, create_access_token, verify_password, get_hashed_password, token_required, admin_required

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/create-user")
def create_user(user: UserCreate, _request: Request, db: Session = Depends(get_db)):
    _ = _request
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    encrypted_password = get_hashed_password(user.password)
    vertical_ids = []
    for vertical in user.verticals:
        vertical_obj = db.query(Vertical).filter(Vertical.name == vertical).first()
        if vertical_obj:
            vertical_ids.append(vertical_obj.id)
    user.verticals = vertical_ids
    if user.user_type.lower() == "guest":
        new_user = User(
            username=user.username,
            email=user.email,
            password=encrypted_password,
            user_type=3,
            platform_access=[],
            verticals=[]
        )
    elif user.user_type.lower() == "user":        
        new_user = User(
            username=user.username,
            email=user.email,
            password=encrypted_password,
            user_type=2,
            platform_access=user.platform_access,
            verticals=user.verticals
        )
    
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User created successfully"}

@router.post("/login", response_model=AuthResponse)
def login(request: RequestDetails, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    hashed_pas = user.password
    if not verify_password(request.password, hashed_pas):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    token_db = TokenTable(user_id=user.id, access_token=access_token, refresh_token=refresh_token, status=True)
    db.add(token_db)
    db.commit()
    db.refresh(token_db)
    
    response.set_cookie(key="username", value=user.username)
    if(user.user_type == 1):
        return {"username": user.username, "access_token": access_token, "refresh_token": refresh_token, "userId": user.id, "role": "admin"}
    elif(user.user_type == 3):
        return {"username": user.username, "access_token": access_token, "refresh_token": refresh_token, "userId": user.id, "role": "guest"}
    return {"username": user.username, "access_token": access_token, "refresh_token": refresh_token, "userId": user.id, "role": "user"}

@router.get("/getusers")
@token_required
@admin_required
def get_users(_request: Request, db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
    

@router.post("/logout")
def logout(token: logout, db: Session = Depends(get_db)):
    token_db = db.query(TokenTable).filter(TokenTable.user_id == token.user_id, TokenTable.access_token == token.access_token).first()
    if token_db is None:
        raise HTTPException(status_code=400, detail="Invalid token")
    token_db.status = False
    db.commit()
    return {"message": "Logged out successfully"}

@router.put("/platforms")
@token_required
@admin_required
def update_platforms(_request: Request , user: platformUpdate, db: Session = Depends(get_db)):
    _=_request
    user_db = db.query(User).filter(User.email == user.email, User.username == user.username).first()
    if(user.role.lower() == "admin"):
        role=1
    elif(user.role.lower() == "guest"):
        role=3
    elif(user.role.lower() == "user"):
        role=2
    
    if user_db is None:
        raise HTTPException(status_code=400, detail="User not found")
    if(user_db.user_type == 1):
        raise HTTPException(status_code=400, detail="Admin cannot be updated")
    if (not user.role and not user.platform_access):
        raise HTTPException(status_code=400, detail="No updates provided")
    if user.role:
        user_db.user_type = role
    if user.platform_access:
        if (user_db.user_type == 3 and user.role.lower() != "user"):
            raise HTTPException(status_code=400, detail="Guest user cannot have platform access")
        if (user_db.user_type == 2 and user.role.lower() == "guest"):
            raise HTTPException(status_code=400, detail="Guest cannot have platform access")
        user_db.platform_access = user.platform_access
    db.commit()
    return {"message": "User platforms updated successfully"}

@router.delete("/delete-user")
@token_required
@admin_required
def delete_user(_request: Request,user: deleteUser, db: Session = Depends(get_db)):
    _=_request
    user_db = db.query(User).filter(User.email == user.email, User.username == user.username).first()
    if user_db is None:
        raise HTTPException(status_code=400, detail="User not found")
    db.delete(user_db)
    db.commit()
    return {"message": "User deleted successfully"}