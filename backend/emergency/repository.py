
"""
CyberFirstAid Enhanced
Member 2 - Personalized Cyber Emergency Assistant

Database repository for recovery plans and tasks.
"""

from sqlalchemy.orm import Session

from models import Incident

from emergency.models import (
    RecoveryPlan,
    RecoveryTask,
    utc_now
)


def get_incident(db: Session, incident_id: int):
    """Retrieve an existing incident."""

    return db.query(Incident).filter(
        Incident.id == incident_id
    ).first()


def get_recovery_plan(db: Session, incident_id: int):
    """Retrieve the recovery plan for an incident."""

    return db.query(RecoveryPlan).filter(
        RecoveryPlan.incident_id == incident_id
    ).first()


def get_recovery_task(
    db: Session,
    plan_id: int,
    task_id: str
):
    """Retrieve a specific recovery task."""

    return db.query(RecoveryTask).filter(
        RecoveryTask.plan_id == plan_id,
        RecoveryTask.task_id == task_id
    ).first()


def save_recovery_plan(
    db: Session,
    incident_id: int,
    response: dict
):
    """Create or update a personalized recovery plan."""

    try:

        incident = get_incident(db, incident_id)

        if incident is None:
            raise ValueError("Incident not found.")

        plan = get_recovery_plan(db, incident_id)

        previous_tasks = {}

        if plan is None:

            plan = RecoveryPlan(
                incident_id=incident_id,
                category=response["category"],
                answers=response["answers"],
                engine_version=response["engine_version"],
                needs_review=response["needs_review"]
            )

            db.add(plan)
            db.flush()

        else:

            # Preserve progress only when the category
            # and questionnaire answers are unchanged.
            if (
                plan.category == response["category"]
                and plan.answers == response["answers"]
            ):

                previous_tasks = {
                    task.task_id: {
                        "completed": task.completed,
                        "completed_at": task.completed_at,
                        "title": task.title,
                        "description": task.description
                    }
                    for task in plan.tasks
                }

            plan.category = response["category"]
            plan.answers = response["answers"]
            plan.engine_version = response["engine_version"]
            plan.needs_review = response["needs_review"]
            plan.updated_at = utc_now()

            # Remove outdated recovery tasks.
            plan.tasks.clear()
            db.flush()

        # Store the newly generated recovery tasks.
        for action in response["actions"]:

            previous = previous_tasks.get(
                action["id"], {}
            )

            unchanged = (
                previous.get("title") == action["title"]
                and previous.get("description")
                == action["description"]
            )

            completed = (
                previous.get("completed", False)
                if unchanged else False
            )

            task = RecoveryTask(
                task_id=action["id"],
                title=action["title"],
                description=action["description"],
                priority=action["priority"],
                reason=action["reason"],
                url=action.get("url"),
                phone=action.get("phone"),
                task_order=action["order"],
                completed=completed,
                completed_at=(
                    previous.get("completed_at")
                    if completed else None
                )
            )

            plan.tasks.append(task)

        db.commit()
        db.refresh(plan)

        return plan

    except Exception:

        db.rollback()
        raise


def update_task_completion(
    db: Session,
    incident_id: int,
    task_id: str,
    completed: bool
):
    """Update the completion status of a recovery task."""

    try:

        incident = get_incident(db, incident_id)

        if incident is None:
            raise ValueError("Incident not found.")

        plan = get_recovery_plan(db, incident_id)

        if plan is None:
            raise ValueError("Recovery plan not found.")

        task = get_recovery_task(
            db,
            plan.id,
            task_id
        )

        if task is None:
            raise ValueError("Recovery task not found.")

        # Update only when the status changes.
        if task.completed != completed:

            task.completed = completed

            task.completed_at = (
                utc_now() if completed else None
            )

            plan.updated_at = utc_now()

        db.commit()
        db.refresh(plan)

        return plan

    except Exception:

        db.rollback()
        raise


def delete_recovery_plan(
    db: Session,
    incident_id: int
):
    """Delete a recovery plan and its associated tasks."""

    try:

        plan = get_recovery_plan(db, incident_id)

        if plan is None:
            return False

        db.delete(plan)
        db.commit()

        return True

    except Exception:

        db.rollback()
        raise
