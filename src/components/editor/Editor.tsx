'use client';

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { CustomImage } from './ImageExtension';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import debounce from 'lodash.debounce';

import { EditorToolbar } from './EditorToolbar';
import { ImagePropertiesModal } from './ImagePropertiesModal';
import { OutlineSidebar } from './OutlineSidebar';
import { Vignette, VignetteData } from './Vignette';
import { useStickyNotes } from './hooks/useStickyNotes';
import { ToastNotification, ToastType } from '../ui/ToastNotification';
import { BibleVerse, ShortcutConfig, EditorSettings, DEFAULT_PROMPTER_SETTINGS, PrompterSettings } from '@/shared/types';
import { LineHeight, LetterSpacing, Footnote } from './CustomExtensions';
import { PageBreak } from './PageBreakExtension';
import { PageSpacer } from './PageSpacer';
import { printDocument } from '@/utils/printEngine';
import { estimateReadingTime } from '@/utils/sermonUtils';
import { calculatePages } from '@/utils/pageUtils';
import { cn } from '@/utils/cn';
import { applyPageGaps } from '@/utils/pageGapManager';
import { matchShortcut } from '@/utils/shortcutUtils';
import { ScriptureModal } from '../scripture/ScriptureModal';
import { PrompterOverlay } from '../prompter/PrompterOverlay';

interface EditorProps {
    initialContent?: string;
    onFocusModeChange?: (isFocusMode: boolean) => void;
    toolbarPosition?: 'top' | 'bottom';
    isFocusMode: boolean;
    theme: 'default' | 'sepia' | 'dark' | 'blue';
    onThemeChange: (theme: 'default' | 'sepia' | 'dark' | 'blue') => void;
    onContentChange?: (content: string) => void;
    onEditorReady?: (editor: any) => void;
    onOpenArchive?: () => void;
    onToggleVersions?: () => void;
    onSave?: (html: string, filePath: string | null) => void;
    onNew?: () => void;
    shortcuts: ShortcutConfig;
    onShortcutsChange: (shortcuts: ShortcutConfig) => void;
}

export const Editor = ({
    initialContent: _initialContent,
    onFocusModeChange,
    toolbarPosition: _toolbarPosition = 'bottom',
    isFocusMode,
    theme,
    onThemeChange,
    onContentChange,
    onEditorReady,
    onOpenArchive,
    onToggleVersions,
    onSave,
    onNew,
    shortcuts,
    onShortcutsChange
}: EditorProps) => {
    const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
    const [isScriptureModalOpen, setIsScriptureModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPrompterOpen, setIsPrompterOpen] = useState(false);
    const [prompterSettings, setPrompterSettings] = useState<PrompterSettings>(DEFAULT_PROMPTER_SETTINGS);

    const [paperSize, setPaperSize] = useState<'a4' | 'b5'>('a4');
    const [viewMode, setViewMode] = useState<'editing' | 'print'>('editing');
    const [printMargins, setPrintMargins] = useState({
        top: 20, right: 20, bottom: 20, left: 20,
    });

    const [readingTime, setReadingTime] = useState(0);
    const [pageCount, setPageCount] = useState(1);
    const [zoom, setZoom] = useState(1.0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const [editorSettings, setEditorSettings] = useState<EditorSettings>({
        centerCursorOnType: true,
        toolbarVisibility: 'auto-hide' as 'always' | 'hidden' | 'auto-hide',
        cursorStyle: 'block-large',
        showOutline: true,
        showPageGuides: true,
        pageSpacerHeight: 25,
        vignetteFont: 'serif',
        vignetteOpacity: 90,
        vignetteColors: {
            amber: { bg: '#fef3c7', text: '#92400e' },
            rose: { bg: '#ffe4e6', text: '#9f1239' },
            sky: { bg: '#e0f2fe', text: '#075985' },
            emerald: { bg: '#dcfce7', text: '#065f46' }
        }
    });

    const [stickyNotes, setStickyNotes] = useState<VignetteData[]>([]);
    const { createStickyNote, updateStickyNote, deleteStickyNote } = useStickyNotes({
        stickyNotes,
        setStickyNotes
    });

    const editorSettingsRef = useRef(editorSettings);
    const paperSizeRef = useRef(paperSize);
    const shortcutsRef = useRef(shortcuts);
    const onContentChangeRef = useRef(onContentChange);

    useEffect(() => {
        editorSettingsRef.current = editorSettings;
        paperSizeRef.current = paperSize;
        shortcutsRef.current = shortcuts;
        onContentChangeRef.current = onContentChange;
    }, [editorSettings, paperSize, shortcuts, onContentChange]);

    const lowlight = useMemo(() => createLowlight(common), []);

    const extensions = useMemo(() => [
        StarterKit.configure({
            heading: { levels: [1, 2, 3, 4, 5, 6] },
            codeBlock: false,
            underline: false,
            link: false,
        }),
        Typography,
        TaskList,
        TaskItem.configure({ nested: true }),
        Underline,
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: 'text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 transition-colors',
            },
        }),
        CodeBlockLowlight.configure({
            lowlight,
            HTMLAttributes: {
                class: 'code-block-highlighted bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4 overflow-x-auto',
            },
        }),
        Placeholder.configure({
            placeholder: ({ node }) => {
                if (node.type.name === 'heading' && node.attrs.level === 1) return 'Enter title here';
                return 'Start writing your sermon...';
            }
        }),
        CustomImage.configure({
            allowBase64: true,
            HTMLAttributes: { class: 'my-4 mx-auto block' },
        }),
        Table.configure({
            resizable: true,
            cellMinWidth: 80,
            HTMLAttributes: {
                class: 'border-collapse table-auto w-full my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
            },
        }),
        TableRow, TableHeader, TableCell,
        TextStyle, FontFamily, Color,
        Extension.create({
            name: 'fontSize',
            addGlobalAttributes() {
                return [
                    {
                        types: ['textStyle'],
                        attributes: {
                            fontSize: {
                                default: null,
                                parseHTML: (element: HTMLElement) => element.style.fontSize,
                                renderHTML: attributes => {
                                    if (!attributes.fontSize) return {};
                                    return { style: `font-size: ${attributes.fontSize}` };
                                },
                            },
                        },
                    },
                ];
            },
        }),
        Highlight.configure({ multicolor: true }),
        LineHeight, LetterSpacing, Footnote, PageBreak,
        PageSpacer.extend({
            addKeyboardShortcuts() {
                return {
                    'Alt-Enter': () => {
                        const { pageCount: currentCount } = calculatePages(this.editor, paperSizeRef.current);
                        return this.editor.chain()
                            .insertContent({
                                type: this.name,
                                attrs: {
                                    height: `${editorSettingsRef.current.pageSpacerHeight}mm`,
                                    pageNumber: currentCount + 1
                                }
                            })
                            .focus()
                            .run();
                    },
                };
            },
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph', 'image'],
            alignments: ['left', 'center', 'right', 'justify'],
        }),
    ], []);

    const editor = useEditor({
        extensions,
        content: _initialContent !== undefined ? _initialContent : '',
        autofocus: 'end',
        onUpdate: async ({ editor }) => {
            if (!editor || editor.isDestroyed || !editor.view || !editor.view.dom) return;

            const html = editor.getHTML();
            const text = editor.getText();
            setReadingTime(estimateReadingTime(text));
            if (onContentChangeRef.current) {
                onContentChangeRef.current(html);
            }

            const newCount = await applyPageGaps(editor, paperSizeRef.current);
            if (newCount) setPageCount(newCount);

            if (editorSettingsRef.current.centerCursorOnType) {
                requestAnimationFrame(() => {
                    if (!editor || editor.isDestroyed || !editor.view || !editor.view.dom) return;
                    try {
                        const { from } = editor.state.selection;
                        const coords = editor.view.coordsAtPos(from);
                        const container = document.querySelector('.paper-container');

                        if (container && coords) {
                            const containerRect = container.getBoundingClientRect();
                            const cursorY = coords.top;

                            // Target 40% from the top of the viewport for eye-level typing
                            const targetY = containerRect.top + (containerRect.height * 0.4);
                            const diff = cursorY - targetY;

                            if (Math.abs(diff) > 2) { // Only scroll if needed
                                container.scrollBy({
                                    top: diff,
                                    behavior: 'auto' // Use auto for instant typewriter feel
                                });
                            }
                        }
                    } catch (e) {
                        console.error('Typewriter scroll failed:', e);
                    }
                });
            }
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none min-h-full selection:bg-blue-100 dark:selection:bg-blue-500/30',
                style: "font-family: 'KoPub Batang', serif;",
            }
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && onEditorReady) onEditorReady(editor);
    }, [editor, onEditorReady]);

    const handlePrint = async () => {
        if (!editor) return;
        setToast({ message: '인쇄 준비 중...', type: 'info' });
        try {
            await printDocument(editor.getHTML(), {
                paperSize,
                margins: printMargins,
                title: 'Lumina Note'
            });
            setToast({ message: '인쇄 시작', type: 'success' });
        } catch (e) {
            setToast({ message: '인쇄 실패', type: 'error' });
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && editor) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                if (typeof result === 'string') {
                    editor.chain().focus().setImage({ src: result }).run();
                }
            };
            reader.readAsDataURL(file);
        }
        if (event.target) event.target.value = '';
    };

    const addImage = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleToggleFocus = async () => {
        if (!onFocusModeChange) return;

        const newFocusState = !isFocusMode;
        onFocusModeChange(newFocusState);

        try {
            if (newFocusState) {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
            } else {
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                }
            }
        } catch (err) {
            console.error('Fullscreen toggle failed:', err);
        }
    };

    const handleInsertScripture = (verse: BibleVerse) => {
        if (!editor) return;

        // Use a cleaner HTML structure without extra whitespace from indentation
        const html = `<div class="bible-verse-insert my-6 p-5 bg-blue-50/40 dark:bg-blue-900/10 border-l-[6px] border-blue-500 rounded-r-2xl shadow-sm">` +
            `<div class="flex items-center gap-2 mb-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] luxury-mono">` +
            `<span class="w-2 h-2 rounded-full bg-blue-500/20"></span>` +
            `<span>${verse.book} ${verse.chapter}:${verse.verse}</span>` +
            `</div>` +
            `<div class="text-slate-700 dark:text-slate-200 luxury-serif italic leading-relaxed text-base">"${verse.content}"</div>` +
            `</div>` +
            `<p></p>`;

        editor.chain().focus().insertContent(html).run();
    };

    const [isToolbarVisible, setIsToolbarVisible] = useState(true);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetHideTimer = useCallback(() => {
        setIsToolbarVisible(true);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
            setIsToolbarVisible(false);
        }, 3000);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', resetHideTimer);
        return () => {
            window.removeEventListener('mousemove', resetHideTimer);
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, [resetHideTimer]);

    useEffect(() => {
        const handlePrintEvent = () => handlePrint();
        const handleAIEvent = () => setIsAIModalOpen(true);
        const handleBibleEvent = () => setIsScriptureModalOpen(true);
        const handlePrompterEvent = () => setIsPrompterOpen(true);

        window.addEventListener('trigger-print', handlePrintEvent);
        window.addEventListener('trigger-ai', handleAIEvent);
        window.addEventListener('trigger-bible', handleBibleEvent);
        window.addEventListener('trigger-prompter', handlePrompterEvent);

        return () => {
            window.removeEventListener('trigger-print', handlePrintEvent);
            window.removeEventListener('trigger-ai', handleAIEvent);
            window.removeEventListener('trigger-bible', handleBibleEvent);
            window.removeEventListener('trigger-prompter', handlePrompterEvent);
        };
    }, [handlePrint]);

    if (!editor) return null;

    return (
        <div className="flex-1 flex h-full overflow-hidden relative bg-gray-50 dark:bg-[#1E1E1E]">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />

            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                <div className="flex-1 overflow-auto paper-container custom-scrollbar" onScroll={resetHideTimer}>
                    <div
                        className="flex justify-center p-8 transition-transform duration-200 ease-out min-h-full"
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top center'
                        }}
                    >
                        <div className={cn(
                            "paper shadow-2xl relative",
                            paperSize === 'a4' ? "paper-a4" : "paper-b5",
                            viewMode === 'editing' ? "editing-mode" : "print-mode",
                            theme
                        )}>
                            <EditorContent editor={editor} />

                            {stickyNotes.map(note => (
                                <Vignette
                                    key={note.id}
                                    note={note}
                                    settings={editorSettings}
                                    onUpdate={updateStickyNote}
                                    onDelete={deleteStickyNote}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div
                    className={cn(
                        "p-4 flex justify-center z-10 pointer-events-none fixed bottom-0 left-0 right-0 transition-all duration-500 ease-in-out transform",
                        isToolbarVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                    )}
                    onMouseEnter={() => {
                        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
                        setIsToolbarVisible(true);
                    }}
                    onMouseLeave={resetHideTimer}
                >
                    <div className="pointer-events-auto w-full max-w-[210mm]">
                        <EditorToolbar
                            editor={editor}
                            theme={theme}
                            onThemeChange={onThemeChange}
                            paperSize={paperSize}
                            onPaperSizeChange={setPaperSize}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            onPrint={handlePrint}
                            onSave={() => onSave && onSave(editor.getHTML(), currentFilePath)}
                            onOpenScripture={() => setIsScriptureModalOpen(true)}
                            onOpenAI={() => setIsAIModalOpen(true)}
                            onOpenInsights={() => setIsInsightsOpen(true)}
                            addImage={addImage}
                            onCreateStickyNote={createStickyNote}
                            isFocusMode={isFocusMode}
                            onToggleFocusMode={handleToggleFocus}
                            readingTime={readingTime}
                            pageCount={pageCount}
                            zoom={zoom}
                            onZoomChange={setZoom}
                        />
                    </div>
                </div>
            </div>

            <OutlineSidebar editor={editor} />

            <ScriptureModal
                isOpen={isScriptureModalOpen}
                onClose={() => setIsScriptureModalOpen(false)}
                onInsert={handleInsertScripture}
            />

            {isPrompterOpen && (
                <PrompterOverlay
                    content={editor.getHTML()}
                    settings={prompterSettings}
                    onSettingsChange={(newSettings) => setPrompterSettings(prev => ({ ...prev, ...newSettings }))}
                    onClose={() => setIsPrompterOpen(false)}
                />
            )}

            {toast && (
                <ToastNotification
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};
