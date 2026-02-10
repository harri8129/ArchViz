from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Configure CORS
# Middleware added last runs first. We want CORS to run first to handle OPTIONS requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)  # ← CREATE TABLES

@app.get("/ping")
def ping():
    return {"status": "ok"}

app.include_router(design_router, prefix="")
