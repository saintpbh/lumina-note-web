import React, { useState } from 'react';
import { Settings, Folder, History as HistoryIcon, X, HelpCircle, Plus, ChevronLeft, Menu } from 'lucide-react';
import clsx from 'clsx';
import { ShortcutConfig } from '@/shared/types';
import { MenuBar } from './MenuBar';

interface AppShellProps {
    children: React.ReactNode;
    isFocusMode?: boolean;
    editorSettings?: any;
    onSettingsChange?: (settings: any) => void;
    theme?: 'default' | 'sepia' | 'dark' | 'blue';
    onThemeChange: (theme: 'default' | 'sepia' | 'dark' | 'blue') => void;
    onSermonSelect: (sermon: any) => void;
    onToggleVersions: () => void;
    isSermonManagerOpen: boolean;
    setIsSermonManagerOpen: (isOpen: boolean) => void;
    openDocuments: any[];
    activeDocumentId: number | null;
    onSelectDocument: (id: number) => void;
    onCloseDocument: (id: number) => void;
    printMargins: { top: number; right: number; bottom: number; left: number };
    onPrintMarginsChange: (margins: { top: number; right: number; bottom: number; left: number }) => void;
    paperSize: 'a4' | 'b5';
    onPaperSizeChange: (size: 'a4' | 'b5') => void;
    viewMode: 'editing' | 'print';
    onViewModeChange: (mode: 'editing' | 'print') => void;
    shortcuts: ShortcutConfig;
    onShortcutsChange: (shortcuts: ShortcutConfig) => void;
    onNewSermon: () => void;
    onAction?: (actionId: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
    children,
    isFocusMode = false,
    editorSettings,
    onSettingsChange,
    theme = 'default',
    onThemeChange,
    onSermonSelect,
    onToggleVersions,
    isSermonManagerOpen,
    setIsSermonManagerOpen,
    openDocuments,
    activeDocumentId,
    onSelectDocument,
    onCloseDocument,
    printMargins,
    onPrintMarginsChange,
    paperSize,
    onPaperSizeChange,
    viewMode,
    onViewModeChange,
    shortcuts,
    onShortcutsChange,
    onNewSermon,
    onAction
}) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    return (
        <div className={clsx(
            "flex flex-col h-screen overflow-hidden font-sans selection:bg-blue-100 dark:selection:bg-blue-500/30 transition-colors duration-500",
            theme === 'dark' ? "bg-[#1C1C1E] text-slate-100" : "bg-white text-slate-900"
        )}>
            {/* Custom Menu Bar */}
            {!isFocusMode && (
                <MenuBar
                    onAction={onAction || (() => { })}
                    activeDocumentId={activeDocumentId}
                    theme={theme}
                />
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className={clsx(
                    "app-sidebar h-full flex transition-all duration-300 ease-in-out border-r",
                    isFocusMode || isSidebarCollapsed ? "w-0 border-transparent overflow-hidden" : "w-72 border-gray-200 dark:border-white/5"
                )}>
                    <div className="w-72 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xl">
                        <div className="p-6 flex items-center justify-between">
                            <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest pl-1">
                                Lumina Note
                            </h1>
                            <button
                                onClick={() => setIsSidebarCollapsed(true)}
                                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/5 text-slate-400"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        </div>

                        <div className="px-4 mb-4">
                            <button
                                onClick={onNewSermon}
                                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
                            >
                                <Plus size={18} />
                                <span>New Sermon</span>
                            </button>
                        </div>

                        <nav className="flex-1 px-4 space-y-1 overflow-hidden flex flex-col">
                            <div className="px-2 py-2 flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Library</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
                            </div>

                            <button
                                onClick={() => setIsSermonManagerOpen(true)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm transition-all active:scale-[0.98]"
                            >
                                <Folder size={18} className="text-blue-500" />
                                <span>Archive</span>
                            </button>
                            <button
                                onClick={onToggleVersions}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm transition-all active:scale-[0.98]"
                            >
                                <HistoryIcon size={18} className="text-indigo-500" />
                                <span>History</span>
                            </button>

                            <div className="px-2 py-4 flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                {openDocuments.length === 0 ? (
                                    <div className="px-4 py-8 text-xs text-slate-400 italic text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                                        No open documents.<br />Select from archive.
                                    </div>
                                ) : (
                                    openDocuments.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className={clsx(
                                                "group flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer active:scale-[0.98]",
                                                activeDocumentId === doc.id
                                                    ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-md ring-1 ring-black/5 dark:ring-white/5"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5"
                                            )}
                                            onClick={() => onSelectDocument(doc.id)}
                                        >
                                            <span className="truncate flex-1">{doc.title || 'Untitled'}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCloseDocument(doc.id);
                                                }}
                                                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </nav>

                        <div className="p-4 bg-gray-100/50 dark:bg-white/5 space-y-1">
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 text-sm transition-all"
                            >
                                <Settings size={18} />
                                <span>Settings</span>
                            </button>
                            <button
                                onClick={() => setIsHelpOpen(true)}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 text-sm transition-all"
                            >
                                <HelpCircle size={18} />
                                <span>Help Guide</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="app-main flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1C1C1E] relative overflow-hidden">
                    {/* Collapsed Sidebar Trigger */}
                    {!isFocusMode && isSidebarCollapsed && (
                        <div className="absolute top-4 left-4 z-[50]">
                            <button
                                onClick={() => setIsSidebarCollapsed(false)}
                                className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl text-slate-400 hover:text-blue-500 transition-all"
                            >
                                <Menu size={20} />
                            </button>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
};
