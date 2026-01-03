// @ts-nocheck - FlexSearch types are incomplete
import FlexSearch from 'flexsearch';
import { Sermon } from '@/shared/types';

/**
 * FlexSearch engine for fast client-side sermon search
 * Indexes: title, content, tags
 * Performance: <10ms for 1000+ documents
 */

export class SermonSearchEngine {
    private index: any;
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
     * @param query - Search terms
     * @param limit - Max results (default: 50)
     * @returns Array of sermon IDs matching the query
     */
    search(query: string, limit: number = 50): number[] {
        if (!this.isInitialized || !query.trim()) {
            return [];
        }

        console.time('FlexSearch Query');
        const results = this.index.search(query, {
            limit,
            enrich: true
        });
        console.timeEnd('FlexSearch Query');

        // FlexSearch returns results per field, we need to merge and deduplicate
        const sermonIds = new Set<number>();
        results.forEach((fieldResult: any) => {
            fieldResult.result.forEach((id: number) => {
                sermonIds.add(id);
            });
        });

        return Array.from(sermonIds);
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
    }

    /**
     * Remove a sermon from the index
     */
    removeSermon(sermonId: number) {
        this.index.remove(sermonId);
    }
}

// Singleton instance
export const sermonSearchEngine = new SermonSearchEngine();
