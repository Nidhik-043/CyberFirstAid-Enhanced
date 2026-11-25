from pathlib import Path

import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedGroupKFold

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


def train_model():

    dataset_path = DATA_DIR / "features_dataset.csv"

    if not dataset_path.exists():
        raise FileNotFoundError(
            "Run feature_extractor.py first"
        )

    dataset = pd.read_csv(dataset_path)

    X = dataset.drop(
        columns=["label", "domain_group"]
    )

    y = dataset["label"].astype(int)

    groups = dataset["domain_group"].astype(str)

    feature_names = X.columns.tolist()

    # Separate training and testing by domain

    splitter = StratifiedGroupKFold(
        n_splits=5,
        shuffle=True,
        random_state=42
    )

    train_index, test_index = next(
        splitter.split(X, y, groups)
    )

    X_train = X.iloc[train_index]
    X_test = X.iloc[test_index]

    y_train = y.iloc[train_index]
    y_test = y.iloc[test_index]

    train_domains = set(groups.iloc[train_index])
    test_domains = set(groups.iloc[test_index])

    overlap = train_domains.intersection(
        test_domains
    )

    if overlap:
        raise ValueError(
            "Domain leakage detected"
        )

    print("=" * 60)
    print("CYBERFIRSTAID - MODEL TRAINING")
    print("=" * 60)

    print("Total samples:", len(dataset))
    print("Training samples:", len(X_train))
    print("Testing samples:", len(X_test))
    print("Number of features:", len(feature_names))
    print("Overlapping domains:", len(overlap))

    print("\nTraining Random Forest model...")

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test, predictions
    )

    precision = precision_score(
        y_test, predictions, zero_division=0
    )

    recall = recall_score(
        y_test, predictions, zero_division=0
    )

    f1 = f1_score(
        y_test, predictions, zero_division=0
    )

    print("\n" + "=" * 60)
    print("MODEL EVALUATION RESULTS")
    print("=" * 60)

    print(f"Accuracy:  {accuracy * 100:.2f}%")
    print(f"Precision: {precision * 100:.2f}%")
    print(f"Recall:    {recall * 100:.2f}%")
    print(f"F1 Score:  {f1 * 100:.2f}%")

    print("\nConfusion Matrix:")

    print(
        confusion_matrix(
            y_test,
            predictions,
            labels=[0, 1]
        )
    )

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            predictions,
            labels=[0, 1],
            target_names=[
                "Legitimate candidate",
                "Phishing"
            ],
            zero_division=0
        )
    )

    importance = pd.DataFrame({
        "feature": feature_names,
        "importance": model.feature_importances_
    })

    importance = importance.sort_values(
        by="importance",
        ascending=False
    )

    print("\nTop 10 Important Features:")

    print(
        importance.head(10).to_string(
            index=False
        )
    )

    model_bundle = {
        "model": model,
        "feature_names": feature_names,
        "metrics": {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1
        }
    }

    model_path = MODEL_DIR / "phishing_model.joblib"

    joblib.dump(
        model_bundle,
        model_path
    )

    print("\nModel saved successfully")
    print("Model location:", model_path)

    print("\nTraining completed!")


if __name__ == "__main__":
    train_model()