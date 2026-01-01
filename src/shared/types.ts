export interface BibleVerse {
    id: number;
    book: string;
    chapter: number;
    verse: number;
    content: string;
    version?: string;
}

export interface SearchResult {
    verses: BibleVerse[];
    total: number;
}

export type ShortcutConfig = Record<string, string>;

export interface EditorSettings {
    centerCursorOnType: boolean;
    toolbarVisibility: 'always' | 'hidden' | 'auto-hide';
    cursorStyle: 'block-large' | 'thin-bar' | 'underscore' | 'beam-thick';
    showOutline: boolean;
    showPageGuides: boolean;
    pageSpacerHeight: number;
    vignetteFont: 'serif' | 'sans' | 'mono' | 'handwriting';
    vignetteOpacity: number;
    vignetteColors: {
        amber: { bg: string, text: string };
        rose: { bg: string, text: string };
        sky: { bg: string, text: string };
        emerald: { bg: string, text: string };
    };
}

export interface Sermon {
    id: number;
    title: string;
    passage?: string;
    theme?: string;
    content: string;
    tags?: string;
    parent_id?: number | null;
    version_label?: string;
    created_at: string;
    updated_at: string;
    file_path?: string | null;
}
