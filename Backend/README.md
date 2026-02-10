# ArchViz AI - Backend Documentation

## Overview

ArchViz AI Backend is a FastAPI-based service that generates system architecture visualizations using LLM (Groq API). It provides APIs to build initial system graphs, expand nodes into subgraphs, and manage graph state with versioning and persistence.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ArchViz AI Backend                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   API Layer  │────▶│   Services   │────▶│     LLM      │                │
│  │   (FastAPI)  │     │   (Business) │     │   (Groq)     │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│         │                    │                                              │
│         │                    ▼                                              │
│         │            ┌──────────────┐     ┌──────────────┐                │
│         │            │ Graph Engine │────▶│    Cache     │                │
│         │            │(Build/Merge) │     │   (Redis)    │                │
│         │            └──────────────┘     └──────────────┘                │
│         │                    │                                              │
│         ▼                    ▼                                              │
│  ┌──────────────┐     ┌──────────────┐                                     │
│  │    Core      │────▶│  Database    │                                     │
│  │(Config/Utils)│     │(PostgreSQL)  │                                     │
│  └──────────────┘     └──────────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
Backend/
├── app/
│   ├── main.py                 # Application entry point
│   ├── api/
│   │   └── design.py           # API routes/endpoints
│   ├── core/
│   │   ├── config.py           # Configuration management
│   │   ├── db.py               # Database connection
│   │   ├── cache.py            # Redis caching
│   │   ├── cost_monitor.py     # LLM cost tracking
│   │   ├── performance.py      # Performance monitoring
│   │   └── rate_limiter.py     # Rate limiting
│   ├── graph/
│   │   ├── builder.py          # Graph construction
│   │   └── merge.py            # Graph merging
│   ├── llm/
│   │   ├── client.py           # LLM API client
│   │   └── prompts/
│   │       ├── system.txt      # System design prompt
│   │       └── expand_node.txt # Node expansion prompt
│   ├── models/
│   │   └── graph_snapshot.py   # Database models
│   ├── schemas/
│   │   └── design.py           # Pydantic schemas
│   └── services/
│       ├── design_service.py   # Main business logic
│       ├── snapshot_service.py # State persistence
│       ├── graph_state.py      # State builder
│       └── graph_diff.py       # Diff computation
├── tests/                      # Test suite
└── README.md                   # This file
```

## File-by-File Documentation

### 1. Entry Point

#### [`app/main.py`](app/main.py)
**Purpose**: FastAPI application initialization and configuration

**Agenda**:
- Initialize FastAPI app with CORS middleware
- Register API routers
- Configure rate limiting and performance monitoring
- Database table creation on startup

**Key Components**:
- CORS configuration for frontend (`localhost:5173`)
- Rate limiter registration
- Performance middleware
- Database initialization on startup event

---

### 2. API Layer

#### [`app/api/design.py`](app/api/design.py)
**Purpose**: Define REST API endpoints for graph operations

**Agenda**:
- `POST /build-graph` - Generate initial system architecture
- `POST /expand-node` - Expand a node into detailed subgraph
- `GET /load-latest/{system}` - Retrieve latest saved graph
- `GET /stats` - Get LLM usage statistics
- `GET /metrics` - Get performance metrics

**Rate Limits**:
- `/build-graph`: 5/minute (expensive LLM calls)
- `/expand-node`: 10/minute
- `/load-latest`: 30/minute

---

### 3. Core Infrastructure

#### [`app/core/config.py`](app/core/config.py)
**Purpose**: Environment configuration and secrets management

**Agenda**:
- Load environment variables from `.env` file
- Provide `get_groq_key()` function for API key access
- Centralized configuration access

**Environment Variables**:
- `GROQ_API_KEY` - LLM provider API key

#### [`app/core/db.py`](app/core/db.py)
**Purpose**: Database connection and ORM setup

**Agenda**:
- SQLAlchemy engine creation
- Session factory configuration
- Base class for declarative models

**Database**: PostgreSQL (configured via `DATABASE_URL`)

#### [`app/core/cache.py`](app/core/cache.py)
**Purpose**: Redis caching for LLM responses

**Agenda**:
- Cache LLM responses to reduce costs
- SHA256-based cache key generation
- 24-hour TTL for cached responses

**Key Functions**:
- `get_cached_response(prompt)` - Retrieve cached result
- `set_cached_response(prompt, response, ttl)` - Store result

#### [`app/core/cost_monitor.py`](app/core/cost_monitor.py)
**Purpose**: Track and limit LLM API usage costs

**Agenda**:
- Monitor total API calls and estimated costs
- Enforce budget limits ($10 default)
- Track hourly usage patterns

**Key Features**:
- Cost per call: $0.001 (configurable)
- Budget limit checking before LLM calls
- Usage statistics endpoint

#### [`app/core/performance.py`](app/core/performance.py)
**Purpose**: Monitor API endpoint performance

**Agenda**:
- Track request duration per endpoint
- Calculate min/max/average response times
- Middleware for automatic timing

**Metrics Tracked**:
- Request count
- Average response time (ms)
- Min/Max response times

#### [`app/core/rate_limiter.py`](app/core/rate_limiter.py)
**Purpose**: API rate limiting using slowapi

**Agenda**:
- Global rate limit: 100/hour per IP
- Custom limits per endpoint
- JSON error responses for exceeded limits

---

### 4. Graph Engine

#### [`app/graph/builder.py`](app/graph/builder.py)
**Purpose**: Construct graph from LLM-generated system design

**Agenda**:
- Parse LLM response into node/edge structures
- Validate input data
- Assign hierarchy levels with cycle detection
- Generate UI-ready node/edge formats

**Key Methods**:
- `build()` - Main entry point
- `_build_nodes()` - Create node objects
- `_build_edges()` - Create edge connections
- `_assign_levels_with_cycle_check()` - BFS level assignment

**Node Schema**:
```python
{
    "id": str,
    "label": str,
    "description": str,
    "type": str,
    "level": int,
    "expandable": bool
}
```

#### [`app/graph/merge.py`](app/graph/merge.py)
**Purpose**: Merge subgraphs into existing graph

**Agenda**:
- Handle node ID collisions during expansion
- Rename conflicting nodes with parent prefix
- Merge edges with deduplication
- Maintain graph integrity

**Key Method**:
- `merge(parent_node, subgraph)` - Merge subgraph into base

---

### 5. LLM Integration

#### [`app/llm/client.py`](app/llm/client.py)
**Purpose**: Async client for Groq LLM API

**Agenda**:
- Call Groq API with system architecture prompts
- Extract JSON from LLM responses
- Cache responses to reduce costs
- Track usage via cost_monitor

**Model**: `openai/gpt-oss-safeguard-20b`

**Key Function**:
- `call_llm(system_name)` - Generate architecture for system

#### [`app/llm/prompts/system.txt`](app/llm/prompts/system.txt)
**Purpose**: Prompt template for initial system design

**Agenda**:
- Define LLM behavior as senior system architect
- Specify output format (JSON only)
- Constrain component count (6-10)
- Define allowed types (frontend, backend, database, infra, ml)

#### [`app/llm/prompts/expand_node.txt`](app/llm/prompts/expand_node.txt)
**Purpose**: Prompt template for node expansion

**Agenda**:
- Focus on single component decomposition
- Limit sub-components (3-6)
- Support configurable depth
- Maintain JSON output format

---

### 6. Data Models

#### [`app/models/graph_snapshot.py`](app/models/graph_snapshot.py)
**Purpose**: SQLAlchemy model for graph persistence

**Agenda**:
- Store graph versions in PostgreSQL
- Track system name, version, and timestamp
- Use JSONB for flexible state storage

**Schema**:
```python
{
    "id": UUID (primary key),
    "system": str (indexed),
    "version": int,
    "state": JSONB,
    "created_at": datetime
}
```

#### [`app/schemas/design.py`](app/schemas/design.py)
**Purpose**: Pydantic schemas for request/response validation

**Agenda**:
- Define API input/output types
- Validate graph structure
- Support diff responses

**Key Schemas**:
- `BuildGraphRequest` - Input for graph creation
- `GraphNode` / `GraphEdge` - Core graph elements
- `GraphResponse` - Full graph output
- `ExpandNodeRequest` / `ExpandNodeResponse` - Expansion API
- `GraphDiffResponse` - Incremental changes

---

### 7. Business Services

#### [`app/services/design_service.py`](app/services/design_service.py)
**Purpose**: Main orchestration layer for graph operations

**Agenda**:
- `build_graph()` - Generate and save initial graph
- `expand_node()` - Expand node and merge subgraph
- Handle diff mode for incremental updates
- Integrate with LLM, cache, and persistence

**Flow**:
1. Check cache for existing response
2. Call LLM if cache miss
3. Build graph from LLM output
4. Compute diff if requested
5. Save snapshot to database
6. Return result

#### [`app/services/snapshot_service.py`](app/services/snapshot_service.py)
**Purpose**: Database operations for graph snapshots

**Agenda**:
- `save_snapshot()` - Persist graph state
- `load_latest()` - Retrieve most recent version
- Version management

#### [`app/services/graph_state.py`](app/services/graph_state.py)
**Purpose**: Build canonical graph state objects

**Agenda**:
- Standardize graph state format
- Include metadata (action, parent node)
- Version tracking

**Output Format**:
```python
{
    "system": str,
    "version": int,
    "nodes": [...],
    "edges": [...],
    "metadata": {
        "last_action": str,
        "parent_node": str | None
    }
}
```

#### [`app/services/graph_diff.py`](app/services/graph_diff.py)
**Purpose**: Compute differences between graph versions

**Agenda**:
- Compare two graph states
- Identify added nodes and edges
- Support incremental updates for frontend

**Key Method**:
- `compute_diff(old_state, new_state)` - Returns added elements

---

## API Endpoints Reference

### Build Graph
```http
POST /build-graph?diff={boolean}
Content-Type: application/json

{
    "system_name": "E-commerce Platform"
}
```

**Response**:
```json
{
    "system": "E-commerce Platform",
    "version": 1,
    "nodes": [...],
    "edges": [...],
    "metadata": {
        "last_action": "build_graph",
        "parent_node": null
    }
}
```

### Expand Node
```http
POST /expand-node?diff={boolean}
Content-Type: application/json

{
    "system": "E-commerce Platform",
    "node_id": "payment_service",
    "node_label": "Payment Service",
    "max_depth": 1
}
```

**Response**:
```json
{
    "system": "E-commerce Platform",
    "version": 2,
    "added_nodes": [...],
    "added_edges": [...],
    "metadata": {
        "last_action": "expand_node",
        "parent_node": "payment_service"
    }
}
```

### Load Latest
```http
GET /load-latest/{system}
```

### Stats & Metrics
```http
GET /stats      # LLM usage
GET /metrics    # Performance & cache stats
```

---

## Data Flow

### Building Initial Graph
```
User Request
    ↓
[design_service.build_graph]
    ↓
[cache.check] → Cache Hit? → Return Cached
    ↓ (Cache Miss)
[cost_monitor.check_budget]
    ↓
[llm.client.call_llm] → Groq API
    ↓
[graph.builder.build]
    ↓
[snapshot_service.save]
    ↓
Return Graph
```

### Expanding Node
```
User Request
    ↓
[design_service.expand_node]
    ↓
[llm.client.call_llm] (with node context)
    ↓
[graph.builder.build]
    ↓
[graph.merge.merge] (into existing)
    ↓
[snapshot_service.save] (new version)
    ↓
Return Diff
```

---

## Configuration

### Environment Variables

Create a `.env` file in the Backend directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/archviz

# LLM API
GROQ_API_KEY=your_groq_api_key_here

# Redis (optional, defaults to localhost)
REDIS_URL=redis://localhost:6379
```

### Dependencies

```bash
pip install -r requirements.txt
```

Key dependencies:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM
- `psycopg2-binary` - PostgreSQL driver
- `redis` - Caching
- `httpx` - Async HTTP client
- `slowapi` - Rate limiting
- `python-dotenv` - Environment management

---

## Running the Server

```bash
# Development
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Access:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs (Swagger UI)
- Health: http://localhost:8000/ping

---

## Testing

```bash
# Run all tests
pytest

# Run specific test
pytest tests/test_graph_builder.py

# Run benchmarks
pytest tests/benchmark.py
```

---

## Future Enhancements

### Planned Features
1. **Graph History API** - List all versions of a system
2. **Graph Diff Visualization** - Server-side diff formatting
3. **Export Endpoints** - Generate PNG/SVG server-side
4. **Collaborative Editing** - Multi-user graph editing
5. **AI Suggestions** - Smart node recommendations

### API Additions Needed for Frontend
```python
# History tracking
GET /history/{system}           # List all versions
GET /graph/{system}/{version}   # Get specific version
POST /revert/{system}/{version} # Revert to version

# Export
GET /export/{system}/png        # Generate PNG
GET /export/{system}/svg        # Generate SVG
GET /export/{system}/json       # Download JSON

# Import
POST /import                    # Upload JSON graph
```

---

## Architecture Decisions

1. **Diff Mode**: Supports incremental updates to reduce payload size for large graphs
2. **Versioning**: Each operation creates a new version for history tracking
3. **Caching**: Redis cache reduces LLM costs for repeated queries
4. **Rate Limiting**: Protects expensive LLM endpoints from abuse
5. **Cost Monitoring**: Prevents runaway API costs
6. **Async/Await**: All I/O operations are async for performance

---

## Troubleshooting

### Common Issues

**Redis Connection Error**:
```bash
# Start Redis
redis-server
```

**Database Connection Error**:
```bash
# Ensure PostgreSQL is running and DATABASE_URL is correct
```

**LLM API Errors**:
- Check `GROQ_API_KEY` is set
- Verify budget limit not exceeded
- Check rate limits

**CORS Errors**:
- Ensure frontend origin is in `main.py` CORS config
- Default: `http://localhost:5173`
