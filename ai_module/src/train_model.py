"""Train and evaluate the CyberFirstAid incident classification model."""

import csv
import os

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline


DATASET_PATH = "ai_module/datasets/cyberfirstaid_synthetic_incidents_7_categories.csv"
MODEL_PATH = "ai_module/models/incident_classifier.joblib"


def load_dataset():
    """Load incident descriptions and category labels from the CSV."""

    with open(DATASET_PATH, encoding="utf-8-sig", newline="") as file:
        records = list(csv.DictReader(file))

    texts = [row["incident_text"].strip() for row in records]
    labels = [row["category"].strip() for row in records]

    if not texts or len(texts) != len(labels):
        raise ValueError("Dataset is empty or invalid.")

    return texts, labels


def create_model():
    """Create the TF-IDF and Logistic Regression pipeline."""

    return Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                lowercase=True,
                ngram_range=(1, 2),
                sublinear_tf=True
            )
        ),
        (
            "classifier",
            LogisticRegression(
                max_iter=2000,
                class_weight="balanced",
                random_state=42
            )
        )
    ])


def main():
    texts, labels = load_dataset()

    print("TOTAL RECORDS:", len(texts))
    print("TOTAL CATEGORIES:", len(set(labels)))

    model = create_model()

    # Evaluate using stratified 3-fold cross-validation.
    cv = StratifiedKFold(
        n_splits=3,
        shuffle=True,
        random_state=42
    )

    predictions = cross_val_predict(
        model,
        texts,
        labels,
        cv=cv
    )

    print("\n3-FOLD CROSS-VALIDATION RESULTS")
    print("Accuracy:", round(accuracy_score(labels, predictions), 4))

    print("\nCLASSIFICATION REPORT")
    print(
        classification_report(
            labels,
            predictions,
            zero_division=0
        )
    )

    # Train the final model using all available examples.
    model.fit(texts, labels)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print("FINAL MODEL SAVED:", MODEL_PATH)


if __name__ == "__main__":
    main()
