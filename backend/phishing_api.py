from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from ai_module.production_detector import analyze_production_url


router = APIRouter(
    prefix="/api/phishing",
    tags=["Phishing Detection"]
)


class PhishingRequest(BaseModel):

    url: str = Field(
        ...,
        min_length=3,
        max_length=8192
    )

    @field_validator("url")
    @classmethod
    def validate_url(cls, value):

        value = value.strip()

        if len(value) < 3:
            raise ValueError("Please enter a valid URL")

        if any(
            char.isspace()
            or ord(char) < 32
            or ord(char) == 127
            for char in value
        ):
            raise ValueError(
                "URL contains invalid characters"
            )

        return value


@router.post("/analyze")
def analyze_url(request: PhishingRequest):

    try:

        result = analyze_production_url(request.url)

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="URL analysis failed. Please try again."
        )


@router.get("/health")
def phishing_health():

    return {
        "status": "online",
        "service": "CyberFirstAid URL Scanner",
        "engine_version": "4.0",
        "detection_layers": 4,
        "live_verification": False,
        "methods": [
            "Rule-Based Security Analysis",
            "OpenPhish Threat Intelligence",
            "Binary Random Forest",
            "Tranco Domain Reputation"
        ]
    }