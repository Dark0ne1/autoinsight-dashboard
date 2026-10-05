import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send

from app.api import MAX_FILE_BYTES, router


class UploadLimit:
    """Limit actual request bytes before multipart parsing (including chunked requests)."""
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope["path"] != "/api/upload":
            await self.app(scope, receive, send)
            return
        seen = 0
        limit = MAX_FILE_BYTES + 1024 * 1024
        headers = dict(scope.get("headers", []))
        try:
            declared = int(headers.get(b"content-length", b"0"))
        except ValueError:
            declared = limit + 1
        if declared > limit:
            await JSONResponse({"detail": "Upload exceeds size limit."}, status_code=413)(scope, receive, send)
            return

        async def bounded_receive() -> dict:
            nonlocal seen
            message = await receive()
            seen += len(message.get("body", b""))
            if seen > limit:
                from starlette.exceptions import HTTPException
                raise HTTPException(413, "Upload exceeds size limit.")
            return message

        await self.app(scope, bounded_receive, send)


app = FastAPI(title="AutoInsight Dashboard", version="1.0.0")
app.add_middleware(UploadLimit)
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(","), allow_methods=["GET", "POST", "DELETE"], allow_headers=["Content-Type"])
app.include_router(router)


@app.exception_handler(ValueError)
async def invalid_data(request: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse({"detail": str(exc)}, status_code=422)


@app.exception_handler(KeyError)
async def missing_dataset(request: Request, exc: KeyError) -> JSONResponse:
    return JSONResponse({"detail": "Dataset expired or was removed. Upload it again."}, status_code=404)


@app.exception_handler(Exception)
async def unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    import logging
    logging.getLogger("autoinsight").exception("Request failed", exc_info=exc)
    return JSONResponse({"detail": "Could not read or analyze this file. Check its format and try a smaller dataset."}, status_code=422)
