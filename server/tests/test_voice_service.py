from io import BytesIO

import pytest
from starlette.datastructures import Headers, UploadFile

from app.exceptions.handlers import ConflictException, ForbiddenException
from app.models.user import User
from app.schema.voice import VoiceCreateFields, VoiceCreateRequest
from app.schema.visibility import VisibilityStatus
from app.schema.voices import VoiceCategory, VoiceVariant
from app.services.voices_services import VoiceService


class FakeS3Client:
    def __init__(self) -> None:
        self.objects: dict[str, tuple[bytes, str]] = {}

    def put_object(
        self,
        *,
        Bucket: str,
        Key: str,
        Body: bytes,
        ContentType: str,
    ) -> None:
        self.objects[Key] = (Body, ContentType)

    def delete_object(self, *, Bucket: str, Key: str) -> None:
        self.objects.pop(Key, None)

    def generate_presigned_url(
        self,
        operation: str,
        *,
        Params: dict[str, str],
        ExpiresIn: int,
    ) -> str:
        return f"https://storage.test/{Params['Key']}?expires={ExpiresIn}"


class FakeAsyncSession:
    def __init__(
        self,
        *,
        fail_commit: bool = False,
        email_owner: str | None = None,
    ) -> None:
        self.voice = None
        self.users: dict[str, User] = {}
        self.fail_commit = fail_commit
        self.email_owner = email_owner
        self.rolled_back = False

    async def get(self, model, identity: str):
        return self.users.get(identity) if model is User else None

    async def scalar(self, query):
        return self.email_owner

    def add(self, instance) -> None:
        if isinstance(instance, User):
            self.users[instance.id] = instance
        else:
            self.voice = instance

    async def commit(self) -> None:
        if self.fail_commit:
            raise RuntimeError("database unavailable")

    async def refresh(self, voice) -> None:
        pass

    async def rollback(self) -> None:
        self.rolled_back = True


def upload_file(
    filename: str,
    content_type: str,
    content: bytes,
) -> UploadFile:
    return UploadFile(
        file=BytesIO(content),
        filename=filename,
        headers=Headers({"content-type": content_type}),
    )


def make_request(*, with_avatar: bool = True) -> VoiceCreateRequest:
    fields = VoiceCreateFields(
        name="Warm narrator",
        description="A clear, warm voice.",
        category=VoiceCategory.AUDIOBOOK,
        language="en",
        status=VisibilityStatus.PRIVATE,
        reference_text="A sample sentence.",
    )
    audio = upload_file(
        "sample.wav",
        "audio/wav",
        b"RIFF\x00\x00\x00\x00WAVE" + b"\x00\x00",
    )
    avatar = (
        upload_file(
            "avatar.png",
            "image/png",
            b"\x89PNG\r\n\x1a\n" + b"image",
        )
        if with_avatar
        else None
    )
    return VoiceCreateRequest(fields=fields, audio=audio, avatar=avatar)


@pytest.mark.asyncio
async def test_create_voice_stores_audio_avatar_and_metadata() -> None:
    s3_client = FakeS3Client()
    db = FakeAsyncSession()
    service = VoiceService(s3_client=s3_client)

    result = await service.create_voice(
        db=db,
        user_id="user-1",
        user_email="user@example.com",
        request=make_request(),
    )

    assert db.users["user-1"].email == "user@example.com"
    assert db.users["user-1"].hashed_password is None
    voice = db.voice
    assert voice is not None
    assert voice.name == "Warm narrator"
    assert voice.category == VoiceCategory.AUDIOBOOK
    assert voice.variant == VoiceVariant.CUSTOM
    assert voice.reference_text == "A sample sentence."
    assert voice.audio_s3_object_key in s3_client.objects
    assert voice.avatar_s3_object_key in s3_client.objects
    assert s3_client.objects[voice.audio_s3_object_key][1] == "audio/wav"
    assert s3_client.objects[voice.avatar_s3_object_key][1] == "image/png"
    assert result["audio_url"].startswith("https://storage.test/")
    assert result["avatar_url"].startswith("https://storage.test/")


@pytest.mark.asyncio
async def test_create_voice_allows_optional_avatar() -> None:
    s3_client = FakeS3Client()
    db = FakeAsyncSession()
    service = VoiceService(s3_client=s3_client)

    result = await service.create_voice(
        db=db,
        user_id="user-1",
        user_email="user@example.com",
        request=make_request(with_avatar=False),
    )

    assert db.voice.avatar_s3_object_key is None
    assert result["avatar_url"] is None
    assert len(s3_client.objects) == 1


@pytest.mark.asyncio
async def test_create_voice_removes_uploaded_objects_if_database_commit_fails() -> None:
    s3_client = FakeS3Client()
    db = FakeAsyncSession(fail_commit=True)
    service = VoiceService(s3_client=s3_client)

    with pytest.raises(RuntimeError, match="database unavailable"):
        await service.create_voice(
            db=db,
            user_id="user-1",
            user_email="user@example.com",
            request=make_request(),
        )

    assert db.rolled_back
    assert s3_client.objects == {}


@pytest.mark.asyncio
async def test_create_voice_requires_email_for_an_unregistered_user() -> None:
    s3_client = FakeS3Client()
    service = VoiceService(s3_client=s3_client)

    with pytest.raises(ForbiddenException, match="must have an email"):
        await service.create_voice(
            db=FakeAsyncSession(),
            user_id="user-1",
            user_email=None,
            request=make_request(),
        )

    assert s3_client.objects == {}


@pytest.mark.asyncio
async def test_create_voice_rejects_an_email_owned_by_another_user() -> None:
    s3_client = FakeS3Client()
    db = FakeAsyncSession(email_owner="other-user")
    service = VoiceService(s3_client=s3_client)

    with pytest.raises(ConflictException, match="already linked"):
        await service.create_voice(
            db=db,
            user_id="user-1",
            user_email="user@example.com",
            request=make_request(),
        )

    assert db.rolled_back
    assert s3_client.objects == {}
