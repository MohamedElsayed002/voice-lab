

from abc import ABC, abstractmethod

class StorageBackend(ABC):


    @abstractmethod
    def save_bytes(self, key: str, content_type: str = "audio/wav") -> str:
        """ 
            Persist `data` under `key`. Returns a storage-backend-specific
            locator (a local path today; could be an object URL/key for 
            R2/S3 Later). callers should treat the return value as opaque
        """

    @abstractmethod
    def load_bytes(self, key: str) -> bytes:
        """
            Raise StorageError (via the implementation) if key is missing
        """

    @abstractmethod
    def exists(self, key: str) -> bool:
        ...

    