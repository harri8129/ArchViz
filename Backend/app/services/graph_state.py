def build_canonical_state(
    system: str,
    nodes: list,
    edges: list,
    last_action: str,
    parent_node: str | None = None,
    version: int = 1
) -> dict:
    return {
        "system": system,
        "version": version,
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "last_action": last_action,
            "parent_node": parent_node
        }
    }
