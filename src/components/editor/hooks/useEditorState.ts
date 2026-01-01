import { useState, useEffect } from 'react';
import { VignetteData } from '../Vignette';
import { ToastType } from '../../ui/ToastNotification';

export interface PrintMargins {
    top: number;     // mm
    right: number;   // mm
    bottom: number;  // mm
    left: number;    // mm
}

export interface EditorSettings {
    fontSize: number;
    fontFamily: 'batang' | 'dotum' | 'sans';
    lineHeight: number;
    cursorStyle: 'default' | 'block' | 'beam';
    showOutline: boolean;
    pageSpacerHeight: number;
}

export interface EditorStateReturn {
    // File state
    currentFilePath: string | null;
    setCurrentFilePath: (path: string | null) => void;

    // Modal states
    isScriptureModalOpen: boolean;
    setIsScriptureModalOpen: (open: boolean) => void;
    isAIModalOpen: boolean;
    setIsAIModalOpen: (open: boolean) => void;
    isInsightsOpen: boolean;
    setIsInsightsOpen: (open: boolean) => void;

    // Editor configuration
    paperSize: 'a4' | 'b5';
    setPaperSize: (size: 'a4' | 'b5') => void;
    theme: 'default' | 'sepia' | 'dark' | 'blue';
    setTheme: (theme: 'default' | 'sepia' | 'dark' | 'blue') => void;
    isFullscreen: boolean;
    setIsFullscreen: (fullscreen: boolean) => void;
    printMargins: PrintMargins;
    setPrintMargins: (margins: PrintMargins) => void;

    // Content metrics
    readingTime: number;
    setReadingTime: (time: number) => void;
    pageCount: number;
    setPageCount: (count: number) => void;

    // Focus mode
    isFocusMode: boolean;
    setIsFocusMode: (focus: boolean) => void;

    // Editor settings
    editorSettings: EditorSettings;
    setEditorSettings: (settings: EditorSettings) => void;

    // Vignettes (formerly Sticky notes)
    stickyNotes: VignetteData[];
    setStickyNotes: (notes: VignetteData[] | ((prev: VignetteData[]) => VignetteData[])) => void;

    // Toast notifications
    toast: { message: string; type: ToastType } | null;
    setToast: (toast: { message: string; type: ToastType } | null) => void;
}

const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
    fontSize: 16,
    fontFamily: 'batang',
    lineHeight: 1.8,
    cursorStyle: 'default',
    showOutline: true,
    pageSpacerHeight: 40,
};

const DEFAULT_MARGINS: PrintMargins = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
};

/**
 * Centralized state management hook for the editor component.
 * Manages all editor-related state including file path, modals, settings, and UI state.
 */
export function useEditorState(): EditorStateReturn {
    // File state
    const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

    // Modal states
    const [isScriptureModalOpen, setIsScriptureModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);

    // Editor configuration
    const [paperSize, setPaperSize] = useState<'a4' | 'b5'>('a4');
    const [printMargins, setPrintMargins] = useState<PrintMargins>(DEFAULT_MARGINS);
    const [theme, setTheme] = useState<'default' | 'sepia' | 'dark' | 'blue'>('default');
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Content metrics
    const [readingTime, setReadingTime] = useState(0);
    const [pageCount, setPageCount] = useState(1);

    // Focus mode
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Editor settings
    const [editorSettings, setEditorSettings] = useState<EditorSettings>(DEFAULT_EDITOR_SETTINGS);

    // Vignettes
    const [stickyNotes, setStickyNotes] = useState<VignetteData[]>([]);

    // Toast notifications
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('editor-settings');
        if (savedSettings) {
            try {
                setEditorSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error('Failed to load editor settings:', e);
            }
        }

        const savedMargins = localStorage.getItem('print-margins');
        if (savedMargins) {
            try {
                setPrintMargins(JSON.parse(savedMargins));
            } catch (e) {
                console.error('Failed to load print margins:', e);
            }
        }

        const savedNotes = localStorage.getItem('sticky-notes');
        if (savedNotes) {
            try {
                setStickyNotes(JSON.parse(savedNotes));
            } catch (e) {
                console.error('Failed to load sticky notes:', e);
            }
        }
    }, []);

    // Save settings
    useEffect(() => {
        localStorage.setItem('editor-settings', JSON.stringify(editorSettings));
    }, [editorSettings]);

    // Save print margins
    useEffect(() => {
        localStorage.setItem('print-margins', JSON.stringify(printMargins));
    }, [printMargins]);

    // Save sticky notes to localStorage when they change
    useEffect(() => {
        localStorage.setItem('sticky-notes', JSON.stringify(stickyNotes));
    }, [stickyNotes]);

    return {
        currentFilePath,
        setCurrentFilePath,
        isScriptureModalOpen,
        setIsScriptureModalOpen,
        isAIModalOpen,
        setIsAIModalOpen,
        isInsightsOpen,
        setIsInsightsOpen,
        paperSize,
        setPaperSize,
        theme,
        setTheme,
        isFullscreen,
        setIsFullscreen,
        printMargins,
        setPrintMargins,
        readingTime,
        setReadingTime,
        pageCount,
        setPageCount,
        isFocusMode,
        setIsFocusMode,
        editorSettings,
        setEditorSettings,
        stickyNotes,
        setStickyNotes,
        toast,
        setToast,
    };
}
