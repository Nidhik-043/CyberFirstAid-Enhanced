
"""
CyberFirstAid Enhanced
Member 2 - Personalized Cyber Emergency Assistant

Service layer connecting the intelligence engine,
database repository and API endpoints.
"""

from datetime import timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ai_module.emergency import (
    generate_personalized_response,
    get_questionnaire,
    get_emergency_categories,
    get_emergency_contacts
)

from ai_module.emergency.question_bank import (
    CATEGORY_LABELS
)

from ai_module.emergency.action_priority import (
    PRIORITY_LABELS,
    group_actions,
    get_action_summary
)

from emergency.repository import (
    get_incident,
    get_recovery_plan,
    get_recovery_task,
    save_recovery_plan,
    update_task_completion
)


DISCLAIMER = (
    "This recovery plan provides preliminary guidance "
    "and does not replace professional assistance, "
    "law enforcement or official support. "
    "Completing the checklist does not guarantee "
    "incident resolution or financial recovery."
)


def format_datetime(value):
    """Convert database timestamps to UTC strings."""

    if value is None:
        return None

    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc).isoformat()


def list_categories():
    """Return supported incident categories."""

    return {
        "categories": get_emergency_categories()
    }


def retrieve_questionnaire(category: str):
    """Return the questionnaire for a category."""

    try:

        return get_questionnaire(category)

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error


def retrieve_emergency_contacts():
    """Return official emergency contact information."""

    return {
        "contacts": get_emergency_contacts()
    }


def require_incident(db: Session, incident_id: int):
    """Verify that the incident exists."""

    incident = get_incident(db, incident_id)

    if incident is None:

        raise HTTPException(
            status_code=404,
            detail="Incident not found."
        )

    return incident


def serialize_task(task):
    """Convert a database task into API response data."""

    return {
        "id": task.task_id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "priority_label": PRIORITY_LABELS.get(
            task.priority,
            task.priority
        ),
        "reason": task.reason,
        "url": task.url,
        "phone": task.phone,
        "order": task.task_order,
        "completed": task.completed,
        "completed_at": format_datetime(
            task.completed_at
        )
    }


def serialize_recovery_plan(plan, incident):
    """Convert a saved recovery plan into API data."""

    actions = [
        serialize_task(task)
        for task in plan.tasks
    ]

    summary = get_action_summary(actions)

    grouped_actions = group_actions(actions)

    uncertain_answers = [
        question_id
        for question_id, answer in plan.answers.items()
        if answer == "unsure"
    ]

    if summary["pending_actions"] == 0:

        message = (
            "All checklist tasks are marked as completed. "
            "Continue monitoring your accounts and follow "
            "official guidance."
        )

    elif any(
        action["priority"] == "immediate"
        and not action["completed"]
        for action in actions
    ):

        message = (
            "Your recovery plan contains urgent actions. "
            "Complete the immediate actions first."
        )

    else:

        message = (
            "Continue completing your personalized "
            "recovery checklist."
        )

    return {
        "plan_id": plan.id,
        "incident_id": incident.id,
        "incident_status": incident.status,
        "risk_level": incident.risk_level,
        "category": plan.category,
        "category_label": CATEGORY_LABELS.get(
            plan.category,
            plan.category
        ),
        "engine_version": plan.engine_version,
        "engine_type": "rule_based_expert_system",
        "message": message,
        "answers": plan.answers,
        "needs_review": plan.needs_review,
        "uncertain_answers": uncertain_answers,
        "actions": actions,
        "grouped_actions": grouped_actions,
        "summary": summary,
        "emergency_contacts": get_emergency_contacts(),
        "created_at": format_datetime(
            plan.created_at
        ),
        "updated_at": format_datetime(
            plan.updated_at
        ),
        "disclaimer": DISCLAIMER
    }


def create_personalized_plan(
    db: Session,
    incident_id: int,
    category: str,
    answers: dict
):
    """Generate and save a personalized recovery plan."""

    incident = require_incident(
        db,
        incident_id
    )

    try:

        response = generate_personalized_response(
            category,
            answers
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error

    # Prevent a recovery plan from being linked
    # to an unrelated incident category.
    if incident.incident_category != response["category"]:

        raise HTTPException(
            status_code=409,
            detail=(
                "The selected category does not match "
                "the assessed incident category."
            )
        )

    plan = save_recovery_plan(
        db,
        incident_id,
        response
    )

    return serialize_recovery_plan(
        plan,
        incident
    )


def retrieve_recovery_plan(
    db: Session,
    incident_id: int
):
    """Retrieve an existing personalized recovery plan."""

    incident = require_incident(
        db,
        incident_id
    )

    plan = get_recovery_plan(
        db,
        incident_id
    )

    if plan is None:

        raise HTTPException(
            status_code=404,
            detail="Recovery plan not found."
        )

    return serialize_recovery_plan(
        plan,
        incident
    )


def change_task_status(
    db: Session,
    incident_id: int,
    task_id: str,
    completed: bool
):
    """Update recovery checklist completion."""

    incident = require_incident(
        db,
        incident_id
    )

    plan = get_recovery_plan(
        db,
        incident_id
    )

    if plan is None:

        raise HTTPException(
            status_code=404,
            detail="Recovery plan not found."
        )

    task = get_recovery_task(
        db,
        plan.id,
        task_id
    )

    if task is None:

        raise HTTPException(
            status_code=404,
            detail="Recovery task not found."
        )

    updated_plan = update_task_completion(
        db,
        incident_id,
        task_id,
        completed
    )

    return serialize_recovery_plan(
        updated_plan,
        incident
    )
