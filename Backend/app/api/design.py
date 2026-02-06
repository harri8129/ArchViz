from fastapi import APIRouter, HTTPException,Query,Request
from app.schemas.design import BuildGraphRequest, GraphResponse,ExpandNodeRequest, CanonicalGraphResponse
from app.services.design_service import DesignService
from app.services.snapshot_service import SnapshotService
from app.schemas.design import (
    BuildGraphRequest, 
    GraphResponse,
    ExpandNodeRequest, 
    CanonicalGraphResponse,
    GraphDiffResponse
)
from app.core.rate_limiter import limiter
from app.core.cost_monitor import cost_monitor
from app.core.performance import perf_monitor

router = APIRouter()


@router.post("/build-graph")
@limiter.limit("5/minute")  # Strict limit for expensive LLM calls
async def build_graph(
    request: Request,
    payload: BuildGraphRequest,
    diff: bool = Query(False, description="Return only changes from previous version")
):
    """
    Build system architecture graph.
    
    Rate limit: 5 requests per minute per IP
    """
    try:
        result = await DesignService.build_graph(
            payload.system_name, 
            return_diff=diff
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/expand-node")
@limiter.limit("10/minute")  # Slightly more permissive
async def expand_node(
    request: Request,  # Required for rate limiter
    payload: ExpandNodeRequest,
    diff: bool = Query(False, description="Return only changes from previous version")
):
    """
    Expand a single node into subgraph.
    
    Rate limit: 10 requests per minute per IP
    """
    try:
        result = await DesignService.expand_node(
            system=payload.system,
            node_id=payload.node_id,
            node_label=payload.node_label,
            max_depth=payload.max_depth,
            return_diff=diff
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/load-latest/{system}")
@limiter.limit("30/minute")  # More permissive for read-only
async def load_latest(request: Request, system: str):
    """
    Load latest saved graph.
    
    Rate limit: 30 requests per minute per IP
    """
    state = SnapshotService.load_latest(system)
    if not state:
        return {"message": "No saved graph found"}
    return state

@router.get("/stats")
async def get_stats(request: Request):
    """
    Get API usage statistics.
    
    No rate limit for monitoring endpoint.
    """
    return {
        "llm_usage": cost_monitor.get_stats(),
        "status": "operational"
    }

@router.get("/metrics")
async def get_metrics(request: Request):
    """
    Get detailed performance and usage metrics.
    
    Returns:
        - Performance stats per endpoint
        - LLM usage and costs
        - Cache hit rates
    """
    from app.core.cost_monitor import cost_monitor
    from app.core.cache import redis_client
    
    # Get cache stats
    cache_info = redis_client.info("stats")
    cache_hits = cache_info.get("keyspace_hits", 0)
    cache_misses = cache_info.get("keyspace_misses", 0)
    total_cache_ops = cache_hits + cache_misses
    hit_rate = (cache_hits / total_cache_ops * 100) if total_cache_ops > 0 else 0
    
    return {
        "performance": perf_monitor.get_stats(),
        "llm_usage": cost_monitor.get_stats(),
        "cache": {
            "hits": cache_hits,
            "misses": cache_misses,
            "hit_rate_percent": round(hit_rate, 2)
        },
        "status": "operational"
    }