from fastapi import FastAPI
from app.api.design import router as design_router

app = FastAPI(title="ArchViz AI")

@app.get("/ping")
def ping():
    return {"status": "ok"}

app.include_router(design_router, prefix="/design")
