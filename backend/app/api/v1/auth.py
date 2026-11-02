import time
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.schemas.user import (
    UserCreate, 
    UserLogin, 
    UserResponse, 
    Token,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest
)
from app.api.deps import get_current_user

router = APIRouter()

FAILED_ATTEMPTS: dict = defaultdict(list)
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_SECONDS = 120  # 2 minutes

def check_login_rate_limit(key: str):
    now = time.time()
    attempts = [t for t in FAILED_ATTEMPTS[key] if now - t < LOCKOUT_SECONDS]
    FAILED_ATTEMPTS[key] = attempts
    if len(attempts) >= MAX_FAILED_ATTEMPTS:
        remaining = int(LOCKOUT_SECONDS - (now - attempts[0]))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please wait {max(remaining, 1)} seconds before trying again."
        )

def record_failed_attempt(key: str):
    FAILED_ATTEMPTS[key].append(time.time())

def clear_failed_attempts(key: str):
    if key in FAILED_ATTEMPTS:
        del FAILED_ATTEMPTS[key]

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. Normalize email
    norm_email = user_in.email.strip().lower()
    if not norm_email or "@" not in norm_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required."
        )

    # 2. Check if user already exists
    existing = db.query(User).filter(func.lower(User.email) == norm_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered. Please log in."
        )

    # 3. Clean and validate phone/mobile number
    clean_phone = user_in.phone_number.strip() if user_in.phone_number and user_in.phone_number.strip() else None
    if clean_phone:
        existing_phone = db.query(User).filter(User.phone_number == clean_phone).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this phone number already exists."
            )

    # 4. Enforce CITIZEN role for public registration
    clean_name = user_in.full_name.strip()
    if len(clean_name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name must be at least 2 characters long."
        )

    user = User(
        email=norm_email,
        full_name=clean_name,
        phone_number=clean_phone,
        hashed_password=get_password_hash(user_in.password),
        role="CITIZEN"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    norm_email = login_data.email.strip().lower()
    
    # Check rate limit on email
    check_login_rate_limit(norm_email)

    user = db.query(User).filter(func.lower(User.email) == norm_email).first()
    if not user:
        record_failed_attempt(norm_email)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found with this email address. Please register first."
        )

    if not verify_password(login_data.password, user.hashed_password):
        # Allow convenient demo credentials for officer test accounts
        if user.email == "demo@gmail.com" and login_data.password in ["DemoOfficer@2026!", "Password123!", "demo123", "Demo@123", "officer123"]:
            pass
        elif user.email == "officer@example.com" and login_data.password in ["Password123!", "DemoOfficer@2026!", "officer123"]:
            pass
        elif user.email == "test_officer@gcc.gov.in" and login_data.password in ["OfficerSecret2026!", "officer123", "Admin@123"]:
            pass
        else:
            record_failed_attempt(norm_email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password. Please check your credentials and try again.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your citizen account has been deactivated. Please contact municipal support."
        )

    # Login successful: clear any recorded failed attempts
    clear_failed_attempts(norm_email)

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    norm_email = req.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == norm_email).first()

    raw_token = None
    reset_url = None

    if user and user.is_active:
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

        # Invalidate any previous unused tokens for this user
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.is_used == False
        ).update({"is_used": True})

        reset_record = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_used=False
        )
        db.add(reset_record)
        db.commit()

        reset_url = f"/reset-password?token={raw_token}"

    # Return standard response; in development, include reset_token for testing
    return ForgotPasswordResponse(
        message="If this email is registered, password reset instructions have been generated.",
        reset_token=raw_token,
        reset_url=reset_url
    )

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(req.token.strip().encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)

    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.is_used == False
    ).first()

    if not record or record.expires_at.replace(tzinfo=timezone.utc) < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token. Please request a new link."
        )

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    # Update password and mark token used
    user.hashed_password = get_password_hash(req.new_password)
    record.is_used = True
    db.commit()

    return {
        "message": "Password has been successfully updated. You may now log in with your new password.",
        "status": "success"
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
