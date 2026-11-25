import joblib
import pandas as pd
import sklearn
import tldextract

from pathlib import Path
from functools import lru_cache

from ai_module.advanced_feature_extractor import extract_features


MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "advanced_url_model.joblib"
)


@lru_cache(maxsize=1)
def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Advanced model not found: {MODEL_PATH}"
        )

    bundle = joblib.load(MODEL_PATH)

    if bundle["sklearn_version"] != sklearn.__version__:
        raise RuntimeError(
            "Scikit-learn version mismatch. "
            f"Required: {bundle['sklearn_version']}, "
            f"Installed: {sklearn.__version__}"
        )

    if bundle["tldextract_version"] != tldextract.__version__:
        raise RuntimeError(
            "Tldextract version mismatch. "
            f"Required: {bundle['tldextract_version']}, "
            f"Installed: {tldextract.__version__}"
        )

    return bundle


def predict_advanced(url):
    features = extract_features(url)

    if features is None:
        return {
            "model_available": False,
            "error": "Invalid or unsupported URL"
        }

    try:
        bundle = load_model()

        model = bundle["model"]
        feature_columns = bundle["feature_columns"]

        missing = [
            name for name in feature_columns
            if name not in features
        ]

        if missing:
            raise ValueError(
                f"Missing model features: {missing}"
            )

        input_data = pd.DataFrame(
            [[features[name] for name in feature_columns]],
            columns=feature_columns,
            dtype="float32"
        )

        prediction = str(
            model.predict(input_data)[0]
        )

        probabilities = model.predict_proba(
            input_data
        )[0]

        scores = {
            str(label): round(float(prob) * 100, 2)
            for label, prob in zip(
                model.classes_,
                probabilities
            )
        }

        malicious_score = sum(
            scores.get(label, 0)
            for label in [
                "phishing",
                "malware",
                "defacement"
            ]
        )

        return {
            "model_available": True,
            "model": bundle["model_name"],
            "model_version": bundle["model_version"],
            "prediction": prediction,
            "confidence": scores[prediction],
            "benign_score": scores.get("benign", 0),
            "phishing_score": scores.get("phishing", 0),
            "malware_score": scores.get("malware", 0),
            "defacement_score": scores.get("defacement", 0),
            "malicious_score": round(malicious_score, 2),
            "class_probabilities": scores,
            "features_analyzed": len(feature_columns),
            "evaluation_metrics": bundle["evaluation_metrics"],
            "live_verification": False,
            "disclaimer": (
                "ML predictions are based on URL patterns. "
                "They do not confirm website safety or "
                "actual malicious content."
            )
        }

    except Exception as error:
        return {
            "model_available": False,
            "error": str(error)
        }


if __name__ == "__main__":
    import json

    test_urls = [
        "https://www.google.com",
        "https://www.amazon.com",
        "https://www.sbi.co.in",
        "https://secure-sbi-login.example.com",
        "https://paypal-verify-account.example.com",
        "https://example.com"
    ]

    for url in test_urls:
        print("\n" + "=" * 50)
        print("URL:", url)

        result = predict_advanced(url)

        print(json.dumps(result, indent=4))
