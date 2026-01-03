'use server';

import { parse } from 'hwp.js';

export async function parseHwpAction(base64Data: string): Promise<string> {
    try {
        console.log('Server Action: Starting HWP parse. Data length:', base64Data.length);
        const buffer = Buffer.from(base64Data, 'base64');
        const uint8Array = new Uint8Array(buffer);
        console.log('Buffer converted, uint8Array size:', uint8Array.length);

        // Parse HWP on the server
        console.log('Calling hwp.js parse with { type: "binary" }...');
        // @ts-ignore
        const hwpObjects = await parse(uint8Array, { type: 'binary' });
        console.log('hwp.js parse completed.');

        let html = '';

        if (hwpObjects && hwpObjects.sections) {
            console.log('Processing', hwpObjects.sections.length, 'sections');
            hwpObjects.sections.forEach((section: any, sIdx: number) => {
                // Section content is an array of paragraphs
                if (section.content && Array.isArray(section.content)) {
                    section.content.forEach((paragraph: any) => {
                        let pText = "";

                        // Paragraph has content as an array of characters
                        if (paragraph.content && Array.isArray(paragraph.content)) {
                            paragraph.content.forEach((char: any) => {
                                // Some chars are strings, some are special values
                                if (typeof char.value === 'string') {
                                    pText += char.value;
                                } else if (char.value === 13) { // Newline in HWP
                                    // Normally handled by paragraph boundaries in our HTML output
                                }
                            });
                        }

                        // Only add non-empty paragraphs or meaningful spaces
                        if (pText.trim() || pText === "") {
                            html += `<p>${pText.trim() || '&nbsp;'}</p>`;
                        }
                    });
                }
            });
        }

        if (!html) {
            return "<p>[HWP 파일 내용을 읽을 수 없습니다. 텍스트가 없거나 호환되지 않는 버전입니다.]</p>";
        }

        return html;
    } catch (err: any) {
        console.error('Server-side HWP Parse error:', err);
        if (err.stack) console.error(err.stack);
        throw new Error(`HWP 파싱 중 서버 오류가 발생했습니다: ${err.message}`);
    }
}
