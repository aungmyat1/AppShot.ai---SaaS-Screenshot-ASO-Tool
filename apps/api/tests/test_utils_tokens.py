from app.utils.tokens import new_token, sha256_hex


def test_sha256_hex():
    assert sha256_hex("hello") == "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    assert sha256_hex("") == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    assert len(sha256_hex("x")) == 64


def test_new_token_length():
    t = new_token()
    assert isinstance(t, str)
    assert len(t) >= 32
