/**
 * Estimates reading time for Korean text.
 * Average Korean reading speed is around 300-500 characters per minute for sermons.
 * We'll use 400 chars/min as a baseline.
 */
export const estimateReadingTime = (text: string): number => {
    const cleanText = text.replace(/<[^>]*>?/gm, ''); // Remove HTML tags
    const charCount = cleanText.trim().length;
    if (charCount === 0) return 0;

    // 400 chars per minute
    return Math.ceil(charCount / 400);
};

export const formatTime = (minutes: number): string => {
    if (minutes < 1) return 'Less than 1 min';
    if (minutes >= 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    }
    return `${minutes} min`;
};
