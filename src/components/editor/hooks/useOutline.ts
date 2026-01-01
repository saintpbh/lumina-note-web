import { useState, useCallback, useEffect } from 'react';
import { Editor } from '@tiptap/react';

export interface OutlineItem {
    id: string;
    text: string;
    level: 1 | 2 | 3;
    start: number;
    end: number;
}

/**
 * Outline Engine v4.0 - DIAGNOSTIC VERSION
 * Heavy logging to identify where the process breaks
 */
export const useOutline = (editor: Editor | null) => {
    const [outline, setOutline] = useState<OutlineItem[]>([]);

    const scanDocument = useCallback((): OutlineItem[] => {
        if (!editor) {
            console.log('[Outline] ⚠️  Editor not available');
            return [];
        }

        console.log('[Outline] 📖 Scanning document...');
        const items: OutlineItem[] = [];
        const doc = editor.state.doc;

        doc.descendants((node, pos) => {
            if (node.type.name === 'heading' && [1, 2, 3].includes(node.attrs.level)) {
                items.push({
                    id: `h${node.attrs.level}-${pos}`,
                    text: node.textContent,
                    level: node.attrs.level as 1 | 2 | 3,
                    start: pos,
                    end: 0
                });
            }
        });

        // Calculate section ranges
        for (let i = 0; i < items.length; i++) {
            let end = doc.content.size;
            for (let j = i + 1; j < items.length; j++) {
                if (items[j].level <= items[i].level) {
                    end = items[j].start;
                    break;
                }
            }
            items[i].end = end;
        }

        console.log(`[Outline] ✅ Found ${items.length} sections:`, items.map(i => i.text));
        return items;
    }, [editor]);

    const updateOutline = useCallback(() => {
        const items = scanDocument();
        setOutline(items);
    }, [scanDocument]);

    const moveSection = useCallback((sourceIndex: number, targetIndex: number) => {
        console.log(`\n[Outline] 🚀 MOVE REQUESTED: ${sourceIndex} -> ${targetIndex}`);

        if (!editor) {
            console.error('[Outline] ❌ Editor not available');
            return;
        }

        if (sourceIndex === targetIndex) {
            console.warn('[Outline] ⚠️  Source and target are the same, skipping');
            return;
        }

        // Re-scan to get current positions
        const currentItems = scanDocument();

        if (sourceIndex < 0 || sourceIndex >= currentItems.length) {
            console.error(`[Outline] ❌ Invalid source index: ${sourceIndex} (total: ${currentItems.length})`);
            return;
        }

        const source = currentItems[sourceIndex];
        console.log(`[Outline] 📍 Source section: "${source.text}" [${source.start}-${source.end}]`);

        const doc = editor.state.doc;
        const tr = editor.state.tr;

        // Calculate target position
        let targetPos: number;
        if (targetIndex >= currentItems.length) {
            targetPos = doc.content.size;
            console.log(`[Outline] 🎯 Target: END OF DOCUMENT (pos ${targetPos})`);
        } else if (sourceIndex < targetIndex) {
            // Moving down: insert after target section
            targetPos = currentItems[targetIndex].end;
            console.log(`[Outline] 🎯 Target: AFTER "${currentItems[targetIndex].text}" (pos ${targetPos})`);
        } else {
            // Moving up: insert before target section
            targetPos = currentItems[targetIndex].start;
            console.log(`[Outline] 🎯 Target: BEFORE "${currentItems[targetIndex].text}" (pos ${targetPos})`);
        }

        // Sanity check
        if (targetPos > source.start && targetPos < source.end) {
            console.error('[Outline] ❌ Cannot move section into itself!');
            return;
        }

        console.log('[Outline] 🔄 Executing transaction...');

        try {
            // Extract the slice
            const slice = doc.slice(source.start, source.end);
            console.log(`[Outline] ✂️  Extracted slice of size ${slice.size}`);

            // Delete source
            tr.delete(source.start, source.end);
            console.log(`[Outline] 🗑️  Deleted source range [${source.start}-${source.end}]`);

            // Map target position
            const mappedPos = tr.mapping.map(targetPos);
            console.log(`[Outline] 🗺️  Mapped target position: ${targetPos} -> ${mappedPos}`);

            // Insert at target
            tr.insert(mappedPos, slice.content);
            console.log(`[Outline] ➕ Inserted slice at position ${mappedPos}`);

            // Dispatch transaction
            if (editor && !editor.isDestroyed && editor.view) {
                editor.view.dispatch(tr);
                console.log('[Outline] ✅ Transaction dispatched successfully!');
            } else {
                console.warn('[Outline] ⚠️  Cannot dispatch: view not available');
                return;
            }

            // Re-scan to verify
            setTimeout(() => {
                console.log('[Outline] 🔍 Verifying move...');
                const newItems = scanDocument();
                setOutline(newItems);

                // Focus on new position
                if (editor && !editor.isDestroyed && editor.view && editor.view.dom) {
                    editor.commands.focus();
                    editor.commands.setTextSelection(mappedPos);
                }
            }, 100);

        } catch (error) {
            console.error('[Outline] ❌ Transaction failed:', error);
        }

    }, [editor, scanDocument]);

    // Setup listener
    useEffect(() => {
        if (!editor) return;

        console.log('[Outline] 🎧 Setting up editor listener');
        updateOutline();

        editor.on('update', updateOutline);

        return () => {
            console.log('[Outline] 👋 Cleaning up editor listener');
            editor.off('update', updateOutline);
        };
    }, [editor, updateOutline]);

    return {
        outline,
        moveSection
    };
};
