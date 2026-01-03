import React, { useState, useEffect } from 'react';
import { X, FileText, FileCode, FileType, File } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ExportFormat = 'md' | 'pdf' | 'docx' | 'rtf' | 'txt';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (format: ExportFormat, filename: string) => void;
    defaultFilename: string;
}

const FORMATS: { id: ExportFormat; label: string; icon: any; desc: string }[] = [
    { id: 'pdf', label: 'PDF Document', icon: FileType, desc: 'Best for sharing and printing. Preserves layout.' },
    { id: 'docx', label: 'Microsoft Word', icon: FileText, desc: 'Editable in Word. Standard document format.' },
    { id: 'md', label: 'Markdown', icon: FileCode, desc: 'Plain text with formatting symbols. Good for developers.' },
    { id: 'rtf', label: 'Rich Text', icon: FileText, desc: 'Universal text format with basic styling.' },
    { id: 'txt', label: 'Plain Text', icon: File, desc: 'Simple text without any formatting.' },
];

export const ExportModal = ({ isOpen, onClose, onExport, defaultFilename }: ExportModalProps) => {
    const [filename, setFilename] = useState(defaultFilename);
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFilename(defaultFilename);
            setIsExporting(false);
        }
    }, [isOpen, defaultFilename]);

    const handleExport = () => {
        setIsExporting(true);
        // Small delay to show loading state if needed, or just proceed
        setTimeout(() => {
            onExport(selectedFormat, filename);
            // We don't close immediately here, let page handle it or close after success
            // But usually we close modal after trigger
            onClose();
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white luxury-serif">Export Document</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Filename Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 luxury-mono">Filename</label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors dark:text-white"
                                placeholder="My Sermon"
                                autoFocus
                            />
                            <div className="px-3 py-2 bg-gray-100 dark:bg-white/5 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg text-sm text-gray-500 dark:text-gray-400 font-mono">
                                .{selectedFormat}
                            </div>
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 luxury-mono">Format</label>
                        <div className="grid gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {FORMATS.map((fmt) => (
                                <button
                                    key={fmt.id}
                                    onClick={() => setSelectedFormat(fmt.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                        selectedFormat === fmt.id
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                                            : "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-white/5"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        selectedFormat === fmt.id ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                                    )}>
                                        <fmt.icon size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-900 dark:text-white">{fmt.label}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{fmt.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={!filename.trim() || isExporting}
                        className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                </div>
            </div>
        </div>
    );
};
