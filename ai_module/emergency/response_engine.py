
"""
CyberFirstAid Enhanced
Member 2 - Personalized Cyber Emergency Assistant

Main personalized emergency response engine.
"""

from ai_module.emergency.question_bank import (
    get_questions,
    get_supported_categories,
    CATEGORY_LABELS
)

from ai_module.emergency.recovery_rules import (
    generate_recovery_actions
)

from ai_module.emergency.action_priority import (
    prioritize_actions,
    group_actions,
    get_action_summary
)


ENGINE_VERSION = "1.0.0"

VALID_ANSWERS = {"yes", "no", "unsure"}


def normalize_category(category: str) -> str:
    """Validate and normalize the incident category."""

    if not isinstance(category, str):
        raise ValueError("Incident category must be a string.")

    category = category.strip().lower()

    if category not in CATEGORY_LABELS:
        raise ValueError("Unsupported incident category.")

    return category


def validate_answers(category: str, answers: dict) -> dict:
    """Validate questionnaire answers."""

    if not isinstance(answers, dict):
        raise ValueError("Answers must be provided as a dictionary.")

    questions = get_questions(category)

    valid_question_ids = {
        question["id"] for question in questions
    }

    normalized_answers = {}

    for question_id, value in answers.items():

        if question_id not in valid_question_ids:
            raise ValueError(
                "An invalid question ID was provided."
            )

        if not isinstance(value, str):
            raise ValueError(
                "Answers must be yes, no or unsure."
            )

        value = value.strip().lower()

        if value not in VALID_ANSWERS:
            raise ValueError(
                "Answers must be yes, no or unsure."
            )

        normalized_answers[question_id] = value

    # Unanswered questions are treated as uncertain.
    for question in questions:

        question_id = question["id"]

        if question_id not in normalized_answers:
            normalized_answers[question_id] = "unsure"

    return normalized_answers


def get_questionnaire(category: str) -> dict:
    """Return the questionnaire for an incident category."""

    category = normalize_category(category)

    questions = get_questions(category)

    return {
        "category": category,
        "category_label": CATEGORY_LABELS[category],
        "total_questions": len(questions),
        "questions": questions,
        "privacy_notice": (
            "Never enter passwords, OTPs, UPI PINs, "
            "card numbers or other sensitive credentials."
        )
    }


def get_emergency_contacts() -> list:
    """Return official Indian emergency reporting resources."""

    return [
        {
            "id": "financial_fraud_helpline",
            "name": "Financial Cyber Fraud Helpline",
            "phone": "1930",
            "url": "https://cybercrime.gov.in/",
            "description": (
                "For reporting financial cyber fraud in India."
            )
        },
        {
            "id": "cybercrime_portal",
            "name": "National Cyber Crime Reporting Portal",
            "phone": None,
            "url": "https://cybercrime.gov.in/",
            "description": (
                "Official portal for reporting cybercrime in India."
            )
        },
        {
            "id": "emergency_services",
            "name": "Emergency Response Support System",
            "phone": "112",
            "url": "https://112.gov.in/",
            "description": (
                "For emergencies involving immediate danger "
                "to physical safety in India."
            )
        }
    ]


def generate_personalized_response(
    category: str,
    answers: dict
) -> dict:
    """Generate a complete personalized recovery plan."""

    # Step 1: Validate incident category.
    category = normalize_category(category)

    # Step 2: Validate questionnaire answers.
    validated_answers = validate_answers(
        category,
        answers
    )

    # Step 3: Generate personalized recovery actions.
    raw_actions = generate_recovery_actions(
        category,
        validated_answers
    )

    # Step 4: Remove duplicates and prioritize actions.
    actions = prioritize_actions(raw_actions)

    # Step 5: Group actions by urgency.
    grouped_actions = group_actions(actions)

    # Step 6: Calculate recovery statistics.
    summary = get_action_summary(actions)

    # Step 7: Identify uncertain answers.
    uncertain_answers = [
        question_id
        for question_id, value in validated_answers.items()
        if value == "unsure"
    ]

    needs_review = (
        category == "unknown"
        or len(uncertain_answers) > 0
    )

    # Step 8: Generate the response message.
    if summary["immediate_actions"] > 0:

        message = (
            "Your personalized recovery plan contains "
            "actions that may require immediate attention. "
            "Review the urgent instructions first."
        )

    else:

        message = (
            "Your personalized recovery plan is ready. "
            "Follow the recommended actions and continue "
            "monitoring your affected accounts."
        )

    # Step 9: Return the complete response.
    return {
        "engine_version": ENGINE_VERSION,

        "engine_type": "rule_based_expert_system",

        "category": category,

        "category_label": CATEGORY_LABELS[category],

        "message": message,

        "answers": validated_answers,

        "needs_review": needs_review,

        "uncertain_answers": uncertain_answers,

        "actions": actions,

        "grouped_actions": grouped_actions,

        "summary": summary,

        "emergency_contacts": get_emergency_contacts(),

        "disclaimer": (
            "CyberFirstAid provides preliminary cybersecurity "
            "recovery guidance. It does not replace professional "
            "assistance, law enforcement or official support. "
            "Completing the recovery checklist does not "
            "guarantee successful recovery."
        )
    }


def get_emergency_categories() -> list:
    """Return supported emergency categories."""

    return get_supported_categories()
