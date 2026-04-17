import logging
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Configure basic logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)-15s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger("coderag.api")

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log request details (method, path, status, duration)."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.perf_counter()
        
        # Process the request
        try:
            response = await call_next(request)
            
            # Calculate duration in milliseconds
            process_time = (time.perf_counter() - start_time) * 1000
            
            # Log successful requests
            # We skip /health and /docs logging to avoid noise unless errors occur
            if request.url.path not in ["/health", "/docs", "/openapi.json"]:      
                logger.info(
                    f"{request.method} {request.url.path} | "
                    f"Status: {response.status_code} | "
                    f"Duration: {process_time:.2f}ms"
                )
            
            return response
            
        except Exception as e:
            # Errors will be handled by the custom exception handlers, 
            # but we catch them here for duration logging if needed.
            process_time = (time.perf_counter() - start_time) * 1000
            logger.error(
                f"{request.method} {request.url.path} | "
                f"FAILED | Duration: {process_time:.2f}ms | Error: {str(e)}"
            )
            raise e
