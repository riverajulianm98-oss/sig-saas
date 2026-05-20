"""document enterprise: audit, settings, file hash, ai metadata

Revision ID: 20260519_0004
Revises: 20260519_0003
Create Date: 2026-05-19

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260519_0004"
down_revision: Union[str, None] = "20260519_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "document_versions",
        sa.Column("file_hash_sha256", sa.String(length=64), nullable=True),
    )
    op.add_column(
        "document_versions",
        sa.Column("ai_metadata", sa.JSON(), nullable=True),
    )
    op.create_index(
        op.f("ix_document_versions_file_hash_sha256"),
        "document_versions",
        ["file_hash_sha256"],
        unique=False,
    )

    op.create_table(
        "tenant_document_settings",
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
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("expiration_warning_days", sa.Integer(), nullable=False, server_default="30"),
        sa.Column("expiration_critical_days", sa.Integer(), nullable=False, server_default="7"),
        sa.Column("email_alerts_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "websocket_alerts_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tenant_id"),
    )
    op.create_index(
        op.f("ix_tenant_document_settings_tenant_id"),
        "tenant_document_settings",
        ["tenant_id"],
        unique=True,
    )

    op.create_table(
        "document_audit_logs",
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
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(length=50), nullable=False),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column("changes", sa.JSON(), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["version_id"], ["document_versions.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_document_audit_logs_action"),
        "document_audit_logs",
        ["action"],
        unique=False,
    )
    op.create_index(
        op.f("ix_document_audit_logs_document_id"),
        "document_audit_logs",
        ["document_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_document_audit_logs_tenant_id"),
        "document_audit_logs",
        ["tenant_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_document_audit_logs_version_id"),
        "document_audit_logs",
        ["version_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_document_audit_logs_version_id"), table_name="document_audit_logs")
    op.drop_index(op.f("ix_document_audit_logs_tenant_id"), table_name="document_audit_logs")
    op.drop_index(op.f("ix_document_audit_logs_document_id"), table_name="document_audit_logs")
    op.drop_index(op.f("ix_document_audit_logs_action"), table_name="document_audit_logs")
    op.drop_table("document_audit_logs")
    op.drop_index(
        op.f("ix_tenant_document_settings_tenant_id"),
        table_name="tenant_document_settings",
    )
    op.drop_table("tenant_document_settings")
    op.drop_index(
        op.f("ix_document_versions_file_hash_sha256"),
        table_name="document_versions",
    )
    op.drop_column("document_versions", "ai_metadata")
    op.drop_column("document_versions", "file_hash_sha256")
