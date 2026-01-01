import { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';

interface ImageAttributes {
    width?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    hasShadow?: boolean;
    opacity?: number;
    rotation?: number;
    [key: string]: any;
}

export const ImagePropertiesModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [attrs, setAttrs] = useState<ImageAttributes>({});
    const [updateCallback, setUpdateCallback] = useState<((attrs: ImageAttributes) => void) | null>(null);

    useEffect(() => {
        const handleOpen = (e: CustomEvent) => {
            const { attrs, updateAttributes } = e.detail;
            setAttrs(attrs);
            setUpdateCallback(() => updateAttributes);
            setIsOpen(true);
        };

        window.addEventListener('open-image-properties' as any, handleOpen);
        return () => window.removeEventListener('open-image-properties' as any, handleOpen);
    }, []);

    const handleSave = () => {
        if (updateCallback) {
            updateCallback(attrs);
        }
        setIsOpen(false);
    };

    const handleClose = () => setIsOpen(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-80 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Image Properties</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">

                    {/* Size */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Size</label>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-12">Width</span>
                            <input
                                type="text"
                                value={attrs.width || ''}
                                onChange={(e) => setAttrs({ ...attrs, width: e.target.value })}
                                className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g. 300px or 100%"
                            />
                        </div>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Border */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Border</label>

                        {/* Radius */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-12">Radius</span>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                value={parseInt(attrs.borderRadius || '0')}
                                onChange={(e) => setAttrs({ ...attrs, borderRadius: `${e.target.value}px` })}
                                className="flex-1 accent-blue-500"
                            />
                            <span className="text-xs text-gray-500 w-8 text-right">{attrs.borderRadius}</span>
                        </div>

                        {/* Width */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-12">Width</span>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={parseInt(attrs.borderWidth || '0')}
                                onChange={(e) => setAttrs({ ...attrs, borderWidth: `${e.target.value}px` })}
                                className="flex-1 accent-blue-500"
                            />
                            <span className="text-xs text-gray-500 w-8 text-right">{attrs.borderWidth}</span>
                        </div>

                        {/* Color */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-12">Color</span>
                            <div className="relative flex-1 flex items-center gap-2">
                                <input
                                    type="color"
                                    value={attrs.borderColor || '#000000'}
                                    onChange={(e) => setAttrs({ ...attrs, borderColor: e.target.value })}
                                    className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                                />
                                <span className="text-xs text-gray-500 font-mono">{attrs.borderColor}</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Effects */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Effects</label>

                        {/* Shadow */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Drop Shadow</span>
                            <button
                                onClick={() => setAttrs({ ...attrs, hasShadow: !attrs.hasShadow })}
                                className={`w-10 h-5 rounded-full duration-200 relative ${attrs.hasShadow ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${attrs.hasShadow ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Opacity */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-12">Opacity</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={attrs.opacity ?? 1}
                                onChange={(e) => setAttrs({ ...attrs, opacity: parseFloat(e.target.value) })}
                                className="flex-1 accent-blue-500"
                            />
                            <span className="text-xs text-gray-500 w-8 text-right">{Math.round((attrs.opacity ?? 1) * 100)}%</span>
                        </div>

                        {/* Rotation */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-12">Rotate</span>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={attrs.rotation ?? 0}
                                onChange={(e) => setAttrs({ ...attrs, rotation: parseInt(e.target.value) })}
                                className="flex-1 accent-blue-500"
                            />
                            <span className="text-xs text-gray-500 w-8 text-right">{attrs.rotation}°</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        onClick={handleClose}
                        className="py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1.5"
                    >
                        <Check size={14} />
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};
