from fastapi import FastAPI

from app.api.router import api_router


app = FastAPI(
    title="Print Machine API",
    version="0.1.0",
)

app.include_router(
    api_router,
    prefix="/api",
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "print-machine-api",
    }
