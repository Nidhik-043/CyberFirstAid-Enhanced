from pathlib import Path
from urllib.parse import urlsplit
import pandas as pd
import tldextract

from ai_module.threat_intelligence import load_phishing_feed


DATA_DIR = Path(__file__).resolve().parent / "data"

extract = tldextract.TLDExtract(
    suffix_list_urls=()
)


def registered_domain(hostname):

    parts = extract(hostname)

    return parts.top_domain_under_public_suffix or hostname


def collect_legitimate():

    csv_path = DATA_DIR / "tranco" / "top-1m.csv"

    if not csv_path.exists():
        raise FileNotFoundError("Tranco CSV file not found")

    phishing_urls = load_phishing_feed()

    phishing_domains = {
        registered_domain(urlsplit(url).hostname)
        for url in phishing_urls
        if urlsplit(url).hostname
    }

    data = pd.read_csv(
        csv_path,
        header=None,
        names=["rank", "domain"],
        nrows=10000
    )

    data = data.dropna(subset=["domain"])

    data = data.drop_duplicates(subset=["domain"])

    data = data[
        ~data["domain"].apply(
            registered_domain
        ).isin(phishing_domains)
    ]

    sample = data.sample(
        n=min(1000, len(data)),
        random_state=42
    )

    legitimate_urls = [
        "https://" + domain.strip()
        for domain in sample["domain"]
    ]

    output_file = DATA_DIR / "legitimate_urls.txt"

    output_file.write_text(
        "\n".join(legitimate_urls) + "\n",
        encoding="utf-8"
    )

    print("=" * 50)
    print("LEGITIMATE DATASET COLLECTION")
    print("=" * 50)

    print("Source: Tranco")
    print("Legitimate candidates:", len(legitimate_urls))
    print("Known phishing domains excluded")
    print("Dataset saved successfully")


if __name__ == "__main__":
    collect_legitimate()