"""Allow preset provider voices in generation history.

Revision ID: 0014_nullable_generation_voice
Revises: 0013_generation_voice_fk
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0014_nullable_generation_voice"
down_revision: Union[str, None] = "0013_generation_voice_fk"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "generations",
        "voice_id",
        existing_type=sa.String(length=36),
        nullable=True,
    )


def downgrade() -> None:
    op.execute("DELETE FROM generations WHERE voice_id IS NULL")
    op.alter_column(
        "generations",
        "voice_id",
        existing_type=sa.String(length=36),
        nullable=False,
    )
