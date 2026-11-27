"""Store the provider used for each generation.

Revision ID: 0015_add_generation_provider
Revises: 0014_nullable_generation_voice
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0015_add_generation_provider"
down_revision: Union[str, None] = "0014_nullable_generation_voice"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "generations",
        sa.Column(
            "provider",
            sa.String(length=50),
            nullable=False,
            server_default="unknown",
        ),
    )
    op.alter_column(
        "generations",
        "provider",
        existing_type=sa.String(length=50),
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column("generations", "provider")
