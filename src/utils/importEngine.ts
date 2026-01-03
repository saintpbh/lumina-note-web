// Imports moved to dynamic imports inside functions to prevent SSR issues

// We need to set up the worker for PDF.js
// In Next.js/Webpack, we usually point to a CDN or local worker file.
// For simplicity in this env, we might rely on dynamic import or CDN.
// Let's try to set it dynamically if possible, or use the standard configured one if present.
// If this fails, we might need to simplify PDF import to "Not Supported" or install `pdfjs-dist` properly with worker copy.
// We'll trust the user has internet for CDN for now? No, local first.
// We will set GlobalWorkerOptions in the function if needed.

export const importFile = async (file: File): Promise<{ content: string; title: string }> => {
    const filename = file.name;
    const extension = filename.split('.').pop()?.toLowerCase();
    const title = filename.replace(/\.[^/.]+$/, "");

    let content = '';

    switch (extension) {
        case 'md':
        case 'markdown':
            content = await importMarkdown(file);
            break;
        case 'docx':
            content = await importDocx(file);
            break;
        case 'txt':
            content = await importText(file);
            break;
        case 'pdf':
            content = await importPdf(file);
            break;
        case 'hwp':
            const { importHwp } = await import('./hwpImporter');
            content = await importHwp(file);
            break;
        default:
            // Fallback: try reading as text
            content = await importText(file);
    }

    return { content, title };
};

const importMarkdown = async (file: File): Promise<string> => {
    const { marked } = await import('marked');
    const text = await file.text();
    return marked.parse(text) as string;
};

const importText = async (file: File): Promise<string> => {
    const text = await file.text();
    // Convert newlines to paragraphs
    return text.split('\n').map(line => `<p>${line}</p>`).join('');
};

const importDocx = async (file: File): Promise<string> => {
    const { default: mammoth } = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value; // The generated HTML
};

const importPdf = async (file: File): Promise<string> => {
    // Basic text extraction from PDF
    try {
        console.log('Starting PDF import...');
        const pdfjsLib = await import('pdfjs-dist');
        const version = pdfjsLib.version || '5.4.530';
        console.log('pdfjsLib loaded version:', version);

        // Use a more standard way to set the worker with https
        if (typeof window !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `<p>${pageText}</p>`;
        }

        return fullText;
    } catch (e) {
        console.error('PDF Import Error:', e);
        return '<p>[Error importing PDF - Text extraction failed]</p>';
    }
};
