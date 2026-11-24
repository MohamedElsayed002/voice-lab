"""Allow generations to reference voices owned by another user.

Revision ID: 0013_generation_voice_fk
Revises: 0012_remove_legacy_generation
"""
from typing import Sequence, Union

from alembic import op


revision: str = "0013_generation_voice_fk"
down_revision: Union[str, None] = "0012_remove_legacy_generation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint(
        "fk_generations_user_voice",
        "generations",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "fk_generations_voice_id_voices",
        "generations",
        "voices",
        ["voice_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_generations_voice_id_voices",
        "generations",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "fk_generations_user_voice",
        "generations",
        "voices",
        ["user_id", "voice_id"],
        ["user_id", "id"],
        ondelete="CASCADE",
    )
