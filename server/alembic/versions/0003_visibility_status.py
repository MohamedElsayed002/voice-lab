"""Add public/private visibility to voices and generations.

Revision ID: 0003_visibility_status
Revises: 0002_users_owned_voices
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0003_visibility_status"
down_revision: Union[str, None] = "0002_users_owned_voices"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

visibility_status = postgresql.ENUM(
    "public",
    "private",
    name="visibility_status",
    create_type=False,
)


def upgrade() -> None:
    visibility_status.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "voices",
        sa.Column("status", visibility_status, server_default="private", nullable=False),
    )
    op.add_column(
        "generations",
        sa.Column("status", visibility_status, server_default="private", nullable=False),
    )
    op.create_index("ix_voices_status", "voices", ["status"], unique=False)
    op.create_index("ix_generations_status", "generations", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_generations_status", table_name="generations")
    op.drop_index("ix_voices_status", table_name="voices")
    op.drop_column("generations", "status")
    op.drop_column("voices", "status")
    visibility_status.drop(op.get_bind(), checkfirst=True)
