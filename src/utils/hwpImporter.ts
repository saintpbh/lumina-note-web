import { parseHwpAction } from '../app/actions/hwp';

export const importHwp = async (file: File): Promise<string> => {
    try {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onload = async (e) => {
                try {
                    const data = e.target?.result;
                    if (!data || !(data instanceof ArrayBuffer)) {
                        reject(new Error("File read error"));
                        return;
                    }

                    // Convert ArrayBuffer to Base64 to send to Server Action (Browser-safe)
                    const uint8Array = new Uint8Array(data);
                    let binary = '';
                    for (let i = 0; i < uint8Array.byteLength; i++) {
                        binary += String.fromCharCode(uint8Array[i]);
                    }
                    const base64Data = btoa(binary);

                    // Call Server Action
                    const html = await parseHwpAction(base64Data);

                    resolve(html);
                } catch (err) {
                    console.error('HWP Parse logic error:', err);
                    reject(err);
                }
            };

            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        });
    } catch (e) {
        console.error('HWP Import Error:', e);
        throw e;
    }
};
