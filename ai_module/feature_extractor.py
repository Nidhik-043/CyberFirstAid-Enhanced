import math
import ipaddress
from collections import Counter
from urllib.parse import urlsplit

import pandas as pd
import tldextract
from pathlib import Path


DATA_DIR = Path(__file__).resolve().parent / "data"

extract_domain = tldextract.TLDExtract(
    suffix_list_urls=()
)

SUSPICIOUS_KEYWORDS = [
    "login",
    "verify",
    "secure",
    "account",
    "update",
    "password",
    "banking",
    "confirm",
    "wallet",
    "reward",
    "urgent",
    "kyc",
    "signin",
    "reset",
    "payment"
]

SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "is.gd",
    "buff.ly",
    "cutt.ly",
    "rb.gy"
}

BRANDS = {
    "google": ["google.com"],
    "paypal": ["paypal.com"],
    "amazon": ["amazon.com", "amazon.in"],
    "microsoft": ["microsoft.com"],
    "apple": ["apple.com"],
    "facebook": ["facebook.com"],
    "netflix": ["netflix.com"],
    "sbi": ["sbi.co.in", "bank.sbi", "onlinesbi.sbi"],
    "hdfc": ["hdfcbank.com"],
    "icici": ["icicibank.com"]
}


def calculate_entropy(text):

    if not text:
        return 0.0

    counts = Counter(text)

    return -sum(
        (count / len(text)) *
        math.log2(count / len(text))
        for count in counts.values()
    )


def is_ip_address(hostname):

    try:
        ipaddress.ip_address(hostname)
        return 1

    except ValueError:
        return 0


def detect_brand_impersonation(hostname, domain):

    for brand, official_domains in BRANDS.items():

        if brand in hostname:

            if domain not in official_domains:
                return 1

    return 0


def extract_features(url):

    url = str(url).strip()

    if "://" not in url:
        url = "https://" + url

    parsed = urlsplit(url)

    hostname = (parsed.hostname or "").lower()

    if not hostname:
        raise ValueError("Invalid hostname")

    extracted = extract_domain(hostname)

    domain = (
        extracted.top_domain_under_public_suffix
        or hostname
    )

    features = {

        "hostname_length": len(hostname),

        "domain_length": len(domain),

        "dot_count": hostname.count("."),

        "hyphen_count": hostname.count("-"),

        "digit_count": sum(
            char.isdigit() for char in hostname
        ),

        "digit_ratio": sum(
            char.isdigit() for char in hostname
        ) / max(len(hostname), 1),

        "subdomain_count": len(
            extracted.subdomain.split(".")
        ) if extracted.subdomain else 0,

        "is_ip_address": is_ip_address(hostname),

        "hostname_entropy": calculate_entropy(hostname),

        "domain_entropy": calculate_entropy(domain),

        "suspicious_keyword_count": sum(
            keyword in hostname
            for keyword in SUSPICIOUS_KEYWORDS
        ),

        "brand_impersonation": detect_brand_impersonation(
            hostname,
            domain
        ),

        "is_shortened_url": int(
            domain in SHORTENERS
        ),

        "has_punycode": int(
            "xn--" in hostname
        ),

        "has_unicode": int(
            any(ord(char) > 127 for char in hostname)
        ),

        "long_hostname": int(
            len(hostname) > 50
        )

    }

    return features


def generate_feature_dataset():

    input_file = DATA_DIR / "combined_dataset.csv"

    if not input_file.exists():
        raise FileNotFoundError(
            "Combined dataset not found"
        )

    dataset = pd.read_csv(input_file)

    feature_rows = []
    skipped = 0

    for _, row in dataset.iterrows():

        try:

            features = extract_features(row["url"])

            parsed = urlsplit(row["url"])

            hostname = parsed.hostname or ""

            extracted = extract_domain(hostname)

            features["domain_group"] = (
                extracted.top_domain_under_public_suffix
                or hostname
            )

            features["label"] = int(row["label"])

            feature_rows.append(features)

        except (ValueError, TypeError):

            skipped += 1

    feature_dataset = pd.DataFrame(feature_rows)

    if feature_dataset.empty:
        raise ValueError("No valid features extracted")

    output_file = DATA_DIR / "features_dataset.csv"

    feature_dataset.to_csv(
        output_file,
        index=False
    )

    print("=" * 55)
    print("CYBERFIRSTAID - FEATURE EXTRACTION")
    print("=" * 55)

    print("Original URLs:", len(dataset))

    print("Processed URLs:", len(feature_dataset))

    print("Skipped URLs:", skipped)

    print(
        "Number of ML features:",
        len(feature_dataset.columns) - 2
    )

    print(
        "Phishing samples:",
        sum(feature_dataset["label"] == 1)
    )

    print(
        "Legitimate samples:",
        sum(feature_dataset["label"] == 0)
    )

    print("Feature dataset saved successfully")


if __name__ == "__main__":
    generate_feature_dataset()