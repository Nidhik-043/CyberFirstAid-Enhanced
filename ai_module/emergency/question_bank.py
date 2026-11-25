
"""
CyberFirstAid Enhanced
Member 2 - Personalized Cyber Emergency Assistant

Dynamic question bank for cyber incident recovery.
"""

from copy import deepcopy


def question(question_id, text):
    return {
        "id": question_id,
        "question": text,
        "type": "single_choice",
        "options": [
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"},
            {"label": "Not sure", "value": "unsure"}
        ]
    }


QUESTION_BANK = {

    # 1. Financial Fraud
    "financial_fraud": [
        question(
            "money_lost",
            "Has money been deducted from your bank account or wallet?"
        ),
        question(
            "shared_credentials",
            "Did you share an OTP, UPI PIN, password or card details?"
        ),
        question(
            "ongoing_transactions",
            "Are unauthorized transactions still happening?"
        ),
        question(
            "bank_contacted",
            "Have you contacted your bank or payment provider?"
        ),
        question(
            "fraud_reported",
            "Have you reported the financial fraud through an official channel?"
        )
    ],

    # 2. Phishing
    "phishing": [
        question(
            "clicked_link",
            "Did you click the suspicious link?"
        ),
        question(
            "entered_password",
            "Did you enter your password or login credentials?"
        ),
        question(
            "shared_financial_details",
            "Did you enter banking or payment information?"
        ),
        question(
            "downloaded_file",
            "Did you download a file or install an application?"
        ),
        question(
            "money_lost",
            "Have you noticed any unauthorized financial transactions?"
        )
    ],

    # 3. Social Media Hacking
    "social_media_hacking": [
        question(
            "account_access",
            "Can you still log in to your social media account?"
        ),
        question(
            "recovery_details_changed",
            "Has your recovery email address or phone number been changed?"
        ),
        question(
            "unauthorized_activity",
            "Has someone posted content or sent messages from your account?"
        ),
        question(
            "linked_email_compromised",
            "Do you suspect that your linked email account is also compromised?"
        ),
        question(
            "mfa_enabled",
            "Is two-factor authentication enabled on your account?"
        )
    ],

    # 4. Email Compromise
    "email_compromise": [
        question(
            "account_access",
            "Can you still access your email account?"
        ),
        question(
            "unauthorized_activity",
            "Have suspicious emails been sent from your account?"
        ),
        question(
            "recovery_details_changed",
            "Have your account recovery details been changed?"
        ),
        question(
            "suspicious_forwarding",
            "Have you noticed unfamiliar email forwarding rules or filters?"
        ),
        question(
            "password_reused",
            "Do you use the same password on other accounts?"
        ),
        question(
            "mfa_enabled",
            "Is two-factor authentication enabled?"
        )
    ],

    # 5. Identity Theft
    "identity_theft": [
        question(
            "documents_exposed",
            "Have your identity documents or personal details been exposed?"
        ),
        question(
            "financial_misuse",
            "Have you noticed suspicious financial activity?"
        ),
        question(
            "fake_account",
            "Has someone created an account using your identity?"
        ),
        question(
            "service_provider_contacted",
            "Have you contacted the affected service provider?"
        ),
        question(
            "incident_reported",
            "Have you reported the identity misuse?"
        )
    ],

    # 6. Online Harassment
    "online_harassment": [
        question(
            "physical_threat",
            "Have you received threats to your physical safety?"
        ),
        question(
            "ongoing_harassment",
            "Are you still receiving threatening or abusive messages?"
        ),
        question(
            "blackmail",
            "Is someone threatening or blackmailing you?"
        ),
        question(
            "personal_information_exposed",
            "Has someone publicly shared your private information?"
        ),
        question(
            "evidence_saved",
            "Have you safely preserved evidence of the harassment?"
        ),
        question(
            "incident_reported",
            "Have you reported the harassment?"
        )
    ],

    # 7. Lost or Stolen Devices
    "lost_stolen_devices": [
        question(
            "device_locked",
            "Was your device protected by a password or screen lock?"
        ),
        question(
            "sim_active",
            "Is the SIM card in the missing device still active?"
        ),
        question(
            "banking_apps",
            "Does the missing device contain banking or payment applications?"
        ),
        question(
            "remote_lock_available",
            "Can you remotely locate or lock your device?"
        ),
        question(
            "unauthorized_activity",
            "Have you noticed suspicious activity on your accounts?"
        ),
        question(
            "incident_reported",
            "Have you reported the loss or theft?"
        )
    ],

    # Fallback for unidentified incidents
    "unknown": [
        question(
            "money_lost",
            "Have you experienced any financial loss?"
        ),
        question(
            "account_compromised",
            "Do you suspect that someone accessed your account?"
        ),
        question(
            "personal_information_exposed",
            "Has your personal information been exposed?"
        ),
        question(
            "physical_threat",
            "Are you facing any threats to your physical safety?"
        )
    ]
}


CATEGORY_LABELS = {
    "financial_fraud": "Financial Fraud",
    "phishing": "Phishing",
    "social_media_hacking": "Social Media Hacking",
    "email_compromise": "Email Compromise",
    "identity_theft": "Identity Theft",
    "online_harassment": "Online Harassment",
    "lost_stolen_devices": "Lost or Stolen Devices",
    "unknown": "Other / Unidentified Incident"
}


def get_questions(category: str) -> list:
    """Return questions for the selected incident category."""

    if not isinstance(category, str):
        category = "unknown"

    category = category.strip().lower()

    return deepcopy(
        QUESTION_BANK.get(category, QUESTION_BANK["unknown"])
    )


def get_supported_categories() -> list:
    """Return all supported incident categories."""

    return [
        {
            "id": category,
            "label": label
        }
        for category, label in CATEGORY_LABELS.items()
    ]
