"""Drop the legacy generation table and align generations with its model.

Revision ID: 0012_remove_legacy_generation
Revises: 0011_oauth_exchange_codes
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0012_remove_legacy_generation"
down_revision: Union[str, None] = "0011_oauth_exchange_codes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Podcasts now own their IDs and no longer depend on the legacy generation table.
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("podcasts"):
        for constraint in inspector.get_foreign_keys("podcasts"):
            if constraint.get("referred_table") == "generation" and constraint.get("name"):
                op.drop_constraint(constraint["name"], "podcasts", type_="foreignkey")

    if inspector.has_table("generation"):
        op.drop_table("generation")

    # The current Generation model permits records without an audio object yet.
    op.alter_column(
        "generations",
        "s3_object_key",
        existing_type=sa.String(length=1024),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "generations",
        "s3_object_key",
        existing_type=sa.String(length=1024),
        nullable=False,
    )

    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("generation"):
        op.create_table(
            "generation",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("type", sa.String(), nullable=False),
            sa.Column("status", sa.String(), nullable=False),
            sa.Column("provider", sa.String(), nullable=False),
            sa.Column("input_metadata", sa.JSON(), nullable=False),
            sa.Column("storage_key", sa.String(), nullable=True),
            sa.Column("error_message", sa.Text(), nullable=True),
            sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
        )
    if inspector.has_table("podcasts") and not any(
        constraint.get("referred_table") == "generation"
        for constraint in inspector.get_foreign_keys("podcasts")
    ):
        op.create_foreign_key(
            "podcasts_id_fkey",
            "podcasts",
            "generation",
            ["id"],
            ["id"],
        )
