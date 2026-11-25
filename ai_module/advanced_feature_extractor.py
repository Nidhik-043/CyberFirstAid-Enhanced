import re
import math
import ipaddress
import tldextract

from collections import Counter
from urllib.parse import urlsplit

extract_domain = tldextract.TLDExtract(
    suffix_list_urls=(),
    include_psl_private_domains=True
)

SUSPICIOUS_WORDS = [
    "login", "verify", "secure", "account",
    "update", "password", "bank", "confirm",
    "signin", "wallet", "payment", "support",
    "free", "bonus", "reward", "urgent"
]

SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co",
    "goo.gl", "ow.ly", "is.gd", "buff.ly"
}


def entropy(text):
    if not text:
        return 0.0

    counts = Counter(text)
    length = len(text)

    return -sum(
        (count / length) * math.log2(count / length)
        for count in counts.values()
    )


def extract_features(url):
    try:
        url = str(url).strip()

        if any(c.isspace() or ord(c) < 32 for c in url):
            return None

        if "\\" in url:
            return None

        normalized = url

        if normalized.startswith("//"):
            normalized = "http:" + normalized
        elif "://" not in normalized:
            normalized = "http://" + normalized

        parsed = urlsplit(normalized)

        if parsed.scheme.lower() not in ("http", "https"):
            return None

        host = (parsed.hostname or "").lower().rstrip(".")

        if not host:
            return None

        port = parsed.port
        path = parsed.path
        query = parsed.query

        try:
            ipaddress.ip_address(host)
            is_ip = 1
        except ValueError:
            is_ip = 0

            host = host.encode("idna").decode("ascii")

            if len(host) > 253:
                return None

            if not re.fullmatch(r"[a-z0-9.-]+", host):
                return None

            if any(
                not label
                or len(label) > 63
                or label.startswith("-")
                or label.endswith("-")
                for label in host.split(".")
            ):
                return None

        info = extract_domain(host)

        domain = info.domain

        registered_domain = ".".join(
            part for part in [info.domain, info.suffix]
            if part
        )

        if is_ip:
            registered_domain = host
        elif not info.suffix:
            registered_domain = host

        lower_url = url.lower()
        digits = sum(c.isdigit() for c in url)

        return {
            "url_length": len(url),
            "hostname_length": len(host),
            "domain_length": len(domain),
            "path_length": len(path),
            "query_length": len(query),
            "dot_count": url.count("."),
            "hyphen_count": url.count("-"),
            "underscore_count": url.count("_"),
            "slash_count": url.count("/"),
            "question_count": url.count("?"),
            "equal_count": url.count("="),
            "at_count": url.count("@"),
            "percent_count": url.count("%"),
            "ampersand_count": url.count("&"),
            "digit_count": digits,
            "letter_count": sum(c.isalpha() for c in url),
            "digit_ratio": digits / max(len(url), 1),
            "subdomain_count": (
                len(info.subdomain.split("."))
                if info.subdomain else 0
            ),
            "path_depth": len([
                p for p in path.split("/") if p
            ]),
            "query_parameter_count": len([
                p for p in query.split("&") if p
            ]),
            "is_ip_address": is_ip,
            "uses_https": int(
                url.lower().startswith("https://")
            ),
            "has_explicit_scheme": int("://" in url),
            "has_punycode": int("xn--" in host),
            "has_unicode": int(
                any(ord(c) > 127 for c in url)
            ),
            "has_userinfo": int(
                parsed.username is not None
            ),
            "has_unusual_port": int(
                port is not None and port not in (80, 443)
            ),
            "is_shortened_url": int(
                registered_domain in SHORTENERS
            ),
            "suspicious_keyword_count": sum(
                word in lower_url
                for word in SUSPICIOUS_WORDS
            ),
            "url_entropy": entropy(url),
            "hostname_entropy": entropy(host),
            "domain_entropy": entropy(domain),
            "domain_group": registered_domain or host
        }

    except (ValueError, UnicodeError):
        return None


if __name__ == "__main__":
    sample = extract_features("https://www.google.com")

    assert sample is not None

    print("Advanced feature extractor working!")
    print("Numerical features:", len(sample) - 1)
    print("Domain group:", sample["domain_group"])