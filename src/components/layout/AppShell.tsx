'use client';

import React, { useState } from 'react';
import { Settings, Folder, History as HistoryIcon, X, HelpCircle } from 'lucide-react';
import clsx from 'clsx';
import { ShortcutConfig } from '@/shared/types';

interface AppShellProps {
    children: React.ReactNode;
    isFocusMode?: boolean;
    editorSettings?: any;
    onSettingsChange?: (settings: any) => void;
    theme?: 'default' | 'sepia' | 'dark' | 'blue';
    onThemeChange?: (theme: 'default' | 'sepia' | 'dark' | 'blue') => void;
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
    onShortcutsChange
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    return (
        <div className={clsx(
            "flex h-screen overflow-hidden font-sans selection:bg-blue-100 dark:selection:bg-blue-500/30",
            theme === 'dark' ? "bg-[#1C1C1E] text-slate-100 dark" : "bg-white text-slate-900"
        )}>
            {/* Sidebar */}
            <div className={clsx(
                "app-sidebar h-full flex transition-all duration-300",
                isFocusMode ? "w-0 overflow-hidden" : "w-64"
            )}>
                <div
                    className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col p-4 sm:p-6"
                >
                    <div className="px-5 pb-6">
                        <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest pl-1">
                            Lumina Note
                        </h1>
                    </div>

                    <nav className="flex-1 px-3 space-y-0.5 overflow-hidden">
                        <div className="px-3 py-1 mb-2">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Library</span>
                        </div>

                        <button
                            onClick={() => setIsSermonManagerOpen(true)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white ring-1 ring-black/5 dark:ring-white/10 active:scale-[0.98] transition-all"
                        >
                            <span className="flex items-center gap-2">
                                <Folder size={16} />
                                Sermons
                            </span>
                        </button>
                        <button
                            onClick={onToggleVersions}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 hover:bg-gray-200/50 dark:hover:bg-white/5 transition-colors active:bg-gray-200"
                        >
                            <HistoryIcon size={16} />
                            <span>Version History</span>
                        </button>
                        <button
                            onClick={() => setIsHelpOpen(true)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 hover:bg-gray-200/50 dark:hover:bg-white/5 transition-colors active:bg-gray-200"
                        >
                            <HelpCircle size={16} />
                            <span>Help</span>
                        </button>
                    </nav>

                    {/* Open Documents Section */}
                    <nav className="flex-1 px-3 space-y-0.5 mt-6 overflow-hidden flex flex-col">
                        <div className="px-3 py-1 mb-2">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Open Documents</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {openDocuments.length === 0 ? (
                                <div className="px-3 py-4 text-xs text-gray-400 italic text-center border-t border-dashed border-gray-200 dark:border-gray-800">
                                    No open documents.<br />Select from library.
                                </div>
                            ) : (
                                openDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className={clsx(
                                            "group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer active:scale-[0.98]",
                                            activeDocumentId === doc.id
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                                : "text-slate-700 dark:text-slate-200 hover:bg-gray-200/50 dark:hover:bg-white/5 active:bg-gray-300 dark:active:bg-white/10"
                                        )}
                                        onClick={() => onSelectDocument(doc.id)}
                                    >
                                        <span className="truncate flex-1">{doc.title || 'Untitled'}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCloseDocument(doc.id);
                                            }}
                                            className={clsx(
                                                "p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                                                activeDocumentId === doc.id ? "hover:bg-white/20" : "hover:bg-gray-200 dark:hover:bg-white/10"
                                            )}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </nav>

                    <div className="p-3 bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 text-sm transition-colors"
                        >
                            <Settings size={16} />
                            <span>Settings</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="app-main flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1E1E1E] relative">
                {children}
            </main>

            {/* Modals will be ported next */}
        </div>
    );
};
