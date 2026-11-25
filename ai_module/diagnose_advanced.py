from ai_module.advanced_ml_predictor import predict_advanced


test_urls = [
    "google.com",
    "www.google.com",
    "http://google.com",
    "https://google.com",
    "https://www.google.com",
    "https://www.google.com/",

    "amazon.com",
    "www.amazon.com",
    "http://amazon.com",
    "https://amazon.com",
    "https://www.amazon.com",

    "whatsapp.com",
    "https://whatsapp.com",

    "example.com",
    "https://example.com",

    "secure-sbi-login.example.com",
    "https://secure-sbi-login.example.com"
]


print("=" * 90)
print("ADVANCED MODEL BIAS DIAGNOSTIC")
print("=" * 90)

for url in test_urls:

    result = predict_advanced(url)

    if not result.get("model_available"):
        print("Error:", result.get("error"))
        continue

    print(f"\nURL: {url}")
    print(f"Prediction: {result['prediction']}")
    print(f"Benign: {result['benign_score']}%")
    print(f"Phishing: {result['phishing_score']}%")
    print(f"Malware: {result['malware_score']}%")
    print(f"Defacement: {result['defacement_score']}%")
    print(f"Malicious: {result['malicious_score']}%")
    print("-" * 70)