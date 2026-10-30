from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001_voice_generation"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

voice_category = postgresql.ENUM(
    "audiobook",
    "conversational",
    "customer_support",
    "general",
    "narrative",
    "characters",
    "meditation",
    "motivational",
    "podcast",
    "advertising",
    "voiceover",
    "corporate",
    name="voice_category",
    create_type=False,
)
voice_variant = postgresql.ENUM(
    "system",
    "custom",
    name="voice_variant",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    voice_category.create(bind, checkfirst=True)
    voice_variant.create(bind, checkfirst=True)

    op.create_table(
        "voices",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("org_id", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=256), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column(
            "category",
            voice_category,
            server_default="general",
            nullable=False,
        ),
        sa.Column(
            "language",
            sa.String(length=36),
            server_default="en-US",
            nullable=False,
        ),
        sa.Column(
            "variant",
            voice_variant,
            server_default="system",
            nullable=False,
        ),
        sa.Column("S3_object_key", sa.String(length=1024), nullable=False),
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
        sa.UniqueConstraint("org_id", "id", name="uq_voices_org_id_id"),
    )
    op.create_index("ix_voices_org_id", "voices", ["org_id"], unique=False)

    op.create_table(
        "generations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("org_id", sa.String(length=255), nullable=False),
        sa.Column("voice_id", sa.String(length=36), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("voice_name", sa.String(length=256), nullable=False),
        sa.Column("s3_object_key", sa.String(length=1024), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=False),
        sa.Column("top_p", sa.Float(), nullable=False),
        sa.Column("top_k", sa.Integer(), nullable=False),
        sa.Column("repetition_penalty", sa.Float(), nullable=False),
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
        sa.ForeignKeyConstraint(
            ["org_id", "voice_id"],
            ["voices.org_id", "voices.id"],
            name="fk_generations_org_voice",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_generations_org_id_voice_id",
        "generations",
        ["org_id", "voice_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_generations_org_id_voice_id", table_name="generations")
    op.drop_table("generations")
    op.drop_index("ix_voices_org_id", table_name="voices")
    op.drop_table("voices")
    voice_variant.drop(op.get_bind(), checkfirst=True)
    voice_category.drop(op.get_bind(), checkfirst=True)
