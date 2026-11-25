from ai_module.hybrid_detector import analyze_link
from ai_module.domain_reputation import check_domain_reputation
from ai_module.advanced_ml_bridge import predict_using_advanced_model


def analyze_advanced_url(url):

    # Layers 1 and 2:
    # Rule-based analysis and threat intelligence
    result = analyze_link(url)

    # Layer 3: Advanced machine learning
    ml = predict_using_advanced_model(url)

    # Layer 4: Domain reputation
    reputation = check_domain_reputation(url)

    threat = result.get("threat_intelligence", {})

    rule_score = result.get(
        "rule_based_score",
        result.get("risk_score", 0)
    )

    ml_available = ml.get("model_available", False)

    malicious_score = ml.get("malicious_score", 0)

    official = reputation.get("official_domain", False)

    rank = reputation.get("tranco_rank")

    risk_score = rule_score
    reasons = []

    # Known threats always receive highest priority
    if threat.get("matched", False):

        risk_score = 100
        classification = "Known Phishing Threat"

        reasons.append(
            "URL matched the OpenPhish threat database."
        )

    else:

        # Machine learning contributes supporting evidence
        if ml_available:

            ml_risk = round(malicious_score * 0.8)

            risk_score = max(rule_score, ml_risk)

            if malicious_score >= 75:
                reasons.append(
                    "Machine learning detected strong "
                    "malicious URL patterns."
                )

            elif malicious_score >= 40:
                reasons.append(
                    "Machine learning detected potentially "
                    "suspicious URL patterns."
                )

        else:
            reasons.append(
                "Advanced machine learning is unavailable."
            )

        if rule_score >= 60:
            reasons.append(
                "Strong rule-based security indicators detected."
            )

        if official:
            reasons.append(
                "Hostname matches a recognized official domain."
            )

        elif rank is not None:
            reasons.append(
                f"Domain appears in Tranco at rank {rank}."
            )

        # Reputation must never override threat indicators
        if risk_score >= 60:

            classification = "High Risk"

        elif risk_score >= 30:

            classification = "Suspicious"

        elif (
            official
            and rule_score == 0
            and not result.get("indicators")
            and ml_available
            and malicious_score < 20
            and threat.get("feed_available", False)
            and url.lower().startswith("https://")
        ):

            classification = "Recognized Official Domain"

        elif (
            rank is not None
            and rule_score == 0
            and not result.get("indicators")
            and ml_available
            and malicious_score < 30
            and threat.get("feed_available", False)
        ):

            classification = "Low Risk"

        else:

            classification = "Unverified"

    recommendations = []

    if classification in [
        "Known Phishing Threat",
        "High Risk"
    ]:

        recommendations = [
            "Do not open the suspicious link.",
            "Do not enter passwords, OTPs or banking details.",
            "Report the link through CyberFirstAid.",
            "Access the organization through its official website."
        ]

    elif classification == "Suspicious":

        recommendations = [
            "Verify the sender before opening the link.",
            "Avoid entering sensitive information.",
            "Use the organization's official website instead."
        ]

    else:

        recommendations = [
            "Verify the website address before proceeding.",
            "Never share passwords or OTPs with unknown parties.",
            "Remember that URL analysis cannot guarantee safety."
        ]

    result.update({
        "risk_score": min(100, max(0, risk_score)),
        "classification": classification,
        "verdict": classification,
        "rule_based_score": rule_score,
        "advanced_machine_learning": ml,
        "domain_reputation": reputation,
        "decision_reasons": reasons,
        "recommendations": recommendations,
        "detection_layers": 4,
        "analysis_method": "Four-Layer Hybrid URL Analysis",
        "live_verification": False,
        "disclaimer": (
            "This analysis combines URL patterns, threat "
            "intelligence, machine learning and domain "
            "reputation. It does not guarantee website "
            "safety or confirm malicious website content."
        )
    })

    return result


if __name__ == "__main__":

    import json

    test_urls = [
        "https://www.google.com",
        "https://www.amazon.com",
        "https://incometax.gov.in",
        "https://npci.org.in",
        "https://whatsapp.com",
        "https://www.sbi.co.in",
        "https://secure-sbi-login.example.com",
        "https://paypal-verify-account.example.com",
        "https://google.com.example.com",
        "https://bit.ly/example",
        "https://example.com"
    ]

    for url in test_urls:

        result = analyze_advanced_url(url)

        summary = {
            "url": url,
            "classification": result["classification"],
            "risk_score": result["risk_score"],
            "rule_score": result["rule_based_score"],
            "ml_available": result[
                "advanced_machine_learning"
            ].get("model_available"),
            "ml_prediction": result[
                "advanced_machine_learning"
            ].get("prediction"),
            "ml_malicious_score": result[
                "advanced_machine_learning"
            ].get("malicious_score"),
            "domain_reputation": result[
                "domain_reputation"
            ].get("reputation"),
            "decision_reasons": result["decision_reasons"]
        }

        print("\n" + "=" * 50)
        print(json.dumps(summary, indent=4))