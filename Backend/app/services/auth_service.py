from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, Tuple
from datetime import datetime
import uuid

from app.models.user import User, Administrator
from app.models.driver import Driver
from app.core.security import (
    verify_firebase_token_string,
    create_firebase_user,
    update_firebase_user,
    delete_firebase_user
)
from app.schemas.auth import (
    AdminCreateUserRequest,
    TokenResponse,
    UserResponse,
    LoginResponse,
    UserRole
)

class AuthService:
    
    @staticmethod
    def create_user(db: Session, data: AdminCreateUserRequest, admin_id: str) -> UserResponse:
        firebase_user = create_firebase_user(
            email=data.email,
            password=data.password,
            phone_number=data.phone_number
        )

        try:
            user = User(
                user_id=firebase_user,
                email=data.email,
                phone_number=data.phone_number,
                name=data.name if data.name else "",
                user_type=data.role.value,
                created_by=admin_id
            )
            db.add(user)
            db.flush()

            if data.role == UserRole.ADMINISTRATOR:
                profile = Administrator(
                    user_id=user.user_id,
                    admin_id=str(uuid.uuid4()),
                    role="administrator",
                    department=data.department if data.department else "",
                )
            elif data.role == UserRole.DRIVER:
                profile = Driver(
                    user_id=user.user_id,
                    name=data.name if data.name else ""
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid user role",
                )
            db.add(profile)
            db.commit()
            db.refresh(user)
            db.refresh(profile)

            return UserResponse.model_validate(user)
        except Exception as e:
            db.rollback()
            delete_firebase_user(firebase_user)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating user",
            )
    
    @staticmethod
    def login(db: Session, token_data: dict) -> LoginResponse:
        # Extract the Firebase ID token from the request body
        token = token_data.get("credentials")
        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing credentials in request body",
            )
        
        data = verify_firebase_token_string(token)
        user_id = data.get("uid")

        user = db.query(User).filter(User.user_id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        user.last_login = datetime.utcnow()
        db.commit()

        return LoginResponse(
            user=UserResponse.model_validate(user),
            token=TokenResponse(
                token=token,
                token_type="bearer",
                expires_in=3600,
                user_id=user.user_id,
                role=user.user_type,
                issued_at=datetime.utcnow()
            )
        )
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        user = db.query(User).filter(User.user_id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        return user
    
    @staticmethod
    def delete_user(db: Session, user_id: str) -> None:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        delete_firebase_user(user.user_id)
        db.delete(user)
        db.commit()

    @staticmethod
    def update_user(db: Session, user_id: str, email: Optional[str] = None, password: Optional[str] = None, phone_number: Optional[str] = None) -> UserResponse:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        update_firebase_user(
            uid=user.user_id,
            email=email,
            password=password,
            phone_number=phone_number
        )

        if email:
            user.email = email
        if phone_number:
            user.phone_number = phone_number

        db.commit()
        db.refresh(user)

        return UserResponse.model_validate(user)

    