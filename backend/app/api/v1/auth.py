import time
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.api.deps import get_current_user

router = APIRouter()

# Simple in-memory tracker for rate-limiting failed login attempts: { key: [timestamps] }
FAILED_ATTEMPTS: dict = defaultdict(list)
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_SECONDS = 120  # 2 minutes

def check_login_rate_limit(key: str):
    now = time.time()
    # Remove timestamps older than lockout window
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

    # 2. Check if user already exists (case-insensitive)
    existing = db.query(User).filter(func.lower(User.email) == norm_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists. Please sign in instead."
        )

    # 3. Clean optional phone number
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
    if not user or not verify_password(login_data.password, user.hashed_password):
        record_failed_attempt(norm_email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials and try again.",
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

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

