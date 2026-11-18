"""
Local-disk implementation of StorageBackend. The development default.

Keys are treated as relative paths under settings.storage_dir, e.g.
"generations/<id>.wav" or "podcasts/<id>/final.wav". The key scheme is
decided by the services that call save_bytes, not by this class -- this
class only knows how to turn a key into a safe path on disk.
"""

from pathlib import Path

from app.core.storage.base import StorageBackend
from app.core.exceptions import StorageError


class LocalStorage(StorageBackend):
    def __init__(self, root: Path):
        self.root = root 
        self.root.mkdir(parents=True, exist_ok=True)

    def _resolve(self,key: str) -> Path:
        """
            Prevent path traversal (e.g. key like "../../etc/passwd)
        """

        path = (self.root / key).resolve()
        if self.root.resolve() not in path.parents and path != self.root.resolve():
            raise StorageError(f"Refusing to write outside storage root: {key}")
        return path

    def save_bytes(self, key: str, data: bytes, content_type: str = "audio/wav") -> str:
        path = self._resolve(key)
        path.parent.mkdir(parents=True, exist_ok=True)

        try:
            path.write_bytes(data)
        except OSError as exc:
            raise StorageError(f"Failed to write '{key}: {exc} from") from exc
        return str(path)

    def load_bytes(self, key: str) -> bytes:
        path = self._resolve(key)
        if not path.exists():
            raise StorageError(f"No such storage object: {key}")

        try:
            return path.read_bytes()
        except OSError as exc:
            raise StorageError(f"Failed to read '{key}': {exc}") from exc 

    def exists(self, key: str) -> bool:
        return self._resolve(key).exists()