from pydantic import BaseModel
from typing import List


class BuildGraphRequest(BaseModel):
    system_name: str


class GraphNode(BaseModel):
    id: str
    label: str
    description: str
    type: str
    level: int
    expandable: bool


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relation: str


class GraphResponse(BaseModel):
    system: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ExpandNodeRequest(BaseModel):
    system: str
    node_id: str
    node_label: str
    max_depth: int = 1


class ExpandNodeResponse(BaseModel):
    parent_node: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class GraphMetadata(BaseModel):
    last_action: str
    parent_node: str | None = None


class CanonicalGraphResponse(BaseModel):
    system: str
    version: int
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    metadata: GraphMetadata