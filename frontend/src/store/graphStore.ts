import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  description: string;
  type: 'service' | 'database' | 'cache' | 'gateway' | 'frontend' | 'queue';
  level: number;
  expandable: boolean;
}

export interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string;
  target: string;
  relation: string;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  action: string;
  system: string; // Added system field
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphState {
  // Graph data
  nodes: GraphNode[];
  edges: GraphEdge[];
  system: string;
  version: number;

  // UI state
  isLoading: boolean;
  error: string | null;
  selectedNodeId: string | null;
  expandedNodeIds: string[]; // Set -> Array for persistence

  // Search & Filter
  searchTerm: string;
  filters: {
    types: string[]; // Set -> Array for persistence
    expansion: 'all' | 'expandable' | 'leaf';
    maxDepth: number;
  };

  // History
  history: HistoryItem[];

  // Actions
  setGraph: (system: string, nodes: GraphNode[], edges: GraphEdge[], action?: string) => void;
  addNodes: (nodes: GraphNode[]) => void;
  addEdges: (edges: GraphEdge[]) => void;
  expandNode: (nodeId: string, newNodes: GraphNode[], newEdges: GraphEdge[]) => void;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<GraphState['filters']>) => void;
  selectNode: (nodeId: string | null) => void;
  restoreVersion: (versionId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  pinNode: (nodeId: string, x: number | null, y: number | null) => void;
}

const DEFAULT_FILTERS: GraphState['filters'] = {
  types: ['service', 'database', 'cache', 'gateway', 'frontend', 'queue', 'backend', 'worker', 'storage'],
  expansion: 'all',
  maxDepth: 10,
};

export const useGraphStore = create<GraphState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      system: '',
      version: 0,
      isLoading: false,
      error: null,
      selectedNodeId: null,
      expandedNodeIds: [],
      searchTerm: '',
      filters: DEFAULT_FILTERS,
      history: [],

      setGraph: (system, nodes, edges, action = 'Build Graph') => {
        const historyItem: HistoryItem = {
          id: self.crypto.randomUUID ? self.crypto.randomUUID() : Math.random().toString(36).substring(2),
          timestamp: Date.now(),
          action,
          system, // Store system name
          nodes: [...nodes],
          edges: [...edges],
        };

        set((state) => ({
          system,
          nodes,
          edges,
          version: state.version + 1,
          history: [historyItem, ...state.history].slice(0, 20),
          expandedNodeIds: [],
          selectedNodeId: null,
        }));
      },

      addNodes: (newNodes) => {
        const { nodes } = get();
        const existingIds = new Set(nodes.map(n => n.id));
        const filteredNewNodes = newNodes.filter(n => !existingIds.has(n.id));
        if (filteredNewNodes.length === 0) return;

        set({ nodes: [...nodes, ...filteredNewNodes] });
      },

      addEdges: (newEdges) => {
        const { edges } = get();
        const existingIds = new Set(edges.map(e => e.id));
        const filteredNewEdges = newEdges.filter(e => !existingIds.has(e.id));
        if (filteredNewEdges.length === 0) return;

        set({ edges: [...edges, ...filteredNewEdges] });
      },

      expandNode: (nodeId, newNodes, newEdges) => {
        const { nodes, edges, expandedNodeIds, history, system } = get();

        const newExpandedIds = [...expandedNodeIds, nodeId];

        const existingNodeIds = new Set(nodes.map(n => n.id));
        const filteredNewNodes = newNodes.filter(n => !existingNodeIds.has(n.id));

        const existingEdgeIds = new Set(edges.map(e => e.id));
        const filteredNewEdges = newEdges.filter(e => !existingEdgeIds.has(e.id));

        const updatedNodes = [...nodes, ...filteredNewNodes];
        const updatedEdges = [...edges, ...filteredNewEdges];

        const historyItem: HistoryItem = {
          id: self.crypto.randomUUID ? self.crypto.randomUUID() : Math.random().toString(36).substring(2),
          timestamp: Date.now(),
          action: `Expand Node ${nodeId}`,
          system, // Store current system name
          nodes: JSON.parse(JSON.stringify(updatedNodes)),
          edges: JSON.parse(JSON.stringify(updatedEdges)),
        };

        set({
          nodes: updatedNodes,
          edges: updatedEdges,
          expandedNodeIds: newExpandedIds,
          history: [historyItem, ...history].slice(0, 20),
        });
      },

      setSearchTerm: (searchTerm) => set({ searchTerm }),

      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),

      selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

      restoreVersion: (versionId) => {
        const { history } = get();
        const item = history.find(h => h.id === versionId);
        if (item) {
          set({
            nodes: [...item.nodes],
            edges: [...item.edges],
            system: item.system, // Use explicit system name
            selectedNodeId: null,
            expandedNodeIds: [],
          });
        }
      },

      pinNode: (nodeId, x, y) => {
        set((state) => ({
          nodes: state.nodes.map(n =>
            n.id === nodeId ? { ...n, fx: x, fy: y } : n
          )
        }));
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      reset: () => set({
        nodes: [],
        edges: [],
        system: '',
        version: 0,
        isLoading: false,
        error: null,
        selectedNodeId: null,
        expandedNodeIds: [],
        searchTerm: '',
        filters: DEFAULT_FILTERS,
      }),
    }),

    {
      name: 'archviz-storage',
      partialize: (state) => ({
        system: state.system,
        nodes: state.nodes,
        edges: state.edges.map(e => ({
          ...e,
          source: typeof e.source === 'object' ? (e.source as any).id : e.source,
          target: typeof e.target === 'object' ? (e.target as any).id : e.target
        })),
        history: state.history.map(h => ({
          ...h,
          edges: h.edges.map(e => ({
            ...e,
            source: typeof e.source === 'object' ? (e.source as any).id : e.source,
            target: typeof e.target === 'object' ? (e.target as any).id : e.target
          }))
        })),
      }),
    }
  )
);