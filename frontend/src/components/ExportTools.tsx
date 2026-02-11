import React from 'react';
import { Download, Image as ImageIcon, FileCode } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { useGraphStore } from '../store/graphStore';

const ExportTools: React.FC = () => {
    const { system, nodes, edges } = useGraphStore();

    const exportAsPng = async () => {
        // Target the D3 graph container which holds the SVG visualization
        const element = document.querySelector('#graph-container svg');
        if (!element) {
            console.error('Graph element not found for PNG export');
            return;
        }

        try {
            const dataUrl = await toPng(element as HTMLElement, {
                backgroundColor: '#0f172a',
                quality: 1,
            });
            const link = document.createElement('a');
            link.download = `archviz-${system || 'graph'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export PNG failed', err);
        }
    };

    const exportAsSvg = async () => {
        // Target the D3 graph container which holds the SVG visualization
        const element = document.querySelector('#graph-container svg');
        if (!element) {
            console.error('Graph element not found for SVG export');
            return;
        }

        try {
            const dataUrl = await toSvg(element as HTMLElement);
            const link = document.createElement('a');
            link.download = `archviz-${system || 'graph'}.svg`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export SVG failed', err);
        }
    };

    const downloadJson = () => {
        const data = {
            system,
            nodes,
            edges,
            version: 1,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `archviz-${system || 'graph'}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-400" />
                Export & Share
            </h3>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={exportAsPng}
                    className="flex flex-col items-center gap-2 p-3 bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800 rounded-xl transition-all group"
                >
                    <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-200 uppercase tracking-wider">PNG Image</span>
                </button>
                <button
                    onClick={exportAsSvg}
                    className="flex flex-col items-center gap-2 p-3 bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800 rounded-xl transition-all group"
                >
                    <FileCode className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-200 uppercase tracking-wider">SVG Vector</span>
                </button>
            </div>

            <button
                onClick={downloadJson}
                className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
                <Download className="w-4 h-4" />
                Download JSON Graph
            </button>
        </div>
    );
};

export default ExportTools;
