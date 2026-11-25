"""Rule-based risk scoring for CyberFirstAid incidents."""

from ai_module.src.incident_questions import INCIDENT_QUESTIONS


# Connect questionnaire answers to existing risk factors.
QUESTION_FACTOR_MAP = {
    "money_lost": "money_loss",
    "bank_details_shared": "banking_information",
    "remote_access": "remote_access",
    "bank_access": "account_access",

    "link_clicked": "suspicious_link",
    "credentials_entered": "credentials",
    "financial_details_entered": "banking_information",
    "file_downloaded": "file_download",

    "account_access": "account_access",
    "password_changed": "compromised_account",
    "unknown_messages": "active_account_misuse",
    "recovery_details_changed": "recovery_changed",

    "email_access": "account_access",
    "unknown_emails": "active_account_misuse",
    "recovery_changed": "recovery_changed",
    "other_accounts": "linked_accounts",

    "identity_details_shared": "identity_exposure",
    "identity_misused": "identity_misuse",
    "unknown_account": "unknown_account",
    "financial_loss": "money_loss",

    "physical_threat": "threat",
    "blackmail": "threat",
    "repeated_harassment": "repeated_harassment",
    "personal_information": "identity_exposure",

    "device_unlocked": "device_access",
    "banking_apps": "financial_apps",
    "personal_data": "identity_exposure",
    "sim_active": "sim_active"
}


TEXT_RISK_FACTORS = [
    (
        "money_loss",
        ["money transferred", "money deducted", "money was taken",
         "stole money", "money stolen", "unauthorized transaction",
         "unauthorised transaction"],
        45,
        "Money loss or unauthorized transaction reported."
    ),
    (
        "banking_information",
        ["shared an otp", "shared my otp", "otp", "upi pin",
         "entered my upi pin"],
        20,
        "Sensitive banking information may have been exposed."
    ),
    (
        "compromised_account",
        ["account hacked", "account compromised", "someone hacked",
         "email hacked", "unauthorized email access"],
        25,
        "An account may have been accessed without permission."
    ),
    (
        "account_access",
        ["cannot access my account", "cannot log in",
         "locked out of my account", "unable to access my account"],
        20,
        "The user may have lost access to an account."
    ),
    (
        "identity_misuse",
        ["identity stolen", "identity theft", "aadhaar misused",
         "pan card misused", "personal details stolen"],
        20,
        "Personal identity information may have been misused."
    ),
    (
        "suspicious_link",
        ["clicked a link", "clicked the link",
         "opened a suspicious link"],
        5,
        "A suspicious link was opened."
    ),
    (
        "credentials",
        ["entered my password", "shared my password",
         "entered my login details", "entered my credentials"],
        20,
        "Login credentials may have been exposed."
    ),
    (
        "threat",
        ["blackmail", "physical threat", "threatening messages",
         "threatened me"],
        30,
        "Threats or blackmail were reported."
    ),
    (
        "lost_device",
        ["phone stolen", "mobile stolen", "laptop stolen",
         "device stolen", "lost my phone"],
        20,
        "A device may be lost or stolen."
    )
]


def get_question_details():
    """Create a lookup of questionnaire details using question IDs."""

    details = {}

    for questions in INCIDENT_QUESTIONS.values():
        for question in questions:
            details[question["id"]] = question

    return details


def calculate_risk(
    description: str,
    category: str,
    answers: dict | None = None
) -> dict:
    """Calculate a preliminary risk score from 0 to 100."""

    if not isinstance(description, str) or not description.strip():
        return {
            "risk_score": None,
            "risk_level": "unassessed",
            "risk_reasons": ["Incident description is empty."],
            "needs_review": True
        }

    category_weights = {
        "financial_fraud": 15,
        "phishing": 15,
        "social_media_hacking": 15,
        "email_compromise": 15,
        "identity_theft": 15,
        "online_harassment": 15,
        "lost_stolen_devices": 15
    }

    if category not in category_weights:
        return {
            "risk_score": None,
            "risk_level": "unassessed",
            "risk_reasons": ["Incident category could not be identified."],
            "needs_review": True
        }

    text = description.lower()

    # Store each factor only once to prevent duplicate scoring.
    detected_factors = {}
    reasons = ["Base score and incident category considered."]
    needs_review = False

    # First, detect risk factors from the incident description.
    for factor_id, keywords, points, reason in TEXT_RISK_FACTORS:
        if any(keyword in text for keyword in keywords):
            detected_factors[factor_id] = points
            reasons.append(reason)

    # Next, process questionnaire answers if provided.
    if answers is not None:
        if not isinstance(answers, dict):
            needs_review = True
            reasons.append("Questionnaire answers have an invalid format.")
        else:
            question_details = get_question_details()

            for question_id, answer in answers.items():
                question = question_details.get(question_id)

                if question is None:
                    needs_review = True
                    reasons.append(
                        "An unknown questionnaire answer needs review."
                    )
                    continue

                if not isinstance(answer, str):
                    needs_review = True
                    reasons.append(
                        "A questionnaire answer has an invalid format."
                    )
                    continue

                answer = answer.strip().lower()

                if answer == "not sure":
                    if question.get("review_if_not_sure", True):
                        needs_review = True
                        reasons.append(
                            "Some questionnaire answers are uncertain."
                        )
                    continue

                expected_answer = question.get("risk_when", "Yes").lower()

                if answer not in ("yes", "no"):
                    needs_review = True
                    reasons.append(
                        "A questionnaire answer needs manual review."
                    )
                    continue

                if answer == expected_answer:
                    factor_id = QUESTION_FACTOR_MAP.get(question_id)

                    if factor_id is None:
                        needs_review = True
                        reasons.append(
                            "A questionnaire risk factor is not configured."
                        )
                        continue

                    points = question["risk_points_if_yes"]

                    # Keep the higher score if the same factor was
                    # already detected in the incident description.
                    detected_factors[factor_id] = max(
                        detected_factors.get(factor_id, 0),
                        points
                    )

                    reason = question["risk_reason_if_yes"]

                    if reason not in reasons:
                        reasons.append(reason)

    score = 10 + category_weights[category]
    score += sum(detected_factors.values())
    score = min(score, 100)

    if score >= 75:
        risk_level = "critical"
    elif score >= 50:
        risk_level = "high"
    elif score >= 25:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "risk_reasons": reasons,
        "needs_review": needs_review
    }


def assess_risk(description: str, category: str) -> str:
    """Maintain compatibility with the existing assessment module."""

    result = calculate_risk(description, category)
    return result["risk_level"]
