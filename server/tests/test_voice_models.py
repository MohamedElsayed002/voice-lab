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


def test_generations_reference_voices_independently_of_voice_owner() -> None:
    voice_foreign_key = next(
        constraint
        for constraint in Generation.__table__.constraints
        if isinstance(constraint, ForeignKeyConstraint)
        and constraint.name == "fk_generations_voice_id_voices"
    )

    assert [element.parent.name for element in voice_foreign_key.elements] == ["voice_id"]
    assert [element.target_fullname for element in voice_foreign_key.elements] == ["voices.id"]
    assert voice_foreign_key.ondelete == "CASCADE"
