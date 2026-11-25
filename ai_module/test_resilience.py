from unittest.mock import patch

from ai_module.production_detector import analyze_production_url
from ai_module.final_detector import analyze_phishing
from ai_module import final_detector, hybrid_detector


TEST_URL = "https://www.google.com"

SAFE_CLASSIFICATIONS = {
    "Genuine",
    "Recognized Official Domain",
    "Low Risk",
}

UNAVAILABLE_FEED = {
    "source": "OpenPhish",
    "matched": False,
    "status": "Threat Intelligence Unavailable",
    "feed_available": False,
    "database_size": 0,
    "local_feed_updated_at": None,
    "live_verification": False,
}

UNAVAILABLE_MODEL = {
    "model": "Random Forest",
    "model_available": False,
    "prediction": None,
    "classification": "Unavailable",
    "phishing_score": None,
    "legitimate_score": None,
    "features_analyzed": 0,
    "evaluation_metrics": {},
    "live_verification": False,
}

UNAVAILABLE_REPUTATION = {
    "domain": "google.com",
    "hostname": "www.google.com",
    "official_domain": False,
    "organization": None,
    "tranco_rank": None,
    "reputation": "Unavailable",
    "database_available": False,
    "database_size": 0,
    "live_verification": False,
}


def run_test(name, url, unavailable_layer=None):
    print("\n" + "=" * 60)
    print(name)
    print("=" * 60)

    try:
        result = analyze_production_url(url)

        classification = result.get("classification")
        score = result.get("risk_score")

        print("Classification:", classification)
        print("Risk Score:", score)

        threat = result.get("threat_intelligence", {})
        ml = result.get("machine_learning", {})
        reputation = result.get("domain_reputation", {})

        print("Feed Available:", threat.get("feed_available"))
        print("Model Available:", ml.get("model_available"))
        print(
            "Reputation Available:",
            reputation.get("database_available"),
        )

        if unavailable_layer:
            availability = {
                "feed": threat.get("feed_available"),
                "model": ml.get("model_available"),
                "reputation": reputation.get("database_available"),
            }

            if availability[unavailable_layer] is not False:
                print("Result: FAIL - Simulation not reflected")
                return "FAIL"

            if classification in SAFE_CLASSIFICATIONS:
                print("Result: REVIEW - Reassuring verdict with missing layer")
                return "REVIEW"

        if name == "Suspicious URL Without ML":
            if classification not in {
                "Suspicious",
                "High Risk",
                "Known Phishing Threat",
            }:
                print("Result: FAIL - Warning not preserved")
                return "FAIL"

        print("Result: PASS")
        return "PASS"

    except Exception as error:
        print("Result: ERROR")
        print(type(error).__name__, str(error))
        return "ERROR"


def main():
    results = []

    # Test 1: Normal operation
    results.append(
        run_test("Normal Operation", TEST_URL)
    )

    # Test 2: Threat intelligence unavailable
    with patch.object(
        hybrid_detector,
        "check_reputation",
        return_value=UNAVAILABLE_FEED,
    ):
        results.append(
            run_test(
                "Threat Intelligence Unavailable",
                TEST_URL,
                "feed",
            )
        )

    # Test 3: Machine learning unavailable
    with patch.object(
        final_detector,
        "predict_phishing",
        return_value=UNAVAILABLE_MODEL,
    ):
        results.append(
            run_test(
                "Machine Learning Unavailable",
                TEST_URL,
                "model",
            )
        )

        results.append(
            run_test(
                "Suspicious URL Without ML",
                "https://secure-sbi-login.example.com",
                "model",
            )
        )

    # Test 5: Domain reputation unavailable
    with patch(
        "ai_module.production_detector.check_domain_reputation",
        return_value=UNAVAILABLE_REPUTATION,
    ):
        results.append(
            run_test(
                "Domain Reputation Unavailable",
                TEST_URL,
                "reputation",
            )
        )

    print("\n" + "=" * 60)
    print("RESILIENCE TEST SUMMARY")
    print("=" * 60)

    print("Total Tests:", len(results))
    print("Passed:", results.count("PASS"))
    print("Failed:", results.count("FAIL"))
    print("Needs Review:", results.count("REVIEW"))
    print("Errors:", results.count("ERROR"))


if __name__ == "__main__":
    main()