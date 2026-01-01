import { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Save,
    BookOpen,
    Wand2,
    BarChartBig,
    Type,
    Maximize2,
    Minimize2,
    Palette,
    Clock,
    Highlighter,
    Footprints,
    Printer,
    Check,
    ChevronDown,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Quote,
    Image,
    Table as TableIcon,
    StickyNote as StickyNoteIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Presentation
} from 'lucide-react';
import { formatTime } from '../../utils/sermonUtils';
import { useState } from 'react';

interface EditorToolbarProps {
    editor: Editor | null;
    onSave: () => void;
    onPrint: () => void;
    onOpenScripture: () => void;
    onOpenAI: () => void;
    onOpenInsights: () => void;
    addImage: () => void;
    onCreateStickyNote?: () => void;
    onOpenPrompter?: () => void;
    paperSize: 'a4' | 'b5';
    onPaperSizeChange: (size: 'a4' | 'b5') => void;
    theme: string;
    onThemeChange: (theme: any) => void;
    isFocusMode: boolean;
    onToggleFocusMode: () => void;
    readingTime: number;
    pageCount?: number;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    viewMode: 'editing' | 'print';
    onViewModeChange: (mode: 'editing' | 'print') => void;
}

const LUXURY_COLORS = [
    '#1A1A1B', '#444444', '#888888', '#DDDDDD',
    '#FFFFFF', '#E91E63', '#9C27B0', '#3F51B5',
    '#5865F2', '#009688', '#4CAF50', '#FFC107',
    '#795548', '#607D8B', '#B71C1C', '#1A237E'
];

export const EditorToolbar = ({
    editor,
    onSave,
    onPrint,
    onOpenScripture,
    onOpenAI,
    onOpenInsights,
    addImage,
    onCreateStickyNote,
    onOpenPrompter,
    paperSize,
    onPaperSizeChange,
    theme,
    onThemeChange,
    isFocusMode,
    onToggleFocusMode,
    readingTime,
    pageCount = 1,
    zoom,
    onZoomChange,
    viewMode,
    onViewModeChange,
}: EditorToolbarProps) => {
    const [showColors, setShowColors] = useState(false);
    const [showTableGrid, setShowTableGrid] = useState(false);
    const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 });

    if (!editor) {
        return null;
    }

    const setFontSize = (size: string) => {
        editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
    };

    return (
        <div
            className="flex flex-col gap-2 p-3 w-full max-w-[210mm] luxury-toolbar rounded-2xl z-20 no-drag border border-gray-200 dark:border-gray-800 select-none bg-white dark:bg-gray-900 shadow-2xl"
            onWheel={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-2 flex-wrap pb-1">
                <div className="flex items-center gap-1 theme-bg-subtle p-1 rounded-xl">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 rounded-lg transition-all luxury-toolbar-item ${editor.isActive('bold') ? 'bg-white dark:bg-white/10 shadow-md opacity-100 scale-110' : ''}`}
                        title="Bold (Cmd+B)"
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded-lg transition-all luxury-toolbar-item ${editor.isActive('italic') ? 'bg-white dark:bg-white/10 shadow-md opacity-100 scale-110' : ''}`}
                        title="Italic (Cmd+I)"
                    >
                        <Italic size={16} />
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowColors(!showColors)}
                            className="p-2 rounded-lg transition-all luxury-toolbar-item flex items-center gap-1"
                            title="Text Color"
                        >
                            <Palette size={16} style={{ color: editor.getAttributes('textStyle').color || 'inherit' }} />
                            <ChevronDown size={10} />
                        </button>

                        {showColors && (
                            <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="grid grid-cols-4 gap-1.5 w-32">
                                    {LUXURY_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                editor.chain().focus().setColor(color).run();
                                                setShowColors(false);
                                            }}
                                            className="w-6 h-6 rounded-md border border-black/10 transition-transform hover:scale-110 flex items-center justify-center p-0"
                                            style={{ backgroundColor: color }}
                                        >
                                            {editor.getAttributes('textStyle').color === color && <Check size={12} className={color === '#FFFFFF' || color === '#DDDDDD' ? 'text-black' : 'text-white'} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        className={`p-2 rounded-lg transition-all luxury-toolbar-item ${editor.isActive('highlight') ? 'bg-yellow-100 dark:bg-yellow-900/40 opacity-100' : ''}`}
                        title="Highlight"
                    >
                        <Highlighter size={16} />
                    </button>
                </div>

                <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />

                {/* Typography Luxury Settings */}
                <div className="flex items-center gap-2 theme-bg-subtle p-1 rounded-xl">
                    <div className="flex items-center gap-1.5 px-2">
                        <Type size={14} className="text-gray-800 dark:text-gray-200" />
                        <select
                            onChange={(e) => setFontSize(e.target.value)}
                            className="bg-transparent text-[11px] font-bold focus:outline-none w-10 luxury-mono text-black dark:text-white"
                            style={{ color: 'var(--text-main)', opacity: 1 }}
                            title="Font Size"
                            defaultValue="16px"
                        >
                            <option value="12px">12</option>
                            <option value="14px">14</option>
                            <option value="16px">16</option>
                            <option value="18px">18</option>
                            <option value="20px">20</option>
                            <option value="24px">24</option>
                            <option value="32px">32</option>
                        </select>
                    </div>

                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700/50 mx-1" />

                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={`p-1.5 rounded-lg transition-all luxury-toolbar-item ${editor.isActive('heading', { level: 1 }) ? 'bg-white dark:bg-white/10 shadow-sm opacity-100' : ''}`}
                            title="Heading 1 (Cmd+Alt+1)"
                        >
                            <Heading1 size={16} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`p-1.5 rounded-lg transition-all luxury-toolbar-item ${editor.isActive('heading', { level: 2 }) ? 'bg-white dark:bg-white/10 shadow-sm opacity-100' : ''}`}
                            title="Heading 2 (Cmd+Alt+2)"
                        >
                            <Heading2 size={16} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={`p-1.5 rounded-lg transition-all luxury-toolbar-item ${editor.isActive('heading', { level: 3 }) ? 'bg-white dark:bg-white/10 shadow-sm opacity-100' : ''}`}
                            title="Heading 3 (Cmd+3)"
                        >
                            <Heading3 size={16} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                            className={`p-1.5 rounded-lg transition-all luxury-toolbar-item ${editor.isActive('heading', { level: 4 }) ? 'bg-white dark:bg-white/10 shadow-sm opacity-100' : ''}`}
                            title="Heading 4 / Body (Cmd+4)"
                        >
                            <Heading4 size={16} />
                        </button>
                    </div>

                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700/50 mx-1" />

                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            className={`p-1.5 rounded-lg transition-all luxury-toolbar-item ${editor.isActive({ textAlign: 'left' }) ? 'bg-white dark:bg-white/10 shadow-sm opacity-100' : ''}`}
                            title="Align Left (Cmd+Shift+L)"
                        >
                            <AlignLeft size={16} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            className={`p-1.5 rounded-lg transition-all luxury-toolbar-item ${editor.isActive({ textAlign: 'center' }) ? 'bg-white dark:bg-white/10 shadow-sm opacity-100' : ''}`}
                            title="Align Center (Cmd+Shift+E)"
                        >
                            <AlignCenter size={16} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            className={`p-1.5 rounded-lg transition-all luxury-toolbar-item ${editor.isActive({ textAlign: 'right' }) ? 'bg-white dark:bg-white/10 shadow-sm opacity-100' : ''}`}
                            title="Align Right (Cmd+Shift+R)"
                        >
                            <AlignRight size={16} />
                        </button>
                    </div>

                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700/50 mx-1" />

                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={`p-1.5 rounded-lg transition-all luxury-toolbar-item ${editor.isActive('blockquote') ? 'bg-white dark:bg-white/10 shadow-sm opacity-100' : ''}`}
                            title="Blockquote (Cmd+Shift+B)"
                        >
                            <Quote size={16} />
                        </button>
                        <button
                            onClick={addImage}
                            className="p-1.5 rounded-lg transition-all luxury-toolbar-item hover:bg-white dark:hover:bg-white/10"
                            title="Insert Image (Cmd+Shift+I)"
                        >
                            <Image size={16} />
                        </button>
                    </div>
                </div>

                {/* MS Word-Style Table Grid Selector */}
                <div className="relative">
                    <button
                        onClick={() => {
                            const newState = !showTableGrid;
                            setShowTableGrid(newState);
                            if (newState) {
                                setShowColors(false);
                            }
                        }}
                        className="p-1.5 rounded-lg transition-all luxury-toolbar-item hover:bg-white dark:hover:bg-white/10"
                        title="Insert Table (Cmd+Shift+T)"
                    >
                        <TableIcon size={16} />
                    </button>

                    {showTableGrid && (
                        <div className="absolute bottom-full left-0 mb-2 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="text-[10px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 text-center luxury-mono">
                                {hoveredCell.row > 0 && hoveredCell.col > 0
                                    ? `${hoveredCell.row} × ${hoveredCell.col} Table`
                                    : 'Select Table Size'}
                            </div>
                            <div className="grid grid-cols-8 gap-1.5">
                                {Array.from({ length: 64 }, (_, i) => {
                                    const row = Math.floor(i / 8) + 1;
                                    const col = (i % 8) + 1;
                                    const isHighlighted = row <= hoveredCell.row && col <= hoveredCell.col;
                                    return (
                                        <div
                                            key={i}
                                            onMouseEnter={() => setHoveredCell({ row, col })}
                                            onClick={() => {
                                                editor.chain().focus().insertTable({ rows: row, cols: col, withHeaderRow: true }).run();
                                                setShowTableGrid(false);
                                                setHoveredCell({ row: 0, col: 0 });
                                            }}
                                            className={`w-5 h-5 border-2 transition-all cursor-pointer rounded ${isHighlighted
                                                ? 'bg-[var(--accent-color)] border-[var(--accent-color)] opacity-80 scale-105'
                                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-[var(--accent-color)] hover:scale-110'
                                                }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {onCreateStickyNote && (
                    <>
                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700/50 mx-1" />
                        <button
                            onClick={onCreateStickyNote}
                            className="p-1.5 rounded-lg transition-all luxury-toolbar-item hover:bg-white dark:hover:bg-white/10"
                            title="Add Sticky Note"
                        >
                            <StickyNoteIcon size={16} />
                        </button>
                    </>
                )}

                <select
                    onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                    className="bg-transparent text-[11px] font-bold focus:outline-none border-l border-gray-200 dark:border-gray-800 pl-3 w-28 luxury-serif text-black dark:text-white"
                    style={{ color: 'var(--text-main)', opacity: 1 }}
                    title="Font Family"
                    defaultValue="'KoPub Batang', serif"
                >
                    <option value="'KoPub Batang', serif">KoPub Batang</option>
                    <option value="'KoPub Dotum', sans-serif">KoPub Dotum</option>
                    <option value="Inter, sans-serif">Modern Sans</option>
                    <option value="serif">Classic Serif</option>
                </select>

                <select
                    onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
                    className="bg-transparent text-[11px] font-bold focus:outline-none border-l border-gray-200 dark:border-gray-800 pl-3 luxury-mono text-black dark:text-white"
                    style={{ color: 'var(--text-main)', opacity: 1 }}
                    title="Line Height"
                    defaultValue="1.5"
                >
                    <option value="0.8">0.8</option>
                    <option value="1.0">1.0</option>
                    <option value="1.2">1.2</option>
                    <option value="1.4">1.4</option>
                    <option value="1.5">1.5</option>
                    <option value="1.6">1.6</option>
                    <option value="1.8">1.8</option>
                    <option value="2.0">2.0</option>
                </select>
            </div>

            <div className="flex-1" />

            {/* Action & View Group */}
            <div className="flex items-center gap-1 theme-bg-subtle p-1 rounded-xl">
                {/* v0.1.2/3 Zoom Controller - Tight Grouping */}
                <div className="flex items-center mr-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10">
                    <button
                        onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
                        className="p-1.5 luxury-toolbar-item hover:bg-white dark:hover:bg-white/10 rounded-l-lg transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut size={14} />
                    </button>
                    <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                    <span
                        className="text-[10px] font-bold px-2 luxury-mono min-w-[45px] text-center text-black dark:text-white"
                        style={{ color: 'var(--text-main)', opacity: 1 }}
                    >
                        {Math.round(zoom * 100)}%
                    </span>
                    <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                    <button
                        onClick={() => onZoomChange(Math.min(2.0, zoom + 0.1))}
                        className="p-1.5 luxury-toolbar-item hover:bg-white dark:hover:bg-white/10 transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn size={14} />
                    </button>
                    <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                    <button
                        onClick={() => onZoomChange(1.0)}
                        className="p-1.5 luxury-toolbar-item hover:bg-white dark:hover:bg-white/10 rounded-r-lg transition-colors"
                        title="Reset Zoom"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>

                <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />

                <select
                    value={paperSize}
                    onChange={(e) => onPaperSizeChange(e.target.value as 'a4' | 'b5')}
                    className="bg-transparent text-[10px] font-bold focus:outline-none uppercase px-2 luxury-mono text-black dark:text-white"
                    style={{ color: 'var(--text-main)', opacity: 1 }}
                >
                    <option value="a4">A4 PAGE</option>
                    <option value="b5">B5 PAGE</option>
                </select>

                {/* View Mode Toggle - Prominent */}
                <button
                    onClick={() => onViewModeChange(viewMode === 'editing' ? 'print' : 'editing')}
                    className={`px-3 py-1.5 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider ${viewMode === 'print'
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    title={`${viewMode === 'editing' ? '인쇄 모드로 전환' : '편집 모드로 전환'} (Cmd+Shift+M)`}
                >
                    {viewMode === 'editing' ? '🖨️ 인쇄' : '✏️ 편집'}
                </button>

                <button
                    onClick={() => {
                        const themes: any[] = ['default', 'sepia', 'dark', 'blue'];
                        const next = themes[(themes.indexOf(theme) + 1) % themes.length];
                        onThemeChange(next);
                    }}
                    className="p-2 rounded-lg luxury-toolbar-item"
                    title="Switch Vibe"
                >
                    <Palette size={16} />
                </button>

                <button
                    onClick={onToggleFocusMode}
                    className={`p-2 rounded-lg luxury-toolbar-item ${isFocusMode ? 'text-blue-500' : ''}`}
                    title="Enter Focus Mode"
                >
                    {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                <button
                    onClick={onPrint}
                    className="p-2 rounded-lg luxury-toolbar-item hover:text-orange-500"
                    title="Print Sermon"
                >
                    <Printer size={16} />
                </button>
            </div>

            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2 mt-1 px-1">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold theme-text-muted uppercase tracking-[0.2em] theme-bg-subtle px-3 py-1 rounded-full luxury-mono items-center flex">
                        <Clock size={10} className="mb-0.5" />
                        EST. PACE: <span className="theme-accent ml-1">{formatTime(readingTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold theme-text-muted uppercase tracking-[0.2em] theme-bg-subtle px-3 py-1 rounded-full luxury-mono">
                        PAGES: <span className="theme-accent ml-1">{pageCount}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            let count = 0;
                            editor.state.doc.descendants(n => {
                                if (n.type.name === 'footnote') count++;
                            });
                            editor.chain().focus().insertContent({
                                type: 'footnote',
                                attrs: { number: count + 1 }
                            }).run();
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold theme-text-muted hover:theme-bg-subtle uppercase tracking-widest transition-all luxury-serif"
                    >
                        <Footprints size={14} /> Annotate
                    </button>

                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-800" />

                    <div className="flex items-center gap-1">
                        <button
                            onClick={onOpenInsights}
                            className="p-2 rounded-lg luxury-toolbar-item hover:theme-accent transition-colors"
                            title="Sermon Insights"
                        >
                            <BarChartBig size={16} />
                        </button>
                        <button
                            onClick={onOpenScripture}
                            className="p-2 rounded-lg luxury-toolbar-item hover:theme-accent transition-colors"
                            title="Scripture Reference"
                        >
                            <BookOpen size={16} />
                        </button>
                        <button
                            onClick={onOpenAI}
                            className="p-2 rounded-lg luxury-toolbar-item hover:theme-accent transition-colors"
                            title="AI Muse"
                        >
                            <Wand2 size={16} />
                        </button>
                        {onOpenPrompter && (
                            <button
                                onClick={onOpenPrompter}
                                className="p-2 rounded-lg luxury-toolbar-item hover:theme-accent transition-colors"
                                title="Prompter Mode"
                            >
                                <Presentation size={16} />
                            </button>
                        )}
                        <button
                            onClick={onSave}
                            className="p-2 rounded-lg luxury-toolbar-item hover:theme-accent transition-colors"
                            title="Commit Changes"
                        >
                            <Save size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};
