/**
 * Print Engine - Tauri Native Version (SAFE)
 * 
 * CRITICAL FIX: Previous version used document.documentElement.innerHTML replacement
 * which destroyed React's event system, breaking all buttons and shortcuts.
 * 
 * This version uses CSS-based approach that is 100% safe.
 */

export interface PrintOptions {
    paperSize: 'a4' | 'b5';
    title?: string;
    margins?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

/**
 * Sanitize HTML content for printing
 * Removes Tiptap-specific attributes that can interfere with print layout
 */
function sanitizeForPrint(html: string): string {
    return html
        // Remove Tiptap data attributes
        .replace(/data-pm-slice="[^"]*"/g, '')
        .replace(/data-pm-node="[^"]*"/g, '')
        // Remove contenteditable
        .replace(/contenteditable="[^"]*"/g, '')
        // Clean ProseMirror class while keeping content
        .replace(/class="ProseMirror([^"]*)"/g, 'class="print-content$1"')
        // Remove drag handles and resize handles
        .replace(/<div[^>]*resize-handle[^>]*>.*?<\/div>/g, '')
        .replace(/<div[^>]*drag-handle[^>]*>.*?<\/div>/g, '');
}

/**
 * Print document using CSS-based approach (SAFE for React)
 */
export async function printDocument(contentHtml: string, options: PrintOptions): Promise<void> {
    console.log('[PRINT] 🖨️ Starting SAFE print process...', options);

    const { paperSize, title = 'Lumina Note', margins = { top: 20, right: 20, bottom: 20, left: 20 } } = options;

    // Sanitize content before printing
    const cleanHtml = sanitizeForPrint(contentHtml);

    try {
        // ====================================================================
        // 1. CREATE PRINT OVERLAY
        // ====================================================================
        // Instead of replacing the entire document, we create a hidden overlay
        // that only shows during @media print

        const printOverlay = document.createElement('div');
        printOverlay.id = 'lumina-print-overlay';
        printOverlay.className = 'lumina-print-overlay';

        const paperClass = paperSize === 'a4' ? 'paper-a4' : 'paper-b5';

        printOverlay.innerHTML = `
            <div class="paper-container">
                <div class="paper ${paperClass}">
                    ${cleanHtml}
                </div>
            </div>
        `;

        // ====================================================================
        // 2. INJECT PRINT STYLES
        // ====================================================================
        const printStyles = document.createElement('style');
        printStyles.id = 'lumina-print-styles';
        printStyles.textContent = `
            /* ============================================================
               PRINT OVERLAY STYLES (Only visible during print)
               ============================================================ */
            
            @media screen {
                /* Hide overlay on screen */
                .lumina-print-overlay {
                    display: none !important;
                }
            }
            
            @media print {
                /* Hide everything except print overlay */
                body > *:not(#lumina-print-overlay) {
                    display: none !important;
                }
                
                /* Show print overlay */
                .lumina-print-overlay {
                    display: block !important;
                    position: relative;
                    width: 100%;
                    background: white;
                }
                
                /* Page setup - CRITICAL for multi-page */
                /* Page setup - Hiding top headers by setting top margin to 0 */
                @page {
                    margin-top: 0mm !important;
                    margin-bottom: ${margins.bottom}mm;
                    margin-left: ${margins.left}mm;
                    margin-right: ${margins.right}mm;
                    size: ${paperSize === 'a4' ? 'A4' : 'B5'};
                }
                
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    padding-top: ${margins.top}mm !important; /* Compensate for 0 margin-top */
                    background: white !important;
                    overflow: visible !important;
                    height: auto !important;
                }
                
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    overflow: visible !important;
                }
                
                .paper-container {
                    width: 100%;
                    background: white;
                    overflow: visible !important;
                }
                
                .paper {
                    box-shadow: none !important;
                    margin: 0 !important;
                    border: none !important;
                    width: 100%;
                    max-width: 100%;
                    overflow: visible !important;
                    height: auto !important;
                    page-break-inside: auto;
                    orphans: 2;
                    widows: 2;
                }
                
                /* Ensure content flows across pages */
                .paper > * {
                    overflow: visible !important;
                }
                
                /* Page break handling */
                h1, h2, h3, h4, h5, h6 {
                    page-break-after: avoid;
                    break-after: avoid;
                }
                
                /* FONT MATCHING - Use same fonts as editor */
                .paper, .paper * {
                    font-family: 'KoPub Batang', 'Noto Serif KR', serif !important;
                }
                
                /* Preserve editor prose styles */
                .ProseMirror {
                    font-family: 'KoPub Batang', 'Noto Serif KR', serif !important;
                    line-height: 1.8 !important;
                }
                
                /* Hide elements that shouldn't print */
                .no-print {
                    display: none !important;
                }
                
                /* Remove any UI elements from print content */
                .no-print,
                button,
                .resize-handle,
                [data-resize-handle] {
                    display: none !important;
                }
            }
        `;

        // ====================================================================
        // 3. APPEND TO DOCUMENT
        // ====================================================================
        document.head.appendChild(printStyles);
        document.body.appendChild(printOverlay);

        console.log('[PRINT] ✓ Print overlay created');

        // ====================================================================
        // 4. UPDATE DOCUMENT TITLE
        // ====================================================================
        const originalTitle = document.title;
        document.title = title;

        // ====================================================================
        // 5. WAIT FOR FONTS/IMAGES IN OVERLAY
        // ====================================================================
        await new Promise<void>(resolve => {
            document.fonts.ready.then(() => {
                console.log('[PRINT] ✓ Fonts loaded');

                const images = printOverlay.querySelectorAll('img');
                if (images.length === 0) {
                    resolve();
                    return;
                }

                let loadedCount = 0;
                const checkAllLoaded = () => {
                    loadedCount++;
                    if (loadedCount === images.length) {
                        console.log('[PRINT] ✓ Images loaded');
                        resolve();
                    }
                };

                images.forEach(img => {
                    if (img.complete) {
                        checkAllLoaded();
                    } else {
                        img.addEventListener('load', checkAllLoaded);
                        img.addEventListener('error', checkAllLoaded);
                    }
                });

                setTimeout(resolve, 1000);
            });
        });

        // ====================================================================
        // 6. TRIGGER PRINT
        // ====================================================================
        console.log('[PRINT] 🖨️ Opening print dialog...');

        // Small delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Call print
        window.print();

        console.log('[PRINT] ✓ Print dialog opened');

        // ====================================================================
        // 7. CLEANUP (Using afterprint event for accurate timing)
        // ====================================================================
        // Use afterprint event to ensure cleanup happens AFTER print dialog closes
        // This prevents premature removal of print content

        const cleanup = () => {
            document.title = originalTitle;

            if (printOverlay.parentNode) {
                printOverlay.parentNode.removeChild(printOverlay);
            }
            if (printStyles.parentNode) {
                printStyles.parentNode.removeChild(printStyles);
            }
            console.log('[PRINT] ✓ Cleanup complete');
        };

        // Listen for afterprint event
        window.addEventListener('afterprint', cleanup, { once: true });

        // Fallback: also cleanup after 5 seconds if event doesn't fire
        setTimeout(() => {
            cleanup();
        }, 5000);

        console.log('[PRINT] ✅ Print process complete');

    } catch (error) {
        console.error('[PRINT] ❌ Print failed:', error);

        // Cleanup on error
        const overlay = document.getElementById('lumina-print-overlay');
        const styles = document.getElementById('lumina-print-styles');
        if (overlay) overlay.remove();
        if (styles) styles.remove();

        throw error;
    }
}

/**
 * Alternative: Generate PDF using Tauri backend (future enhancement)
 */
export async function printToPDF(contentHtml: string, options: PrintOptions): Promise<void> {
    console.warn('[PRINT] PDF generation not yet implemented');
    return printDocument(contentHtml, options);
}
