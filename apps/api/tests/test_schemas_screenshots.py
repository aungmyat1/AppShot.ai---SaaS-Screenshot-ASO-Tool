import pytest
from pydantic import ValidationError

from app.schemas.screenshots import ScreenshotCreate


def test_screenshot_create_valid():
    r = ScreenshotCreate(
        app_id="com.example.app",
        platform="appstore",
        url="https://example.com/image.png",
    )
    assert r.app_id == "com.example.app"
    assert r.platform == "appstore"
    assert r.url == "https://example.com/image.png"
    assert r.meta == {}


def test_screenshot_create_platform_playstore():
    r = ScreenshotCreate(
        app_id="com.example.app",
        platform="playstore",
        url="https://example.com/image.png",
    )
    assert r.platform == "playstore"


def test_screenshot_create_invalid_platform():
    with pytest.raises(ValidationError):
        ScreenshotCreate(
            app_id="com.example.app",
            platform="invalid",
            url="https://example.com/image.png",
        )


def test_screenshot_create_app_id_empty():
    with pytest.raises(ValidationError):
        ScreenshotCreate(
            app_id="",
            platform="appstore",
            url="https://example.com/image.png",
        )
