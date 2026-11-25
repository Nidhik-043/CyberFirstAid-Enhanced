
"""
CyberFirstAid Enhanced
Member 2 - Personalized Cyber Emergency Assistant

FastAPI routes for emergency assistance
and personalized recovery tracking.
"""

from fastapi import (
    APIRouter,
    Depends,
    Path
)

from sqlalchemy.orm import Session

from database import SessionLocal

from emergency.schemas import (
    EmergencyPlanRequest,
    RecoveryTaskUpdate
)

from emergency.services import (
    list_categories,
    retrieve_questionnaire,
    retrieve_emergency_contacts,
    create_personalized_plan,
    retrieve_recovery_plan,
    change_task_status
)


# Create a separate API router
# for the emergency assistant.

router = APIRouter(
    prefix="/api",
    tags=["Personalized Emergency Assistant"]
)


def get_db():
    """
    Create a database session for each API request
    and close it when the request is completed.
    """

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# --------------------------------------------------
# API 1: Retrieve supported incident categories
# --------------------------------------------------

@router.get("/emergency/categories")
def emergency_categories():

    return list_categories()


# --------------------------------------------------
# API 2: Retrieve category-specific questionnaire
# --------------------------------------------------

@router.get("/emergency/questions/{category}")
def emergency_questions(
    category: str = Path(
        ...,
        min_length=1,
        max_length=100
    )
):

    return retrieve_questionnaire(category)


# --------------------------------------------------
# API 3: Retrieve emergency contact information
# --------------------------------------------------

@router.get("/emergency/contacts")
def emergency_contacts():

    return retrieve_emergency_contacts()


# --------------------------------------------------
# API 4: Generate personalized recovery plan
# --------------------------------------------------

@router.post("/emergency/action-plan")
def generate_action_plan(
    request: EmergencyPlanRequest,
    db: Session = Depends(get_db)
):

    return create_personalized_plan(
        db=db,
        incident_id=request.incident_id,
        category=request.category,
        answers=request.answers
    )


# --------------------------------------------------
# API 5: Retrieve saved recovery plan
# --------------------------------------------------

@router.get("/recovery/{incident_id}")
def recovery_plan(
    incident_id: int = Path(..., gt=0),
    db: Session = Depends(get_db)
):

    return retrieve_recovery_plan(
        db=db,
        incident_id=incident_id
    )


# --------------------------------------------------
# API 6: Update recovery checklist task
# --------------------------------------------------

@router.patch(
    "/recovery/{incident_id}/tasks/{task_id}"
)
def update_recovery_task(
    request: RecoveryTaskUpdate,

    incident_id: int = Path(
        ...,
        gt=0
    ),

    task_id: str = Path(
        ...,
        min_length=1,
        max_length=100
    ),

    db: Session = Depends(get_db)
):

    return change_task_status(
        db=db,
        incident_id=incident_id,
        task_id=task_id,
        completed=request.completed
    )
