from app.graph.merge import GraphMerger

base_graph = {
    "nodes": [
        {"id": "api_gateway", "label": "API Gateway", "level": 1},
    ],
    "edges": []
}

subgraph = {
    "parent_node": "api_gateway",
    "nodes": [
        {"id": "auth_service", "label": "Auth Service", "level": 2},
        {"id": "cache", "label": "Cache", "level": 2},
    ],
    "edges": [
        {"source": "auth_service", "target": "cache", "relation": "uses"}
    ]
}

merger = GraphMerger(base_graph)
merged = merger.merge("api_gateway", subgraph)

print(merged)
