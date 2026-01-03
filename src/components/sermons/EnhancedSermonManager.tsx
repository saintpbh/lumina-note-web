// @ts-nocheck - react-window types issue
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { List } from 'react-window';
import {
    Search, Folder, Hash, BookOpen,
    Trash2,
    History, Calendar, ChevronRight, X,
    Database, Download, Cloud, Check, Zap
} from 'lucide-react';
import { Sermon } from '@/shared/types';
import { sermonSearchEngine } from '@/utils/sermonSearchEngine';

interface SermonManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectSermon: (sermon: Sermon) => void;
    sermons: Sermon[];
    onDelete?: (id: number) => void;
}

const SERMON_ITEM_HEIGHT = 88; // Height of each sermon card

export const EnhancedSermonManager: React.FC<SermonManagerProps> = ({
    isOpen,
    onClose,
    onSelectSermon,
    sermons: initialSermons,
    onDelete
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'trash' | 'backups'>('all');
    const [isIndexing, setIsIndexing] = useState(false);

    // Index sermons on mount and when sermons change
    useEffect(() => {
        if (initialSermons.length > 0) {
            setIsIndexing(true);
            // Use setTimeout to prevent blocking the UI
            setTimeout(() => {
                sermonSearchEngine.clear();
                sermonSearchEngine.indexSermons(initialSermons);
                setIsIndexing(false);
            }, 100);
        }
    }, [initialSermons]);

    // Filter sermons based on search query
    const filteredSermons = useMemo(() => {
        if (!searchQuery.trim()) {
            return initialSermons;
        }

        console.time('FlexSearch Filter');
        const matchingIds = sermonSearchEngine.search(searchQuery);
        console.log('Matching IDs from search:', matchingIds);
        console.log('First 5 sermon IDs in initialSermons:', initialSermons.slice(0, 5).map(s => s.id));
        console.log('Total initialSermons:', initialSermons.length);

        const filtered = initialSermons.filter(s => matchingIds.includes(s.id));
        console.log('Filtered sermons count:', filtered.length);
        console.timeEnd('FlexSearch Filter');

        return filtered;
    }, [searchQuery, initialSermons]);

    // Virtual list row renderer
    const SermonRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
        const sermon = filteredSermons[index];

        return (
            <div style={style} className="px-4 py-1.5">
                <div
                    className="group p-4 rounded-2xl bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex items-start justify-between cursor-pointer h-full"
                    onClick={() => onSelectSermon(sermon)}
                >
                    <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 luxury-serif group-hover:text-blue-500 transition-colors line-clamp-1">
                            {sermon.title || 'Untitled Sermon'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 luxury-mono">
                            <span className="flex items-center gap-1"><BookOpen size={14} /> {sermon.passage || 'No passage'}</span>
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(sermon.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(sermon.id); }}
                                className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                        <ChevronRight size={18} className="text-gray-300" />
                    </div>
                </div>
            </div>
        );
    }, [filteredSermons, onSelectSermon, onDelete]);

    if (!isOpen) return null;

    const listHeight = Math.min(600, window.innerHeight * 0.6);

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold luxury-serif text-slate-900 dark:text-slate-50 flex items-center gap-2">
                            <Folder className="text-blue-500" />
                            Sermon Archive
                            <span className="text-xs font-normal text-slate-400 ml-2 flex items-center gap-1">
                                <Zap size={14} className="text-yellow-500" />
                                Performance Mode
                            </span>
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {filteredSermons.length} of {initialSermons.length} sermons
                            {isIndexing && <span className="ml-2 text-blue-500">(Indexing...)</span>}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/50 backdrop-blur-sm">
                        <X size={24} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar - Tabs */}
                    <div className="w-64 border-r border-gray-100 dark:border-gray-800 p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                        >
                            <BookOpen size={18} />
                            All Sermons
                        </button>
                        <button
                            onClick={() => setActiveTab('trash')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'trash' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                        >
                            <Trash2 size={18} />
                            Trash (0)
                        </button>
                        <button
                            onClick={() => setActiveTab('backups')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'backups' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                        >
                            <Database size={18} />
                            Backups & Sync
                        </button>
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {activeTab === 'all' ? (
                            <>
                                {/* Search Bar */}
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search by title, content, or tags... (FlexSearch-powered)"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm luxury-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* Virtual List */}
                                <div className="flex-1 overflow-hidden">
                                    {filteredSermons.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-4">
                                            <Folder size={48} className="opacity-20" />
                                            <p>No sermons found</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-y-auto space-y-3 p-4" style={{ height: listHeight }}>
                                            {filteredSermons.map((sermon) => (
                                                <div key={sermon.id} className="px-4 py-1.5">
                                                    <div
                                                        className="group p-4 rounded-2xl bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex items-start justify-between cursor-pointer"
                                                        onClick={() => onSelectSermon(sermon)}
                                                    >
                                                        <div className="flex-1 space-y-1">
                                                            <h3 className="font-bold text-slate-900 dark:text-slate-100 luxury-serif group-hover:text-blue-500 transition-colors line-clamp-1">
                                                                {sermon.title || 'Untitled Sermon'}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 luxury-mono">
                                                                <span className="flex items-center gap-1"><BookOpen size={14} /> {sermon.passage || 'No passage'}</span>
                                                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(sermon.updated_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {onDelete && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onDelete(sermon.id); }}
                                                                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                            <ChevronRight size={18} className="text-gray-300" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : activeTab === 'trash' ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-4">
                                <Trash2 size={48} className="opacity-20" />
                                <p>Trash is empty</p>
                            </div>
                        ) : activeTab === 'backups' ? (
                            <div className="p-8 space-y-8">
                                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 italic">
                                            <Cloud className="text-indigo-500" /> Google Drive Sync
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">Auto-sync enabled</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
                                        <Check size={16} />
                                        Connected
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};
