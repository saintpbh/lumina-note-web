// Imports moved to dynamic imports to prevent SSR issues

export type ExportFormat = 'md' | 'pdf' | 'docx' | 'rtf' | 'txt';

export const exportDocument = async (html: string, format: ExportFormat, filename: string, elementIdForPdf?: string) => {
    const safeFilename = filename.trim() || 'document';
    const fullName = `${safeFilename}.${format}`;

    try {
        switch (format) {
            case 'md':
                exportMarkdown(html, fullName);
                break;
            case 'txt':
                exportText(html, fullName);
                break;
            case 'docx':
                await exportDocx(html, fullName);
                break;
            case 'rtf':
                exportRtf(html, fullName);
                break;
            case 'pdf':
                if (elementIdForPdf) {
                    await exportPdf(elementIdForPdf, fullName);
                } else {
                    console.error('PDF export requires an element ID');
                }
                break;
        }
    } catch (e) {
        console.error('Export failed:', e);
        throw e;
    }
};

const exportMarkdown = async (html: string, filename: string) => {
    const TurndownService = (await import('turndown')).default;
    const { saveAs } = await import('file-saver');

    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
    });
    const markdown = turndownService.turndown(html);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, filename);
};

const exportText = async (html: string, filename: string) => {
    const { saveAs } = await import('file-saver');
    // Basic stripping of tags. For better results, we might use a DOM parser.
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
};

const exportDocx = async (html: string, filename: string) => {
    // @ts-ignore
    const { asBlob } = await import('html-docx-js-typescript');
    const { saveAs } = await import('file-saver');

    // Add basic styling for Word
    const styledHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; }
                h1 { font-size: 24pt; font-weight: bold; }
                h2 { font-size: 18pt; font-weight: bold; }
                p { font-size: 12pt; line-height: 1.5; margin-bottom: 1em; }
            </style>
        </head>
        <body>${html}</body>
        </html>
    `;

    // asBlob can take plain HTML string
    const blob = await asBlob(styledHtml, { orientation: 'portrait' });
    saveAs(blob as Blob, filename);
};

const exportRtf = async (html: string, filename: string) => {
    const { saveAs } = await import('file-saver');
    // Very basic RTF wrapper logic. Real RTF conversion is complex.
    // We treat it as HTML content that Wordpad might open, or try a partial conversion.
    // For simplicity/reliability in client-side without heavy libs, we stick to HTML saved as .rtf (Word works with it) 
    // OR we convert to Plain Text. 
    // A trick is using basic RTF header.

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.innerText.replace(/\n/g, '\\par ');

    // Minimal RTF Header
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}} \\f0\\fs24 ${text} }`;

    const blob = new Blob([rtfContent], { type: 'application/rtf;charset=utf-8' });
    saveAs(blob, filename);
};

const exportPdf = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Use dynamic import
    const { jsPDF } = await import('jspdf');

    // Use html2canvas + jsPDF
    // This creates an IMAGE based PDF. selectable text is harder.
    // For selectable text, we need 'html2pdf.js' functionality which uses html2canvas+context2d but puts text on top?
    // Or just simple jsPDF.html() method (new in recent versions).

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // We want to capture the element.
    // Note: This might be slow for long documents.

    // Better approach for multipage:
    // Tiptap's pagination + printing is usually handled via window.print().
    // True programmatic generation is hard.

    // Let's try jsPDF.html() which supports text selection.
    await pdf.html(element, {
        callback: (doc) => {
            doc.save(filename);
        },
        x: 10,
        y: 10,
        width: 190, // A4 width - margins
        windowWidth: 800 // Virtual window width to render css
    });
};
