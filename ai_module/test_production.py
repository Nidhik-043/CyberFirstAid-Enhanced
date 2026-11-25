import csv
import time
from pathlib import Path

from ai_module.production_detector import analyze_production_url

TEST_CASES = [
    # Recognized legitimate websites
    ("Google", "https://www.google.com", "Benign"),
    ("Amazon", "https://www.amazon.com", "Benign"),
    ("Microsoft", "https://www.microsoft.com", "Benign"),
    ("Apple", "https://www.apple.com", "Benign"),
    ("GitHub", "https://github.com", "Benign"),
    ("SBI", "https://www.sbi.co.in", "Benign"),
    ("HDFC", "https://www.hdfcbank.com", "Benign"),
    ("WhatsApp", "https://whatsapp.com", "Benign"),
    ("Income Tax", "https://incometax.gov.in", "Benign"),
    ("NPCI", "https://npci.org.in", "Benign"),

    # Simulated suspicious URLs
    (
        "Fake SBI",
        "https://secure-sbi-login.example.com",
        "Suspicious",
    ),
    (
        "Fake PayPal",
        "https://paypa1.example.com",
        "Suspicious",
    ),
    (
        "Google Impersonation",
        "https://google.com.example.com",
        "Suspicious",
    ),
    (
        "Misleading URL",
        "https://google.com@example.com",
        "Suspicious",
    ),
    (
        "Shortened URL",
        "https://bit.ly/example",
        "Suspicious",
    ),
    (
        "IP Address",
        "http://192.0.2.1/login",
        "Suspicious",
    ),
    (
        "Fake Amazon",
        "https://amazon-verify-account.example.com",
        "Suspicious",
    ),
    (
        "Fake Microsoft",
        "https://microsoft-password-reset.example.com",
        "Suspicious",
    ),

    # Unknown or ordinary domains
    (
        "Example Domain",
        "https://example.com",
        "Neutral",
    ),
    (
        "Unknown Domain",
        "https://unknown-test-site.example",
        "Neutral",
    ),
]

HIGH_RISK = {
    "High Risk",
    "Known Phishing Threat",
}

WARNING = HIGH_RISK | {"Suspicious"}

LOW_RISK = {
    "Recognized Official Domain",
    "Low Risk",
    "Genuine",
}


def evaluate_result(expected, classification):
    if expected == "Benign":
        if classification in LOW_RISK:
            return "PASS"

        if classification == "Unverified":
            return "REVIEW"

        return "FAIL"

    if expected == "Suspicious":
        return (
            "PASS"
            if classification in WARNING
            else "FAIL"
        )

    if expected == "Known Threat":
        return (
            "PASS"
            if classification == "Known Phishing Threat"
            else "FAIL"
        )

    return "REVIEW"


def run_tests():
    results = []

    print("=" * 75)
    print("CYBERFIRSTAID - FOUR-LAYER ENGINE TESTING")
    print("=" * 75)

    test_cases = TEST_CASES.copy()

    # Add a known phishing record from the local feed.
    feed_path = (
        Path(__file__).resolve().parent
        / "data"
        / "phishing_urls.txt"
    )

    if feed_path.exists():
        feed_urls = [
            line.strip()
            for line in feed_path.read_text(
                encoding="utf-8-sig"
            ).splitlines()
            if line.strip().startswith(
                ("http://", "https://")
            )
        ]

        if feed_urls:
            test_cases.append(
                (
                    "OpenPhish Known Threat",
                    feed_urls[0],
                    "Known Threat",
                )
            )

    for name, url, expected in test_cases:
        start = time.perf_counter()

        try:
            result = analyze_production_url(url)

            elapsed = round(
                (time.perf_counter() - start) * 1000,
                2,
            )

            classification = result.get(
                "classification",
                "Unknown",
            )

            risk_score = result.get("risk_score")

            threat = result.get(
                "threat_intelligence", {}
            )

            ml = result.get(
                "machine_learning", {}
            )

            reputation = result.get(
                "domain_reputation", {}
            )

            outcome = evaluate_result(
                expected,
                classification,
            )

            row = {
                "test_name": name,
                "expected_category": expected,
                "classification": classification,
                "risk_score": risk_score,
                "rule_score": result.get(
                    "rule_based_score"
                ),
                "ml_score": result.get(
                    "ml_phishing_score"
                ),
                "threat_matched": threat.get(
                    "matched"
                ),
                "feed_available": threat.get(
                    "feed_available"
                ),
                "model_available": ml.get(
                    "model_available"
                ),
                "reputation_available": reputation.get(
                    "database_available"
                ),
                "domain_rank": reputation.get(
                    "tranco_rank"
                ),
                "response_time_ms": elapsed,
                "outcome": outcome,
            }

            results.append(row)

            print(f"\nTest: {name}")
            print(f"Expected: {expected}")
            print(f"Classification: {classification}")
            print(f"Risk Score: {risk_score}/100")
            print(f"Response Time: {elapsed} ms")
            print(f"Result: {outcome}")

        except Exception as error:
            print(f"\nTest: {name}")
            print(f"Result: ERROR ({type(error).__name__})")

            results.append({
                "test_name": name,
                "expected_category": expected,
                "classification": "ERROR",
                "outcome": "ERROR",
            })

    passed = sum(
        row["outcome"] == "PASS"
        for row in results
    )

    failed = sum(
        row["outcome"] == "FAIL"
        for row in results
    )

    review = sum(
        row["outcome"] == "REVIEW"
        for row in results
    )

    errors = sum(
        row["outcome"] == "ERROR"
        for row in results
    )

    print("\n" + "=" * 75)
    print("FINAL TEST SUMMARY")
    print("=" * 75)

    print(f"Total Tests: {len(results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Needs Review: {review}")
    print(f"Errors: {errors}")

    output_path = (
        Path(__file__).resolve().parent
        / "models"
        / "production_test_results.csv"
    )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    fields = [
        "test_name",
        "expected_category",
        "classification",
        "risk_score",
        "rule_score",
        "ml_score",
        "threat_matched",
        "feed_available",
        "model_available",
        "reputation_available",
        "domain_rank",
        "response_time_ms",
        "outcome",
    ]

    with output_path.open(
        "w",
        newline="",
        encoding="utf-8",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=fields,
        )

        writer.writeheader()
        writer.writerows(results)

    print(f"\nResults saved to: {output_path}")


if __name__ == "__main__":
    run_tests()