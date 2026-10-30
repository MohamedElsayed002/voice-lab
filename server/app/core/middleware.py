import time 
import uuid 
import logging 

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# from app.services

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) ->Response:
        request_id = str(uuid.uuid4())[:8]

        request.state.request_id = request_id 

        start_time = time.perf_counter()

        logger.info({
            "event": "request_start",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path
        })

        try:
            response = await call_next(request)
        except Exception as e:
            duration_ms = (time.perf_counter() - start_time) * 1000 

            logger.exception({
                "event": "request_error",
                "request_id": request_id,
                "duration_ms": round(duration_ms,2),
                "error": str(e)
            })

            raise

        duration_ms = (time.perf_counter() - start_time) * 1000 

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{duration_ms:.2f}ms"

        logger.info({
            "event": "request_end",
            "request_id": request_id,
            "status": response.status_code,
            "duration_ms": round(duration_ms,2)
        })

        return response