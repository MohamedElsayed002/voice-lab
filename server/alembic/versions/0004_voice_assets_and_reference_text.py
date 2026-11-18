"""Store separate voice audio and avatar object keys.

Revision ID: 0004_voice_assets
Revises: 0003_visibility_status
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0004_voice_assets"
down_revision: Union[str, None] = "0003_visibility_status"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "voices",
        "s3_object_key",
        new_column_name="audio_s3_object_key",
        existing_type=sa.String(length=1024),
        nullable=False,
    )
    op.add_column(
        "voices",
        sa.Column("avatar_s3_object_key", sa.String(length=1024), nullable=True),
    )
    op.add_column(
        "voices",
        sa.Column("reference_text", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("voices", "reference_text")
    op.drop_column("voices", "avatar_s3_object_key")
    op.alter_column(
        "voices",
        "audio_s3_object_key",
        new_column_name="s3_object_key",
        existing_type=sa.String(length=1024),
        nullable=False,
    )
