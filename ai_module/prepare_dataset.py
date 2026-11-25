from pathlib import Path
import pandas as pd

from ai_module.threat_intelligence import load_phishing_feed


DATA_DIR = Path(__file__).resolve().parent / "data"

DATA_DIR.mkdir(parents=True, exist_ok=True)


def prepare_dataset():

    phishing_urls = sorted(load_phishing_feed())

    if not phishing_urls:
        raise ValueError("Phishing dataset is empty")

    phishing_data = pd.DataFrame({
        "url": phishing_urls,
        "label": 1,
        "source": "OpenPhish"
    })

    phishing_data.to_csv(
        DATA_DIR / "phishing_dataset.csv",
        index=False
    )

    legitimate_file = DATA_DIR / "legitimate_urls.txt"

    if not legitimate_file.exists():

        print("Phishing dataset prepared successfully")
        print("Phishing records:", len(phishing_data))
        print("Legitimate dataset is still required")

        return

    legitimate_urls = [
        line.strip()
        for line in legitimate_file.read_text(
            encoding="utf-8-sig"
        ).splitlines()
        if line.strip().startswith(("http://", "https://"))
    ]

    legitimate_data = pd.DataFrame({
        "url": legitimate_urls,
        "label": 0,
        "source": "Legitimate dataset"
    })

    dataset = pd.concat(
        [phishing_data, legitimate_data],
        ignore_index=True
    )

    conflicts = dataset.groupby("url")["label"].nunique()

    conflicting_urls = conflicts[conflicts > 1].index

    dataset = dataset[
        ~dataset["url"].isin(conflicting_urls)
    ]

    dataset = dataset.drop_duplicates(subset=["url"])

    dataset = dataset.sample(
        frac=1,
        random_state=42
    ).reset_index(drop=True)

    dataset.to_csv(
        DATA_DIR / "combined_dataset.csv",
        index=False
    )

    print("=" * 50)
    print("DATASET PREPARATION COMPLETED")
    print("=" * 50)

    print("Total URLs:", len(dataset))
    print("Phishing URLs:", sum(dataset["label"] == 1))
    print("Legitimate URLs:", sum(dataset["label"] == 0))
    print("Conflicting URLs removed:", len(conflicting_urls))

    print("Dataset saved successfully")


if __name__ == "__main__":
    prepare_dataset()