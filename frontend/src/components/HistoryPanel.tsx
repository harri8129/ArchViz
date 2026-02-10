import React from 'react';
import { History, RotateCcw, Clock } from 'lucide-react';
import { useGraphStore } from '../store/graphStore';

const HistoryPanel: React.FC = () => {
    const { history, restoreVersion } = useGraphStore();

    if (history.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                History
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {history.map((item, index) => (
                    <button
                        key={item.id}
                        onClick={() => restoreVersion(item.id)}
                        className="w-full text-left p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all group"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-300 group-hover:text-white truncate">
                                    {item.action}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <p className="text-[10px] text-slate-500">
                                        {new Date(item.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                            <RotateCcw className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                        {index === 0 && (
                            <span className="inline-block mt-2 px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded uppercase tracking-tighter">
                                Current
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HistoryPanel;
