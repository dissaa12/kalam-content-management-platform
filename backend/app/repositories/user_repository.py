from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.core.security import get_password_hash


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email.ilike(email.strip())).first()

    def create(self, first_name: str, last_name: str, email: str, password: str, role_name: str = "content_author") -> User:
        db_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email.strip().lower(),
            password_hash=get_password_hash(password),
            role=role_name,
            is_active=True,
        )

        # Attach role object if exists
        role_obj = self.db.query(Role).filter(Role.name == role_name).first()
        if role_obj:
            db_user.roles_list.append(role_obj)

        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update_password(self, user: User, new_password: str) -> User:
        user.password_hash = get_password_hash(new_password)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_permissions(self, user: User) -> List[str]:
        """Collect all permission names for user roles."""
        permission_names = set()
        for role in user.roles_list:
            for perm in role.permissions:
                permission_names.add(perm.name)
        
        # Default fallback permissions by role string if DB roles aren't attached
        role_defaults = {
            "admin": ["*"],
            "marketing_manager": ["content:*", "campaigns:*", "analytics:*", "media:*"],
            "content_editor": ["content:read", "content:edit", "content:review", "calendar:*"],
            "content_author": ["content:read", "content:create", "content:edit_own", "ai:*"],
            "reviewer": ["content:read", "content:review"],
        }
        
        if not permission_names and user.role in role_defaults:
            permission_names.update(role_defaults[user.role])

        return list(permission_names)
