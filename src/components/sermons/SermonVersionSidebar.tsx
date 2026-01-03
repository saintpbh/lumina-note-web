import React, { useState, useEffect } from 'react';
import { RotateCcw, X, History, Loader2 } from 'lucide-react';
import { Sermon } from '@/shared/types';
import { googleDriveManager } from '@/utils/googleDriveManager';

interface SermonVersion {
    id: string; // Google Drive Revision ID
    version_label: string;
    updated_at: string;
    content?: string; // Loaded on demand
}

interface SermonVersionSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentSermonId: number | null;
    onRestoreVersion: (version: { content: string }) => void;
    lastSynced?: string;
}

export const SermonVersionSidebar: React.FC<SermonVersionSidebarProps> = ({
    isOpen,
    onClose,
    currentSermonId,
    onRestoreVersion,
    lastSynced
}) => {
    const [versions, setVersions] = useState<SermonVersion[]>([]);
    const [loading, setLoading] = useState(false);
    const [restoringId, setRestoringId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && currentSermonId) {
            loadVersions();
        }
    }, [isOpen, currentSermonId, lastSynced]);

    const extractSnippet = (html: string): string => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const paragraphs = Array.from(doc.querySelectorAll('p, h1, h2, h3'));
            // Find the last non-empty paragraph/heading
            for (let i = paragraphs.length - 1; i >= 0; i--) {
                const text = paragraphs[i].textContent?.trim();
                if (text) {
                    return text.length > 20 ? text.substring(0, 20) + '...' : text;
                }
            }
            return 'Empty Content';
        } catch (e) {
            return 'Version content';
        }
    };

    const loadVersions = async () => {
        if (!currentSermonId) return;

        // Check if user is logged into Google Drive
        const token = localStorage.getItem('google_drive_token');
        if (!token) {
            console.log('[Versions] User not logged into Google Drive, skipping version load');
            setVersions([]);
            return;
        }

        setLoading(true);
        try {
            const allRevisions = await googleDriveManager.listRevisions(currentSermonId);
            // Limit to last 10 versions
            const recentRevisions = allRevisions.slice(-10).reverse();

            // Fetch content in parallel to generate "Smart Names"
            // Note: In a real heavy app, we might store this metadata. For now, fetching 10 small JSONs is acceptable.
            const versionsWithNames = await Promise.all(recentRevisions.map(async (rev, index) => {
                let label = `Version ${index + 1}`;
                try {
                    const data = await googleDriveManager.getRevisionContent(currentSermonId, rev.id);
                    if (data && data.content) {
                        label = extractSnippet(data.content);
                    }
                } catch (ignore) { }

                return {
                    id: rev.id,
                    version_label: label,
                    updated_at: rev.modifiedTime,
                };
            }));

            setVersions(versionsWithNames);
        } catch (e: any) {
            // Silently handle auth errors (user not logged in)
            if (e?.message?.includes('access token') || e?.message?.includes('401')) {
                console.log('[Versions] No Google Drive access, skipping version load');
                setVersions([]);
            } else {
                console.error('Failed to load versions:', e);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (version: SermonVersion) => {
        if (!currentSermonId) return;
        setRestoringId(version.id);
        try {
            const data = await googleDriveManager.getRevisionContent(currentSermonId, version.id);
            if (data && data.content) {
                onRestoreVersion({ content: data.content });
            }
        } catch (e) {
            console.error('Failed to restore version:', e);
        } finally {
            setRestoringId(null);
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
                    <div className="flex flex-col items-center justify-center mt-8 text-gray-500 gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-xs luxury-mono">Loading versions...</span>
                    </div>
                ) : versions.length === 0 ? (
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 luxury-mono mt-8 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        No previous versions found.<br />Versions are created automatically when content is saved to the cloud.
                    </div>
                ) : (
                    versions.map((version) => (
                        <div
                            key={version.id}
                            onClick={() => handleRestore(version)}
                            className={`group p-4 rounded-2xl border transition-all cursor-pointer ${restoringId === version.id
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-blue-500/30'
                                }`}
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
                                    onClick={() => handleRestore(version)}
                                    disabled={restoringId !== null}
                                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 disabled:text-gray-400 uppercase tracking-wider"
                                >
                                    {restoringId === version.id ? (
                                        <>
                                            <Loader2 className="animate-spin" size={12} />
                                            Restoring...
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw size={12} />
                                            Restore
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                <p className="text-[10px] text-gray-400 italic text-center">
                    Restoring creates a new version. You can always go back.
                </p>
            </div>
        </div>
    );
};
