from fastapi import APIRouter, HTTPException
from app.schemas.design import BuildGraphRequest, GraphResponse,ExpandNodeRequest, CanonicalGraphResponse
from app.services.design_service import DesignService

router = APIRouter()

@router.post("/build-graph", response_model=GraphResponse)
async def build_graph(payload: BuildGraphRequest):
    try:
        return await DesignService.build_graph(payload.system_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/expand-node", response_model=CanonicalGraphResponse)
async def expand_node(payload: ExpandNodeRequest):
    return await DesignService.expand_node(
        system=payload.system,
        node_id=payload.node_id,
        node_label=payload.node_label,
        max_depth=payload.max_depth
    )
