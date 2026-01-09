from __future__ import annotations

import re
from dataclasses import dataclass

import httpx
from bs4 import BeautifulSoup


@dataclass
class ScrapeResult:
    app_id: str
    platform: str  # appstore|playstore
    title: str | None
    developer: str | None
    screenshots: list[str]


async def scrape_app_store(app_id: str) -> ScrapeResult:
    # Prefer stable iTunes lookup API
    url = f"https://itunes.apple.com/lookup?id={app_id}&country=us"
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url)
        r.raise_for_status()
        data = r.json()
    results = data.get("results") or []
    if not results:
        raise RuntimeError("App Store lookup returned no results")
    item = results[0]
    screenshots = []
    for k in ("screenshotUrls", "ipadScreenshotUrls"):
        screenshots.extend(item.get(k) or [])
    screenshots = [u for u in dict.fromkeys(screenshots) if isinstance(u, str) and u.startswith("http")]
    return ScrapeResult(
        app_id=app_id,
        platform="appstore",
        title=item.get("trackName"),
        developer=item.get("artistName"),
        screenshots=screenshots,
    )


async def scrape_play_store(package_name: str) -> ScrapeResult:
    url = f"https://play.google.com/store/apps/details?id={package_name}&hl=en&gl=US"
    headers = {
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
    }
    async with httpx.AsyncClient(timeout=20, headers=headers, follow_redirects=True) as client:
        r = await client.get(url)
        r.raise_for_status()
        html = r.text

    soup = BeautifulSoup(html, "lxml")
    title = (soup.find("meta", {"property": "og:title"}) or {}).get("content")
    developer = (soup.find("meta", {"property": "og:description"}) or {}).get("content")
    icon = (soup.find("meta", {"property": "og:image"}) or {}).get("content")

    matches = re.findall(r"https://play-lh\.googleusercontent\.com/[A-Za-z0-9_-]+(?:=[^\"\\s<]*)?", html)
    # JSON-LD fallback
    for script in soup.find_all("script", {"type": "application/ld+json"}):
        try:
            import json

            data = json.loads(script.text)
            if isinstance(data, dict) and "screenshot" in data:
                val = data["screenshot"]
                if isinstance(val, str):
                    matches.append(val)
                elif isinstance(val, list):
                    matches.extend([v for v in val if isinstance(v, str)])
        except Exception:
            pass

    screenshots = []
    for m in matches:
        m = m.replace("\\u0026", "&").replace("\\u003d", "=").replace("&amp;", "&")
        if icon and m == icon:
            continue
        if m.startswith("https://play-lh.googleusercontent.com/"):
            screenshots.append(m)
    screenshots = list(dict.fromkeys(screenshots))

    return ScrapeResult(app_id=package_name, platform="playstore", title=title, developer=developer, screenshots=screenshots)

