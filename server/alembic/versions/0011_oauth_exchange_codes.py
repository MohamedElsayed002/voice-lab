"""Create OAuth exchange codes table.

Revision ID: 0011_oauth_exchange_codes
Revises: 0010_user_account_status
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0011_oauth_exchange_codes"
down_revision: Union[str, None] = "0010_user_account_status"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "oauth_exchange_codes",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("code_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code_hash", name="uq_oauth_exchange_codes_code_hash"),
    )
    op.create_index(
        "ix_oauth_exchange_codes_user_id",
        "oauth_exchange_codes",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_oauth_exchange_codes_user_id",
        table_name="oauth_exchange_codes",
    )
    op.drop_table("oauth_exchange_codes")
