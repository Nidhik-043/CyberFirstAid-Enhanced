import unittest

from ai_module.src.ml_classifier import predict_incident
from ai_module.src.assessment import assess_incident


class TestCyberFirstAidML(unittest.TestCase):

    def test_ml_returns_valid_prediction(self):
        result = predict_incident(
            "Someone hacked my Instagram account"
        )

        self.assertIn(
            result["category"],
            [
                "financial_fraud",
                "phishing",
                "social_media_hacking",
                "email_compromise",
                "identity_theft",
                "online_harassment",
                "lost_stolen_devices"
            ]
        )
        self.assertGreaterEqual(result["confidence"], 0.0)
        self.assertLessEqual(result["confidence"], 1.0)

    def test_empty_ml_input_requires_review(self):
        result = predict_incident("")

        self.assertEqual(result["category"], "unknown")
        self.assertTrue(result["needs_review"])

    def test_unknown_incident_requires_human_review(self):
        result = assess_incident("I received an unclear message")

        self.assertEqual(result["incident_category"], "unknown")
        self.assertEqual(
            result["classification_source"],
            "ml_suggestion_requires_review"
        )
        self.assertTrue(result["needs_review"])


if __name__ == "__main__":
    unittest.main()
