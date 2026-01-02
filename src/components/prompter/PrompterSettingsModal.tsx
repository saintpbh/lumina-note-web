'use client';

import React from 'react';
import { Settings, X } from 'lucide-react';
import { PrompterSettings } from '@/shared/types';

interface PrompterSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: PrompterSettings;
    onSettingsChange: (settings: Partial<PrompterSettings>) => void;
}

export const PrompterSettingsModal = ({
    isOpen,
    onClose,
    settings,
    onSettingsChange,
}: PrompterSettingsModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#1C1C1E] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                        <Settings className="w-5 h-5 text-blue-400" />
                        Prompter Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Font Size */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-3">
                            Font Size: {settings.font_size}pt
                        </label>
                        <input
                            type="range"
                            min="24"
                            max="72"
                            value={settings.font_size}
                            onChange={(e) => onSettingsChange({ font_size: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>24pt</span>
                            <span>72pt</span>
                        </div>
                    </div>

                    {/* Line Height */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-3">
                            Line Height: {settings.line_height.toFixed(1)}
                        </label>
                        <input
                            type="range"
                            min="1.0"
                            max="3.0"
                            step="0.1"
                            value={settings.line_height}
                            onChange={(e) => onSettingsChange({ line_height: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1.0</span>
                            <span>3.0</span>
                        </div>
                    </div>

                    {/* Font Family */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-3">
                            Font Family
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['serif', 'sans', 'mono'].map((font) => (
                                <button
                                    key={font}
                                    onClick={() => onSettingsChange({ font_family: font })}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${settings.font_family === font
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                        }`}
                                >
                                    {font}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text Align */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-3">
                            Text Alignment
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['left', 'center', 'right'].map((align) => (
                                <button
                                    key={align}
                                    onClick={() => onSettingsChange({ text_align: align })}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${settings.text_align === align
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                        }`}
                                >
                                    {align}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Width */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-3">
                            Content Width: {settings.content_width}%
                        </label>
                        <input
                            type="range"
                            min="50"
                            max="100"
                            value={settings.content_width}
                            onChange={(e) => onSettingsChange({ content_width: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Narrow (50%)</span>
                            <span>Wide (100%)</span>
                        </div>
                    </div>

                    {/* Primary Display Theme */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-3">
                            Prompter Theme
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {Object.entries({
                                dark: 'Dark',
                                light: 'Light',
                                sepia: 'Sepia',
                                night: 'Night',
                                contrast: 'Contrast'
                            }).map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => onSettingsChange({ primary_theme: value as any })}
                                    className={`px-3 py-2 rounded-lg text-[10px] font-medium transition-all ${settings.primary_theme === value
                                        ? 'bg-blue-500 text-white ring-2 ring-blue-400'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/5 bg-white/5">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
