'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Quote } from 'lucide-react';
import { BibleVerse } from '@/shared/types';

interface ScriptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (verse: BibleVerse) => void;
}

export const ScriptureModal = ({ isOpen, onClose, onInsert }: ScriptureModalProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<BibleVerse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const searchSermon = async () => {
            if (query.trim().length > 1) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/bible/search?query=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    if (data.error) throw new Error(data.error);
                    setResults(data.verses || []);
                    setSelectedIndex(0);
                } catch (err) {
                    console.error('Failed to search Bible:', err);
                    setError('성경 검색 중 오류가 발생했습니다.');
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setError(null);
            }
        };

        const debounce = setTimeout(() => {
            searchSermon();
        }, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                onInsert(results[selectedIndex]);
                onClose();
                setQuery('');
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col scale-in-center">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                        <BookOpen size={24} />
                    </div>
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm luxury-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                            placeholder="성경 검색 (예: 창 1:1, 사랑)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all text-gray-500 dark:text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-sm luxury-mono font-bold animate-pulse">Searching the Word...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-40">
                            <Quote size={64} />
                            <p className="text-sm luxury-serif italic">"Seek and you will find..."</p>
                        </div>
                    ) : (
                        results.map((verse, index) => (
                            <div
                                key={verse.id}
                                className={`group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${index === selectedIndex
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-500/50'
                                    }`}
                                onClick={() => {
                                    onInsert(verse);
                                    onClose();
                                }}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className={`text-[10px] font-bold uppercase tracking-widest luxury-mono ${index === selectedIndex ? 'text-blue-100' : 'text-blue-500'}`}>
                                    {verse.book} {verse.chapter}:{verse.verse}
                                </div>
                                <div className={`text-sm leading-relaxed luxury-serif ${index === selectedIndex ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {verse.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 flex justify-center gap-6 text-[10px] font-bold text-slate-400 luxury-mono uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white dark:bg-black border border-slate-200 dark:border-slate-700 rounded shadow-sm opacity-60">↑</kbd><kbd className="px-1.5 py-0.5 bg-white dark:bg-black border border-slate-200 dark:border-slate-700 rounded shadow-sm opacity-60">↓</kbd> Navigate</span>
                    <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white dark:bg-black border border-slate-200 dark:border-slate-700 rounded shadow-sm opacity-60">ENTER</kbd> Insert</span>
                    <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white dark:bg-black border border-slate-200 dark:border-slate-700 rounded shadow-sm opacity-60">ESC</kbd> Close</span>
                </div>
            </div>
        </div>
    );
};
