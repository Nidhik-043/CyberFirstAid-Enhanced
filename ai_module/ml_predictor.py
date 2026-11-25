from pathlib import Path
from functools import lru_cache

import joblib
import pandas as pd

from ai_module.feature_extractor import extract_features


MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "phishing_model.joblib"
)


@lru_cache(maxsize=1)
def load_model():

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "Trained model not found. Run train_model.py first."
        )

    return joblib.load(MODEL_PATH)


def predict_phishing(url: str) -> dict:

    bundle = load_model()

    model = bundle["model"]

    feature_names = bundle["feature_names"]

    features = extract_features(url)

    input_data = pd.DataFrame(
        [features],
        columns=feature_names
    )

    prediction = int(
        model.predict(input_data)[0]
    )

    probabilities = model.predict_proba(
        input_data
    )[0]

    class_scores = dict(
        zip(model.classes_, probabilities)
    )

    phishing_score = float(class_scores[1])

    legitimate_score = float(class_scores[0])

    if prediction == 1:

        classification = "Likely Phishing"

    else:

        classification = "Likely Legitimate"

    return {
        "model": "Random Forest",
        "prediction": prediction,
        "classification": classification,
        "phishing_score": round(
            phishing_score * 100, 2
        ),
        "legitimate_score": round(
            legitimate_score * 100, 2
        ),
        "features_analyzed": len(feature_names),
        "model_available": True,
        "evaluation_metrics": bundle.get("metrics", {}),
        "disclaimer": (
            "Machine learning predictions are estimates "
            "and do not guarantee website safety."
        )
    }


if __name__ == "__main__":

    print("=" * 55)
    print("CyberFirstAid - ML Phishing Predictor")
    print("=" * 55)

    while True:

        url = input(
            "\nEnter URL or type exit: "
        ).strip()

        if url.lower() == "exit":
            break

        try:

            result = predict_phishing(url)

            print("\nClassification:",
                  result["classification"])

            print("Phishing Score:",
                  result["phishing_score"], "%")

            print("Legitimate Score:",
                  result["legitimate_score"], "%")

            print("Features Analyzed:",
                  result["features_analyzed"])

            print("Model:", result["model"])

        except Exception as error:

            print("Prediction Error:", error)