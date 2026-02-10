import React from 'react';
import { Search, X } from 'lucide-react';
import { useGraphStore } from '../store/graphStore';

const SearchField: React.FC = () => {
    const { searchTerm, setSearchTerm } = useGraphStore();

    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                {/* <Search className={`w-5 h-5 transition-colors ${searchTerm ? 'text-indigo-400' : 'text-slate-500'}`} /> */}
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search nodes by name..."
                className="w-90 h-10  bg-slate-900/50 border border-slate-700/50 focus:border-indigo-500 rounded-xl py-3.5 pl-12 pr-12 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchTerm ? (
                <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    title="Clear search"
                >
                    <X className="w-5 h-5" />
                </button>
            ) : (
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <span className="text-xs text-slate-600 border border-slate-700 rounded px-1.5 py-0.5"></span>
                </div>
            )}
        </div>
    );
};

export default SearchField;
