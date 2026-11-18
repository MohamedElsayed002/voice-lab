import logging
import math
from typing import Any

from fastapi import Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import session_factory
from app.exceptions.handlers import NotFoundException
from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)


class AuditLogService:
    def __init__(self, db: AsyncSession | None = None) -> None:
        self.db = db

    async def get_audit_log(self, log_id: str) -> AuditLog:
        if self.db is None:
            async with session_factory() as db:
                return await AuditLogService(db).get_audit_log(log_id)

        result = await self.db.execute(select(AuditLog).where(AuditLog.id == log_id))
        log = result.scalar_one_or_none()
        if log is None:
            raise NotFoundException("AuditLog", log_id)
        return log

    async def list_audit_logs(
        self,
        page: int = 1,
        page_size: int = 20,
        event: str | None = None,
        status: str | None = None,
        user_id: str | None = None,
    ) -> dict[str, Any]:
        if self.db is None:
            async with session_factory() as db:
                return await AuditLogService(db).list_audit_logs(
                    page=page,
                    page_size=page_size,
                    event=event,
                    status=status,
                    user_id=user_id,
                )

        query = select(AuditLog)
        if event is not None:
            query = query.where(AuditLog.event == event)
        if status is not None:
            query = query.where(AuditLog.status == status)
        if user_id is not None:
            query = query.where(AuditLog.user_id == user_id)

        total_result = await self.db.execute(
            select(func.count()).select_from(query.order_by(None).subquery())
        )
        total = total_result.scalar_one()
        result = await self.db.execute(
            query.order_by(AuditLog.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return {
            "items": list(result.scalars().all()),
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": math.ceil(total / page_size) if total else 0,
        }

    async def create_audit_log(
        self,
        event: str,
        status: str,
        user_id: str,
        request: Request | None = None,
        metadata: dict[str, Any] | None = None,
        commit: bool = False,
    ) -> AuditLog | None:
        log = AuditLog(
            event=event,
            user_id=user_id,
            status=status,
            ip_address=request.client.host if request and request.client else None,
            user_agent=request.headers.get("user-agent") if request else None,
            extra=metadata or {},
        )

        try:
            if self.db is None:
                async with session_factory() as db:
                    db.add(log)
                    await db.commit()
                return log

            self.db.add(log)
            if commit:
                await self.db.commit()
            else:
                await self.db.flush()
            return log
        except Exception:
            logger.exception("Audit log failed")
            if self.db is not None:
                await self.db.rollback()
            return None
