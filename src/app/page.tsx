'use client';

import { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Editor } from '@/components/editor/Editor';
import { SermonManager } from '@/components/sermons/SermonManager';
import { SermonVersionSidebar } from '@/components/sermons/SermonVersionSidebar';
import { ShortcutConfig, Sermon } from '@/shared/types';
import { matchShortcut } from '@/utils/shortcutUtils';

const USAGE_GUIDE = `
<div class="usage-guide">
  <h1>Welcome to Lumina Note Web</h1>
  <p>Congratulations! You are now using the web version of <strong>Lumina Note</strong>, a world-class writing environment crafted for clarity, focus, and a premium experience.</p>
  
  <div class="accent-block" style="background: var(--bg-accent); padding: 1.5rem; border-radius: 1rem; margin: 2rem 0; border: 1px solid var(--border-color);">
    <h3 style="margin-top: 0;">✨ Quick Tip: "Fiat Lux"</h3>
    <p>The Latin phrase <em>"Fiat Lux"</em> means "Let there be light." Our mission is to help you bring light to your ideas with zero distractions and maximum comfort.</p>
  </div>

  <h2>Keyboard Shortcuts (Optimized for Web)</h2>
  <p>Speed is essential for creative flow. Memorize these to never leave the keyboard:</p>
  <ul>
    <li><strong>Alt + S</strong>: <span style="color: var(--text-secondary)">Save your work.</span></li>
    <li><strong>Alt + O</strong>: <span style="color: var(--text-secondary)">Open your Sermon Archive.</span></li>
    <li><strong>Alt + N</strong>: <span style="color: var(--text-secondary)">Start a fresh, new document.</span></li>
    <li><strong>Alt + Enter</strong>: <span style="color: var(--text-secondary)">Insert a crisp Page Break.</span></li>
    <li><strong>Alt + L</strong>: <span style="color: var(--text-secondary)">Search the Scripture Database.</span></li>
    <li><strong>Alt + I</strong>: <span style="color: var(--text-secondary)">Launch AI Insights.</span></li>
  </ul>

  <hr style="border: none; border-top: 1px solid var(--border-color); margin: 3rem 0;" />
  
  <p style="text-align: center; font-style: italic; opacity: 0.8;">"In the beginning was the Word..." — Let's start writing yours.</p>
</div>
`;

function extractTitleFromHTML(html: string): string {
  if (!html || html.trim().length === 0) return 'Untitled Sermon';

  const headingMatch = html.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
  if (headingMatch) {
    const text = headingMatch[1].replace(/<[^>]*>/g, '').trim();
    if (text.length > 0) return text.substring(0, 50);
  }

  const paraMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (paraMatch) {
    const text = paraMatch[1].replace(/<[^>]*>/g, '').trim();
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length > 0) return firstLine.substring(0, 50);
  }

  return 'Untitled Sermon';
}

export default function Home() {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [openSermons, setOpenSermons] = useState<Sermon[]>([]);
  const [activeSermonId, setActiveSermonId] = useState<number | null>(null);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isSermonManagerOpen, setIsSermonManagerOpen] = useState(false);
  const [editorState, setEditorState] = useState<string>(USAGE_GUIDE);
  const [editorRemountKey, setEditorRemountKey] = useState(0);
  const [theme, setTheme] = useState<'default' | 'sepia' | 'dark' | 'blue'>('default');
  const [paperSize, setPaperSize] = useState<'a4' | 'b5'>('a4');
  const [viewMode, setViewMode] = useState<'editing' | 'print'>('editing');
  const [printMargins, setPrintMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 });
  const editorRef = useRef<any>(null);

  const [shortcuts, setShortcuts] = useState<ShortcutConfig>({
    save: 'Alt+s',
    scripture: 'Alt+l',
    ai: 'Alt+i',
    fullscreen: 'Alt+f',
    print: 'Alt+p',
    focus: 'Alt+Shift+f',
    h1: 'Alt+1',
    h2: 'Alt+2',
    h3: 'Alt+3',
    h4: 'Alt+4',
    blockquote: 'Alt+Shift+b',
    image: 'Alt+Shift+i',
    table: 'Alt+Shift+t',
    open: 'Alt+o',
    new: 'Alt+n',
    idea: 'Alt+Shift+v',
    settings: 'Alt+,',
    newPage: 'Alt+Enter'
  });

  // Persistence (Local and Open Sessions)
  useEffect(() => {
    const saved = localStorage.getItem('lumina-web-shortcuts');
    if (saved) {
      try { setShortcuts(JSON.parse(saved)); } catch (e) { console.error(e); }
    }

    const savedSermons = localStorage.getItem('lumina-web-open-sermons');
    if (savedSermons) {
      try {
        const parsed = JSON.parse(savedSermons);
        setOpenSermons(parsed);
        if (parsed.length > 0) {
          const activeId = localStorage.getItem('lumina-web-active-id');
          if (activeId) setActiveSermonId(Number(activeId));
          else setActiveSermonId(parsed[0].id);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina-web-open-sermons', JSON.stringify(openSermons));
  }, [openSermons]);

  useEffect(() => {
    if (activeSermonId) localStorage.setItem('lumina-web-active-id', activeSermonId.toString());
  }, [activeSermonId]);

  const handleSermonSelect = (sermon: Sermon) => {
    const existing = openSermons.find(s => s.id === sermon.id);
    if (existing) {
      setActiveSermonId(sermon.id);
    } else {
      setOpenSermons(prev => [...prev, sermon]);
      setActiveSermonId(sermon.id);
    }
    setIsSermonManagerOpen(false);
  };

  const handleCloseSermon = (id: number) => {
    const newOpen = openSermons.filter(s => s.id !== id);
    setOpenSermons(newOpen);
    if (activeSermonId === id) {
      setActiveSermonId(newOpen.length > 0 ? newOpen[newOpen.length - 1].id : null);
      if (newOpen.length === 0) {
        setEditorState(USAGE_GUIDE);
        setEditorRemountKey(prev => prev + 1);
      }
    }
  };

  const handleSaveSermon = (content?: string) => {
    const active = openSermons.find(s => s.id === activeSermonId);
    const htmlToSave = content || (active ? active.content : editorState);
    if (!htmlToSave) return;

    const title = extractTitleFromHTML(htmlToSave);

    if (active) {
      setOpenSermons(prev => prev.map(s =>
        s.id === active.id ? { ...s, title, content: htmlToSave, updated_at: new Date().toISOString() } : s
      ));
    } else {
      const newId = Date.now();
      const newSermon: Sermon = {
        id: newId,
        title,
        content: htmlToSave,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setOpenSermons(prev => [...prev, newSermon]);
      setActiveSermonId(newId);
    }
  };

  const handleNewSermon = () => {
    const newId = Date.now();
    const newSermon: Sermon = {
      id: newId,
      title: 'Untitled',
      content: '<p></p>',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setOpenSermons(prev => [...prev, newSermon]);
    setActiveSermonId(newId);
    setEditorState('<p></p>');
  };

  const handleDeleteSermon = (id: number) => {
    if (confirm('Are you sure you want to delete this sermon?')) {
      setOpenSermons(prev => prev.filter(s => s.id !== id));
      if (activeSermonId === id) {
        setActiveSermonId(null);
        setEditorState(USAGE_GUIDE);
        setEditorRemountKey(prev => prev + 1);
      }
    }
  };

  const currentSermon = openSermons.find(s => s.id === activeSermonId);
  const currentEditorContent = currentSermon ? currentSermon.content : editorState;

  // Global Key Listeners for Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.isTrusted) return;

      if (matchShortcut(e, shortcuts.new)) {
        e.preventDefault();
        handleNewSermon();
      }
      if (matchShortcut(e, shortcuts.open)) {
        e.preventDefault();
        setIsSermonManagerOpen(true);
      }
      if (matchShortcut(e, shortcuts.save)) {
        e.preventDefault();
        handleSaveSermon();
      }
      if (matchShortcut(e, shortcuts.focus)) {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <AppShell
      isFocusMode={isFocusMode}
      theme={theme}
      onThemeChange={setTheme}
      onSermonSelect={() => setIsSermonManagerOpen(true)}
      onToggleVersions={() => setIsVersionsOpen(!isVersionsOpen)}
      isSermonManagerOpen={isSermonManagerOpen}
      setIsSermonManagerOpen={setIsSermonManagerOpen}
      openDocuments={openSermons}
      activeDocumentId={activeSermonId}
      onSelectDocument={setActiveSermonId}
      onCloseDocument={handleCloseSermon}
      printMargins={printMargins}
      onPrintMarginsChange={setPrintMargins}
      paperSize={paperSize}
      onPaperSizeChange={setPaperSize}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      shortcuts={shortcuts}
      onShortcutsChange={setShortcuts}
    >
      <div className="flex-1 flex overflow-hidden relative">
        <Editor
          onFocusModeChange={setIsFocusMode}
          toolbarPosition='bottom'
          isFocusMode={isFocusMode}
          theme={theme}
          onThemeChange={setTheme}
          initialContent={currentEditorContent}
          key={`editor-${activeSermonId !== null ? activeSermonId : 'empty'}-${editorRemountKey}`}
          onContentChange={(content) => {
            if (activeSermonId !== null) {
              const newTitle = extractTitleFromHTML(content);
              setOpenSermons(prev => prev.map(s =>
                s.id === activeSermonId ? { ...s, content, title: newTitle } : s
              ));
            } else {
              setEditorState(content);
            }
          }}
          onEditorReady={(editor) => {
            editorRef.current = editor;
          }}
          onOpenArchive={() => setIsSermonManagerOpen(true)}
          onToggleVersions={() => setIsVersionsOpen(prev => !prev)}
          shortcuts={shortcuts}
          onShortcutsChange={setShortcuts}
          onSave={handleSaveSermon}
          onNew={handleNewSermon}
        />

        <SermonVersionSidebar
          isOpen={isVersionsOpen}
          onClose={() => setIsVersionsOpen(false)}
          currentSermonId={activeSermonId}
          onRestoreVersion={(version) => {
            if (editorRef.current) {
              editorRef.current.commands.setContent(version.content);
            }
            setIsVersionsOpen(false);
          }}
        />
      </div>

      <SermonManager
        isOpen={isSermonManagerOpen}
        onClose={() => setIsSermonManagerOpen(false)}
        onSelectSermon={handleSermonSelect}
        sermons={openSermons}
        onDelete={handleDeleteSermon}
      />
    </AppShell>
  );
}
