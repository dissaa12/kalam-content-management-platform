"""Create campaigns table and add campaign_id to content

Revision ID: 180f5ccdf0c0
Revises: 8682bf620820
Create Date: 2026-09-29 21:38:55.831529

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision: str = '180f5ccdf0c0'
down_revision: Union[str, Sequence[str], None] = '8682bf620820'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema safely checking existing tables."""
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    tables = inspector.get_table_names()

    if 'campaigns' not in tables:
        op.create_table('campaigns',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('objective', sa.Text(), nullable=True),
            sa.Column('target_audience', sa.Text(), nullable=True),
            sa.Column('campaign_type', sa.String(length=100), nullable=False),
            sa.Column('start_date', sa.DateTime(), nullable=False),
            sa.Column('end_date', sa.DateTime(), nullable=False),
            sa.Column('budget', sa.Float(), nullable=False),
            sa.Column('owner_id', sa.Integer(), nullable=False),
            sa.Column('status', sa.String(length=50), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='RESTRICT'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_campaigns_id'), 'campaigns', ['id'], unique=False)
        op.create_index(op.f('ix_campaigns_name'), 'campaigns', ['name'], unique=False)
        op.create_index(op.f('ix_campaigns_status'), 'campaigns', ['status'], unique=False)

    columns = [c['name'] for c in inspector.get_columns('content')]
    if 'campaign_id' not in columns:
        with op.batch_alter_table('content') as batch_op:
            batch_op.add_column(sa.Column('campaign_id', sa.Integer(), nullable=True))
            batch_op.create_foreign_key('fk_content_campaign', 'campaigns', ['campaign_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    columns = [c['name'] for c in inspector.get_columns('content')]
    
    if 'campaign_id' in columns:
        with op.batch_alter_table('content') as batch_op:
            batch_op.drop_constraint('fk_content_campaign', type_='foreignkey')
            batch_op.drop_column('campaign_id')

    tables = inspector.get_table_names()
    if 'campaigns' in tables:
        op.drop_index(op.f('ix_campaigns_status'), table_name='campaigns')
        op.drop_index(op.f('ix_campaigns_name'), table_name='campaigns')
        op.drop_index(op.f('ix_campaigns_id'), table_name='campaigns')
        op.drop_table('campaigns')
