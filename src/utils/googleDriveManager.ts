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

    setAccessToken(token: string | null) {
        this.accessToken = token;
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

    async ensureAppFolder(): Promise<string> {
        if (this.appFolderId) return this.appFolderId;

        // Find LuminaFlow folder
        const data = await this.fetchDrive(`/files?q=name='${APP_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id)`);

        if (data.files && data.files.length > 0) {
            this.appFolderId = data.files[0].id;
        } else {
            // Create LuminaFlow folder
            const folder = await this.fetchDrive('/files', {
                method: 'POST',
                body: JSON.stringify({
                    name: APP_FOLDER,
                    mimeType: 'application/vnd.google-apps.folder'
                })
            });
            this.appFolderId = folder.id;
        }

        // Also ensure 'sermons' subfolder
        await this.ensureSubfolder('sermons');

        return this.appFolderId!;
    }

    private async ensureSubfolder(name: string): Promise<string> {
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
            console.log('[Sim] Saving sermon to cloud:', sermon.title);
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
        const folderId = await this.ensureSubfolder('sermons');
        const fileName = `sermon_${sermonId}.json`;
        const data = await this.fetchDrive(`/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false&fields=files(id)`);

        if (data.files && data.files.length > 0) {
            await this.fetchDrive(`/files/${data.files[0].id}`, { method: 'DELETE' });
        }
    }
}

export const googleDriveManager = new GoogleDriveManager();
