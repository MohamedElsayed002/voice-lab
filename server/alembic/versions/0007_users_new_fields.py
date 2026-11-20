"""Add user preferences/provider and allow anonymous audit events.

Revision ID: 0007_users_new_fields
Revises: 0006_external_auth_users
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0007_users_new_fields"
down_revision: Union[str, None] = "0006_external_auth_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

user_tier = postgresql.ENUM("free", "pro", "pro_max", name="user_tier", create_type=False)


def upgrade() -> None:
    # This is also present in 0006 for databases that have already applied it.
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(length=256),
        nullable=True,
    )

    user_tier.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "users",
        sa.Column("tier", user_tier, server_default="free", nullable=False),
    )
    # Existing accounts have completed onboarding; future accounts start at False.
    op.add_column("users", sa.Column("onboard", sa.Boolean(), nullable=True))
    op.execute(sa.text("UPDATE users SET onboard = true"))
    op.alter_column(
        "users",
        "onboard",
        existing_type=sa.Boolean(),
        nullable=False,
        server_default=sa.text("false"),
    )
    op.add_column(
        "users",
        sa.Column("email_notification", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.add_column(
        "users",
        sa.Column("auth_provider", sa.String(length=50), server_default="local", nullable=False),
    )

    # Unknown emails cannot reference a user row. Preserve those audit events if the user is deleted.
    op.drop_constraint("audit_logs_user_id_fkey", "audit_logs", type_="foreignkey")
    op.alter_column(
        "audit_logs",
        "user_id",
        existing_type=sa.String(length=36),
        nullable=True,
    )
    op.create_foreign_key(
        "audit_logs_user_id_fkey",
        "audit_logs",
        "users",
        ["user_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("audit_logs_user_id_fkey", "audit_logs", type_="foreignkey")
    op.execute(sa.text("DELETE FROM audit_logs WHERE user_id IS NULL"))
    op.alter_column(
        "audit_logs",
        "user_id",
        existing_type=sa.String(length=36),
        nullable=False,
    )
    op.create_foreign_key(
        "audit_logs_user_id_fkey",
        "audit_logs",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_column("users", "auth_provider")
    op.drop_column("users", "email_notification")
    op.drop_column("users", "onboard")
    op.drop_column("users", "tier")
    user_tier.drop(op.get_bind(), checkfirst=True)
