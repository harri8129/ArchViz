from app.llm.client import call_llm
from app.graph.builder import GraphBuilder
from app.graph.merge import GraphMerger
from app.services.graph_state import build_canonical_state
from app.services.snapshot_service import SnapshotService
from app.services.graph_diff import GraphDiff


class DesignService:

    @staticmethod
    async def build_graph(system_name: str, return_diff: bool = False, use_cache: bool = True) -> dict:
        """
        Build initial graph with optional diff mode.
        
        Args:
            system_name: Name of system to design
            return_diff: If True, return only changes from previous version
            use_cache: If False, bypass LLM cache
        """
        try:
            system_design = await call_llm(system_name, use_cache=use_cache)
        except Exception:
            raise RuntimeError("LLM failed to generate architecture")

        builder = GraphBuilder(system_design)
        graph = builder.build()

        state = build_canonical_state(
            system=system_name,
            nodes=graph["nodes"],
            edges=graph["edges"],
            last_action="build_graph"
        )

        # Load previous state if diff mode requested
        if return_diff:
            prev_state = SnapshotService.load_latest(system_name)
            if prev_state:
                diff = GraphDiff.compute_diff(prev_state, state)
                state["added_nodes"] = diff["added_nodes"]
                state["added_edges"] = diff["added_edges"]
                # Keep full nodes/edges for storage, but client uses added_*
        
        # Save snapshot
        SnapshotService.save_snapshot(
            system=system_name,
            version=state["version"],
            state=state
        )

        return state
    
    @staticmethod
    async def expand_node(
        system: str,
        node_id: str,
        node_label: str,
        max_depth: int,
        return_diff: bool = False
    ) -> dict:
        """
        Expand a node with optional diff mode.
        """
        try:
            subgraph_design = await call_llm(
                system_name=f"{system}::{node_label}"
            )
        except Exception:
            raise RuntimeError("LLM failed to expand node")

        subgraph_design["system"] = system
        subgraph_design.setdefault("edges", [])

        builder = GraphBuilder(subgraph_design)
        graph = builder.build()

        for node in graph["nodes"]:
            node["level"] += 1

        state = build_canonical_state(
            system=system,
            nodes=graph["nodes"],
            edges=graph["edges"],
            last_action="expand_node",
            parent_node=node_id
        )

        # Compute diff if requested
        if return_diff:
            prev_state = SnapshotService.load_latest(system)
            if prev_state:
                diff = GraphDiff.compute_diff(prev_state, state)
                state["added_nodes"] = diff["added_nodes"]
                state["added_edges"] = diff["added_edges"]

        # Save snapshot
        SnapshotService.save_snapshot(
            system=system,
            version=state["version"],
            state=state
        )

        return state
    

    
    @staticmethod
    def merge_graph(base_graph: dict, subgraph: dict) -> dict:
        merger = GraphMerger(base_graph)
        return merger.merge(
            parent_node=subgraph["parent_node"],
            subgraph=subgraph
        )

      