"""finding intelligence — suggestions and tenant rules

Revision ID: 20260519_0007
Revises: 20260519_0006
Create Date: 2026-05-19

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260519_0007"
down_revision: Union[str, None] = "20260519_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _base_columns():
    return [
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by_id", postgresql.UUID(as_uuid=True), nullable=True),
    ]


def upgrade() -> None:
    op.create_table(
        "tenant_finding_generation_settings",
        *_base_columns(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sensitivity", sa.String(length=50), nullable=False, server_default="media"),
        sa.Column("min_clause_score", sa.Integer(), nullable=True),
        sa.Column("min_process_score", sa.Integer(), nullable=True),
        sa.Column("min_global_score", sa.Integer(), nullable=True),
        sa.Column("min_criticality", sa.String(length=50), nullable=False, server_default="media"),
        sa.Column("weight_escalation_threshold", sa.Integer(), nullable=True),
        sa.Column("reincidence_lookback_days", sa.Integer(), nullable=False, server_default="365"),
        sa.Column(
            "reincidence_severity_boost",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "auto_generate_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "require_manual_validation",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tenant_id", name="uq_tenant_finding_settings"),
    )

    op.create_table(
        "audit_finding_suggestions",
        *_base_columns(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("audit_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("checklist_item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("template_question_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("classification", sa.String(length=50), nullable=False),
        sa.Column("severity", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("requirement_reference", sa.String(length=255), nullable=True),
        sa.Column("process_area", sa.String(length=255), nullable=True),
        sa.Column("potential_impact", sa.Text(), nullable=True),
        sa.Column("initial_recommendation", sa.Text(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("evidence_ids", sa.JSON(), nullable=True),
        sa.Column("generation_context", sa.JSON(), nullable=True),
        sa.Column("ai_metadata", sa.JSON(), nullable=True),
        sa.Column("converted_finding_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("reviewed_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("discard_reason", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["audit_id"], ["audits.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["checklist_item_id"], ["audit_checklists.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["template_question_id"], ["checklist_questions.id"], ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_audit_finding_suggestions_audit_id"),
        "audit_finding_suggestions",
        ["audit_id"],
    )
    op.create_index(
        op.f("ix_audit_finding_suggestions_status"),
        "audit_finding_suggestions",
        ["status"],
    )

    op.create_table(
        "audit_finding_suggestion_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("suggestion_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("action", sa.String(length=80), nullable=False),
        sa.Column("from_status", sa.String(length=50), nullable=True),
        sa.Column("to_status", sa.String(length=50), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("changes", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(
            ["suggestion_id"], ["audit_finding_suggestions.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.add_column(
        "audit_findings",
        sa.Column("source", sa.String(length=50), nullable=False, server_default="manual"),
    )
    op.add_column(
        "audit_findings",
        sa.Column("suggestion_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_audit_findings_suggestion_id",
        "audit_findings",
        "audit_finding_suggestions",
        ["suggestion_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_audit_finding_suggestions_converted_finding",
        "audit_finding_suggestions",
        "audit_findings",
        ["converted_finding_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_audit_finding_suggestions_converted_finding",
        "audit_finding_suggestions",
        type_="foreignkey",
    )
    op.drop_constraint("fk_audit_findings_suggestion_id", "audit_findings", type_="foreignkey")
    op.drop_column("audit_findings", "suggestion_id")
    op.drop_column("audit_findings", "source")
    op.drop_table("audit_finding_suggestion_history")
    op.drop_table("audit_finding_suggestions")
    op.drop_table("tenant_finding_generation_settings")
