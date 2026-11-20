from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.models.audit_log import AuditLog
from app.schema.audit_log import AuditLogListResponse, AuditLogResponse
from app.services.audit_log_services import AuditLogService
from app.auth.services.auth_service import auth_service

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("", response_model=AuditLogListResponse)
async def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    event: str | None = None,
    status: str | None = None,
    user: dict[str, str | bool | None] = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await AuditLogService(db).list_audit_logs(
        page=page,
        page_size=page_size,
        event=event,
        status=status,
        user_id=user["id"],
    )


@router.get("/{log_id}", response_model=AuditLogResponse)
async def get_audit_log(
    log_id: str,
    user: dict[str, str | bool | None] = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AuditLog:
    log = await AuditLogService(db).get_audit_log(log_id)
    if log.user_id != user["id"]:
        raise HTTPException(status_code=404, detail="AuditLog not found")
    return log
