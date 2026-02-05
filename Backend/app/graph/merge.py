from typing import Dict, List
from copy import deepcopy


class GraphMerger:
    def __init__(self, base_graph: dict):
        self.nodes = {n["id"]: n for n in base_graph["nodes"]}
        self.edges = {(e["source"], e["target"]): e for e in base_graph["edges"]}

    def merge(self, parent_node: str, subgraph: dict) -> dict:
        rename_map = {}

        # --- Merge nodes ---
        for node in subgraph["nodes"]:
            node_id = node["id"]

            if node_id in self.nodes:
                if self.nodes[node_id]["label"] != node["label"]:
                    new_id = f"{parent_node}__{node_id}"
                    rename_map[node_id] = new_id
                    node = deepcopy(node)
                    node["id"] = new_id
                    self.nodes[new_id] = node
            else:
                self.nodes[node_id] = node

        # --- Merge edges ---
        for edge in subgraph["edges"]:
            src = rename_map.get(edge["source"], edge["source"])
            tgt = rename_map.get(edge["target"], edge["target"])

            key = (src, tgt)
            if key not in self.edges:
                self.edges[key] = {
                    "id": f"{src}-{tgt}",
                    "source": src,
                    "target": tgt,
                    "relation": edge["relation"]
                }

        return {
            "nodes": list(self.nodes.values()),
            "edges": list(self.edges.values())
        }
