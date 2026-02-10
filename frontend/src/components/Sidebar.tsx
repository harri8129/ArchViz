import React from 'react';
import SystemInput from './SystemInput';
import SearchField from './SearchField';
import FilterSection from './FilterSection';
import ExportTools from './ExportTools';
import HistoryPanel from './HistoryPanel';
import NodeDetails from './NodeDetails';
import { Info } from 'lucide-react';

const Sidebar: React.FC = () => {
    return (
        <aside className="w-80 h-screen bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-20 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                <SystemInput />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <NodeDetails />
                <SearchField />
                <FilterSection />
                <HistoryPanel />
                <ExportTools />

                {/* Instructions */}
                <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Controls</h4>
                    </div>
                    <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                        <li className="flex gap-2">
                            <span className="text-indigo-500">•</span>
                            <span><strong className="text-slate-300">Expand:</strong> Double-click on nodes with a <span className="text-indigo-400 font-bold">+</span> badge.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-indigo-500">•</span>
                            <span><strong className="text-slate-300">Pan/Zoom:</strong> Drag background to pan, scroll to zoom.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-indigo-500">•</span>
                            <span><strong className="text-slate-300">Pin Node:</strong> Drag a node to pin its position.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>ArchViz AI v2.0</span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        API Connected
                    </span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
