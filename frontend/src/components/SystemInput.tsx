import { useState, useCallback } from 'react';
import { useGraphStore } from '../store/graphStore';
import { api } from '../services/api';
import { Network, Play, RotateCcw, Loader2, AlertCircle } from 'lucide-react';

export default function SystemInput() {
  const [systemName, setSystemName] = useState('');
  const [useCache, setUseCache] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setGraph = useGraphStore((state) => state.setGraph);
  const setStoreError = useGraphStore((state) => state.setError);
  const setStoreLoading = useGraphStore((state) => state.setLoading);
  const reset = useGraphStore((state) => state.reset);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!systemName.trim()) {
      setError('Please enter a system name');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStoreLoading(true);
    setStoreError(null);

    try {
      // If useCache is false, skip loadLatest and go straight to buildGraph
      let graphData = null;

      if (useCache) {
        graphData = await api.loadLatest(systemName.trim());
      }

      if (!graphData) {
        // If no saved graph or cache bypassed, build new
        graphData = await api.buildGraph(systemName.trim(), false, useCache);
      }

      if (graphData) {
        setGraph(
          graphData.system,
          graphData.nodes,
          graphData.edges,
          `Build ${graphData.system}`
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to build graph';
      setError(message);
      setStoreError(message);
    } finally {
      setIsLoading(false);
      setStoreLoading(false);
    }
  }, [systemName, setGraph, setStoreError, setStoreLoading]);

  const handleReset = useCallback(() => {
    setSystemName('');
    setError(null);
    reset();
  }, [reset]);

  const handleExampleClick = (example: string) => {
    setSystemName(example);
    // Use setTimeout to allow state to update before submitting
    setTimeout(() => {
      // We can't easily call handleSubmit here without refactoring it to take name
      // So we just set name and let user click
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
          <Network className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">ArchViz AI</h1>
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Architecture Visualizer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="system-name" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            System Name
          </label>
          <div className="relative group">
            <input
              id="system-name"
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="e.g., E-commerce App"
              className="w-90 h-10 bg-slate-950/80 border border-slate-700/50 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
              disabled={isLoading}
            />
          </div>
        </div>  

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-200 leading-snug">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-2 px-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={!useCache}
              onChange={(e) => setUseCache(!e.target.checked)}
              className="hidden"
            />
            <div className={`w-3.5 h-3.5 rounded-sm border transition-colors ${!useCache ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 group-hover:border-slate-500'}`}>
              {!useCache && <div className="w-full h-full flex items-center justify-center text-[10px] text-white">✓</div>}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Force Rebuild</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading || !systemName.trim()}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isLoading ? 'Building...' : (useCache ? 'Build Graph' : 'Rebuild Graph')}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="p-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Quick examples */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Quick Start</p>
        <div className="flex flex-wrap gap-1.5">
          {['E-commerce', 'Banking', 'Streaming'].map((example) => (
            <button
              key={example}
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="px-2.5 py-1 text-[10px] font-medium bg-slate-800/40 hover:bg-slate-800 border border-slate-700/30 text-slate-400 hover:text-indigo-300 rounded-full transition-all"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}