from sqlalchemy import ForeignKeyConstraint
from sqlalchemy.orm import configure_mappers

from app.db.base import Base
from app.models import Generation, Voice
from app.schema.voices import VoiceCategory, VoiceVariant


def test_voice_and_generation_tables_are_registered() -> None:
    configure_mappers()

    assert set(Base.metadata.tables) == {"voices", "generations"}
    assert Voice.__table__.c.category.default.arg is VoiceCategory.GENERAL
    assert Voice.__table__.c.language.default.arg == "en-US"
    assert Voice.__table__.c.variant.default.arg is VoiceVariant.SYSTEM
    assert Voice.generations.property.mapper.class_ is Generation
    assert Generation.voice.property.mapper.class_ is Voice


def test_generations_are_tenant_scoped_to_their_voice() -> None:
    voice_foreign_key = next(
        constraint
        for constraint in Generation.__table__.constraints
        if isinstance(constraint, ForeignKeyConstraint)
    )
    generation_index = next(
        index
        for index in Generation.__table__.indexes
        if index.name == "ix_generations_org_id_voice_id"
    )

    assert [element.parent.name for element in voice_foreign_key.elements] == [
        "org_id",
        "voice_id",
    ]
    assert [element.target_fullname for element in voice_foreign_key.elements] == [
        "voices.org_id",
        "voices.id",
    ]
    assert voice_foreign_key.ondelete == "CASCADE"
    assert [column.name for column in generation_index.columns] == [
        "org_id",
        "voice_id",
    ]
