from app.graph.builder import GraphBuilder

sample_json = {
    "system": "ChatGPT",
    "components": [
        {"id": "Frontend", "name": "Frontend", "description": "UI", "type": "frontend"},
        {"id": "API Gateway", "name": "API Gateway", "description": "Routing", "type": "backend"},
        {"id": "LLM Service", "name": "LLM Service", "description": "Inference", "type": "ml"},
    ],
    "edges": [
        {"from": "Frontend", "to": "API Gateway", "relation": "calls"},
        {"from": "API Gateway", "to": "LLM Service", "relation": "queries"}
    ]
}

builder = GraphBuilder(sample_json)
graph = builder.build()

print(graph)
