import { useState, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';

export interface ToolbarVisibilityReturn {
    toolbarVisible: boolean;
    setToolbarVisible: (visible: boolean) => void;
}

interface ToolbarVisibilityOptions {
    editor: Editor | null;
    toolbarVisibility: 'always' | 'hidden' | 'auto-hide';
}

/**
 * Hook for managing toolbar auto-hide behavior.
 * Handles mouse movement detection and activity-based visibility.
 */
export function useToolbarVisibility({
    editor,
    toolbarVisibility,
}: ToolbarVisibilityOptions): ToolbarVisibilityReturn {
    const [toolbarVisible, setToolbarVisible] = useState(true);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (toolbarVisibility === 'auto-hide') {
            const handleActivity = () => {
                setToolbarVisible(true);
                if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = setTimeout(() => {
                    setToolbarVisible(false);
                }, 2000);
            };

            const handleMouseMove = (e: MouseEvent) => {
                const windowHeight = window.innerHeight;
                const mouseY = e.clientY;
                // Show toolbar when mouse in bottom 10% of screen
                if (mouseY > windowHeight * 0.9) {
                    setToolbarVisible(true);
                    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
                }
            };

            editor?.on('update', handleActivity);
            window.addEventListener('mousemove', handleMouseMove);
            handleActivity(); // Initial trigger

            return () => {
                editor?.off('update', handleActivity);
                window.removeEventListener('mousemove', handleMouseMove);
                if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
            };
        } else if (toolbarVisibility === 'always') {
            setToolbarVisible(true);
        } else if (toolbarVisibility === 'hidden') {
            setToolbarVisible(false);
        }
    }, [editor, toolbarVisibility]);

    return {
        toolbarVisible,
        setToolbarVisible,
    };
}
