/**
 * Page splitting utilities for Lumina Note
 * Handles dynamic page breaking based on content height
 */

export interface PageSize {
    width: number;  // in mm
    height: number; // in mm
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
}

export const PAGE_SIZES: Record<'a4' | 'b5', PageSize> = {
    a4: {
        width: 210,
        height: 297,
        marginTop: 25,
        marginRight: 22, // Adjusted to match refined wrap
        marginBottom: 25,
        marginLeft: 22,
    },
    b5: {
        width: 182,
        height: 250,
        marginTop: 20,
        marginRight: 17, // Adjusted to match refined wrap
        marginBottom: 20,
        marginLeft: 17,
    },
};

/**
 * Convert millimeters to pixels
 * Standard: 1mm = 3.7795275591 pixels at 96 DPI
 */
export function mmToPx(mm: number): number {
    return mm * 3.7795275591;
}

/**
 * Convert pixels to millimeters
 */
export function pxToMm(px: number): number {
    return px / 3.7795275591;
}

/**
 * Calculate content height for a page
 * (page height minus top and bottom margins)
 */
export function getPageContentHeight(pageSize: PageSize): number {
    return mmToPx(pageSize.height - pageSize.marginTop - pageSize.marginBottom);
}

/**
 * Split editor content nodes into pages based on height
 */
export function splitNodesIntoPages(
    nodes: Element[],
    pageContentHeight: number
): Element[][] {
    const pages: Element[][] = [];
    let currentPage: Element[] = [];
    let currentPageHeight = 0;

    nodes.forEach((node) => {
        const nodeHeight = node.getBoundingClientRect().height;

        // If adding this node would exceed page height, start a new page
        if (currentPageHeight + nodeHeight > pageContentHeight && currentPage.length > 0) {
            pages.push(currentPage);
            currentPage = [node];
            currentPageHeight = nodeHeight;
        } else {
            currentPage.push(node);
            currentPageHeight += nodeHeight;
        }
    });

    // Add the last page if it has content
    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    // Always have at least one page
    if (pages.length === 0) {
        pages.push([]);
    }

    return pages;
}

/**
 * Get all top-level block nodes from Tiptap editor
 */
export function getEditorBlockNodes(editor: any): Element[] {
    if (!editor || !editor.view || !editor.view.dom || editor.isDestroyed) return [];

    // Get the ProseMirror editor DOM element
    const proseMirror = editor.view.dom as HTMLElement;

    // Get direct children (top-level blocks like p, h1, h2, etc.)
    return Array.from(proseMirror.children);
}

/**
 * Calculate page breaks and return page information
 */
export function calculatePages(
    editor: any,
    pageSize: 'a4' | 'b5'
): { pageCount: number; pages: Element[][] } {
    if (!editor || !editor.view || !editor.view.dom || editor.isDestroyed) {
        return { pageCount: 1, pages: [[]] };
    }

    // Get the total height of the editor content
    const dom = editor.view.dom as HTMLElement;
    const totalHeight = dom.getBoundingClientRect().height;

    // Use FULL page height for calculation (since we are in continuous mode with overlays)
    // NOT content height (which subtracts margins)
    const size = PAGE_SIZES[pageSize];

    // Calculate page count based on total height / CONTENT HEIGHT (excluding margins)
    // This gives an accurate "Printed Page Count"
    const contentHeightPx = getPageContentHeight(size);
    const pageCount = Math.max(1, Math.ceil(totalHeight / contentHeightPx));

    return {
        pageCount,
        pages: Array(pageCount).fill([]), // Dummy pages array as we don't physically split nodes anymore
    };
}
