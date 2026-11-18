"""Add users, audit logs, and user-owned voices and generations.

Revision ID: 0002_users_owned_voices
Revises: 0001_voice_generation
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0002_users_owned_voices"
down_revision: Union[str, None] = "0001_voice_generation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


user_role = postgresql.ENUM("user", "admin", name="user_role", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    user_role.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.String(36), nullable=False),
        sa.Column("email", sa.String(256), nullable=False),
        sa.Column("username", sa.String(50), nullable=True),
        sa.Column("hashed_password", sa.String(256), nullable=False),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("role", user_role, server_default="user", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    # Existing organization IDs represented users, but the initial schema did not
    # create user records. Preserve data only when the referenced users exist;
    # since this migration creates the user table, populated legacy rows require
    # an explicit ownership mapping before they can satisfy the new constraints.
    op.execute(sa.text("""
        DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM voices) OR EXISTS (SELECT 1 FROM generations) THEN
                RAISE EXCEPTION 'Cannot migrate populated voices/generations: map legacy org_id values to users before upgrading';
            END IF;
        END $$;
    """))

    op.drop_constraint("fk_generations_org_voice", "generations", type_="foreignkey")
    op.drop_index("ix_generations_org_id_voice_id", table_name="generations")
    op.drop_index("ix_voices_org_id", table_name="voices")
    op.drop_constraint("uq_voices_org_id_id", "voices", type_="unique")

    op.drop_column("generations", "org_id")
    op.drop_column("voices", "org_id")
    op.add_column("voices", sa.Column("user_id", sa.String(36), nullable=False))
    op.add_column("generations", sa.Column("user_id", sa.String(36), nullable=False))

    op.create_foreign_key("fk_voices_user_id_users", "voices", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key("fk_generations_user_id_users", "generations", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_unique_constraint("uq_voices_user_id_id", "voices", ["user_id", "id"])
    op.create_foreign_key(
        "fk_generations_user_voice", "generations", "voices", ["user_id", "voice_id"],
        ["user_id", "id"], ondelete="CASCADE"
    )
    op.create_index("ix_voices_user_id", "voices", ["user_id"], unique=False)
    op.create_index("ix_generations_user_id", "generations", ["user_id"], unique=False)
    op.create_index("ix_generations_voice_id", "generations", ["voice_id"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), nullable=False),
        sa.Column("event", sa.String(256), nullable=False),
        sa.Column("user_id", sa.String(36), nullable=False),
        sa.Column("status", sa.String(256), nullable=False),
        sa.Column("ip_address", sa.String(256), nullable=True),
        sa.Column("user_agent", sa.String(256), nullable=True),
        sa.Column("extra", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"], unique=False)

    # Align the legacy quoted mixed-case column with the model's lowercase name.
    op.alter_column("voices", "S3_object_key", new_column_name="s3_object_key", existing_type=sa.String(1024), nullable=False)


def downgrade() -> None:
    op.alter_column("voices", "s3_object_key", new_column_name="S3_object_key", existing_type=sa.String(1024), nullable=False)
    op.drop_index("ix_audit_logs_user_id", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_generations_voice_id", table_name="generations")
    op.drop_index("ix_generations_user_id", table_name="generations")
    op.drop_index("ix_voices_user_id", table_name="voices")
    op.drop_constraint("fk_generations_user_voice", "generations", type_="foreignkey")
    op.drop_constraint("uq_voices_user_id_id", "voices", type_="unique")
    op.drop_constraint("fk_generations_user_id_users", "generations", type_="foreignkey")
    op.drop_constraint("fk_voices_user_id_users", "voices", type_="foreignkey")
    op.drop_column("generations", "user_id")
    op.drop_column("voices", "user_id")
    op.add_column("voices", sa.Column("org_id", sa.String(255), nullable=False))
    op.add_column("generations", sa.Column("org_id", sa.String(255), nullable=False))
    op.create_unique_constraint("uq_voices_org_id_id", "voices", ["org_id", "id"])
    op.create_index("ix_voices_org_id", "voices", ["org_id"], unique=False)
    op.create_foreign_key(
        "fk_generations_org_voice", "generations", "voices", ["org_id", "voice_id"],
        ["org_id", "id"], ondelete="CASCADE"
    )
    op.create_index("ix_generations_org_id_voice_id", "generations", ["org_id", "voice_id"], unique=False)
    op.drop_index("ix_users_username", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    user_role.drop(op.get_bind(), checkfirst=True)
