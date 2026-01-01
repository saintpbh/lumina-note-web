import React, { useState, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { List, GripVertical, ChevronRight } from 'lucide-react';
import { useOutline } from './hooks/useOutline';

interface OutlineSidebarProps {
    editor: Editor | null;
}

/**
 * Outline Sidebar v9.0 - REFINED UX
 * Subtle line indicator with smooth spacing animations
 */
export const OutlineSidebar: React.FC<OutlineSidebarProps> = ({ editor }) => {
    const { outline, moveSection } = useOutline(editor);

    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
    const isDraggingRef = useRef(false);
    const dragIndexRef = useRef<number | null>(null);

    const handleNavigate = useCallback((pos: number) => {
        if (!editor) return;
        console.log(`[UI] 🧭 Navigating to position ${pos}`);
        editor.commands.focus();
        editor.commands.setTextSelection(pos);
    }, [editor]);

    const handlePointerDown = useCallback((e: React.PointerEvent, index: number) => {
        if (e.button !== 0) return;

        console.log(`\n[UI] 🖱️ POINTER DOWN: index ${index}`);

        isDraggingRef.current = true;
        dragIndexRef.current = index;
        setDraggingIndex(index);

        (e.target as HTMLElement).setPointerCapture(e.pointerId);

        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDraggingRef.current || dragIndexRef.current === null) return;

        const elements = document.querySelectorAll('[data-outline-index]');
        let targetIdx: number | null = null;

        elements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;

            if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
                targetIdx = parseInt(el.getAttribute('data-outline-index') || '');
                if (e.clientY > midY) {
                    targetIdx = targetIdx + 1;
                }
            }
        });

        // Check "Move to End" zone
        const endZone = document.querySelector('[data-drop-zone="end"]');
        if (endZone) {
            const rect = endZone.getBoundingClientRect();
            if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
                targetIdx = outline.length;
            }
        }

        if (targetIdx !== null && targetIdx !== dropTargetIndex) {
            setDropTargetIndex(targetIdx);
        }

        e.preventDefault();
    }, [dropTargetIndex, outline.length]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDraggingRef.current || dragIndexRef.current === null) {
            return;
        }

        const sourceIndex = dragIndexRef.current;
        const targetIndex = dropTargetIndex;

        console.log(`\n[UI] 🎯 POINTER UP: source=${sourceIndex}, target=${targetIndex}`);

        if (targetIndex !== null && targetIndex !== sourceIndex && targetIndex !== sourceIndex + 1) {
            console.log('[UI] ✅ Valid drop, calling moveSection...');
            const adjustedTarget = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
            moveSection(sourceIndex, adjustedTarget);
        } else {
            console.log('[UI] ⚠️ No valid drop target');
        }

        // Cleanup
        isDraggingRef.current = false;
        dragIndexRef.current = null;
        setDraggingIndex(null);
        setDropTargetIndex(null);

        (e.target as HTMLElement).releasePointerCapture(e.pointerId);

        console.log('[UI] 🧹 Drag state cleaned up');

        e.preventDefault();
    }, [dropTargetIndex, moveSection]);

    const handlePointerCancel = useCallback(() => {
        console.log('[UI] ❌ POINTER CANCEL');
        isDraggingRef.current = false;
        dragIndexRef.current = null;
        setDraggingIndex(null);
        setDropTargetIndex(null);
    }, []);

    return (
        <div className="w-64 h-full bg-[#FAFBFC] dark:bg-[#0A0C10] border-l border-gray-200 dark:border-gray-800 flex flex-col no-print select-none">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <List size={16} className="text-blue-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Outline</span>
                </div>
                <div className="px-2 py-1 bg-indigo-600 text-white text-[9px] font-black rounded">
                    v9.0
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3">
                {outline.length > 0 ? (
                    <>
                        <div className="space-y-0">
                            {outline.map((item, i) => {
                                const isDragging = draggingIndex === i;
                                const showDropLine = dropTargetIndex === i && draggingIndex !== null && draggingIndex !== i;
                                const addSpacing = dropTargetIndex === i && draggingIndex !== null;

                                return (
                                    <React.Fragment key={item.id}>
                                        {/* Subtle drop line indicator */}
                                        {showDropLine && (
                                            <div
                                                className="relative h-0 transition-all duration-200 ease-out"
                                                style={{ marginLeft: `${(item.level - 1) * 12}px` }}
                                            >
                                                <div className="absolute inset-x-0 flex items-center">
                                                    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-sm"></div>
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            data-outline-index={i}
                                            onPointerDown={(e) => handlePointerDown(e, i)}
                                            onPointerMove={handlePointerMove}
                                            onPointerUp={handlePointerUp}
                                            onPointerCancel={handlePointerCancel}
                                            className={`
                                                relative group rounded-lg touch-none
                                                transition-all duration-300 ease-out
                                                ${isDragging
                                                    ? 'opacity-40 scale-[0.98] z-50'
                                                    : 'hover:bg-white dark:hover:bg-gray-800 cursor-grab active:cursor-grabbing'
                                                }
                                                ${addSpacing ? 'mt-8' : 'mt-1'}
                                            `}
                                            style={{
                                                marginLeft: `${(item.level - 1) * 12}px`,
                                            }}
                                        >
                                            <div
                                                onClick={() => !isDraggingRef.current && handleNavigate(item.start)}
                                                className="flex items-center gap-2 px-3 py-2 select-none"
                                            >
                                                <GripVertical
                                                    size={14}
                                                    className={`shrink-0 transition-opacity duration-200 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                />
                                                <ChevronRight
                                                    size={12}
                                                    className={`shrink-0 transition-colors ${item.level === 1 ? 'text-indigo-600' : 'text-gray-400'}`}
                                                />
                                                <span className={`text-sm truncate transition-all ${item.level === 1 ? 'font-bold' : ''}`}>
                                                    {item.text || '(Untitled)'}
                                                </span>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* Drop line at the end */}
                        {dropTargetIndex === outline.length && draggingIndex !== null && (
                            <div className="mt-8 transition-all duration-200 ease-out">
                                <div className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-sm"></div>
                            </div>
                        )}

                        {/* Drop to end zone */}
                        <div
                            data-drop-zone="end"
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            className="mt-4 h-12 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center touch-none transition-all duration-200"
                        >
                            <span className="text-xs text-gray-400 uppercase font-medium select-none">Move to End</span>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                        No headings found
                    </div>
                )}
            </div>

            {/* Debug info */}
            {draggingIndex !== null && (
                <div className="p-2 bg-indigo-600 text-white text-xs text-center font-mono">
                    DRAGGING: {draggingIndex} → {dropTargetIndex ?? '—'}
                </div>
            )}
        </div>
    );
};
