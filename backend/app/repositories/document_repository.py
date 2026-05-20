"""Document persistence queries."""

import uuid
from datetime import datetime

from sqlalchemy import String, cast, exists, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.infrastructure.models.document import Document
from app.infrastructure.models.document_version import DocumentVersion
from app.modules.documents.schemas import DocumentSearchParams


class DocumentRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, tenant_id: uuid.UUID, document_id: uuid.UUID) -> Document | None:
        return self._session.scalar(
            select(Document)
            .where(
                Document.id == document_id,
                Document.tenant_id == tenant_id,
                Document.deleted_at.is_(None),
            )
            .options(
                selectinload(Document.versions),
                selectinload(Document.current_version),
            )
        )

    def code_exists(self, tenant_id: uuid.UUID, code: str) -> bool:
        return bool(
            self._session.scalar(
                select(Document.id).where(
                    Document.tenant_id == tenant_id,
                    Document.code == code,
                    Document.deleted_at.is_(None),
                )
            )
        )

    def search(
        self,
        tenant_id: uuid.UUID,
        params: DocumentSearchParams,
    ) -> tuple[list[Document], int]:
        filters = [Document.tenant_id == tenant_id, Document.deleted_at.is_(None)]

        if params.code:
            filters.append(Document.code.ilike(f"%{params.code.strip().upper()}%"))
        if params.status:
            filters.append(Document.status == params.status.value)
        if params.document_type:
            filters.append(Document.document_type == params.document_type.value)
        if params.process_area:
            filters.append(Document.process_area.ilike(f"%{params.process_area.strip()}%"))
        if params.owner_id:
            filters.append(Document.owner_id == params.owner_id)
        if params.expires_from:
            filters.append(Document.expires_at >= params.expires_from)
        if params.expires_to:
            filters.append(Document.expires_at <= params.expires_to)
        if params.created_from:
            filters.append(Document.created_at >= params.created_from)
        if params.created_to:
            filters.append(Document.created_at <= params.created_to)
        if params.search:
            term = f"%{params.search.strip()}%"
            filters.append(
                or_(
                    Document.code.ilike(term),
                    Document.title.ilike(term),
                    Document.description.ilike(term),
                )
            )
        if params.tags:
            for tag in params.tags:
                filters.append(cast(Document.tags, String).ilike(f'%"{tag}"%'))
        if params.has_file is True:
            filters.append(
                exists().where(
                    DocumentVersion.id == Document.current_version_id,
                    DocumentVersion.storage_key.isnot(None),
                )
            )
        elif params.has_file is False:
            filters.append(
                or_(
                    Document.current_version_id.is_(None),
                    ~exists().where(
                        DocumentVersion.id == Document.current_version_id,
                        DocumentVersion.storage_key.isnot(None),
                    ),
                )
            )

        total = self._session.scalar(select(func.count(Document.id)).where(*filters)) or 0
        rows = self._session.scalars(
            select(Document)
            .where(*filters)
            .order_by(Document.updated_at.desc())
            .offset(params.skip)
            .limit(params.limit)
        ).all()
        return list(rows), total

    def list_expiring(
        self,
        tenant_id: uuid.UUID,
        *,
        before: datetime,
        after: datetime | None = None,
    ) -> list[Document]:
        filters = [
            Document.tenant_id == tenant_id,
            Document.deleted_at.is_(None),
            Document.expires_at.isnot(None),
            Document.expires_at <= before,
        ]
        if after is not None:
            filters.append(Document.expires_at > after)
        return list(
            self._session.scalars(
                select(Document).where(*filters).order_by(Document.expires_at.asc())
            ).all()
        )
