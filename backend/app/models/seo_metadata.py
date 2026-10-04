from typing import Optional
from sqlalchemy import String, Text, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class SEOMetadata(Base):
    __tablename__ = "seo_metadata"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    content_id: Mapped[int] = mapped_column(Integer, ForeignKey("content.id", ondelete="CASCADE"), unique=True, nullable=False)
    meta_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    meta_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    keywords: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    canonical_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    og_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    og_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    og_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    no_index: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    content: Mapped["Content"] = relationship("Content", back_populates="seo_metadata")
