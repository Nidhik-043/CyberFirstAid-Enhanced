
"""
CyberFirstAid Enhanced
Member 2 - Personalized Cyber Emergency Assistant

Automated tests for the emergency intelligence engine.
"""

import unittest

from ai_module.emergency import (
    generate_personalized_response,
    get_questionnaire,
    get_emergency_categories,
    get_emergency_contacts
)

from ai_module.emergency.action_priority import (
    get_action_summary
)


class TestEmergencyAssistant(unittest.TestCase):

    # Test 1: Supported categories
    def test_supported_categories(self):

        categories = get_emergency_categories()

        self.assertEqual(len(categories), 8)

    # Test 2: Questionnaires for every category
    def test_all_questionnaires(self):

        for category in get_emergency_categories():

            with self.subTest(category=category["id"]):

                result = get_questionnaire(category["id"])

                self.assertGreater(
                    result["total_questions"], 0
                )

                self.assertEqual(
                    result["total_questions"],
                    len(result["questions"])
                )

    # Test 3: Financial fraud
    def test_financial_fraud(self):

        result = generate_personalized_response(
            "financial_fraud",
            {
                "money_lost": "yes",
                "shared_credentials": "yes",
                "ongoing_transactions": "yes",
                "bank_contacted": "no",
                "fraud_reported": "no"
            }
        )

        ids = [item["id"] for item in result["actions"]]

        self.assertIn("contact_bank", ids)
        self.assertIn("call_1930", ids)
        self.assertIn("stop_transactions", ids)

    # Test 4: Phishing without financial loss
    def test_phishing(self):

        result = generate_personalized_response(
            "phishing",
            {
                "clicked_link": "yes",
                "entered_password": "yes",
                "shared_financial_details": "no",
                "downloaded_file": "no",
                "money_lost": "no"
            }
        )

        ids = [item["id"] for item in result["actions"]]

        self.assertIn("change_password", ids)
        self.assertNotIn("contact_bank", ids)
        self.assertNotIn("call_1930", ids)

    # Test 5: Social media hacking
    def test_social_media_hacking(self):

        result = generate_personalized_response(
            "social_media_hacking",
            {
                "account_access": "no",
                "recovery_details_changed": "yes",
                "unauthorized_activity": "yes",
                "linked_email_compromised": "no",
                "mfa_enabled": "no"
            }
        )

        ids = [item["id"] for item in result["actions"]]

        self.assertIn("recover_social_account", ids)
        self.assertIn("warn_contacts", ids)
        self.assertIn("enable_social_mfa", ids)

        self.assertNotIn("change_social_password", ids)

    # Test 6: Email compromise
    def test_email_compromise(self):

        result = generate_personalized_response(
            "email_compromise",
            {
                "account_access": "yes",
                "unauthorized_activity": "yes",
                "recovery_details_changed": "no",
                "suspicious_forwarding": "yes",
                "password_reused": "yes",
                "mfa_enabled": "no"
            }
        )

        ids = [item["id"] for item in result["actions"]]

        self.assertIn("change_email_password", ids)
        self.assertIn("remove_forwarding", ids)
        self.assertIn("secure_other_accounts", ids)

    # Test 7: Identity theft
    def test_identity_theft(self):

        result = generate_personalized_response(
            "identity_theft",
            {
                "documents_exposed": "yes",
                "financial_misuse": "yes",
                "fake_account": "yes",
                "service_provider_contacted": "no",
                "incident_reported": "no"
            }
        )

        ids = [item["id"] for item in result["actions"]]

        self.assertIn("protect_identity", ids)
        self.assertIn("report_impersonation", ids)
        self.assertIn("contact_bank", ids)

    # Test 8: Online harassment
    def test_online_harassment(self):

        result = generate_personalized_response(
            "online_harassment",
            {
                "physical_threat": "yes",
                "ongoing_harassment": "yes",
                "blackmail": "yes",
                "personal_information_exposed": "yes",
                "evidence_saved": "no",
                "incident_reported": "no"
            }
        )

        ids = [item["id"] for item in result["actions"]]

        self.assertIn("physical_safety", ids)
        self.assertIn("blackmail_response", ids)

        self.assertEqual(ids[0], "physical_safety")

    # Test 9: Lost or stolen devices
    def test_lost_stolen_devices(self):

        result = generate_personalized_response(
            "lost_stolen_devices",
            {
                "device_locked": "no",
                "sim_active": "yes",
                "banking_apps": "yes",
                "remote_lock_available": "yes",
                "unauthorized_activity": "no",
                "incident_reported": "no"
            }
        )

        ids = [item["id"] for item in result["actions"]]

        self.assertIn("remote_lock", ids)
        self.assertIn("block_sim", ids)
        self.assertIn("contact_bank", ids)

    # Test 10: Unknown incident
    def test_unknown_incident(self):

        result = generate_personalized_response(
            "unknown", {}
        )

        self.assertTrue(result["needs_review"])

        ids = [item["id"] for item in result["actions"]]

        self.assertIn("manual_review", ids)

    # Test 11: Invalid answers
    def test_invalid_answer(self):

        with self.assertRaises(ValueError):

            generate_personalized_response(
                "phishing",
                {"clicked_link": "invalid"}
            )

    # Test 12: Invalid category
    def test_invalid_category(self):

        with self.assertRaises(ValueError):

            generate_personalized_response(
                "invalid_category", {}
            )

    # Test 13: Invalid question ID
    def test_invalid_question(self):

        with self.assertRaises(ValueError):

            generate_personalized_response(
                "phishing",
                {"invalid_question": "yes"}
            )

    # Test 14: Uncertain answers
    def test_uncertain_answers(self):

        result = generate_personalized_response(
            "phishing",
            {"clicked_link": "unsure"}
        )

        self.assertTrue(result["needs_review"])

        self.assertIn(
            "clicked_link",
            result["uncertain_answers"]
        )

    # Test 15: Duplicate removal
    def test_duplicate_actions(self):

        result = generate_personalized_response(
            "phishing", {}
        )

        ids = [item["id"] for item in result["actions"]]

        self.assertEqual(len(ids), len(set(ids)))

        self.assertNotIn("preserve_evidence", ids)
        self.assertNotIn("official_reporting", ids)

    # Test 16: Priority ordering
    def test_priority_order(self):

        result = generate_personalized_response(
            "financial_fraud", {}
        )

        order = {
            "immediate": 0,
            "high": 1,
            "follow_up": 2
        }

        priorities = [
            order[item["priority"]]
            for item in result["actions"]
        ]

        self.assertEqual(
            priorities,
            sorted(priorities)
        )

    # Test 17: Recovery progress
    def test_recovery_progress(self):

        result = generate_personalized_response(
            "phishing",
            {
                "clicked_link": "yes",
                "entered_password": "yes",
                "shared_financial_details": "no",
                "downloaded_file": "no",
                "money_lost": "no"
            }
        )

        actions = result["actions"]

        actions[0]["completed"] = True

        summary = get_action_summary(actions)

        self.assertEqual(
            summary["completed_actions"], 1
        )

        self.assertEqual(
            summary["progress_percentage"],
            round(100 / len(actions), 2)
        )

    # Test 18: Emergency contacts
    def test_emergency_contacts(self):

        contacts = get_emergency_contacts()

        numbers = [
            contact["phone"]
            for contact in contacts
        ]

        self.assertIn("1930", numbers)
        self.assertIn("112", numbers)

    # ==========================================
    # NEW PERSONALIZED BANK RECOMMENDATION TESTS
    # ==========================================

    # Test 19: Bank already contacted
    def test_bank_already_contacted(self):

        result = generate_personalized_response(
            "financial_fraud",
            {
                "money_lost": "yes",
                "shared_credentials": "no",
                "ongoing_transactions": "no",
                "bank_contacted": "yes",
                "fraud_reported": "yes"
            }
        )

        actions = {
            item["id"]: item
            for item in result["actions"]
        }

        self.assertIn("contact_bank", actions)

        bank_action = actions["contact_bank"]

        self.assertEqual(
            bank_action["title"],
            "Follow up with your bank immediately"
        )

        self.assertEqual(
            bank_action["priority"],
            "immediate"
        )

        self.assertFalse(bank_action["completed"])

    # Test 20: Bank not contacted
    def test_bank_not_contacted(self):

        result = generate_personalized_response(
            "financial_fraud",
            {
                "money_lost": "yes",
                "shared_credentials": "no",
                "ongoing_transactions": "no",
                "bank_contacted": "no",
                "fraud_reported": "no"
            }
        )

        actions = {
            item["id"]: item
            for item in result["actions"]
        }

        self.assertIn("contact_bank", actions)

        bank_action = actions["contact_bank"]

        self.assertEqual(
            bank_action["title"],
            "Contact your bank immediately"
        )

        self.assertEqual(
            bank_action["priority"],
            "immediate"
        )

    # Test 21: Bank contact status uncertain
    def test_bank_contact_unsure(self):

        result = generate_personalized_response(
            "financial_fraud",
            {
                "money_lost": "yes",
                "shared_credentials": "no",
                "ongoing_transactions": "no",
                "bank_contacted": "unsure",
                "fraud_reported": "no"
            }
        )

        actions = {
            item["id"]: item
            for item in result["actions"]
        }

        self.assertIn("contact_bank", actions)

        bank_action = actions["contact_bank"]

        self.assertEqual(
            bank_action["title"],
            "Verify bank notification immediately"
        )

        self.assertEqual(
            bank_action["priority"],
            "immediate"
        )

        self.assertTrue(result["needs_review"])

        self.assertIn(
            "bank_contacted",
            result["uncertain_answers"]
        )

    # Test 22: Bank contacted but transactions continue
    def test_bank_contacted_ongoing_transactions(self):

        result = generate_personalized_response(
            "financial_fraud",
            {
                "money_lost": "yes",
                "shared_credentials": "yes",
                "ongoing_transactions": "yes",
                "bank_contacted": "yes",
                "fraud_reported": "no"
            }
        )

        actions = {
            item["id"]: item
            for item in result["actions"]
        }

        required_actions = [
            "contact_bank",
            "call_1930",
            "stop_transactions",
            "secure_payment_credentials"
        ]

        for task_id in required_actions:

            with self.subTest(task_id=task_id):

                self.assertIn(task_id, actions)

                self.assertEqual(
                    actions[task_id]["priority"],
                    "immediate"
                )

                self.assertFalse(
                    actions[task_id]["completed"]
                )

        self.assertEqual(
            actions["contact_bank"]["title"],
            "Follow up with your bank immediately"
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
