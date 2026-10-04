from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, create_access_token
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    ChangePasswordRequest,
    MessageResponse,
)
from app.schemas.user import UserResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)) -> Any:
    """Register a new enterprise user account."""
    user_repo = UserRepository(db)
    existing_user = user_repo.get_by_email(request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # Allowed roles validation
    allowed_roles = ["admin", "marketing_manager", "content_editor", "content_author", "reviewer"]
    role = request.role if request.role in allowed_roles else "content_author"

    user = user_repo.create(
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        password=request.password,
        role_name=role,
    )

    access_token = create_access_token(subject=user.id)
    permissions = user_repo.get_user_permissions(user)

    user_response = UserResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        permissions=permissions,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)


@router.post("/login", response_model=TokenResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)) -> Any:
    """Authenticate user with email and password and return JWT access token."""
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(request.email)

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    access_token = create_access_token(subject=user.id)
    permissions = user_repo.get_user_permissions(user)

    user_response = UserResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        permissions=permissions,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Any:
    """Get profile and permissions of the currently authenticated user."""
    user_repo = UserRepository(db)
    permissions = user_repo.get_user_permissions(current_user)

    return UserResponse(
        id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        full_name=current_user.full_name,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        permissions=permissions,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Change current user's password."""
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password entered is incorrect.",
        )

    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long.",
        )

    user_repo = UserRepository(db)
    user_repo.update_password(current_user, request.new_password)

    return MessageResponse(message="Password successfully updated.")
