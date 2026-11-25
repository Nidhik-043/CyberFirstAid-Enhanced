from ai_module.phishing_detector import analyze_url
from ai_module.threat_intelligence import check_reputation

import json


def analyze_link(url: str) -> dict:

    result = analyze_url(url)

    reputation = check_reputation(
        result["normalized_url"]
    )

    result["threat_intelligence"] = reputation
    result["rule_based_score"] = result["risk_score"]

    result["detection_methods"] = [
        "Rule-based URL analysis",
        "OpenPhish reputation lookup"
    ]

    if reputation["matched"]:

        result["risk_score"] = 100
        result["classification"] = "Known Phishing Threat"

        result["verdict"] = (
            "This URL matches a reported phishing threat."
        )

        result["indicators"].append({
            "indicator": "Known phishing URL",
            "points": 100,
            "explanation": (
                "URL found in the OpenPhish threat feed."
            )
        })

        result["recommendations"] = [
            "Do not open this link.",
            "Do not enter personal information.",
            "Do not download any files.",
            "Block and report the sender.",
            "Change passwords if credentials were shared."
        ]

        result["evidence_level"] = "Threat feed match"

    elif result["risk_score"] >= 60:

        result["classification"] = "High Risk"
        result["verdict"] = (
            "Strong phishing characteristics detected."
        )
        result["evidence_level"] = (
            "Strong heuristic indicators"
        )

    elif result["risk_score"] >= 30:

        result["classification"] = "Suspicious"
        result["verdict"] = (
            "Suspicious URL characteristics detected."
        )
        result["evidence_level"] = "Heuristic indicators"

    elif (
        result.get("domain_recognized", False)
        and result["classification"] == "Genuine"
        and result["risk_score"] == 0
    ):

        result["classification"] = "Genuine"
        result["verdict"] = (
            "Recognized official domain with no detected "
            "URL warning signs."
        )
        result["evidence_level"] = "Trusted domain match"

    else:

        result["classification"] = "Unverified"
        result["verdict"] = (
            "Website authenticity is not confirmed."
        )
        result["evidence_level"] = "Insufficient evidence"

    result["indicator_count"] = len(result["indicators"])

    result["analysis_method"] = (
        "Hybrid rule-based and threat intelligence analysis"
    )

    result["live_verification"] = False

    result["disclaimer"] = (
        "This analysis does not guarantee website safety "
        "or verify live website content."
    )

    return result


if __name__ == "__main__":

    print("=" * 55)
    print("CyberFirstAid - Hybrid Phishing Detector")
    print("=" * 55)

    while True:

        url = input("\nEnter URL or type exit: ").strip()

        if url.lower() == "exit":
            break

        try:
            result = analyze_link(url)
            print(json.dumps(result, indent=4))

        except ValueError as error:
            print("Invalid URL:", error)