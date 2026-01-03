export interface Announcement {
    id: string;
    title: string;
    content: string; // HTML supported
    active: boolean;
    date: string;
    forceShow?: boolean; // Show even if already seen
    actionLabel?: string;
}

export const ACTIVE_ANNOUNCEMENT: Announcement = {
    id: 'welcome-v1',
    title: 'Lumina Note v1.0',
    content: `
        <p class="mb-4">Welcome to the official launch of Lumina Note.</p>
        <ul class="list-disc pl-5 space-y-2 mb-4 text-left">
            <li><strong>Google Drive Sync</strong>: Your sermons are safe and accessible.</li>
            <li><strong>Ergonomic Themes</strong>: 10 new themes designed for focus.</li>
            <li><strong>Focus Mode</strong>: Distraction-free writing environment.</li>
        </ul>
        <p>We are continuously improving. Thank you for being a part of this journey.</p>
    `,
    active: true,
    date: '2024-01-03',
    forceShow: false,
    actionLabel: 'Fiat Lux'
};
