import { useCallback } from 'react';
import { VignetteData } from '../Vignette';

export interface StickyNotesReturn {
    createStickyNote: () => void;
    updateStickyNote: (note: VignetteData) => void;
    deleteStickyNote: (id: string) => void;
}

interface StickyNotesOptions {
    stickyNotes: VignetteData[];
    setStickyNotes: (notes: VignetteData[] | ((prev: VignetteData[]) => VignetteData[])) => void;
}

/**
 * Hook for managing Lumina Vignettes CRUD operations
 */
export function useStickyNotes({
    stickyNotes,
    setStickyNotes,
}: StickyNotesOptions): StickyNotesReturn {
    const createStickyNote = useCallback(() => {
        const colors: Array<'amber' | 'rose' | 'sky' | 'emerald'> = ['amber', 'rose', 'sky', 'emerald'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // Calculate initial position in the right margin area
        const paperEl = document.querySelector('.paper');
        const paperRect = paperEl?.getBoundingClientRect();

        const initialX = paperRect ? paperRect.right + 40 : window.innerWidth - 300;

        // Smart Stacking: Find the next available Y slot
        const VIGNETTE_HEIGHT = 160;
        const PADDING_TOP = 100;

        let initialY = PADDING_TOP;
        const pinnedNotes = stickyNotes
            .filter(n => n.isPinned)
            .sort((a, b) => a.position.y - b.position.y);

        for (const note of pinnedNotes) {
            if (Math.abs(initialY - note.position.y) < VIGNETTE_HEIGHT - 20) {
                initialY = note.position.y + VIGNETTE_HEIGHT;
            }
        }

        const newNote: VignetteData = {
            id: `vignette-${Date.now()}`,
            content: '',
            color: randomColor,
            position: { x: initialX, y: initialY },
            isPinned: true,
        };

        setStickyNotes(prev => [...prev, newNote]);
    }, [setStickyNotes, stickyNotes]);

    const updateStickyNote = useCallback((note: VignetteData) => {
        setStickyNotes(prev => prev.map(n => n.id === note.id ? note : n));
    }, [setStickyNotes]);

    const deleteStickyNote = useCallback((id: string) => {
        setStickyNotes(prev => prev.filter(n => n.id !== id));
    }, [setStickyNotes]);

    return {
        createStickyNote,
        updateStickyNote,
        deleteStickyNote,
    };
}
