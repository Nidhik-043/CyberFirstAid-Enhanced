from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from datetime import datetime, timezone


FEED_PATH = (
    Path(__file__).resolve().parent
    / "data"
    / "phishing_urls.txt"
)


def normalize_url(url):

    url = url.strip()

    if "://" not in url:
        url = "https://" + url

    parsed = urlsplit(url)

    if parsed.scheme not in ("http", "https"):
        raise ValueError("Unsupported URL scheme")

    if not parsed.hostname:
        raise ValueError("Invalid URL")

    if parsed.username is not None:
        raise ValueError("URL contains user information")

    hostname = parsed.hostname.lower()

    if ":" in hostname:
        hostname = "[" + hostname + "]"

    port = parsed.port

    if port is not None:
        if not (
            (parsed.scheme == "https" and port == 443)
            or (parsed.scheme == "http" and port == 80)
        ):
            hostname += ":" + str(port)

    return urlunsplit((
        parsed.scheme.lower(),
        hostname,
        parsed.path or "/",
        parsed.query,
        ""
    ))


def load_phishing_feed():

    if not FEED_PATH.exists():
        return set()

    urls = set()

    with open(FEED_PATH, encoding="utf-8-sig") as file:

        for line in file:

            line = line.strip()

            if not line.startswith(("http://", "https://")):
                continue

            try:
                urls.add(normalize_url(line))

            except ValueError:
                continue

    return urls


def check_reputation(url):

    phishing_urls = load_phishing_feed()

    updated_at = None

    if FEED_PATH.exists():

        updated_at = datetime.fromtimestamp(
            FEED_PATH.stat().st_mtime,
            tz=timezone.utc
        ).isoformat()

    # Handle URLs that are not eligible for lookup

    try:

        normalized = normalize_url(url)

    except ValueError:

        return {
            "source": "OpenPhish",
            "matched": False,
            "status": "URL Not Eligible for Reputation Lookup",
            "feed_available": bool(phishing_urls),
            "database_size": len(phishing_urls),
            "local_feed_updated_at": updated_at,
            "live_verification": False
        }

    matched = normalized in phishing_urls

    if matched:

        status = "Known Phishing Threat"

    elif phishing_urls:

        status = "Not Found in Feed"

    else:

        status = "Threat Intelligence Unavailable"

    return {
        "source": "OpenPhish",
        "matched": matched,
        "status": status,
        "feed_available": bool(phishing_urls),
        "database_size": len(phishing_urls),
        "local_feed_updated_at": updated_at,
        "live_verification": False
    }