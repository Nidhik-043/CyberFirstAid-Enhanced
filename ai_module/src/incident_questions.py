"""Incident-specific follow-up questions for CyberFirstAid."""

ANSWER_OPTIONS = ["Yes", "No", "Not sure"]

INCIDENT_QUESTIONS = {
    "financial_fraud": [
        {
            "id": "money_lost",
            "question": "Was any money deducted or transferred without your permission?",
            "risk_points_if_yes": 35,
            "risk_reason_if_yes": "Unauthorised financial transaction reported."
        },
        {
            "id": "bank_details_shared",
            "question": "Did you share an OTP, UPI PIN, card PIN or banking password?",
            "risk_points_if_yes": 20,
            "risk_reason_if_yes": "Sensitive banking information was shared."
        },
        {
            "id": "remote_access",
            "question": "Did you install an application or give someone remote access to your device?",
            "risk_points_if_yes": 25,
            "risk_reason_if_yes": "A third party may have remote access to the device."
        },
        {
            "id": "bank_access",
            "question": "Can you still access your bank account?",
            "risk_points_if_yes": 15,
            "risk_reason_if_yes": "The user may have lost access to the bank account.",
            "risk_when": "No"
        }
    ],

    "phishing": [
        {
            "id": "link_clicked",
            "question": "Did you click or open the suspicious link?",
            "risk_points_if_yes": 5,
            "risk_reason_if_yes": "A suspicious link was opened."
        },
        {
            "id": "credentials_entered",
            "question": "Did you enter your password or login details on the website?",
            "risk_points_if_yes": 20,
            "risk_reason_if_yes": "Login credentials may have been exposed."
        },
        {
            "id": "financial_details_entered",
            "question": "Did you enter your card details, UPI PIN or banking information?",
            "risk_points_if_yes": 30,
            "risk_reason_if_yes": "Financial information may have been exposed."
        },
        {
            "id": "file_downloaded",
            "question": "Did you download or install a file or application from the suspicious message?",
            "risk_points_if_yes": 20,
            "risk_reason_if_yes": "A suspicious file or application was downloaded."
        }
    ],

    "social_media_hacking": [
        {
            "id": "account_access",
            "question": "Can you still access your social media account?",
            "risk_points_if_yes": 20,
            "risk_reason_if_yes": "The user has lost access to the account.",
            "risk_when": "No"
        },
        {
            "id": "password_changed",
            "question": "Did someone change your account password without permission?",
            "risk_points_if_yes": 20,
            "risk_reason_if_yes": "Account password may have been changed by an attacker."
        },
        {
            "id": "unknown_messages",
            "question": "Are unknown messages or posts being sent from your account?",
            "risk_points_if_yes": 15,
            "risk_reason_if_yes": "The account may be actively misused."
        },
        {
            "id": "recovery_details_changed",
            "question": "Were your recovery email address or phone number changed?",
            "risk_points_if_yes": 20,
            "risk_reason_if_yes": "Account recovery details may be controlled by someone else."
        }
    ],

    "email_compromise": [
        {
            "id": "email_access",
            "question": "Can you still access your email account?",
            "risk_points_if_yes": 20,
            "risk_reason_if_yes": "The user has lost access to the email account.",
            "risk_when": "No"
        },
        {
            "id": "unknown_emails",
            "question": "Are emails being sent from your account without your permission?",
            "risk_points_if_yes": 15,
            "risk_reason_if_yes": "The email account may be actively misused."
        },
        {
            "id": "recovery_changed",
            "question": "Were your email recovery details changed without your permission?",
            "risk_points_if_yes": 20,
            "risk_reason_if_yes": "Email recovery details may have been changed."
        },
        {
            "id": "other_accounts",
            "question": "Do you use this email account to reset passwords for other important accounts?",
            "risk_points_if_yes": 15,
            "risk_reason_if_yes": "Other accounts may also be at risk."
        }
    ],

    "identity_theft": [
        {
            "id": "identity_details_shared",
            "question": "Were your Aadhaar, PAN or other identity details shared with an unknown person?",
            "risk_points_if_yes": 15,
            "risk_reason_if_yes": "Personal identity details may have been exposed."
        },
        {
            "id": "identity_misused",
            "question": "Has someone used your identity details without your permission?",
            "risk_points_if_yes": 30,
            "risk_reason_if_yes": "Possible identity misuse reported."
        },
        {
            "id": "unknown_account",
            "question": "Did you receive information about an account, loan or service that you did not create?",
            "risk_points_if_yes": 25,
            "risk_reason_if_yes": "An unknown account or service may have been created using your identity."
        },
        {
            "id": "financial_loss",
            "question": "Have you lost money because someone misused your identity?",
            "risk_points_if_yes": 30,
            "risk_reason_if_yes": "Financial loss linked to possible identity misuse."
        }
    ],

    "online_harassment": [
        {
            "id": "physical_threat",
            "question": "Has anyone threatened to physically harm you?",
            "risk_points_if_yes": 35,
            "risk_reason_if_yes": "A physical threat was reported."
        },
        {
            "id": "blackmail",
            "question": "Is anyone blackmailing or threatening you to demand money or something else?",
            "risk_points_if_yes": 30,
            "risk_reason_if_yes": "Blackmail or coercion was reported."
        },
        {
            "id": "repeated_harassment",
            "question": "Are you receiving repeated unwanted or threatening messages?",
            "risk_points_if_yes": 15,
            "risk_reason_if_yes": "Repeated online harassment was reported."
        },
        {
            "id": "personal_information",
            "question": "Has anyone shared your private information online without your permission?",
            "risk_points_if_yes": 25,
            "risk_reason_if_yes": "Private information may have been exposed."
        }
    ],

    "lost_stolen_devices": [
        {
            "id": "device_unlocked",
            "question": "Was your lost or stolen device unlocked or without a screen lock?",
            "risk_points_if_yes": 20,
            "risk_reason_if_yes": "The device may be accessible to another person."
        },
        {
            "id": "banking_apps",
            "question": "Were banking or payment applications logged in on the device?",
            "risk_points_if_yes": 25,
            "risk_reason_if_yes": "Financial applications may be accessible on the device."
        },
        {
            "id": "personal_data",
            "question": "Did the device contain personal documents, passwords or private information?",
            "risk_points_if_yes": 20,
            "risk_reason_if_yes": "Personal information may be exposed."
        },
        {
            "id": "sim_active",
            "question": "Is the SIM card still active in the lost or stolen device?",
            "risk_points_if_yes": 15,
            "risk_reason_if_yes": "The SIM may be misused to receive calls or verification messages."
        }
    ]
}


def get_incident_questions(category: str) -> list:
    """Return follow-up questions for a recognised incident category."""

    if not isinstance(category, str):
        return []

    questions = INCIDENT_QUESTIONS.get(category.strip().lower(), [])

    return [
        {
            **question,
            "answer_type": "single_choice",
            "options": ANSWER_OPTIONS.copy(),
            "risk_when": question.get("risk_when", "Yes"),
            "review_if_not_sure": True
        }
        for question in questions
    ]
