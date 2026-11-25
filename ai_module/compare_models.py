import joblib
import pandas as pd
import sklearn
import tldextract

from pathlib import Path
from ai_module.advanced_feature_extractor import extract_features


MODEL_DIR = Path(__file__).resolve().parent / "models"

MODEL_FILES = {
    "V2": MODEL_DIR / "advanced_url_model.joblib",
    "V3": MODEL_DIR / "advanced_url_model_v3.joblib"
}


def load_bundle(path):

    bundle = joblib.load(path)

    if bundle["sklearn_version"] != sklearn.__version__:
        raise RuntimeError(
            f"Scikit-learn mismatch: "
            f"Required {bundle['sklearn_version']}, "
            f"Installed {sklearn.__version__}"
        )

    if bundle["tldextract_version"] != tldextract.__version__:
        raise RuntimeError(
            f"Tldextract mismatch: "
            f"Required {bundle['tldextract_version']}, "
            f"Installed {tldextract.__version__}"
        )

    bundle["model"].verbose = 0

    return bundle


def predict(bundle, url):

    features = extract_features(url)

    if features is None:
        raise ValueError("Invalid URL")

    columns = bundle["feature_columns"]

    input_data = pd.DataFrame(
        [[features[col] for col in columns]],
        columns=columns,
        dtype="float32"
    )

    model = bundle["model"]

    probabilities = model.predict_proba(
        input_data
    )[0]

    scores = {
        label: round(float(prob) * 100, 2)
        for label, prob in zip(
            model.classes_,
            probabilities
        )
    }

    prediction = max(scores, key=scores.get)

    malicious_score = sum(
        scores.get(label, 0)
        for label in [
            "phishing",
            "malware",
            "defacement"
        ]
    )

    return prediction, round(malicious_score, 2)


TEST_CASES = [
    ("google.com", "benign"),
    ("https://www.google.com", "benign"),
    ("https://www.amazon.com", "benign"),
    ("https://incometax.gov.in", "benign"),
    ("https://npci.org.in", "benign"),
    ("https://whatsapp.com", "benign"),
    ("https://www.sbi.co.in", "benign"),
    ("https://www.apple.com", "benign"),
    ("https://github.com", "benign"),
    ("https://example.com", "benign"),

    (
        "https://secure-sbi-login.example.com",
        "suspicious"
    ),
    (
        "https://paypal-verify-account.example.com",
        "suspicious"
    ),
    (
        "https://google.com.example.com",
        "suspicious"
    ),
    (
        "https://amaz0n-login.example.com",
        "suspicious"
    ),
    (
        "https://192.0.2.10/bank/login",
        "suspicious"
    )
]


all_results = {}

for version, path in MODEL_FILES.items():

    print("\n" + "=" * 80)
    print("TESTING MODEL:", version)
    print("=" * 80)

    bundle = load_bundle(path)

    print("Features:", len(bundle["feature_columns"]))

    print("\nEvaluation metrics:")

    for metric, value in bundle["evaluation_metrics"].items():
        print(f"{metric}: {value * 100:.2f}%")

    results = []

    for url, expected in TEST_CASES:

        prediction, score = predict(bundle, url)

        results.append({
            "URL": url,
            "Expected": expected,
            "Prediction": prediction,
            "Malicious %": score
        })

    all_results[version] = pd.DataFrame(results)

    # Release the model before loading the next one
    del bundle

    import gc
    gc.collect()


comparison = pd.DataFrame({
    "URL": all_results["V2"]["URL"],
    "Expected": all_results["V2"]["Expected"],
    "V2 Prediction": all_results["V2"]["Prediction"],
    "V2 Risk %": all_results["V2"]["Malicious %"],
    "V3 Prediction": all_results["V3"]["Prediction"],
    "V3 Risk %": all_results["V3"]["Malicious %"]
})


print("\n" + "=" * 100)
print("MODEL COMPARISON")
print("=" * 100)

print(comparison.to_string(index=False))


for version, results in all_results.items():

    benign = results[
        results["Expected"] == "benign"
    ]

    suspicious = results[
        results["Expected"] == "suspicious"
    ]

    correct_benign = (
        benign["Prediction"] == "benign"
    ).sum()

    detected_suspicious = (
        suspicious["Prediction"] != "benign"
    ).sum()

    print(f"\n{version} SUMMARY")

    print(
        "Correct legitimate URLs:",
        correct_benign,
        "/",
        len(benign)
    )

    print(
        "Simulated suspicious URLs flagged:",
        detected_suspicious,
        "/",
        len(suspicious)
    )

    print(
        "Average legitimate malicious score:",
        round(benign["Malicious %"].mean(), 2)
    )

    print(
        "Average suspicious malicious score:",
        round(suspicious["Malicious %"].mean(), 2)
    )


comparison.to_csv(
    MODEL_DIR / "model_comparison.csv",
    index=False
)

print("\nComparison report saved successfully!")