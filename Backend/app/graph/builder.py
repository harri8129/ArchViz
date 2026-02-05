from collections import deque, defaultdict
from typing import Dict, List


class GraphBuilder:
    def __init__(self, system_design: dict):
        # Required top-level fields
        self.system = system_design.get("system", "unknown_system")
        self.components = system_design.get("components")
        self.edges = system_design.get("edges", [])  # edges optional

        # 🔒 Minimal validation guard
        if not isinstance(self.components, list):
            raise ValueError("Invalid system design: components must be a list")

        if not isinstance(self.edges, list):
            raise ValueError("Invalid system design: edges must be a list")

        self.node_map: Dict[str, dict] = {}
        self.adjacency: Dict[str, List[str]] = defaultdict(list)

    # -------------------------
    # Utilities
    # -------------------------
    def normalize_id(self, value) -> str:
        return str(value).strip().lower().replace(" ", "_")


    # -------------------------
    # Public API
    # -------------------------
    def build(self) -> Dict[str, List[dict]]:
        self._build_nodes()
        self._build_edges()

        levels = self._assign_levels_with_cycle_check()

        return {
            "system": self.system,
            "nodes": self._build_ui_nodes(levels),
            "edges": self._build_ui_edges()
        }

    # -------------------------
    # Internal Steps
    # -------------------------
    def _build_nodes(self):
        for idx, comp in enumerate(self.components):
            # Prefer explicit id, fallback to name, fallback to index
            raw_id = (
                comp.get("id")
                or comp.get("name")
                or f"component_{idx}"
            )

            node_id = self.normalize_id(raw_id)

            self.node_map[node_id] = {
                "name": comp.get("name", node_id),
                "description": comp.get("description", ""),
                "type": comp.get("type", "backend")
            }

            # Ensure node exists in adjacency even if isolated
            self.adjacency[node_id]

    def _build_edges(self):
        for edge in self.edges:
            raw_src = edge.get("from")
            raw_tgt = edge.get("to")

            if not raw_src or not raw_tgt:
                continue

            src = self.normalize_id(raw_src)
            tgt = self.normalize_id(raw_tgt)

            if src in self.node_map and tgt in self.node_map:
                self.adjacency[src].append(tgt)

    def _assign_levels_with_cycle_check(self) -> Dict[str, int]:
        indegree = defaultdict(int)

        for src in self.adjacency:
            for tgt in self.adjacency[src]:
                indegree[tgt] += 1

        queue = deque()
        levels: Dict[str, int] = {}

        for node_id in self.node_map:
            if indegree[node_id] == 0:
                queue.append(node_id)
                levels[node_id] = 0

        visited_count = 0

        while queue:
            node = queue.popleft()
            visited_count += 1

            for neighbor in self.adjacency[node]:
                indegree[neighbor] -= 1
                if indegree[neighbor] == 0:
                    levels[neighbor] = levels[node] + 1
                    queue.append(neighbor)

        if visited_count != len(self.node_map):
            raise ValueError("Cycle detected in system architecture graph")

        return levels

    def _build_ui_nodes(self, levels: Dict[str, int]) -> List[dict]:
        return [
            {
                "id": node_id,
                "label": comp["name"],
                "description": comp["description"],
                "type": comp["type"],
                "level": levels.get(node_id, 0),
                "expandable": True
            }
            for node_id, comp in self.node_map.items()
        ]

    def _build_ui_edges(self) -> List[dict]:
        return [
            {
                "id": f"{src}-{tgt}",
                "source": src,
                "target": tgt,
                "relation": "depends_on"
            }
            for src, targets in self.adjacency.items()
            for tgt in targets
        ]
