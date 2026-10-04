from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.models.media import Media


class MediaRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        filename: str,
        original_filename: str,
        file_path: str,
        file_type: str,
        mime_type: str,
        file_size: int,
        uploaded_by_id: int,
    ) -> Media:
        media = Media(
            filename=filename,
            original_filename=original_filename,
            file_path=file_path,
            file_type=file_type,
            mime_type=mime_type,
            file_size=file_size,
            uploaded_by_id=uploaded_by_id,
        )
        self.db.add(media)
        self.db.commit()
        self.db.refresh(media)
        return media

    def get_by_id(self, media_id: int) -> Optional[Media]:
        return self.db.query(Media).filter(Media.id == media_id).first()

    def list_media(
        self,
        search: Optional[str] = None,
        file_type: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> List[Media]:
        query = self.db.query(Media)

        if file_type and file_type != "all":
            query = query.filter(Media.file_type == file_type)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Media.original_filename.ilike(search_pattern)) |
                (Media.filename.ilike(search_pattern))
            )

        # Sorting
        if sort_by == "name":
            sort_attr = Media.original_filename
        elif sort_by == "size":
            sort_attr = Media.file_size
        else:
            sort_attr = Media.created_at

        if sort_order == "asc":
            query = query.order_by(asc(sort_attr))
        else:
            query = query.order_by(desc(sort_attr))

        return query.all()

    def delete(self, media_id: int) -> bool:
        media = self.get_by_id(media_id)
        if not media:
            return False
        self.db.delete(media)
        self.db.commit()
        return True
