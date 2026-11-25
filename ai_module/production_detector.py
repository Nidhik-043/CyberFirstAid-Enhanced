from ai_module.final_detector import analyze_phishing
from ai_module.domain_reputation import check_domain_reputation

from urllib.parse import urlsplit


def analyze_production_url(url):

    # Layers 1, 2 and 3:
    # Rule-based detection
    # OpenPhish threat intelligence
    # Binary Random Forest

    result = analyze_phishing(url)

    # Layer 4: Domain reputation

    reputation = check_domain_reputation(url)

    threat = result.get("threat_intelligence", {})
    ml = result.get("machine_learning", {})

    rule_score = result.get("rule_based_score", 0)
    ml_score = result.get("ml_phishing_score", 0)

    risk_score = result.get("risk_score", 0)
    indicators = result.get("indicators", [])

    official = reputation.get("official_domain", False)
    rank = reputation.get("tranco_rank")

    ml_available = ml.get("model_available", False)
    feed_available = threat.get("feed_available", False)

    normalized_url = result.get("normalized_url", url)
    parsed = urlsplit(normalized_url)

    https = parsed.scheme == "https"

    reasons = []

    # Highest priority: confirmed threat feed match

    if threat.get("matched", False):

        classification = "Known Phishing Threat"
        risk_score = 100

        reasons.append(
            "URL matched the OpenPhish threat database."
        )

    # Preserve existing security warnings

    elif risk_score >= 60 or rule_score >= 60:

        classification = "High Risk"

        reasons.append(
            "Strong malicious URL indicators detected."
        )

    elif risk_score >= 30 or rule_score >= 30:

        classification = "Suspicious"

        reasons.append(
            "Potentially suspicious URL patterns detected."
        )

    # Recognize official domains only when
    # supporting security checks are satisfactory

    elif (
        official
        and https
        and parsed.username is None
        and parsed.port in (None, 443)
        and rule_score == 0
        and not indicators
        and ml_available
        and ml_score < 20
        and feed_available
        and risk_score < 30
    ):

        classification = "Recognized Official Domain"

        reasons.append(
            "Hostname matches the maintained official-domain list."
        )

        reasons.append(
            "No strong phishing indicators were detected."
        )

    # Popular domains receive supporting reputation
    # evidence, not an automatic safety guarantee

    elif (
        rank is not None
        and https
        and parsed.username is None
        and parsed.port in (None, 443)
        and rule_score == 0
        and not indicators
        and ml_available
        and ml_score < 20
        and feed_available
        and risk_score < 30
    ):

        classification = "Low Risk"

        reasons.append(
            "Domain has an established popularity ranking."
        )

        reasons.append(
            "Available security checks found no strong warnings."
        )

    else:

        classification = "Unverified"

        reasons.append(
            "Insufficient evidence to establish URL trustworthiness."
        )

    if not ml_available:

        reasons.append(
            "Machine learning analysis is unavailable."
        )

    if not feed_available:

        reasons.append(
            "Threat intelligence database is unavailable."
        )

    if official:

        reasons.append(
            "Recognized organization: "
            + str(reputation.get("organization"))
        )

    if rank is not None:

        reasons.append(
            f"Tranco domain rank: {rank}"
        )

    # Personalized security recommendations

    if classification in [
        "Known Phishing Threat",
        "High Risk"
    ]:

        recommendations = [
            "Do not open this link.",
            "Do not enter passwords, OTPs or banking details.",
            "Report the suspicious link using CyberFirstAid.",
            "Access the organization through its official website.",
            "If you already shared sensitive information, "
            "use the Emergency Response module."
        ]

        evidence_level = "Strong warning evidence"

    elif classification == "Suspicious":

        recommendations = [
            "Verify the sender independently.",
            "Avoid entering sensitive information.",
            "Do not download unknown files.",
            "Use the organization's official website."
        ]

        evidence_level = "Suspicious indicators"

    else:

        recommendations = [
            "Check the website address carefully.",
            "Verify unexpected requests for sensitive information.",
            "Remember that URL analysis cannot guarantee safety."
        ]

        evidence_level = (
            "Supporting reputation evidence"
            if classification != "Unverified"
            else "Insufficient evidence"
        )

    result.update({

        "risk_score": min(100, max(0, risk_score)),

        "classification": classification,

        "verdict": classification,

        "domain_reputation": reputation,

        "decision_reasons": reasons,

        "recommendations": recommendations,

        "evidence_level": evidence_level,

        "detection_layers": 4,

        "detection_methods": [
            "Rule-Based Security Analysis",
            "OpenPhish Threat Intelligence",
            "Binary Random Forest",
            "Tranco Domain Reputation"
        ],

        "analysis_method":
            "Four-Layer Hybrid URL Analysis",

        "engine_version": "4.0",

        "live_verification": False,

        "disclaimer": (
            "CyberFirstAid analyzes URL patterns, known "
            "phishing records, machine learning predictions "
            "and domain reputation. It does not visit the "
            "website or guarantee its safety."
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
        "https://github.com",
        "https://example.com",
        "https://secure-sbi-login.example.com",
        "https://paypal-verify-account.example.com",
        "https://google.com.example.com",
        "https://bit.ly/example",
        "http://192.0.2.10/login"
    ]

    for url in test_urls:

        result = analyze_production_url(url)

        summary = {
            "url": url,
            "classification": result["classification"],
            "risk_score": result["risk_score"],
            "rule_score": result.get("rule_based_score"),
            "ml_score": result.get("ml_phishing_score"),
            "domain_reputation": result[
                "domain_reputation"
            ].get("reputation"),
            "decision_reasons": result["decision_reasons"]
        }

        print("\n" + "=" * 60)

        print(json.dumps(summary, indent=4))