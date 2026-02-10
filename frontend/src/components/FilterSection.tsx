import React from 'react';
import { useGraphStore } from '../store/graphStore';
import { nodeColors } from './GraphIcons';
import { Filter, RotateCcw } from 'lucide-react';

const FilterSection: React.FC = () => {
    const { filters, setFilters } = useGraphStore();

    const toggleType = (type: string) => {
        const newTypes = filters.types.includes(type)
            ? filters.types.filter(t => t !== type)
            : [...filters.types, type];
        setFilters({ types: newTypes });
    };

    const resetFilters = () => {
        setFilters({
            types: ['service', 'database', 'cache', 'gateway', 'frontend', 'queue'],
            expansion: 'all',
            maxDepth: 10,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-indigo-400" />
                    Filters
                </h3>
                <button
                    onClick={resetFilters}
                    className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                </button>
            </div>

            {/* Node Types */}
            <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Node Types</p>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(nodeColors).map(([type, color]) => (
                        <button
                            key={type}
                            onClick={() => toggleType(type)}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs transition-all ${filters.types.includes(type)
                                ? 'bg-slate-800 border-slate-600 text-slate-200'
                                : 'bg-transparent border-slate-800 text-slate-500 opacity-50'
                                }`}
                        >
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color, boxShadow: filters.types.includes(type) ? `0 0 8px ${color}` : 'none' }}
                            />
                            <span className="capitalize">{type}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Expansion Status */}
            <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expansion</p>
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    {(['all', 'expandable', 'leaf'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setFilters({ expansion: mode })}
                            className={`flex-1 py-1 text-[11px] font-medium rounded-lg capitalize transition-all ${filters.expansion === mode
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Max Depth */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Max Depth</p>
                    <span className="text-xs font-mono text-indigo-400">{filters.maxDepth}</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={filters.maxDepth}
                    onChange={(e) => setFilters({ maxDepth: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
            </div>
        </div>
    );
};

export default FilterSection;
