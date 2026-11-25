
"""
CyberFirstAid Enhanced
Member 2 - Personalized Cyber Emergency Assistant

API request validation schemas.
"""

from typing import Literal

from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    field_validator,
    StrictBool
)

from ai_module.emergency.response_engine import (
    normalize_category,
    validate_answers
)


# Allowed questionnaire answers
AnswerValue = Literal["yes", "no", "unsure"]


class EmergencyPlanRequest(BaseModel):
    """
    Request schema for generating a personalized
    emergency recovery plan.
    """

    model_config = ConfigDict(extra="forbid")

    incident_id: int = Field(
        ...,
        gt=0,
        strict=True,
        description="Existing incident ID"
    )

    category: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Cyber incident category"
    )

    answers: dict[str, AnswerValue] = Field(
        default_factory=dict,
        max_length=20,
        description="Answers to emergency questions"
    )

    @field_validator("category")
    @classmethod
    def check_category(cls, value):

        return normalize_category(value)

    @field_validator("answers")
    @classmethod
    def check_answers(cls, value, info):

        category = info.data.get("category")

        if category is not None:
            return validate_answers(category, value)

        return value


class RecoveryTaskUpdate(BaseModel):
    """
    Request schema for updating the completion
    status of a recovery checklist task.
    """

    model_config = ConfigDict(extra="forbid")

    completed: StrictBool = Field(
        ...,
        description="Whether the recovery task is completed"
    )
