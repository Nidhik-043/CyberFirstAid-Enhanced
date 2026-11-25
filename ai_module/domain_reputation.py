import csv
import ipaddress
import tldextract

from pathlib import Path
from functools import lru_cache
from urllib.parse import urlsplit


TRANCO_PATH = (
    Path(__file__).resolve().parent
    / "data"
    / "tranco"
    / "top-1m.csv"
)

extract_domain = tldextract.TLDExtract(
    suffix_list_urls=(),
    include_psl_private_domains=True
)

OFFICIAL_DOMAINS = {
    "incometax.gov.in": "Income Tax Department",
    "npci.org.in": "National Payments Corporation of India",
    "whatsapp.com": "WhatsApp",
    "google.com": "Google",
    "amazon.com": "Amazon",
    "amazon.in": "Amazon India",
    "microsoft.com": "Microsoft",
    "apple.com": "Apple",
    "github.com": "GitHub",
    "sbi.co.in": "State Bank of India",
    "bank.sbi": "State Bank of India",
    "onlinesbi.sbi": "SBI Online Banking",
    "hdfcbank.com": "HDFC Bank",
    "icicibank.com": "ICICI Bank",
    "axisbank.com": "Axis Bank",
    "rbi.org.in": "Reserve Bank of India",
    "uidai.gov.in": "UIDAI",
    "cybercrime.gov.in": "National Cyber Crime Portal",
    "digilocker.gov.in": "DigiLocker",
    "india.gov.in": "Government of India",
    "irctc.co.in": "IRCTC",
    "flipkart.com": "Flipkart",
    "phonepe.com": "PhonePe",
    "paytm.com": "Paytm",
    "paypal.com": "PayPal",
    "instagram.com": "Instagram",
    "facebook.com": "Facebook",
    "youtube.com": "YouTube",
    "netflix.com": "Netflix",
    "linkedin.com": "LinkedIn",
    "openai.com": "OpenAI",
    "chatgpt.com": "ChatGPT"
}


@lru_cache(maxsize=1)
def load_tranco():
    domains = {}

    if not TRANCO_PATH.is_file():
        return domains

    with open(
        TRANCO_PATH,
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        reader = csv.reader(file)

        for row in reader:
            if len(row) < 2:
                continue

            try:
                rank = int(row[0])
                domain = row[1].strip().lower()

                # Limit memory usage on our laptop
                if rank <= 100000:
                    domains[domain] = rank

            except ValueError:
                continue

    return domains


def check_domain_reputation(url):
    try:
        url = str(url).strip()

        if "\\" in url or any(c.isspace() for c in url):
            raise ValueError("Invalid URL")

        if url.startswith("//"):
            url = "https:" + url
        elif "://" not in url:
            url = "https://" + url

        parsed = urlsplit(url)

        if parsed.scheme not in ("http", "https"):
            raise ValueError("Unsupported URL scheme")

        if parsed.username is not None:
            raise ValueError("URL contains user information")

        host = (parsed.hostname or "").lower().rstrip(".")

        if not host:
            raise ValueError("Missing hostname")

        host = host.encode("idna").decode("ascii")

        try:
            ipaddress.ip_address(host)
            domain = host

        except ValueError:
            info = extract_domain(host)

            domain = (
                f"{info.domain}.{info.suffix}"
                if info.suffix else host
            )

        tranco = load_tranco()
        rank = tranco.get(domain)

        official = host in OFFICIAL_DOMAINS

        if host.startswith("www."):
            official = host[4:] in OFFICIAL_DOMAINS

        organization = (
            OFFICIAL_DOMAINS.get(host)
            or OFFICIAL_DOMAINS.get(
                host.removeprefix("www.")
            )
        )

        if official:
            reputation = "Recognized Official Domain"

        elif rank is not None and rank <= 1000:
            reputation = "Highly Popular Domain"

        elif rank is not None and rank <= 10000:
            reputation = "Popular Domain"

        elif rank is not None:
            reputation = "Established Ranked Domain"

        else:
            reputation = "Unknown Domain Reputation"

        return {
            "domain": domain,
            "hostname": host,
            "official_domain": official,
            "organization": organization,
            "tranco_rank": rank,
            "reputation": reputation,
            "database_available": bool(tranco),
            "database_size": len(tranco),
            "live_verification": False,
            "disclaimer": (
                "Domain popularity and recognition "
                "do not guarantee URL safety."
            )
        }

    except (ValueError, UnicodeError) as error:
        return {
            "reputation": "Unavailable",
            "official_domain": False,
            "error": str(error),
            "live_verification": False
        }


if __name__ == "__main__":
    import json

    test_urls = [
        "https://www.google.com",
        "https://incometax.gov.in",
        "https://npci.org.in",
        "https://whatsapp.com",
        "https://www.sbi.co.in",
        "https://google.com.example.com",
        "https://secure-sbi-login.example.com"
    ]

    for url in test_urls:
        print("\n" + "=" * 50)
        print("URL:", url)

        print(json.dumps(
            check_domain_reputation(url),
            indent=4
        ))