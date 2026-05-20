"""checklist ISO templates

Revision ID: 20260519_0006
Revises: 20260519_0005
Create Date: 2026-05-19

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260519_0006"
down_revision: Union[str, None] = "20260519_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _base_entity_columns():
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
        "checklist_templates",
        *_base_entity_columns(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("iso_standard", sa.String(length=50), nullable=False),
        sa.Column("code", sa.String(length=80), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_system", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("source_template_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("current_version_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["source_template_id"], ["checklist_templates.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tenant_id", "code", name="uq_checklist_templates_tenant_code"),
    )
    op.create_index(
        op.f("ix_checklist_templates_iso_standard"),
        "checklist_templates",
        ["iso_standard"],
    )
    op.create_index(op.f("ix_checklist_templates_tenant_id"), "checklist_templates", ["tenant_id"])
    op.create_index(op.f("ix_checklist_templates_is_active"), "checklist_templates", ["is_active"])

    op.create_table(
        "checklist_template_versions",
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
        sa.Column("template_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="draft"),
        sa.Column("change_summary", sa.Text(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(["template_id"], ["checklist_templates.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["published_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_checklist_template_versions_template_id"),
        "checklist_template_versions",
        ["template_id"],
    )
    op.create_index(
        op.f("ix_checklist_template_versions_status"),
        "checklist_template_versions",
        ["status"],
    )

    op.create_foreign_key(
        "fk_checklist_templates_current_version",
        "checklist_templates",
        "checklist_template_versions",
        ["current_version_id"],
        ["id"],
        ondelete="SET NULL",
        use_alter=True,
    )

    op.create_table(
        "checklist_sections",
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
        sa.Column("version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chapter_code", sa.String(length=20), nullable=False),
        sa.Column("clause_code", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("process_area", sa.String(length=255), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(
            ["version_id"], ["checklist_template_versions.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_checklist_sections_version_id"), "checklist_sections", ["version_id"]
    )
    op.create_index(
        op.f("ix_checklist_sections_clause_code"), "checklist_sections", ["clause_code"]
    )

    op.create_table(
        "checklist_questions",
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
        sa.Column("section_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("clause_code", sa.String(length=50), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("compliance_criteria", sa.Text(), nullable=False),
        sa.Column("guidance_text", sa.Text(), nullable=True),
        sa.Column("weight", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("criticality", sa.String(length=50), nullable=False, server_default="media"),
        sa.Column("response_type", sa.String(length=50), nullable=False, server_default="cumple"),
        sa.Column("is_required", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("evidence_required", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["section_id"], ["checklist_sections.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_checklist_questions_section_id"), "checklist_questions", ["section_id"]
    )

    op.add_column(
        "audits",
        sa.Column("checklist_template_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "audits",
        sa.Column(
            "checklist_template_version_id", postgresql.UUID(as_uuid=True), nullable=True
        ),
    )
    op.create_foreign_key(
        "fk_audits_checklist_template",
        "audits",
        "checklist_templates",
        ["checklist_template_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_audits_checklist_template_version",
        "audits",
        "checklist_template_versions",
        ["checklist_template_version_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.add_column(
        "audit_checklists",
        sa.Column("template_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "audit_checklists",
        sa.Column("template_version_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "audit_checklists",
        sa.Column("template_question_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column("audit_checklists", sa.Column("chapter_code", sa.String(length=20), nullable=True))
    op.add_column(
        "audit_checklists", sa.Column("section_title", sa.String(length=500), nullable=True)
    )
    op.add_column(
        "audit_checklists", sa.Column("process_area", sa.String(length=255), nullable=True)
    )
    op.add_column(
        "audit_checklists", sa.Column("criticality", sa.String(length=50), nullable=True)
    )
    op.add_column(
        "audit_checklists", sa.Column("response_type", sa.String(length=50), nullable=True)
    )
    op.add_column(
        "audit_checklists",
        sa.Column("evidence_required", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column("audit_checklists", sa.Column("compliance_criteria", sa.Text(), nullable=True))

    op.create_foreign_key(
        "fk_audit_checklists_template",
        "audit_checklists",
        "checklist_templates",
        ["template_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_audit_checklists_template_version",
        "audit_checklists",
        "checklist_template_versions",
        ["template_version_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_audit_checklists_template_question",
        "audit_checklists",
        "checklist_questions",
        ["template_question_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.add_column("audit_responses", sa.Column("text_value", sa.Text(), nullable=True))
    op.add_column("audit_responses", sa.Column("numeric_value", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("audit_responses", "numeric_value")
    op.drop_column("audit_responses", "text_value")

    op.drop_constraint("fk_audit_checklists_template_question", "audit_checklists", type_="foreignkey")
    op.drop_constraint("fk_audit_checklists_template_version", "audit_checklists", type_="foreignkey")
    op.drop_constraint("fk_audit_checklists_template", "audit_checklists", type_="foreignkey")
    for col in (
        "compliance_criteria",
        "evidence_required",
        "response_type",
        "criticality",
        "process_area",
        "section_title",
        "chapter_code",
        "template_question_id",
        "template_version_id",
        "template_id",
    ):
        op.drop_column("audit_checklists", col)

    op.drop_constraint("fk_audits_checklist_template_version", "audits", type_="foreignkey")
    op.drop_constraint("fk_audits_checklist_template", "audits", type_="foreignkey")
    op.drop_column("audits", "checklist_template_version_id")
    op.drop_column("audits", "checklist_template_id")

    op.drop_table("checklist_questions")
    op.drop_table("checklist_sections")
    op.drop_constraint(
        "fk_checklist_templates_current_version", "checklist_templates", type_="foreignkey"
    )
    op.drop_table("checklist_template_versions")
    op.drop_table("checklist_templates")
