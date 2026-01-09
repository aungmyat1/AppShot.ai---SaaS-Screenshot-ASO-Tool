import secrets

from app.utils.tokens import sha256_hex


def generate_api_key(prefix: str = "gas_live") -> tuple[str, str, str]:
    """
    Returns: (raw_key, key_hash, last4)
    - raw_key: show once to user
    - key_hash: stored in DB
    """
    raw = f"{prefix}_{secrets.token_urlsafe(32)}"
    return raw, sha256_hex(raw), raw[-4:]

