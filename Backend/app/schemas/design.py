from pydantic import BaseModel
from typing import List, Literal

class DesignRequest(BaseModel):
    system_name: str

class Component(BaseModel):
    id: str
    name: str
    description: str
    type: Literal["frontend", "backend", "database", "infra", "ml"]

class Edge(BaseModel):
    from_: str
    to: str
    relation: str

class SystemDesign(BaseModel):
    system: str
    components: List[Component]
    edges: List[Edge]
