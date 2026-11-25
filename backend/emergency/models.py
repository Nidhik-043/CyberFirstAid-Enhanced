
"""
CyberFirstAid Enhanced
Member 2 - Personalized Cyber Emergency Assistant

Database models for personalized recovery plans
and recovery checklist tasks.
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    JSON,
    ForeignKey,
    UniqueConstraint
)

from sqlalchemy.orm import relationship

from database import Base


def utc_now():
    """Return the current UTC time."""

    return datetime.now(timezone.utc)


class RecoveryPlan(Base):

    __tablename__ = "emergency_recovery_plans"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    incident_id = Column(
        Integer,
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )

    category = Column(
        String(100),
        nullable=False
    )

    answers = Column(
        JSON,
        nullable=False,
        default=dict
    )

    engine_version = Column(
        String(30),
        nullable=False,
        default="1.0.0"
    )

    needs_review = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now
    )

    tasks = relationship(
        "RecoveryTask",
        back_populates="plan",
        cascade="all, delete-orphan",
        order_by="RecoveryTask.task_order"
    )


class RecoveryTask(Base):

    __tablename__ = "emergency_recovery_tasks"

    __table_args__ = (
        UniqueConstraint(
            "plan_id",
            "task_id",
            name="uq_emergency_plan_task"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    plan_id = Column(
        Integer,
        ForeignKey(
            "emergency_recovery_plans.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    task_id = Column(
        String(100),
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    priority = Column(
        String(30),
        nullable=False
    )

    reason = Column(
        Text,
        nullable=False
    )

    url = Column(
        Text,
        nullable=True
    )

    phone = Column(
        String(30),
        nullable=True
    )

    task_order = Column(
        Integer,
        nullable=False
    )

    completed = Column(
        Boolean,
        nullable=False,
        default=False
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now
    )

    plan = relationship(
        "RecoveryPlan",
        back_populates="tasks"
    )
