from fastapi import FastAPI

app = FastAPI(title="Mosaic API", version="0.1.0")


@app.get("/health")
async def health() -> dict[str, str]:
    """Return the service health status."""
    return {"status": "ok"}
