"""Add linked identity accounts for external authentication.

Revision ID: 0008_google_auth_accounts
Revises: 0007_users_new_fields
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0008_google_auth_accounts"
down_revision: Union[str, None] = "0007_users_new_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "auth_accounts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("provider_user_id", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=256), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("provider", "provider_user_id", name="uq_auth_accounts_provider_subject"),
        sa.UniqueConstraint("user_id", "provider", name="uq_auth_accounts_user_provider"),
    )
    op.create_index("ix_auth_accounts_user_id", "auth_accounts", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_auth_accounts_user_id", table_name="auth_accounts")
    op.drop_table("auth_accounts")
