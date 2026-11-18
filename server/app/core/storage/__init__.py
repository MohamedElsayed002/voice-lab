import boto3

from app.core.config import settings


def create_s3_client():
    """Create an AWS S3 or S3-compatible client from application settings."""
    options: dict[str, object] = {"region_name": settings.AWS_REGION}
    if settings.S3_ENDPOINT_URL:
        options["endpoint_url"] = settings.S3_ENDPOINT_URL

    has_access_key = bool(settings.AWS_ACCESS_KEY_ID)
    has_secret_key = bool(settings.AWS_SECRET_ACCESS_KEY)
    if has_access_key != has_secret_key:
        raise ValueError("Set both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY")
    if has_access_key:
        options["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
        options["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY

    return boto3.client("s3", **options)


__all__ = ["create_s3_client"]
