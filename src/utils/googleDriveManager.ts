/**
 * Google Drive API Manager for Web
 * Handles cross-platform sync with LuminaFlow desktop app.
 */

import { Sermon } from '@/shared/types';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const APP_FOLDER = 'LuminaFlow';

export interface GoogleUser {
    id: string;
    email: string;
    name: string;
    picture?: string;
}

export class GoogleDriveManager {
    private accessToken: string | null = null;
    private appFolderId: string | null = null;
    private simRevisions: Record<number, { id: string, modifiedTime: string, content: Sermon }[]> = {};

    setAccessToken(token: string | null) {
        this.accessToken = token;
        // Reset simulation data on logout/login if needed
        if (!token) this.simRevisions = {};
    }

    async getUserInfo(): Promise<GoogleUser | null> {
        if (!this.accessToken) return null;
        if (this.accessToken === 'sim-token') {
            return {
                id: 'sim-user-123',
                email: 'saintpbh@gmail.com',
                name: 'Saint PBH',
                picture: 'https://lh3.googleusercontent.com/a/ACg8ocL...'
            };
        }
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            return await response.json();
        } catch (e) {
            console.error('Failed to get user info:', e);
            return null;
        }
    }

    // ... fetchDrive ...
    private async fetchDrive(endpoint: string, options: RequestInit = {}) {
        if (!this.accessToken) throw new Error('No access token');

        const url = endpoint.startsWith('http') ? endpoint : `${DRIVE_API_BASE}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(`Google Drive API Error: ${response.status} ${JSON.stringify(err)}`);
        }

        return response.status === 204 ? null : response.json();
    }

    async checkWorkspaceStatus(): Promise<{ folderId: string, isNewUser: boolean }> {
        if (this.appFolderId) return { folderId: this.appFolderId!, isNewUser: false };
        if (this.accessToken === 'sim-token') return { folderId: 'sim-folder', isNewUser: false };

        const data = await this.fetchDrive(`/files?q=name='${APP_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id)`);

        if (data.files && data.files.length > 0) {
            this.appFolderId = data.files[0].id;
            return { folderId: this.appFolderId!, isNewUser: false };
        } else {
            const folder = await this.fetchDrive('/files', {
                method: 'POST',
                body: JSON.stringify({
                    name: APP_FOLDER,
                    mimeType: 'application/vnd.google-apps.folder'
                })
            });
            this.appFolderId = folder.id;
            return { folderId: this.appFolderId!, isNewUser: true };
        }
    }

    async ensureAppFolder(): Promise<string> {
        const { folderId } = await this.checkWorkspaceStatus();
        if (this.accessToken !== 'sim-token') {
            await this.ensureSubfolder('sermons');
        }
        return folderId;
    }

    private async ensureSubfolder(name: string): Promise<string> {
        if (this.accessToken === 'sim-token') return 'sim-folder-' + name;
        const parentId = await this.ensureAppFolder();
        const data = await this.fetchDrive(`/files?q=name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id)`);

        if (data.files && data.files.length > 0) {
            return data.files[0].id;
        }

        const folder = await this.fetchDrive('/files', {
            method: 'POST',
            body: JSON.stringify({
                name,
                parents: [parentId],
                mimeType: 'application/vnd.google-apps.folder'
            })
        });
        return folder.id;
    }

    async listSermons(): Promise<Sermon[]> {
        if (this.accessToken === 'sim-token') {
            // Return stored sims if any, else default
            return [
                {
                    id: 999,
                    title: 'Simulation Sermon (Cloud)',
                    content: '<h1>Cloud Sermon</h1><p>Greetings from saintpbh@gmail.com simulation!</p>',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    tags: 'simulation, cloud'
                }
            ];
        }
        const folderId = await this.ensureSubfolder('sermons');
        const data = await this.fetchDrive(`/files?q='${folderId}' in parents and trashed=false&fields=files(id, name)`);

        const sermons: Sermon[] = [];
        for (const file of data.files) {
            if (file.name.endsWith('.json')) {
                try {
                    const content = await this.fetchDrive(`/files/${file.id}?alt=media`);
                    sermons.push(content);
                } catch (e) {
                    console.error(`Failed to download sermon ${file.name}:`, e);
                }
            }
        }
        return sermons;
    }

    async saveSermon(sermon: Sermon) {
        if (this.accessToken === 'sim-token') {
            // Stateful Simulation Store
            if (!this.simRevisions[sermon.id]) {
                this.simRevisions[sermon.id] = [];
            }
            this.simRevisions[sermon.id].push({
                id: `sim-rev-${Date.now()}`,
                modifiedTime: new Date().toISOString(),
                content: { ...sermon }
            });
            console.log('[Sim] Saved revision to memory:', sermon.title);
            return;
        }
        const folderId = await this.ensureSubfolder('sermons');
        const fileName = `sermon_${sermon.id}.json`;

        // Check if file exists
        const data = await this.fetchDrive(`/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false&fields=files(id)`);

        const existingFileId = data.files && data.files.length > 0 ? data.files[0].id : null;

        const metadata = {
            name: fileName,
            parents: existingFileId ? undefined : [folderId],
            mimeType: 'application/json',
        };

        // We use simple upload for JSON data
        const url = existingFileId
            ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`
            : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

        if (existingFileId) {
            await fetch(url, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sermon)
            });
        } else {
            // Multipart upload for new file with metadata
            const boundary = '-------314159265358979323846';
            const delimiter = `\r\n--${boundary}\r\n`;
            const closeDelimiter = `\r\n--${boundary}--`;

            const body =
                delimiter +
                'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(sermon) +
                closeDelimiter;

            await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': `multipart/related; boundary=${boundary}`
                },
                body
            });
        }
    }

    async deleteSermon(sermonId: number) {
        if (this.accessToken === 'sim-token') {
            delete this.simRevisions[sermonId];
            return;
        }
        const folderId = await this.ensureSubfolder('sermons');
        const fileName = `sermon_${sermonId}.json`;
        const data = await this.fetchDrive(`/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false&fields=files(id)`);

        if (data.files && data.files.length > 0) {
            await this.fetchDrive(`/files/${data.files[0].id}`, { method: 'DELETE' });
        }
    }

    async createWelcomeFile() {
        if (this.accessToken === 'sim-token') return;

        const welcomeSermon: Sermon = {
            id: Date.now(),
            title: 'Welcome to Lumina Note',
            content: `<h1>Welcome to Lumina Note</h1>
<p>We are thrilled to have you here. Lumina Note is designed to bring <strong>clarity, focus, and peace</strong> to your writing process.</p>
<h2>Getting Started</h2>
<ul>
<li><strong>Focus Mode</strong>: Press <code>Alt+Shift+F</code> to enter a distraction-free environment.</li>
<li><strong>Cloud Sync</strong>: Your work is automatically synced to your <strong>Google Drive > LuminaFlow > sermons</strong> folder.</li>
<li><strong>Bible Search</strong>: Quickly find scripture with <code>Alt+L</code>.</li>
</ul>
<p>Start writing your first sermon by clicking the <strong>+ New Sermon</strong> button on the dashboard.</p>
<p><em>Fiat Lux — Let there be light.</em></p>`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: 'welcome, guide'
        };

        await this.saveSermon(welcomeSermon);
    }

    private async getFileId(sermonId: number): Promise<string | null> {
        const folderId = await this.ensureSubfolder('sermons');
        const fileName = `sermon_${sermonId}.json`;
        const data = await this.fetchDrive(`/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false&fields=files(id)`);

        return data.files && data.files.length > 0 ? data.files[0].id : null;
    }

    async listRevisions(sermonId: number): Promise<any[]> {
        if (this.accessToken === 'sim-token') {
            // Return stored stateful sims
            if (this.simRevisions[sermonId]) {
                return this.simRevisions[sermonId].map(r => ({
                    id: r.id,
                    modifiedTime: r.modifiedTime,
                    lastModifyingUser: { displayName: 'Saint PBH' }
                }));
            }
            return [
                { id: 'rev-1', modifiedTime: new Date(Date.now() - 3600000).toISOString(), lastModifyingUser: { displayName: 'Saint PBH' } },
                { id: 'rev-2', modifiedTime: new Date(Date.now() - 1800000).toISOString(), lastModifyingUser: { displayName: 'Saint PBH' } },
                { id: 'rev-3', modifiedTime: new Date().toISOString(), lastModifyingUser: { displayName: 'Saint PBH' } }
            ];
        }

        const fileId = await this.getFileId(sermonId);
        if (!fileId) return [];

        try {
            const data = await this.fetchDrive(`/files/${fileId}/revisions?fields=revisions(id,modifiedTime,lastModifyingUser)`);
            return data.revisions || [];
        } catch (e) {
            console.error('Failed to list revisions:', e);
            return [];
        }
    }

    async getRevisionContent(sermonId: number, revisionId: string): Promise<Sermon | null> {
        if (this.accessToken === 'sim-token') {
            const stored = this.simRevisions[sermonId]?.find(r => r.id === revisionId);
            if (stored) return stored.content;

            return {
                id: sermonId,
                title: 'Restored Version (Mock)',
                content: `<h1>Restored Content</h1><p>This is a simulation of revision ${revisionId}.</p>`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                tags: 'restored'
            };
        }

        const fileId = await this.getFileId(sermonId);
        if (!fileId) return null;

        try {
            const content = await this.fetchDrive(`/files/${fileId}/revisions/${revisionId}?alt=media`);
            return content;
        } catch (e) {
            console.error('Failed to get revision content:', e);
            return null;
        }
    }
}

export const googleDriveManager = new GoogleDriveManager();
