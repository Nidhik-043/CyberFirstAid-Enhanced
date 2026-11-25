import json
import logging

from ai_module.hybrid_detector import analyze_link
from ai_module.ml_predictor import predict_phishing


logger = logging.getLogger(__name__)


def analyze_phishing(url: str) -> dict:

    # Layer 1 and Layer 2
    result = analyze_link(url)

    rule_score = result.get(
        "rule_based_score",
        result["risk_score"]
    )

    threat = result.get("threat_intelligence", {})

    known_threat = threat.get("matched", False)

    original_classification = result["classification"]

    # Layer 3: Machine learning
    try:

        ml_result = predict_phishing(
            result["normalized_url"]
        )

        ml_score = ml_result["phishing_score"]

        ml_available = (
            ml_result.get("model_available", False)
            and isinstance(ml_score, (int, float))
            and 0 <= ml_score <= 100
        )

        if not ml_available:
            ml_score = None
            ml_result["model_available"] = False
            ml_result["phishing_score"] = None

    except Exception:

        logger.exception("ML prediction unavailable")

        ml_result = {
            "model": "Random Forest",
            "model_available": False,
            "classification": "Unavailable",
            "phishing_score": None
        }

        ml_score = None

        ml_available = False

    # Combine detection layers
    final_score = rule_score

    if known_threat:

        final_score = 100

        classification = "Known Phishing Threat"

        reason = (
            "URL matches the OpenPhish threat database."
        )

    elif rule_score >= 60:

        classification = "High Risk"

        reason = (
            "Strong phishing indicators detected "
            "by rule-based analysis."
        )

    elif ml_available and ml_score >= 80:

        final_score = max(
            rule_score,
            round(ml_score)
        )

        classification = "High Risk"

        reason = (
            "Machine learning detected strong "
            "similarity to phishing URL patterns."
        )

    elif rule_score >= 30 or (
        ml_available and ml_score >= 50
    ):

        final_score = max(
            rule_score,
            round(ml_score or 0)
        )

        classification = "Suspicious"

        reason = (
            "Potential phishing indicators detected."
        )

    elif (

    result.get("domain_recognized", False)
    and result.get("normalized_url", "").startswith("https://")
    and rule_score == 0
    and not result.get("indicators")
    and ml_available
    and ml_score < 20
    and threat.get("feed_available", False)

    ):

        classification = "Genuine"

        reason = (
            "Recognized official domain with no "
            "detected rule-based indicators and "
            "a low machine learning phishing score."
        )

    else:

        classification = "Unverified"

        reason = (
            "Insufficient evidence to establish "
            "website authenticity or safety."
        )

    # Security recommendations
    if classification in [
        "Known Phishing Threat",
        "High Risk"
    ]:

        recommendations = [
            "Do not open this link.",
            "Do not enter passwords or banking details.",
            "Access the organization through its official website.",
            "Report the suspicious link."
        ]

    elif classification == "Suspicious":

        recommendations = [
            "Avoid entering sensitive information.",
            "Verify the sender and website address.",
            "Confirm the link through an official source."
        ]

    elif classification == "Genuine":

        recommendations = [
            "The URL matches a recognized official domain.",
            "Always verify unexpected requests for sensitive information.",
            "Domain recognition does not guarantee page safety."
        ]

    else:

        recommendations = [
            "Verify the website independently.",
            "Do not assume the website is safe.",
            "Avoid sharing sensitive information until verified."
        ]

    result["risk_score"] = final_score
    result["classification"] = classification
    result["verdict"] = reason
    result["evidence_level"] = {
    "Known Phishing Threat": "Threat feed match",
    "High Risk": "Strong risk indicators",
    "Suspicious": "Potential risk indicators",
    "Genuine": "Recognized official domain",
    "Unverified": "Insufficient evidence"
}[classification]
    result["rule_based_score"] = rule_score

    result["machine_learning"] = ml_result

    result["ml_phishing_score"] = ml_score

    result["detection_methods"] = [
        "Rule-based URL analysis",
        "OpenPhish threat intelligence",
        "Random Forest machine learning"
    ]

    result["detection_layers"] = {
        "rule_based": {
            "available": True,
            "risk_score": rule_score
        },
        "threat_intelligence": {
            "available": threat.get(
                "feed_available", False
            ),
            "matched": known_threat
        },
        "machine_learning": {
            "available": ml_available,
            "phishing_score": ml_score
        }
    }

    result["recommendations"] = recommendations

    result["analysis_method"] = (
        "Three-layer hybrid phishing detection"
    )

    result["live_verification"] = False

    result["disclaimer"] = (
        "This analysis uses URL patterns, local threat "
        "intelligence and machine learning. It does not "
        "visit the website or guarantee its safety. "
        "Risk scores are not calibrated probabilities."
    )

    return result


if __name__ == "__main__":

    print("=" * 60)
    print("CYBERFIRSTAID - HYBRID PHISHING DETECTOR")
    print("=" * 60)

    while True:

        url = input(
            "\nEnter URL or type exit: "
        ).strip()

        if url.lower() == "exit":
            break

        try:

            result = analyze_phishing(url)

            print(json.dumps(
                result,
                indent=4,
                ensure_ascii=False
            ))

        except Exception as error:

            print("Analysis error:", error)
