import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# Find the main CyberFirstAid project folder
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Import database tools
from database import Base, engine, SessionLocal
from models import Incident
import models

# Import Core Intelligence functions
from ai_module.src import assess_incident
from ai_module.src.incident_questions import get_incident_questions


# Member 2 - Personalized Cyber Emergency Assistant
from emergency.routes import router as emergency_router
from emergency import models as emergency_models

# Import phishing detection API
from phishing_api import router as phishing_router

# Create the FastAPI application
app = FastAPI(title="CyberFirstAid Backend")

# Register phishing detection endpoints
app.include_router(phishing_router)

# Allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create existing and new database tables
Base.metadata.create_all(bind=engine)

# Register Member 2's emergency APIs
app.include_router(emergency_router)


# Information expected from the user
class IncidentRequest(BaseModel):
    description: str = Field(..., min_length=5, max_length=5000)
    answers: dict[str, str] | None = None

    @field_validator("description")
    @classmethod
    def validate_description(cls, value):
        value = value.strip()

        if len(value) < 10:
            raise ValueError(
                "Please provide a more detailed incident description."
            )

        if value.lower() in ["string", "test", "hello", "unknown"]:
            raise ValueError(
                "Please enter a meaningful incident description."
            )

        return value


class IncidentUpdate(BaseModel):
    description: str = Field(
        ...,
        min_length=5,
        max_length=5000
    )

    @field_validator("description")
    @classmethod
    def validate_description(cls, value):
        value = value.strip()

        if len(value) < 10:
            raise ValueError(
                "Please provide a more detailed incident description."
            )

        if value.lower() in ["string", "test", "hello", "unknown"]:
            raise ValueError(
                "Please enter a meaningful incident description."
            )

        return value


# --------------------------------------------------
# Home API
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to CyberFirstAid Backend!"
    }


# Get incident-specific follow-up questions
@app.get("/api/assessment/questions/{category}")
def get_assessment_questions(category: str):

    questions = get_incident_questions(category)

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="No questions found for this incident category."
        )

    return {
        "category": category,
        "questions": questions
    }


# --------------------------------------------------
# Analyse an incident and save it
# --------------------------------------------------

@app.post("/api/assessment")
def analyse_incident(request: IncidentRequest):

    db = SessionLocal()

    try:
        # Classify the incident and calculate risk using answers
        result = assess_incident(
            request.description,
            request.answers
        )

        # Save the incident in the database
        new_incident = Incident(
            description=request.description,
            incident_category=result["incident_category"],
            risk_level=result["risk_level"],
            matched_keywords=result["matched_keywords"],
            immediate_actions=result["immediate_actions"],
            follow_up_actions=result["follow_up_actions"],
            needs_review=result["needs_review"]
        )

        db.add(new_incident)
        db.commit()
        db.refresh(new_incident)

        return {
            "incident_id": new_incident.id,
            **result
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Incident assessment could not be completed."
        )

    finally:
        db.close()


# --------------------------------------------------
# Update an existing incident
# --------------------------------------------------

@app.put("/api/incidents/{incident_id}")
def update_incident(
    incident_id: int,
    request: IncidentUpdate
):

    db = SessionLocal()

    try:
        incident = db.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if incident is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found."
            )

        incident.description = request.description

        db.commit()
        db.refresh(incident)

        return {
            "message": "Incident updated successfully.",
            "incident_id": incident.id,
            "description": incident.description
        }

    finally:
        db.close()


# --------------------------------------------------
# Get all previously saved incidents
# --------------------------------------------------

@app.get("/api/incidents")
def get_incidents():

    db = SessionLocal()

    try:
        incidents = db.query(Incident).order_by(
            Incident.id.desc()
        ).all()

        return [
            {
                "incident_id": incident.id,
                "description": incident.description,
                "incident_category": incident.incident_category,
                "risk_level": incident.risk_level,
                "matched_keywords": incident.matched_keywords,
                "immediate_actions": incident.immediate_actions,
                "follow_up_actions": incident.follow_up_actions,
                "needs_review": incident.needs_review,
                "status": incident.status,
                "created_at": incident.created_at
            }
            for incident in incidents
        ]

    finally:
        db.close()


# --------------------------------------------------
# Get one incident using its ID
# --------------------------------------------------

@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: int):

    db = SessionLocal()

    try:
        incident = db.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if incident is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found."
            )

        return {
            "incident_id": incident.id,
            "description": incident.description,
            "incident_category": incident.incident_category,
            "risk_level": incident.risk_level,
            "matched_keywords": incident.matched_keywords,
            "immediate_actions": incident.immediate_actions,
            "follow_up_actions": incident.follow_up_actions,
            "needs_review": incident.needs_review,
            "status": incident.status,
            "created_at": incident.created_at
        }

    finally:
        db.close()


# --------------------------------------------------
# Delete an incident and associated recovery records
# Member 2 - Recovery record cleanup
# --------------------------------------------------

@app.delete("/api/incidents/{incident_id}")
def delete_incident(incident_id: int):

    db = SessionLocal()

    try:
        # Find the incident
        incident = db.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if incident is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found."
            )

        # Find the associated recovery plan
        recovery_plan = db.query(
            emergency_models.RecoveryPlan
        ).filter(
            emergency_models.RecoveryPlan.incident_id
            == incident_id
        ).first()

        # Delete the recovery plan and its associated tasks
        if recovery_plan is not None:

            db.delete(recovery_plan)

            # Execute pending deletions without committing
            db.flush()

        # Delete the original incident
        db.delete(incident)

        # Commit all deletions together
        db.commit()

        return {
            "message": "Incident deleted successfully.",
            "incident_id": incident_id
        }

    except HTTPException:

        db.rollback()
        raise

    except Exception:

        # Undo all pending changes if deletion fails
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Incident and recovery records could not be deleted."
        )

    finally:
        db.close()


# --------------------------------------------------
# Mark an incident as resolved
# --------------------------------------------------

@app.put("/api/incidents/{incident_id}/resolve")
def resolve_incident(incident_id: int):

    db = SessionLocal()

    try:
        incident = db.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if incident is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found."
            )

        incident.status = "resolved"

        db.commit()
        db.refresh(incident)

        return {
            "message": "Incident marked as resolved.",
            "incident_id": incident.id,
            "status": incident.status
        }

    finally:
        db.close()