"""add notifications case_id FK

Revision ID: a1b2c3d4e5f6
Revises: e5b81bacc6f9
Create Date: 2026-09-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'eef329e83923'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_foreign_key(
        'fk_notifications_case_id',
        'notifications',
        'cases',
        ['case_id'],
        ['id'],
        ondelete='SET NULL',
    )


def downgrade() -> None:
    op.drop_constraint('fk_notifications_case_id', 'notifications', type_='foreignkey')