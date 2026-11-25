
"""
CyberFirstAid Enhanced
Member 2 - Personalized Cyber Emergency Assistant

Action prioritization and duplicate removal.
"""

from copy import deepcopy


# Lower number means higher priority.
PRIORITY_ORDER = {
    "immediate": 0,
    "high": 1,
    "follow_up": 2
}


PRIORITY_LABELS = {
    "immediate": "Act Immediately",
    "high": "Important Action",
    "follow_up": "Follow-up Action"
}


# Prioritize critical safety actions within each group.
TASK_ORDER = {
    "physical_safety": 0,
    "contact_bank": 1,
    "call_1930": 2,
    "stop_transactions": 3,
    "stop_interaction": 4,
    "check_device": 5,
    "secure_linked_email": 6,
    "block_sim": 7,
    "remote_lock": 8
}


def remove_duplicate_actions(actions: list) -> list:
    """Remove duplicate and overlapping recovery tasks."""

    unique_actions = {}

    for item in actions:

        task_id = item["id"]

        if task_id not in unique_actions:
            unique_actions[task_id] = deepcopy(item)

    # Prefer incident-specific evidence instructions.
    evidence_tasks = {
        "save_transactions",
        "save_phishing_evidence",
        "save_social_evidence",
        "save_harassment_evidence"
    }

    if evidence_tasks.intersection(unique_actions):
        unique_actions.pop("preserve_evidence", None)

    # Prefer incident-specific reporting instructions.
    reporting_tasks = {
        "report_financial_fraud",
        "report_phishing",
        "report_identity_theft",
        "report_harassment"
    }

    if reporting_tasks.intersection(unique_actions):
        unique_actions.pop("official_reporting", None)

    # Avoid repeating general monitoring instructions.
    monitoring_tasks = {
        "monitor_bank",
        "monitor_identity",
        "monitor_device_accounts"
    }

    if monitoring_tasks.intersection(unique_actions):
        unique_actions.pop("monitor_recovery", None)

    return list(unique_actions.values())


def prioritize_actions(actions: list) -> list:
    """Arrange recovery actions according to urgency."""

    unique_actions = remove_duplicate_actions(actions)

    sorted_actions = sorted(
        unique_actions,
        key=lambda item: (
            PRIORITY_ORDER.get(item["priority"], 99),
            TASK_ORDER.get(item["id"], 100)
        )
    )

    for index, item in enumerate(sorted_actions, start=1):

        item["order"] = index

        item["priority_label"] = PRIORITY_LABELS.get(
            item["priority"],
            "Other Action"
        )

    return sorted_actions


def group_actions(actions: list) -> dict:
    """Group recovery actions into urgency levels."""

    grouped = {
        "immediate": [],
        "high": [],
        "follow_up": []
    }

    for item in actions:

        priority = item.get("priority", "follow_up")

        if priority not in grouped:
            priority = "follow_up"

        grouped[priority].append(item)

    return grouped


def get_action_summary(actions: list) -> dict:
    """Calculate recovery checklist statistics."""

    total = len(actions)

    completed = sum(
        1 for item in actions
        if item.get("completed", False)
    )

    immediate = sum(
        1 for item in actions
        if item.get("priority") == "immediate"
    )

    high = sum(
        1 for item in actions
        if item.get("priority") == "high"
    )

    follow_up = sum(
        1 for item in actions
        if item.get("priority") == "follow_up"
    )

    progress = round(
        (completed / total) * 100, 2
    ) if total else 0

    return {
        "total_actions": total,
        "completed_actions": completed,
        "pending_actions": total - completed,
        "immediate_actions": immediate,
        "high_priority_actions": high,
        "follow_up_actions": follow_up,
        "progress_percentage": progress
    }
