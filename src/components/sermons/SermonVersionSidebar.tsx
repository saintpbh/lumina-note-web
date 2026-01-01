'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, X, History } from 'lucide-react';
import { Sermon } from '@/shared/types';

interface SermonVersion {
    id: number;
    version_label: string;
    updated_at: string;
    content: string;
}

interface SermonVersionSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentSermonId: number | null;
    onRestoreVersion: (version: SermonVersion) => void;
}

export const SermonVersionSidebar: React.FC<SermonVersionSidebarProps> = ({
    isOpen,
    onClose,
    currentSermonId,
    onRestoreVersion
}) => {
    const [versions, setVersions] = useState<SermonVersion[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentSermonId) {
            loadVersions();
        }
    }, [isOpen, currentSermonId]);

    const loadVersions = async () => {
        if (!currentSermonId) return;
        setLoading(true);
        try {
            // Web version: versions are limited for now without a database
            // We could use localStorage to store history, but keep it empty/simple for now
            setVersions([]);
        } catch (e) {
            console.error('Failed to load versions:', e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#1C1C1E] border-l border-gray-200 dark:border-gray-800 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 luxury-mono flex items-center gap-2">
                    <History size={16} />
                    Version History
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <X size={18} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 luxury-mono mt-8">Loading versions...</div>
                ) : versions.length === 0 ? (
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 luxury-mono mt-8 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        No previous versions found.<br />Versions are created when you manually update or snapshot.
                    </div>
                ) : (
                    versions.map((version) => (
                        <div
                            key={version.id}
                            className="group p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-blue-500 luxury-mono">{version.version_label}</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 luxury-mono">
                                    {new Date(version.updated_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-gray-500 luxury-mono">
                                    {new Date(version.updated_at).toLocaleTimeString()}
                                </span>
                                <button
                                    onClick={() => onRestoreVersion(version)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                                >
                                    <RotateCcw size={12} />
                                    Restore
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                <p className="text-[10px] text-gray-400 italic text-center">
                    Restoring a version will overwrite your current editor content.
                </p>
            </div>
        </div>
    );
};
