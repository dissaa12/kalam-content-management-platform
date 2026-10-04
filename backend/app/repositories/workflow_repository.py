from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc

from app.models.content import Content
from app.models.content_version import ContentVersion
from app.models.content_comment import ContentComment
from app.models.content_activity import ContentActivity
from app.models.user import User


class WorkflowRepository:
    def __init__(self, db: Session):
        self.db = db

    def log_activity(self, content_id: int, user_id: int, action: str, details: Optional[str] = None) -> ContentActivity:
        activity = ContentActivity(
            content_id=content_id,
            user_id=user_id,
            action=action,
            details=details,
            timestamp=datetime.utcnow(),
        )
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return activity

    def add_comment(self, content_id: int, user_id: int, comment_text: str) -> ContentComment:
        comment = ContentComment(
            content_id=content_id,
            user_id=user_id,
            comment=comment_text.strip(),
            created_at=datetime.utcnow(),
        )
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def get_comments(self, content_id: int) -> List[ContentComment]:
        return (
            self.db.query(ContentComment)
            .options(joinedload(ContentComment.user))
            .filter(ContentComment.content_id == content_id)
            .order_by(asc(ContentComment.created_at))
            .all()
        )

    def create_version_snapshot(self, content: Content, author_id: int) -> ContentVersion:
        # Determine next version number
        last_version = (
            self.db.query(ContentVersion)
            .filter(ContentVersion.content_id == content.id)
            .order_by(desc(ContentVersion.version_number))
            .first()
        )
        next_ver = (last_version.version_number + 1) if last_version else 1

        snapshot = {
            "title": content.title,
            "slug": content.slug,
            "content_type": content.content_type,
            "excerpt": content.excerpt,
            "body": content.body,
            "status": content.status,
            "featured_image": content.featured_image,
        }

        version = ContentVersion(
            content_id=content.id,
            version_number=next_ver,
            author_id=author_id,
            title=content.title,
            excerpt=content.excerpt,
            body=content.body,
            content_snapshot=snapshot,
            created_at=datetime.utcnow(),
        )
        self.db.add(version)
        self.db.commit()
        self.db.refresh(version)
        return version

    def get_versions(self, content_id: int) -> List[ContentVersion]:
        return (
            self.db.query(ContentVersion)
            .options(joinedload(ContentVersion.author))
            .filter(ContentVersion.content_id == content_id)
            .order_by(desc(ContentVersion.version_number))
            .all()
        )

    def restore_version(self, content: Content, version_number: int, restored_by_user: User) -> Content:
        target_version = (
            self.db.query(ContentVersion)
            .filter(ContentVersion.content_id == content.id, ContentVersion.version_number == version_number)
            .first()
        )
        if not target_version:
            raise ValueError(f"Version #{version_number} not found for content #{content.id}")

        content.title = target_version.title
        content.excerpt = target_version.excerpt
        content.body = target_version.body
        content.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(content)

        # Create new version snapshot for the restoration
        self.create_version_snapshot(content, restored_by_user.id)
        self.log_activity(content.id, restored_by_user.id, "restored_version", f"Restored from Version #{version_number}")
        return content

    def get_activities(self, content_id: int) -> List[ContentActivity]:
        return (
            self.db.query(ContentActivity)
            .options(joinedload(ContentActivity.user))
            .filter(ContentActivity.content_id == content_id)
            .order_by(asc(ContentActivity.timestamp))
            .all()
        )
