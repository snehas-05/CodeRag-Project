"""Authentication routes for registration and login."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import random
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.schemas.auth_schemas import (
    RegisterRequest, 
    TokenResponse, 
    UserProfileUpdate, 
    UserProfileResponse,
    ForgotPasswordRequest,
    VerifyOTPRequest,
    ResetPasswordRequest
)
from app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user
from app.services.email_service import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user and return an initial access token."""
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    hashed_password = hash_password(request.password)
    new_user = User(email=request.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    access_token = create_access_token(data={"sub": new_user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "email": new_user.email,
        "username": new_user.username,
        "full_name": new_user.full_name
    }


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user and return a JWT access token."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name
    }


@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return current user profile."""
    return current_user


@router.put("/me", response_model=UserProfileResponse)
def update_me(
    request: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    if request.full_name is not None:
        current_user.full_name = request.full_name
    if request.username is not None:
        # Optional: check for username uniqueness if changed
        if request.username != current_user.username:
            existing = db.query(User).filter(User.username == request.username).first()
            if existing:
                raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = request.username
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate and send OTP for password reset."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal if user exists for security, just return success
        return {"message": "If an account with this email exists, an OTP has been sent."}

    # Generate 6-digit OTP
    otp = "{:06d}".format(random.randint(0, 999999))
    user.otp = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    # Send email
    await send_otp_email(user.email, otp)

    return {"message": "OTP sent successfully."}


@router.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify if the OTP is valid and not expired."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user or user.otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if user.otp_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    return {"message": "OTP verified successfully."}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password if OTP is valid."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user or user.otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if user.otp_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    # Update password and clear OTP
    user.hashed_password = hash_password(request.new_password)
    user.otp = None
    user.otp_expiry = None
    db.commit()

    return {"message": "Password reset successfully."}
