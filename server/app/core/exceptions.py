

class AppError(Exception):

    status_code = 500 
    error_code = "internal_error"

    def __init__(self,message: str):
        super().__init__(message)
        self.message = message



class GenerationNotFoundError(AppError):
    status_code =  404
    error_code = "generation_not_found"

class InvalidRequestError(AppError):
    status_code = 422
    error_code = "invalid_request"

class StorageError(AppError):
    status_code = 500 
    error_code = "storage_error"


class VoiceNotFoundError(AppError):
    status_code = 404 
    error_code = "voice_not_found"

# # --- Provider-level errors
# Raised inside providers/*, never inside modules/* business logic.
# Services catch these and decide how to translate them into API errors.

class ProviderError(AppError):
    status_code = 502
    error_code = "provider_error"


class TTSProviderError(ProviderError):
    error_code = "tts_provider_error"


class TTSProviderQuotaExceededError(TTSProviderError):
    status_code = 503
    error_code = "tts_provider_quota_exceeded"

    def __init__(self) -> None:
        super().__init__(
            "Speech generation is temporarily unavailable because the provider "
            "has no remaining credits."
        )


class TTSProviderRateLimitError(TTSProviderError):
    status_code = 503
    error_code = "tts_provider_rate_limited"

    def __init__(self) -> None:
        super().__init__(
            "The speech provider is temporarily rate-limiting requests. Please retry shortly."
        )


class UnsupportedLanguageError(TTSProviderError):
    status_code = 422 
    error_code = "voice_reference_error"