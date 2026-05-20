"""audits module tables

Revision ID: 20260519_0005
Revises: 20260519_0004
Create Date: 2026-05-19

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260519_0005"
down_revision: Union[str, None] = "20260519_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _audit_base_columns():
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
        "audit_plans",
        *_audit_base_columns(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="activo"),
        sa.Column("iso_standards", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_plans_tenant_id"), "audit_plans", ["tenant_id"])
    op.create_index(op.f("ix_audit_plans_year"), "audit_plans", ["year"])

    op.create_table(
        "audits",
        *_audit_base_columns(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("audit_plan_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("audit_type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("iso_standards", sa.JSON(), nullable=True),
        sa.Column("process_area", sa.String(length=255), nullable=True),
        sa.Column("scope", sa.Text(), nullable=True),
        sa.Column("objectives", sa.Text(), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("planned_start_date", sa.Date(), nullable=True),
        sa.Column("planned_end_date", sa.Date(), nullable=True),
        sa.Column("actual_start_date", sa.Date(), nullable=True),
        sa.Column("actual_end_date", sa.Date(), nullable=True),
        sa.Column("lead_auditor_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("team_member_ids", sa.JSON(), nullable=True),
        sa.Column("compliance_score", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["audit_plan_id"], ["audit_plans.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["lead_auditor_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audits_audit_type"), "audits", ["audit_type"])
    op.create_index(op.f("ix_audits_status"), "audits", ["status"])
    op.create_index(op.f("ix_audits_tenant_id"), "audits", ["tenant_id"])

    op.create_table(
        "audit_checklists",
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
        sa.Column("audit_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("iso_standard", sa.String(length=50), nullable=False),
        sa.Column("clause_code", sa.String(length=50), nullable=False),
        sa.Column("requirement_text", sa.Text(), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("weight", sa.Integer(), nullable=False, server_default="1"),
        sa.ForeignKeyConstraint(["audit_id"], ["audits.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_checklists_audit_id"), "audit_checklists", ["audit_id"])

    op.create_table(
        "audit_responses",
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
        sa.Column("checklist_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("compliance_status", sa.String(length=50), nullable=False),
        sa.Column("score", sa.Integer(), nullable=True),
        sa.Column("observations", sa.Text(), nullable=True),
        sa.Column("responded_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("responded_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["checklist_id"], ["audit_checklists.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["responded_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("checklist_id"),
    )

    op.create_table(
        "audit_findings",
        *_audit_base_columns(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("audit_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("classification", sa.String(length=50), nullable=False),
        sa.Column("severity", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("requirement_reference", sa.String(length=255), nullable=True),
        sa.Column("process_area", sa.String(length=255), nullable=True),
        sa.Column("responsible_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("root_cause", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["audit_id"], ["audits.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["responsible_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_findings_audit_id"), "audit_findings", ["audit_id"])
    op.create_index(op.f("ix_audit_findings_severity"), "audit_findings", ["severity"])

    op.create_table(
        "audit_action_plans",
        *_audit_base_columns(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("finding_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("responsible_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["finding_id"], ["audit_findings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["responsible_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "audit_evidences",
        *_audit_base_columns(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("audit_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("finding_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("checklist_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("evidence_type", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("document_version_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("external_url", sa.String(length=2048), nullable=True),
        sa.Column("file_name", sa.String(length=500), nullable=True),
        sa.Column("storage_key", sa.String(length=1024), nullable=True),
        sa.Column("mime_type", sa.String(length=128), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("file_hash_sha256", sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(["audit_id"], ["audits.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["checklist_id"], ["audit_checklists.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["document_version_id"], ["document_versions.id"], ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(["finding_id"], ["audit_findings.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "audit_activity_logs",
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
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("audit_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("entity_type", sa.String(length=50), nullable=True),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(length=50), nullable=False),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("changes", sa.JSON(), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["audit_id"], ["audits.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_audit_activity_logs_audit_id"),
        "audit_activity_logs",
        ["audit_id"],
    )


def downgrade() -> None:
    op.drop_table("audit_activity_logs")
    op.drop_table("audit_evidences")
    op.drop_table("audit_action_plans")
    op.drop_table("audit_findings")
    op.drop_table("audit_responses")
    op.drop_table("audit_checklists")
    op.drop_table("audits")
    op.drop_table("audit_plans")
