from pathlib import Path
from urllib.parse import urlsplit

import pandas as pd


DATA_DIR = Path(__file__).resolve().parent / "data"


def improve_dataset():

    input_file = DATA_DIR / "combined_dataset.csv"

    if not input_file.exists():
        raise FileNotFoundError(
            "Combined dataset not found"
        )

    dataset = pd.read_csv(input_file)

    backup_file = DATA_DIR / "combined_dataset_backup.csv"

    if not backup_file.exists():
        dataset.to_csv(backup_file, index=False)

    # Always use the original dataset
    dataset = pd.read_csv(backup_file)

    legitimate = dataset[dataset["label"] == 0]

    additional_rows = []

    for _, row in legitimate.iterrows():

        parsed = urlsplit(row["url"])

        hostname = parsed.hostname

        if not hostname:
            continue

        if hostname.startswith("www."):
            continue

        additional_rows.append({
            "url": f"https://www.{hostname}",
            "label": 0,
            "source": "Synthetic WWW augmentation"
        })

    additional_data = pd.DataFrame(
        additional_rows,
        columns=["url", "label", "source"]
    )

    improved = pd.concat(
        [dataset, additional_data],
        ignore_index=True
    )

    conflicts = improved.groupby("url")["label"].nunique()

    conflicting_urls = conflicts[conflicts > 1].index

    improved = improved[
        ~improved["url"].isin(conflicting_urls)
    ]

    improved = improved.drop_duplicates(
        subset=["url"]
    )

    improved = improved.sample(
        frac=1,
        random_state=42
    ).reset_index(drop=True)

    improved.to_csv(
        input_file,
        index=False
    )

    print("=" * 55)
    print("CYBERFIRSTAID - DATASET IMPROVEMENT")
    print("=" * 55)

    print("Original samples:", len(dataset))

    print("Additional WWW variants:", len(additional_rows))

    print("Updated dataset size:", len(improved))

    print(
        "Legitimate candidates:",
        sum(improved["label"] == 0)
    )

    print(
        "Phishing samples:",
        sum(improved["label"] == 1)
    )

    print("Original dataset backup saved")
    print("Dataset improvement completed")


if __name__ == "__main__":
    improve_dataset()