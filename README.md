# 🏗️ ArchViz AI

> **AI-Powered System Architecture Visualizer**

Transform system descriptions into interactive, explorable architecture diagrams using the power of Large Language Models.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6.svg?logo=typescript)](https://typescriptlang.org)
[![D3.js](https://img.shields.io/badge/D3.js-7+-F9A03C.svg)](https://d3js.org)

---

## ✨ Features

### 🤖 AI-Powered Architecture Generation
- **Intelligent Graph Building**: Enter any system name (e.g., "E-commerce Platform", "Banking System") and watch as the AI generates a complete architecture diagram
- **Recursive Expansion**: Double-click any node to expand it into a detailed subgraph, revealing internal components and relationships
- **Smart Caching**: Redis-powered caching reduces LLM costs and speeds up repeated queries

### 🎨 Interactive Visualization
- **Force-Directed Graph**: D3.js-powered interactive diagrams with physics-based layouts
- **Pan & Zoom**: Navigate large architectures with smooth zooming and panning
- **Node Details**: Click any component to see detailed information, type, and description
- **Drag & Pin**: Drag nodes to pin them in place for custom layouts

### 🔍 Powerful Discovery Tools
- **Real-time Search**: Instantly find nodes by name with visual highlighting
- **Smart Filtering**: Filter by node types (Service, Database, Cache, Gateway, Frontend, Queue, Worker, Storage)
- **Expansion Control**: View all nodes, only expandable nodes, or only leaf nodes
- **Depth Control**: Limit graph depth to focus on specific architecture layers

### 📊 History & Versioning
- **Automatic Snapshots**: Every change is automatically saved
- **Version History**: Browse and restore previous graph versions
- **Diff Tracking**: Visualize changes between versions

### 📤 Export & Share
- **PNG Export**: Download high-quality raster images of your architecture
- **SVG Export**: Get scalable vector graphics for documentation
- **JSON Export**: Export raw graph data for further processing

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ArchViz AI                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │      Frontend (React)       │    │         Backend (FastAPI)           │ │
│  │  ┌───────────────────────┐  │    │  ┌─────────────────────────────┐   │ │
│  │  │   D3.js Visualization │  │    │  │      API Layer              │   │ │
│  │  │   - Interactive Graph │  │◄──►│  │      - REST Endpoints       │   │ │
│  │  │   - Zoom/Pan/Drag     │  │    │  │      - Rate Limiting        │   │ │
│  │  │   - Node Selection    │  │    │  └──────────────┬──────────────┘   │ │
│  │  └───────────────────────┘  │    │                 │                   │ │
│  │  ┌───────────────────────┐  │    │  ┌──────────────▼──────────────┐   │ │
│  │  │   Zustand Store       │  │    │  │     Services Layer          │   │ │
│  │  │   - State Management  │  │    │  │     - Graph Builder         │   │ │
│  │  │   - History Tracking  │  │    │  │     - Node Expansion        │   │ │
│  │  │   - Filter Logic      │  │    │  │     - Snapshot Service      │   │ │
│  │  └───────────────────────┘  │    │  └──────────────┬──────────────┘   │ │
│  │  ┌───────────────────────┐  │    │                 │                   │ │
│  │  │   Tailwind UI         │  │    │  ┌──────────────▼──────────────┐   │ │
│  │  │   - Sidebar Controls  │  │    │  │      LLM Integration        │   │ │
│  │  │   - Export Tools      │  │    │  │      - Groq API (Llama)     │   │ │
│  │  │   - Search & Filter   │  │    │  │      - Prompt Engineering   │   │ │
│  │  └───────────────────────┘  │    │  │      - Response Caching     │   │ │
│  └─────────────────────────────┘    │  └──────────────┬──────────────┘   │ │
│                                      │                 │                   │ │
│                                      │  ┌──────────────▼──────────────┐   │ │
│                                      │  │      Data Layer             │   │ │
│                                      │  │      - PostgreSQL           │   │ │
│                                      │  │      - Redis Cache          │   │ │
│                                      │  └─────────────────────────────┘   │ │
│                                      └─────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL** (for data persistence)
- **Redis** (for caching)
- **Groq API Key** (get one at [groq.com](https://groq.com))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/archviz-ai.git
cd archviz-ai
```

### 2. Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Run the server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

### 4. Open the App

Navigate to `http://localhost:5173` in your browser.


## 📁 Project Structure

```
archviz-ai/
├── Backend/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── core/             # Config, DB, cache
│   │   ├── graph/            # Graph building & merging
│   │   ├── llm/              # LLM client & prompts
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Business logic
│   └── tests/                # Test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── store/            # Zustand store
│   │   └── services/         # API client
│   └── public/               # Static assets
│
└── README.md                 # This file
```

---

## 🎯 Example Use Cases

### E-Commerce Platform
```
Frontend → API Gateway → [User Service, Order Service, Payment Service]
                                    ↓
                           [Database, Cache, Message Queue]
                                    ↓
                        [Background Workers, Storage]
```

### Banking System
```
Mobile App → Load Balancer → [Auth Service, Account Service]
                                      ↓
                    [Transaction Service, Notification Service]
                                      ↓
                         [Core Banking DB, Audit Logs]
```

### Video Streaming
```
Web Player → CDN → [Video API, Recommendation Engine]
                          ↓
               [Transcoding Service, Analytics]
                          ↓
              [Object Storage, Stream Processing]
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://user:pass@localhost/archviz
REDIS_URL=redis://localhost:6379/0
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📈 Performance

- **Graph Generation**: ~2-5 seconds for initial build
- **Node Expansion**: ~1-3 seconds
- **Cached Responses**: <100ms
- **Frontend Rendering**: 60fps with 100+ nodes

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- **Groq** for providing fast LLM inference
- **D3.js** community for amazing visualization tools
- **FastAPI** team for the excellent web framework
- **Tailwind CSS** for the beautiful utility-first CSS

---
