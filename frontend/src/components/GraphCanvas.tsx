import { useGraphStore } from '../store/graphStore';
import D3Graph from './D3Graph';
import NodeDetails from './NodeDetails';

export default function GraphCanvas() {
  const isLoading = useGraphStore((state) => state.isLoading);
  const error = useGraphStore((state) => state.error);
  const setError = useGraphStore((state) => state.setError);
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const system = useGraphStore((state) => state.system);
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950">
      <D3Graph />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white font-medium">Processing graph...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute top-4 right-4 max-w-md bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm text-red-100">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-200 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Graph stats panel */}
      {nodes.length > 0 && (
        <div className="absolute bottom-6 left-6 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700/50 px-5 py-3 shadow-xl pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                {nodes.length} nodes
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                {edges.length} edges
              </span>
            </div>
            {system && (
              <span className="text-xs text-slate-400 font-mono mt-1 opacity-80">
                System: {system}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Node Details Modal - Right Side */}
      {selectedNodeId && (
        <div className="absolute top-6 right-6 w-80 z-[100]">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-indigo-600/20 border-b border-indigo-500/20 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider">Node Details</h3>
              <button
                onClick={() => useGraphStore.getState().selectNode(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-4">
              <NodeDetails />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}