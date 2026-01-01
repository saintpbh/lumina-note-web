import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, GripVertical, Pin, PinOff } from 'lucide-react';
import { cn } from '../../utils/cn';
import { EditorSettings } from '@/shared/types';

export interface VignetteData {
    id: string;
    content: string;
    color: 'amber' | 'rose' | 'sky' | 'emerald';
    position: { x: number; y: number };
    isPinned: boolean;
    opacity?: number;
}

interface VignetteProps {
    note: VignetteData;
    onUpdate: (note: VignetteData) => void;
    onDelete: (id: string) => void;
    settings: EditorSettings;
}

export const Vignette: React.FC<VignetteProps> = ({ note, onUpdate, onDelete, settings }) => {
    const [isDragging, setIsDragging] = useState(false);
    const noteRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const posRef = useRef(note.position);
    const dragOffset = useRef({ x: 0, y: 0 });

    const fontClasses = {
        serif: 'luxury-serif',
        sans: 'font-sans',
        mono: 'luxury-mono',
        handwriting: 'luxury-serif italic'
    };

    const themeColors = settings.vignetteColors[note.color] || { bg: '#ffffff', text: '#000000' };

    // Auto-focus on new empty notes
    useEffect(() => {
        if (textareaRef.current && note.content === '') {
            textareaRef.current.focus();
        }
    }, [note.content]);

    // Update internal posRef when props change (only if not dragging)
    useEffect(() => {
        if (!isDragging) {
            posRef.current = note.position;
            if (noteRef.current) {
                noteRef.current.style.transform = `translate3d(${note.position.x}px, ${note.position.y}px, 0)`;
            }
        }
    }, [note.position, isDragging]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;

        posRef.current = { x: newX, y: newY };

        if (noteRef.current) {
            // Direct DOM manipulation for bypass React render cycle lag
            noteRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        const paperEl = document.querySelector('.paper');
        let finalPos = { ...posRef.current };
        let finalPinned = note.isPinned;

        if (paperEl) {
            const paperRect = paperEl.getBoundingClientRect();
            const snapThreshold = 150;
            const rightMarginX = paperRect.right + 20;

            // Snap if near the margin
            if (Math.abs(posRef.current.x - rightMarginX) < snapThreshold) {
                finalPos.x = rightMarginX;
                finalPinned = true;
            } else {
                // Unpin if moved away
                finalPinned = false;
            }
        }

        onUpdate({
            ...note,
            position: finalPos,
            isPinned: finalPinned
        });
    }, [note, onUpdate, handleMouseMove]);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent drag on interactables
        if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).closest('button')) return;

        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - posRef.current.x,
            y: e.clientY - posRef.current.y
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            ref={noteRef}
            className={cn(
                "group fixed top-0 left-0 w-56 min-h-[140px] rounded-2xl border flex flex-col overflow-hidden will-change-transform",
                isDragging ? "z-50 scale-105 shadow-2xl ring-2 ring-white/10" : "z-40 shadow-xl hover:shadow-2xl transition-all",
                note.isPinned ? "" : ""
            )}
            style={{
                transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`,
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, scale 0.2s ease',
                backgroundColor: themeColors.bg,
                color: themeColors.text,
                opacity: settings.vignetteOpacity / 100,
                borderColor: `${themeColors.text}20` // Subtle border based on text color
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Controls Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                <div className="flex items-center gap-1.5 text-black/40 dark:text-white/40">
                    <button
                        onClick={() => onUpdate({ ...note, isPinned: !note.isPinned })}
                        className={cn(
                            "p-1 rounded-md transition-all hover:scale-110",
                            note.isPinned ? "bg-black/10 dark:bg-white/10 text-accent" : "hover:bg-black/10 dark:hover:bg-white/10"
                        )}
                        title={note.isPinned ? "Unpin from margin" : "Pin to margin"}
                    >
                        {note.isPinned ? <Pin size={12} /> : <PinOff size={12} />}
                    </button>
                    <div className="cursor-grab hover:text-black dark:hover:text-white p-1">
                        <GripVertical size={12} />
                    </div>
                </div>

                <button
                    onClick={() => onDelete(note.id)}
                    className="p-1 hover:bg-red-500/20 rounded-md transition-colors text-black/30 dark:text-white/30 hover:text-red-500"
                >
                    <X size={12} />
                </button>
            </div>

            <textarea
                ref={textareaRef}
                value={note.content}
                onChange={(e) => onUpdate({ ...note, content: e.target.value })}
                className={cn(
                    "flex-1 w-full p-4 bg-transparent resize-none outline-none text-sm leading-relaxed placeholder:opacity-30",
                    fontClasses[settings.vignetteFont]
                )}
                style={{ color: 'inherit' }}
                placeholder="Capturing a flash of insight..."
                spellCheck={false}
            />

            {/* Active Anchor Indicator */}
            {note.isPinned && (
                <div className="h-1 w-full bg-accent/40" />
            )}
        </div>
    );
};
