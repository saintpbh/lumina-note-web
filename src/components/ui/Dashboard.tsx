'use client';

import React from 'react';
import { Plus, FileText, Search, Clock, ArrowRight, Zap, Book } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ThemeId, THEMES } from '@/utils/themes';

interface DashboardProps {
    onNewSermon: () => void;
    onOpenArchive: () => void;
    recentSermons: any[];
    onSelectSermon: (sermon: any) => void;
    onLoadSamples?: () => void;
    theme: ThemeId;
}

export const Dashboard: React.FC<DashboardProps> = ({
    onNewSermon,
    onOpenArchive,
    recentSermons,
    onSelectSermon,
    onLoadSamples,
    theme
}) => {
    const isDark = THEMES.find(t => t.id === theme)?.type === 'dark';

    return (
        <div className={cn(
            "flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-12 md:p-16 lg:p-24",
            // Use CSS variables for background
            "bg-[var(--editor-bg)]"
        )}>
            <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <header className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-widest mb-4">
                        <Zap size={14} />
                        <span>Fiat Lux</span>
                    </div>
                    <h1 className={cn(
                        "text-5xl sm:text-6xl font-black tracking-tight",
                        "text-[var(--text-main)]"
                    )}>
                        Welcome to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Lumina Note</span>
                    </h1>
                    <p className={cn(
                        "text-xl max-w-2xl leading-relaxed",
                        "text-[var(--text-muted)]"
                    )}>
                        A world-class writing environment crafted for clarity, focus, and a premium experience.
                    </p>
                </header>

                {/* Quick Actions */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={onNewSermon}
                        className={cn(
                            "group relative overflow-hidden p-8 rounded-3xl border transition-all duration-300 text-left hover:shadow-2xl hover:-translate-y-1",
                            "bg-[var(--paper-bg)] border-[var(--border-color)] hover:border-blue-500/50"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Plus size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h3 className={cn("text-xl font-bold", "text-[var(--text-main)]")}>New Sermon</h3>
                                <p className={cn("text-sm", "text-[var(--text-muted)]")}>Start a fresh document with focus mode.</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={onOpenArchive}
                        className={cn(
                            "group relative overflow-hidden p-8 rounded-3xl border transition-all duration-300 text-left hover:shadow-2xl hover:-translate-y-1",
                            "bg-[var(--paper-bg)] border-[var(--border-color)] hover:border-indigo-500/50"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Search size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                <Search size={24} />
                            </div>
                            <div>
                                <h3 className={cn("text-xl font-bold", "text-[var(--text-main)]")}>Open Archive</h3>
                                <p className={cn("text-sm", "text-[var(--text-muted)]")}>Browse your previous sermons and notes.</p>
                            </div>
                        </div>
                    </button>

                    {onLoadSamples && (
                        <button
                            onClick={onLoadSamples}
                            className={cn(
                                "group relative overflow-hidden p-8 rounded-3xl border transition-all duration-300 text-left hover:shadow-2xl hover:-translate-y-1",
                                "bg-[var(--paper-bg)] border-[var(--border-color)] hover:border-emerald-500/50"
                            )}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Book size={120} />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                                    <Book size={24} />
                                </div>
                                <div>
                                    <h3 className={cn("text-xl font-bold", "text-[var(--text-main)]")}>Load Samples</h3>
                                    <p className={cn("text-sm", "text-[var(--text-muted)]")}>Try out 3 full-length sample sermons.</p>
                                </div>
                            </div>
                        </button>
                    )}
                </section>

                {/* Recent Work */}
                {recentSermons.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className={cn("text-sm font-black uppercase tracking-widest", "text-[var(--text-muted)]")}>
                                Recently Edited
                            </h2>
                            <button onClick={onOpenArchive} className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline">
                                View all <ArrowRight size={12} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentSermons.slice(0, 3).map((sermon) => (
                                <button
                                    key={sermon.id}
                                    onClick={() => onSelectSermon(sermon)}
                                    className={cn(
                                        "group flex flex-col p-5 rounded-2xl border transition-all text-left hover:shadow-lg",
                                        "bg-[var(--paper-bg)] border-[var(--border-color)] hover:bg-[var(--bg-subtle)]"
                                    )}
                                >
                                    <div className="flex-1 space-y-2">
                                        <FileText size={18} className="text-blue-500" />
                                        <h4 className={cn("font-bold truncate", "text-[var(--text-main)]")}>
                                            {sermon.title || 'Untitled Sermon'}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] opacity-50">
                                            <Clock size={10} />
                                            <span>{new Date(sermon.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Features / Tips */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-dashed border-gray-200 dark:border-white/5">
                    <div className="space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Zap size={16} />
                        </div>
                        <h4 className={cn("font-bold text-sm", "text-[var(--text-main)]")}>AI Insights</h4>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">Let AI analyze your sermon structure and provide stylistic feedback instantly.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Book size={16} />
                        </div>
                        <h4 className={cn("font-bold text-sm", "text-[var(--text-main)]")}>Bible Search</h4>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">Integrated scripture database. Search and insert verses directly into your text styles.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Zap size={16} />
                        </div>
                        <h4 className={cn("font-bold text-sm", "text-[var(--text-main)]")}>Focus Mode</h4>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">Hide all UI elements and fully immerse yourself in the Word with a distraction-free view.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};
