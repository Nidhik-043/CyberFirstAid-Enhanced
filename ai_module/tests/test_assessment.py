import unittest

from ai_module.src.assessment import assess_incident


class TestCyberFirstAidAssessment(unittest.TestCase):

    def test_financial_fraud(self):
        result = assess_incident(
            "Someone stole money from my bank account after I shared an OTP"
        )
        self.assertEqual(result["incident_category"], "financial_fraud")
        self.assertEqual(result["risk_level"], "critical")
        self.assertTrue(result["immediate_actions"])

    def test_social_media_hacking(self):
        result = assess_incident(
            "Someone hacked my Instagram account and changed my password"
        )
        self.assertEqual(
            result["incident_category"], "social_media_hacking"
        )
        self.assertEqual(result["risk_level"], "high")

    def test_phishing(self):
        result = assess_incident(
            "I clicked a suspicious link on a fake website"
        )
        self.assertEqual(result["incident_category"], "phishing")
        self.assertEqual(result["risk_level"], "medium")

    def test_unknown_incident(self):
        result = assess_incident(
            "Something unusual happened online"
        )
        self.assertEqual(result["incident_category"], "unknown")
        self.assertEqual(result["risk_level"], "unassessed")
        self.assertTrue(result["needs_review"])

    def test_empty_description(self):
        result = assess_incident("")
        self.assertEqual(result["incident_category"], "unknown")
        self.assertTrue(result["needs_review"])

    def test_questionnaire_yes_increases_risk(self):
        result = assess_incident(
            "I noticed an unknown transaction in my bank account",
            {"money_lost": "Yes"}
        )
        self.assertEqual(result["risk_score"], 60)
        self.assertEqual(result["risk_level"], "high")

    def test_questionnaire_no_does_not_add_risk(self):
        result = assess_incident(
            "I noticed an unknown transaction in my bank account",
            {"money_lost": "No"}
        )
        self.assertEqual(result["risk_score"], 25)
        self.assertFalse(result["needs_review"])

    def test_not_sure_requires_review(self):
        result = assess_incident(
            "I noticed an unknown transaction in my bank account",
            {"money_lost": "Not sure"}
        )
        self.assertEqual(result["risk_score"], 25)
        self.assertTrue(result["needs_review"])

    def test_duplicate_money_loss_is_not_counted_twice(self):
        result = assess_incident(
            "Someone stole money from my bank account",
            {"money_lost": "Yes"}
        )
        self.assertEqual(result["risk_score"], 70)


if __name__ == "__main__":
    unittest.main()


