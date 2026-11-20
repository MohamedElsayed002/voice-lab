# Hashes and verifies passwords
import bcrypt
from pwdlib import PasswordHash 


password_hasher = PasswordHash.recommended()

def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hasher.verify(password, hashed_password)

def password_needs_rehash(hashed_password: str) -> bool:
    """Return whether a bcrypt hash uses a work factor below the current default."""
    try:
        encoded_hash = hashed_password.encode("utf-8")
        if not encoded_hash.startswith((b"$2a$", b"$2b$", b"$2y$")):
            return True
        return int(encoded_hash.split(b"$")[2]) < 12
    except (ValueError, TypeError):
        return True


def verify_and_update_password(
    password: str,
    hashed_password: str,
) -> tuple[bool, str | None]:

    # Support existing bcrypt hashes during migration.
    if hashed_password.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            valid = bcrypt.checkpw(
                password.encode("utf-8"),
                hashed_password.encode("utf-8"),
            )
        except ValueError:
            return False, None

        if not valid:
            return False, None

        # Upgrade the old bcrypt hash to Argon2.
        return True, hash_password(password)

    try:
        valid, updated_hash = password_hasher.verify_and_update(
            password,
            hashed_password,
        )
        return valid, updated_hash
    except (ValueError, TypeError):
        return False, None