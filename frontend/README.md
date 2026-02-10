# ArchViz AI - Frontend
A modern React-based frontend for visualizing system architectures using interactive D3.js graphs. Built with TypeScript, Vite, and Tailwind CSS.


## 🚀 Features

- **Interactive Graph Visualization** - Drag, zoom, and explore architecture diagrams
- **Node Details Modal** - Click any node to see detailed information
- **Search & Filter** - Find nodes quickly and filter by type
- **Reset Layout** - Reorganize scattered nodes with one click
- **History Panel** - Track and restore previous graph versions
- **Export Tools** - Export graphs as images
- **Real-time Updates** - Expand nodes to see more architecture details
- **Responsive Design** - Works on different screen sizes

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand (with persistence)
- **Graph Rendering**: D3.js v7
- **Icons**: Lucide React
- **UI Components**: Custom components with Tailwind

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── D3Graph.tsx     # Main graph visualization component
│   │   ├── GraphCanvas.tsx # Graph container with overlays
│   │   ├── Sidebar.tsx     # Left sidebar with controls
│   │   ├── SystemInput.tsx # System name input & build button
│   │   ├── SearchField.tsx # Node search input
│   │   ├── FilterSection.tsx # Node type filters
│   │   ├── NodeDetails.tsx # Node details display
│   │   ├── HistoryPanel.tsx # Graph history
│   │   ├── ExportTools.tsx # Export functionality
│   │   └── GraphIcons.ts   # Node type icons & colors
│   ├── store/
│   │   └── graphStore.ts   # Zustand store for graph state
│   ├── services/
│   │   └── api.ts          # API client for backend communication
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite configuration
└── tailwind.config.js      # Tailwind CSS config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running (see Backend/README.md)

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:5173`

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## 🎯 Usage Guide

### Building a Graph

1. Enter a system name (e.g., "E-commerce", "Banking", "Streaming")
2. Click **"Build Graph"** button
3. The architecture diagram will be generated and displayed

### Interacting with the Graph

| Action | How To |
|--------|--------|
| **Pan** | Drag the background |
| **Zoom** | Scroll or use +/- buttons (bottom-right) |
| **Select Node** | Click on any node |
| **View Details** | Click a node → see right-side modal |
| **Expand Node** | Double-click a node with "+" badge |
| **Drag Node** | Click and drag any node |
| **Reset Layout** | Click the ↻ button (bottom-right) |
| **Fit View** | Click the □ button (bottom-right) |

### Searching & Filtering

- **Search**: Type in the search box to highlight matching nodes
- **Filter by Type**: Toggle node types in the Filters section
- **Clear Filters**: Click the "Reset" button

🧩 Component Architecture

### D3Graph.tsx
The core graph visualization component using D3.js:
- Renders nodes and edges as SVG elements
- Handles zoom and pan interactions
- Implements force-directed layout simulation
- Manages node selection and expansion

### GraphCanvas.tsx
Container component that:
- Wraps D3Graph
- Displays loading overlays
- Shows error messages
- Renders node details modal
- Displays graph statistics

### graphStore.ts
Zustand store managing:
- Graph data (nodes, edges)
- UI state (selected node, search term, filters)
- History of graph changes
- Actions (setGraph, expandNode, rebuildLayout, etc.)

### Sidebar.tsx
Left sidebar containing:
- SystemInput (name input & build controls)
- NodeDetails (when a node is selected)
- SearchField
- FilterSection
- HistoryPanel
- ExportTools
- Instructions

## 🎨 Customization

### Adding New Node Types

1. Add type to `GraphNode` interface in `graphStore.ts`:
```typescript
type: 'service' | 'database' | 'cache' | 'gateway' | 'frontend' | 'queue' | 'your-new-type';
```

2. Add icon and color in `GraphIcons.ts`:
```typescript
export const nodeIcons: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  // ... existing types
  'your-new-type': YourIconComponent,
};

export const nodeColors: Record<string, string> = {
  // ... existing types
  'your-new-type': '#your-color',
};
```

3. Update filters in `graphStore.ts`:
```typescript
types: ['service', 'database', ..., 'your-new-type'],
```

### Styling

The project uses Tailwind CSS with custom colors:
- Primary: Indigo (`#6366f1`)
- Background: Slate 950 (`#020617`)
- Text: Slate 200 (`#e2e8f0`)

Modify `tailwind.config.js` to add custom themes.

## 🔌 API Integration

The frontend communicates with the backend via REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/build-graph` | POST | Generate new architecture graph |
| `/expand-node` | POST | Expand a specific node |
| `/load-latest` | GET | Load most recent graph for system |

See `src/services/api.ts` for implementation details.

## 🐛 Troubleshooting

### Common Issues

**Graph not loading:**
- Check backend is running on port 8000
- Verify `VITE_API_URL` in `.env`
- Check browser console for errors

**Nodes not clickable:**
- Ensure no CSS is blocking pointer events
- Check console for D3 errors

**Build errors:**
- Run `npm install` to update dependencies
- Clear `node_modules` and reinstall

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the ArchViz AI system. See main project LICENSE for details.

## 🔗 Links

- [Backend Documentation](../Backend/README.md)
- [Main Project README](../README.md)
- [D3.js Documentation](https://d3js.org/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

Built with ❤️ using React, D3.js, and Tailwind CSS
