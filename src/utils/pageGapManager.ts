import { PAGE_SIZES } from './pageUtils';

/**
 * Page Gap Manager (Web Version)
 * Handles the calculation and application of vertical gaps 
 * to ensure content "skips" the Page Margin/Break Zone.
 * Ported from Rust implementation for web compatibility.
 */

interface NodeMeasurement {
    id: string;
    height_px: number;
}

interface PageConfig {
    width_mm: number;
    height_mm: number;
    margin_top_mm: number;
    margin_bottom_mm: number;
}

const MM_TO_PX_RATIO = 3.7795275591;

function mmToPx(mm: number): number {
    return mm * MM_TO_PX_RATIO;
}

function calculateLayoutLocal(nodes: NodeMeasurement[], config: PageConfig) {
    const pageHeightPx = mmToPx(config.height_mm);
    const marginTopPx = mmToPx(config.margin_top_mm);
    const marginBottomPx = mmToPx(config.margin_bottom_mm);
    const contentEndThreshold = pageHeightPx - marginBottomPx;

    const gaps: number[] = new Array(nodes.length).fill(0);
    let currentTopRelative = 0;

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const posInPageTop = currentTopRelative % pageHeightPx;
        const nodeBottomRelative = currentTopRelative + node.height_px;
        const posInPageBottom = nodeBottomRelative % pageHeightPx;

        const pageOfTop = Math.floor(currentTopRelative / pageHeightPx);
        const pageOfBottom = Math.floor(nodeBottomRelative / pageHeightPx);

        const isTopInMargin = posInPageTop > contentEndThreshold;
        const spansPageBreak = pageOfTop !== pageOfBottom;
        const isBottomInMargin = pageOfTop === pageOfBottom && posInPageBottom > contentEndThreshold;

        let marginTop = 0;

        if (isTopInMargin || spansPageBreak || isBottomInMargin) {
            const nextContentStartTotal = (pageOfTop + 1) * pageHeightPx + marginTopPx;
            marginTop = nextContentStartTotal - currentTopRelative;
            currentTopRelative += marginTop;
        }

        gaps[i] = marginTop;
        currentTopRelative += node.height_px;
    }

    const pageCount = Math.ceil(currentTopRelative / (pageHeightPx - marginTopPx - marginBottomPx));

    return {
        gaps,
        pageCount: Math.max(1, pageCount)
    };
}

export async function applyPageGaps(editor: any, pageSize: 'a4' | 'b5') {
    if (!editor || !editor.view || !editor.view.dom || editor.isDestroyed) return;

    const proseMirror = editor.view.dom as HTMLElement;
    const nodes = Array.from(proseMirror.children) as HTMLElement[];

    if (nodes.length === 0) return;

    // Clear all existing gaps
    nodes.forEach(node => {
        node.style.marginTop = '';
        node.style.paddingTop = '';
    });

    // Gather measurements
    const nodeMeasurements = nodes.map((node, index) => ({
        id: index.toString(),
        height_px: node.getBoundingClientRect().height
    }));

    const size = PAGE_SIZES[pageSize];
    const config = {
        width_mm: size.width,
        height_mm: size.height,
        margin_top_mm: size.marginTop,
        margin_bottom_mm: size.marginBottom,
    };

    try {
        // Run local calculation instead of Tauri invoke
        const result = calculateLayoutLocal(nodeMeasurements, config);

        // Apply gaps
        nodes.forEach((node, index) => {
            const gap = result.gaps[index];
            if (gap > 0) {
                node.style.marginTop = `${gap}px`;
            }
        });

        return result.pageCount;
    } catch (error) {
        console.error('Layout calculation failed:', error);
        return 1;
    }
}
