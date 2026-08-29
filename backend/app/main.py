from fastapi import FastAPI

app = FastAPI(
    title="Print Machine API",
    version="0.1.0"
)

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "print-machine-api"
    }
