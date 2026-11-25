"""ML-based incident prediction for CyberFirstAid."""

import os
import joblib


MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "incident_classifier.joblib"
)


def predict_incident(description: str) -> dict:
    """Predict an incident category using the trained ML model."""

    if not isinstance(description, str) or not description.strip():
        return {
            "category": "unknown",
            "confidence": 0.0,
            "needs_review": True
        }

    if not os.path.exists(MODEL_PATH):
        return {
            "category": "unknown",
            "confidence": 0.0,
            "needs_review": True
        }

    try:
        model = joblib.load(MODEL_PATH)
        probabilities = model.predict_proba([description])[0]

        best_index = probabilities.argmax()
        category = str(model.classes_[best_index])
        confidence = float(probabilities[best_index])

        return {
            "category": category,
            "confidence": round(confidence, 4),
            "needs_review": confidence < 0.60
        }

    except Exception:
        return {
            "category": "unknown",
            "confidence": 0.0,
            "needs_review": True
        }

