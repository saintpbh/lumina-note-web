// @ts-nocheck - FlexSearch types are incomplete
import FlexSearch from 'flexsearch';
import { Sermon } from '@/shared/types';

/**
 * FlexSearch engine for fast client-side sermon search
 * Indexes: title, content, tags
 * Performance: <10ms for 1000+ documents
 * Korean phrase search: whitespace-insensitive
 */

/**
 * Normalize Korean text by removing whitespace
 * This allows phrase searches to match regardless of spacing
 */
function normalizeKorean(text: string): string {
    // Check if text contains Korean characters
    const hasKorean = /[\u3131-\u318E\uAC00-\uD7A3]/.test(text);

    if (hasKorean) {
        // Remove all whitespace for Korean text
        return text.replace(/\s+/g, '');
    }

    return text;
}

export class SermonSearchEngine {
    private index: any;
    private rawIndex: Sermon[] = []; // Store raw sermons for fallback search
    private isInitialized = false;

    constructor() {
        this.index = new FlexSearch.Document({
            document: {
                id: 'id',
                index: ['title', 'content', 'tags'],
                store: ['title', 'created_at', 'updated_at', 'tags']
            },
            tokenize: 'forward',
            cache: true
        });
    }

    /**
     * Index all sermons for searching
     */
    indexSermons(sermons: Sermon[]) {
        console.time('FlexSearch Indexing');
        this.rawIndex = sermons; // Store for fallback search
        sermons.forEach(sermon => {
            this.index.add({
                id: sermon.id,
                title: sermon.title,
                content: sermon.content,
                tags: sermon.tags || '',
                created_at: sermon.created_at,
                updated_at: sermon.updated_at
            });
        });
        this.isInitialized = true;
        console.timeEnd('FlexSearch Indexing');
        console.log(`✅ Indexed ${sermons.length} sermons`);
    }

    /**
     * Search sermons by query
     * Supports both FlexSearch (fast word search) and Korean phrase search (whitespace-insensitive)
     */
    search(query: string, limit: number = 50): number[] {
        if (!this.isInitialized || !query.trim()) {
            return [];
        }

        // Check if query contains Korean and looks like a phrase (no spaces = phrase search request)
        const hasKorean = /[\u3131-\u318E\uAC00-\uD7A3]/.test(query);
        const normalizedQuery = normalizeKorean(query);

        console.time('FlexSearch Query');
        const results = this.index.search(query, {
            limit,
            enrich: true
        });
        console.timeEnd('FlexSearch Query');

        console.log('FlexSearch raw results:', results);

        // FlexSearch returns results per field, we need to merge and deduplicate
        const sermonIds = new Set<number>();

        if (Array.isArray(results)) {
            results.forEach((fieldResult: any) => {
                console.log('Field result:', fieldResult);
                if (fieldResult && Array.isArray(fieldResult.result)) {
                    fieldResult.result.forEach((item: any) => {
                        // item can be either an ID or an object with id property
                        const id = typeof item === 'object' ? item.id : item;
                        if (id != null) {
                            sermonIds.add(Number(id));
                        }
                    });
                }
            });
        }

        // If Korean phrase and we got no results, try whitespace-insensitive fallback
        if (hasKorean && sermonIds.size === 0 && query.includes(' ')) {
            console.log('Trying Korean phrase search fallback...');
            this.rawIndex.forEach(sermon => {
                const normalizedTitle = normalizeKorean(sermon.title);
                const normalizedContent = normalizeKorean(sermon.content);
                const normalizedTags = normalizeKorean(sermon.tags || '');

                if (normalizedTitle.includes(normalizedQuery) ||
                    normalizedContent.includes(normalizedQuery) ||
                    normalizedTags.includes(normalizedQuery)) {
                    sermonIds.add(sermon.id);
                }
            });
            console.log(`Korean phrase search found ${sermonIds.size} results`);
        }

        const idsArray = Array.from(sermonIds);
        console.log('Extracted sermon IDs:', idsArray);

        return idsArray;
    }

    /**
     * Clear the index
     */
    clear() {
        this.index = new FlexSearch.Document({
            document: {
                id: 'id',
                index: ['title', 'content', 'tags'],
                store: ['title', 'created_at', 'updated_at', 'tags']
            },
            tokenize: 'forward',
            cache: true
        });
        this.rawIndex = [];
        this.isInitialized = false;
    }

    /**
     * Update a single sermon in the index
     */
    updateSermon(sermon: Sermon) {
        this.index.update({
            id: sermon.id,
            title: sermon.title,
            content: sermon.content,
            tags: sermon.tags || '',
            created_at: sermon.created_at,
            updated_at: sermon.updated_at
        });

        // Update rawIndex
        const idx = this.rawIndex.findIndex(s => s.id === sermon.id);
        if (idx !== -1) {
            this.rawIndex[idx] = sermon;
        }
    }

    /**
     * Remove a sermon from the index
     */
    removeSermon(sermonId: number) {
        this.index.remove(sermonId);
        this.rawIndex = this.rawIndex.filter(s => s.id !== sermonId);
    }
}

// Singleton instance
export const sermonSearchEngine = new SermonSearchEngine();
