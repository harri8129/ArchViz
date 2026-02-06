from fastapi import FastAPI
from app.api.design import router as design_router
from app.core.db import engine, Base
from app.models.graph_snapshot import GraphSnapshot
from app.core.rate_limiter import limiter, rate_limit_handler
from slowapi.errors import RateLimitExceeded
from app.core.performance import PerformanceMiddleware


app = FastAPI(title="ArchViz AI")

# Register rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)
app.add_middleware(PerformanceMiddleware)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)  # ← CREATE TABLES

@app.get("/ping")
def ping():
    return {"status": "ok"}

app.include_router(design_router, prefix="/design")
