from app.llm.client import call_llm
from app.graph.builder import GraphBuilder
from app.graph.merge import GraphMerger
from app.services.graph_state import build_canonical_state

class DesignService:

    @staticmethod
    async def build_graph(system_name: str) -> dict:
        try:
            system_design = await call_llm(system_name)
        except Exception:
            raise RuntimeError("LLM failed to generate architecture")

        builder = GraphBuilder(system_design)
        graph = builder.build()

        return build_canonical_state(
            system=system_name,
            nodes=graph["nodes"],
            edges=graph["edges"],
            last_action="build_graph"
        )

    @staticmethod
    async def expand_node(
        system: str,
        node_id: str,
        node_label: str,
        max_depth: int
    ) -> dict:

        try:
            subgraph_design = await call_llm(
                system_name=f"{system}::{node_label}"
            )
        except Exception:
            raise RuntimeError("LLM failed to expand node")

        # Inject parent context
        subgraph_design["system"] = system
        subgraph_design.setdefault("edges", [])

        builder = GraphBuilder(subgraph_design)
        graph = builder.build()

        # Offset levels so expansion starts below parent
        for node in graph["nodes"]:
            node["level"] += 1

        return build_canonical_state(
            system=system,
            nodes=graph["nodes"],
            edges=graph["edges"],
            last_action="expand_node",
            parent_node=node_id
        )

    
    @staticmethod
    def merge_graph(base_graph: dict, subgraph: dict) -> dict:
        merger = GraphMerger(base_graph)
        return merger.merge(
            parent_node=subgraph["parent_node"],
            subgraph=subgraph
        )

      