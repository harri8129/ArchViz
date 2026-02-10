import React from 'react';
import { useGraphStore } from '../store/graphStore';
import { nodeIcons, nodeColors } from './GraphIcons';
import { Info, Share2, Layers } from 'lucide-react';

const NodeDetails: React.FC = () => {
    const { nodes, selectedNodeId } = useGraphStore();

    const node = nodes.find(n => n.id === selectedNodeId);

    if (!node) return null;

    const Icon = nodeIcons[node.type] || nodeIcons.service;
    const color = nodeColors[node.type] || '#3b82f6';

    return (
        <div className="bg-slate-900/60 border border-indigo-500/30 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-start gap-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
                >
                    <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{node.label}</h3>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 border border-slate-700">
                        {node.type}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-slate-500 mt-0.5" />
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {node.description || 'No description available for this component.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Layers className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Depth</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">Level {node.level}</p>
                    </div>
                    <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Share2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">
                            {node.expandable ? 'Expandable' : 'Leaf Node'}
                        </p>
                    </div>
                </div>
            </div>

            {node.expandable && (
                <div className="pt-2">
                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-indigo-300 font-medium">
                            Double-click this node on the map to explore its architecture.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NodeDetails;
