from ai_module.src.classifier import classify_incident
from ai_module.src.recommendations import get_recommendations
from ai_module.src.risk_assessor import calculate_risk
from ai_module.src.ml_classifier import predict_incident


def assess_incident(description: str, answers: dict | None = None) -> dict:
    """Classify an incident, calculate risk and return guidance."""

    classification = classify_incident(description)
    category = classification["category"]

    ml_suggestion = None

    # Use ML only when rule-based classification cannot identify the category.
    if category == "unknown":
        ml_suggestion = predict_incident(description)

    recommendations = get_recommendations(category)
    risk = calculate_risk(description, category, answers)

    return {
        "incident_category": category,
        "matched_keywords": classification.get("matched_keywords", []),
        "classification_needs_review": classification.get("needs_review", True),
        "ml_suggestion": ml_suggestion,
        "classification_source": (
            "rule_based" if category != "unknown"
            else "ml_suggestion_requires_review"
        ),
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "risk_reasons": risk["risk_reasons"],
        "immediate_actions": recommendations["immediate_actions"],
        "follow_up_actions": recommendations["follow_up_actions"],
        "needs_review": (
            classification.get("needs_review", True)
            or recommendations.get("needs_review", False)
            or risk["needs_review"]
        )
    }
