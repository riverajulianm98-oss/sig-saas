"""Audit module activity log actions."""

from enum import StrEnum


class AuditActivityAction(StrEnum):
    PLAN_CREATED = "plan_created"
    PLAN_UPDATED = "plan_updated"
    AUDIT_CREATED = "audit_created"
    AUDIT_UPDATED = "audit_updated"
    AUDIT_STATUS_CHANGED = "audit_status_changed"
    AUDIT_DELETED = "audit_deleted"
    CHECKLIST_CREATED = "checklist_created"
    CHECKLIST_UPDATED = "checklist_updated"
    RESPONSE_RECORDED = "response_recorded"
    FINDING_CREATED = "finding_created"
    FINDING_UPDATED = "finding_updated"
    FINDING_CLOSED = "finding_closed"
    EVIDENCE_ADDED = "evidence_added"
    EVIDENCE_REMOVED = "evidence_removed"
    ACTION_PLAN_CREATED = "action_plan_created"
    ACTION_PLAN_UPDATED = "action_plan_updated"
    TEMPLATE_APPLIED = "template_applied"
    AUDIT_FROM_TEMPLATE = "audit_from_template"
    FINDING_SUGGESTIONS_GENERATED = "finding_suggestions_generated"
    FINDING_SUGGESTION_APPROVED = "finding_suggestion_approved"
    FINDING_SUGGESTION_DISCARDED = "finding_suggestion_discarded"
    FINDING_SUGGESTION_CONVERTED = "finding_suggestion_converted"
