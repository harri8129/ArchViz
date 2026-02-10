import React from 'react';
import { Search, X } from 'lucide-react';
import { useGraphStore } from '../store/graphStore';

const SearchField: React.FC = () => {
    const { searchTerm, setSearchTerm } = useGraphStore();

    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className={`w-4 h-4 transition-colors ${searchTerm ? 'text-indigo-400' : 'text-slate-500'}`} />
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search nodes..."
                className="w-full bg-slate-900/50 border border-slate-700/50 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchTerm && (
                <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default SearchField;
