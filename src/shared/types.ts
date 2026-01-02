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

export type PrompterTheme = 'dark' | 'light' | 'sepia' | 'night' | 'contrast';

export interface PrompterSettings {
    font_size: number;
    line_height: number;
    font_family: string;
    text_align: string;
    content_width: number;
    outline_display_mode: 'always' | 'auto' | 'off';
    controls_display_mode: 'always' | 'auto';
    timer_size: 'large' | 'medium' | 'small';
    primary_theme: PrompterTheme;
}

export const DEFAULT_PROMPTER_SETTINGS: PrompterSettings = {
    font_size: 48,
    line_height: 1.6,
    font_family: 'serif',
    text_align: 'center',
    content_width: 80,
    outline_display_mode: 'auto',
    controls_display_mode: 'auto',
    timer_size: 'medium',
    primary_theme: 'dark',
};
