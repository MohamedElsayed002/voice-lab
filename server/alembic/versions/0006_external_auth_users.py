"""Allow users authenticated by an external identity provider.

Revision ID: 0006_external_auth_users
Revises: 0005_podcast_generation
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0006_external_auth_users"
down_revision: Union[str, None] = "0005_podcast_generation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(length=256),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(length=256),
        nullable=False,
    )
