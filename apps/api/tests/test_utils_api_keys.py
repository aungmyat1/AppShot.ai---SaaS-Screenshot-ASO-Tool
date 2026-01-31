from app.utils.api_keys import generate_api_key


def test_generate_api_key_returns_three_values():
    raw, key_hash, last4 = generate_api_key()
    assert isinstance(raw, str)
    assert isinstance(key_hash, str)
    assert isinstance(last4, str)
    assert len(last4) == 4


def test_generate_api_key_hash_differs_from_raw():
    raw, key_hash, _ = generate_api_key()
    assert key_hash != raw
    assert len(key_hash) == 64


def test_generate_api_key_prefix():
    raw, _, _ = generate_api_key(prefix="gas_live")
    assert raw.startswith("gas_live_")
