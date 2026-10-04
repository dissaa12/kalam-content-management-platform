"""create media table and add keywords to seo_metadata

Revision ID: 2c096cea8788
Revises: 180f5ccdf0c0
Create Date: 2026-09-29 22:41:35.290843

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2c096cea8788'
down_revision: Union[str, Sequence[str], None] = '180f5ccdf0c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if media table already exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if 'media' not in tables:
        op.create_table(
            'media',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('filename', sa.String(length=255), nullable=False),
            sa.Column('original_filename', sa.String(length=255), nullable=False),
            sa.Column('file_path', sa.String(length=500), nullable=False),
            sa.Column('file_type', sa.String(length=50), nullable=False),
            sa.Column('mime_type', sa.String(length=100), nullable=False),
            sa.Column('file_size', sa.Integer(), nullable=False),
            sa.Column('uploaded_by_id', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['uploaded_by_id'], ['users.id'], ondelete='RESTRICT'),
            sa.PrimaryKeyConstraint('id')
        )
        with op.batch_alter_table('media', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_media_file_type'), ['file_type'], unique=False)
            batch_op.create_index(batch_op.f('ix_media_id'), ['id'], unique=False)

    columns = [col['name'] for col in inspector.get_columns('seo_metadata')]
    if 'keywords' not in columns:
        with op.batch_alter_table('seo_metadata', schema=None) as batch_op:
            batch_op.add_column(sa.Column('keywords', sa.String(length=500), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('seo_metadata', schema=None) as batch_op:
        batch_op.drop_column('keywords')

    with op.batch_alter_table('media', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_media_id'))
        batch_op.drop_index(batch_op.f('ix_media_file_type'))

    op.drop_table('media')
