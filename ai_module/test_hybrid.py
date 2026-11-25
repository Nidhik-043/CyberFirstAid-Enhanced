from ai_module.hybrid_detector import analyze_link
from ai_module.threat_intelligence import load_phishing_feed


test_cases = [
    ("https://www.google.com", "Genuine"),
    ("https://www.amazon.com", "Genuine"),
    ("https://github.com", "Genuine"),
    ("https://www.microsoft.com", "Genuine"),
    ("https://www.apple.com", "Genuine"),
    ("https://example.com", "Unverified"),
    ("https://paypa1.example.com", "High Risk"),
    ("https://bit.ly/example", "Suspicious"),
    ("http://192.0.2.10/login", "Suspicious"),
    (
        "http://sbi-secure-kyc.example.com/login",
        "High Risk"
    ),
    (
        "https://google.com@example.com/login",
        "High Risk"
    ),
    (
        "https://secure-paypal.example.com/verify",
        "High Risk"
    )
]


passed = 0
failed = 0

print("=" * 65)
print("CYBERFIRSTAID - HYBRID DETECTOR TESTING")
print("=" * 65)


for index, (url, expected) in enumerate(test_cases, 1):

    try:
        result = analyze_link(url)

        actual = result["classification"]
        score = result["risk_score"]

        success = actual == expected

        if success:
            passed += 1
        else:
            failed += 1

        print(f"\nTest {index}")
        print(f"URL: {url}")
        print(f"Expected: {expected}")
        print(f"Actual: {actual}")
        print(f"Risk Score: {score}")
        print(f"Result: {'PASS' if success else 'FAIL'}")

    except Exception as error:

        failed += 1
        print(f"\nTest {index}: ERROR")
        print(error)


print("\n" + "=" * 65)
print("REAL-WORLD THREAT FEED TEST")
print("=" * 65)

phishing_urls = load_phishing_feed()

samples = sorted(phishing_urls)[:20]

detected = 0

for url in samples:

    try:
        result = analyze_link(url)

        if result["classification"] == "Known Phishing Threat":
            detected += 1

    except Exception:
        pass


print(f"Available phishing records: {len(phishing_urls)}")
print(f"Phishing samples tested: {len(samples)}")
print(f"Known threats detected: {detected}")


print("\n" + "=" * 65)
print("FINAL TEST SUMMARY")
print("=" * 65)

print(f"Total functional tests: {len(test_cases)}")
print(f"Passed: {passed}")
print(f"Failed: {failed}")

pass_rate = (passed / len(test_cases)) * 100

print(f"Functional test pass rate: {pass_rate:.2f}%")

if samples:
    detection_rate = detected / len(samples) * 100
    print(f"Threat feed match rate: {detection_rate:.2f}%")

print("\nTesting completed.")