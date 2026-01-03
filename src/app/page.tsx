'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Editor } from '@/components/editor/Editor';
import { SermonManager } from '@/components/sermons/SermonManager';
import { SermonVersionSidebar } from '@/components/sermons/SermonVersionSidebar';
import { ShortcutConfig, Sermon } from '@/shared/types';
import { matchShortcut } from '@/utils/shortcutUtils';
import { Dashboard } from '@/components/ui/Dashboard';
import { googleDriveManager, GoogleUser } from '@/utils/googleDriveManager';
import { getSampleSermons } from '@/utils/sampleSermons';
import { ThemeManager } from '@/components/layout/ThemeManager';
import { ThemeId, THEMES } from '@/utils/themes';
import { AuthModal } from '@/components/auth/AuthModal';
import { WelcomeMessageModal } from '@/components/ui/WelcomeMessageModal';
import { Analytics } from '@/utils/analytics';
import { ACTIVE_ANNOUNCEMENT } from '@/config/announcements';
import { ExportModal, ExportFormat } from '@/components/io/ExportModal';
import { importFile } from '@/utils/importEngine';
import { exportDocument } from '@/utils/exportEngine';

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
  const [theme, setTheme] = useState<ThemeId>('warm-paper');
  const [paperSize, setPaperSize] = useState<'a4' | 'b5'>('a4');
  const [viewMode, setViewMode] = useState<'editing' | 'print'>('editing');
  const [printMargins, setPrintMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 });
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [authStatus, setAuthStatus] = useState<'idle' | 'checking' | 'creating' | 'welcome' | 'success'>('idle');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const editorRef = useRef<any>(null);
  const prevSermonsRef = useRef<Sermon[]>([]);

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

    const savedTheme = localStorage.getItem('lumina-web-theme');
    if (savedTheme && THEMES.some(t => t.id === savedTheme)) {
      setTheme(savedTheme as ThemeId);
    }

    // Analytics & Announcements
    Analytics.startSession();

    // Check Announcement
    if (ACTIVE_ANNOUNCEMENT.active) {
      const lastSeen = localStorage.getItem('lumina_last_announcement');
      if (ACTIVE_ANNOUNCEMENT.forceShow || lastSeen !== ACTIVE_ANNOUNCEMENT.id) {
        // Delay slightly for effect or wait for auth? 
        // Better to show immediately for impact, unless auth modal pops.
        // If auth modal is checking, maybe wait? 
        // Let's show it, z-index allows auth modal to be on top if needed.
        setTimeout(() => setIsWelcomeModalOpen(true), 500);
      }
    }

    // Handle Closing/Unloading for Analytics
    const handleUnload = () => Analytics.endSession();
    window.addEventListener('beforeunload', handleUnload);

    const savedSermons = localStorage.getItem('lumina-web-open-sermons');
    if (savedSermons) {
      try {
        const parsed = JSON.parse(savedSermons);
        setOpenSermons(parsed);
        // We no longer set activeSermonId on mount to ensure we always start at the Dashboard
      } catch (e) { console.error(e); }
    }

    // Initial check for Google Drive token
    const token = localStorage.getItem('google_drive_token');
    if (token) {
      try {
        googleDriveManager.setAccessToken(token);
        googleDriveManager.getUserInfo().then(u => {
          if (u) {
            setUser(u);
            handlePullFromCloud();
          } else {
            localStorage.removeItem('google_drive_token');
          }
        }).catch(err => {
          console.error('Failed to get user info:', err);
          localStorage.removeItem('google_drive_token');
          googleDriveManager.setAccessToken(null);
        });
      } catch (err) {
        console.error('Token validation error:', err);
        localStorage.removeItem('google_drive_token');
        googleDriveManager.setAccessToken(null);
      }
    }

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const handlePullFromCloud = async () => {
    setSyncStatus('syncing');
    try {
      const cloudSermons = await googleDriveManager.listSermons();
      if (cloudSermons.length > 0) {
        setOpenSermons(prev => {
          const localMap = new Map(prev.map(s => [s.id, s]));
          cloudSermons.forEach(s => localMap.set(s.id, s));
          return Array.from(localMap.values());
        });
        setSyncStatus('synced');
      } else {
        setSyncStatus('idle');
      }
    } catch (e) {
      console.error('Pull from GD failed:', e);
      setSyncStatus('error');
    }
  };

  const handleLogin = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert("Google Client ID is not configured.");
      return;
    }

    const redirectUri = window.location.origin + '/oauth/callback';
    const scope = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;

    const popup = window.open(authUrl, 'Google Login', 'width=500,height=600');

    const handleToken = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === 'google-token') {
        const { token } = event.data;
        localStorage.setItem('google_drive_token', token);
        googleDriveManager.setAccessToken(token);

        setIsAuthModalOpen(true);
        setAuthStatus('checking');

        try {
          const userInfo = await googleDriveManager.getUserInfo();
          setUser(userInfo);

          // Check/Create Workspace
          const { isNewUser } = await googleDriveManager.checkWorkspaceStatus();

          if (isNewUser) {
            setAuthStatus('creating');
            await new Promise(r => setTimeout(r, 1500)); // Visual delay
            await googleDriveManager.createWelcomeFile();
            await new Promise(r => setTimeout(r, 1000));
            setAuthStatus('welcome');
            // Don't auto-close for creating; let user click "Start"
            handlePullFromCloud(); // Pull the welcome file
          } else {
            setAuthStatus('success');
            handlePullFromCloud();
            setTimeout(() => {
              setIsAuthModalOpen(false);
              setAuthStatus('idle');
            }, 1500);
          }
        } catch (e) {
          console.error("Auth Setup Failed", e);
          setIsAuthModalOpen(false);
          alert("Failed to setup workspace. Please try again.");
        }

        window.removeEventListener('message', handleToken);
      }
    };
    window.addEventListener('message', handleToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('google_drive_token');
    googleDriveManager.setAccessToken(null);
    setUser(null);
    setSyncStatus('idle');
  };

  const handleToggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (e) {
      console.error('Fullscreen toggle failed:', e);
    }
  };

  const [lastCloudSync, setLastCloudSync] = useState<string | null>(null);

  // ... (previous code)

  const executeCloudSync = useCallback(async (sermonsToSync: Sermon[]) => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      await Promise.all(sermonsToSync.map(s => googleDriveManager.saveSermon(s)));
      setSyncStatus('synced');
      setLastCloudSync(new Date().toISOString());
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (e) {
      console.error('Cloud Sync failed:', e);
      setSyncStatus('error');
    }
  }, [user]);

  // Auto-sync Effect (Optimized)
  useEffect(() => {
    if (!user) return;

    // Compare current sermons with previous to detect actual changes
    const hasChanges = openSermons.some((sermon, idx) => {
      const prev = prevSermonsRef.current.find(p => p.id === sermon.id);
      if (!prev) return true; // New sermon
      return sermon.content !== prev.content || sermon.title !== prev.title;
    });

    if (!hasChanges) {
      console.log('[Auto-Save] No changes detected, skipping sync');
      return;
    }

    // Filter out empty or near-empty sermons
    const sermonsToSync = openSermons.filter(s => {
      if (!s.content) return false;
      // Remove HTML tags to check actual text content
      const textContent = s.content.replace(/<[^>]*>/g, '').trim();
      return textContent.length > 0;
    });

    if (sermonsToSync.length === 0) {
      console.log('[Auto-Save] No non-empty sermons to sync');
      return;
    }

    const syncTimeout = setTimeout(() => {
      executeCloudSync(sermonsToSync);
      // Update reference after successful sync initiation
      prevSermonsRef.current = [...openSermons];
    }, 10000); // 10 second debounce for Google Drive sync

    return () => clearTimeout(syncTimeout);
  }, [openSermons, user, executeCloudSync]);

  useEffect(() => {
    localStorage.setItem('lumina-web-open-sermons', JSON.stringify(openSermons));
  }, [openSermons]);

  useEffect(() => {
    if (activeSermonId) localStorage.setItem('lumina-web-active-id', activeSermonId.toString());
  }, [activeSermonId]);

  useEffect(() => {
    localStorage.setItem('lumina-web-theme', theme);
  }, [theme]);

  const handleSermonSelect = (sermon: Sermon) => {
    const existing = openSermons.find(s => s.id === sermon.id);
    if (existing) {
      setActiveSermonId(sermon.id);
    } else {
      setOpenSermons(prev => [...prev, sermon]);
      setActiveSermonId(sermon.id);
    }
    setIsSermonManagerOpen(false);
    setIsVersionsOpen(true);
  };

  const handleCloseSermon = (id: number) => {
    const newOpen = openSermons.filter(s => s.id !== id);
    setOpenSermons(newOpen);
    if (activeSermonId === id) {
      setActiveSermonId(newOpen.length > 0 ? newOpen[newOpen.length - 1].id : null);
    }
  };

  const handleSaveSermon = (content?: string, forceSync = false) => {
    const active = openSermons.find(s => s.id === activeSermonId);
    const htmlToSave = content || (active ? active.content : editorState);
    if (!htmlToSave) return;

    const title = extractTitleFromHTML(htmlToSave);
    let updatedList: Sermon[] = [];

    if (active) {
      updatedList = openSermons.map(s =>
        s.id === active.id ? { ...s, title, content: htmlToSave, updated_at: new Date().toISOString() } : s
      );
    } else {
      const newId = Date.now();
      const newSermon: Sermon = {
        id: newId,
        title,
        content: htmlToSave,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      updatedList = [...openSermons, newSermon];
      setActiveSermonId(newId);
    }

    setOpenSermons(updatedList);
    if (forceSync) {
      executeCloudSync(updatedList);
    }
  };

  const handleExport = async (format: ExportFormat, filename: string) => {
    if (!editorRef.current) return;
    const html = editorRef.current.getHTML();
    await exportDocument(html, format, filename, 'lumina-paper-export');
    setIsExportModalOpen(false);
  };

  const handleImportClick = () => {
    document.getElementById('import-input')?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { content, title } = await importFile(file);
      const newId = Date.now();
      const newSermon: Sermon = {
        id: newId,
        title: title || 'Imported Sermon',
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setOpenSermons(prev => [...prev, newSermon]);
      setActiveSermonId(newId);
      setIsVersionsOpen(true);
    } catch (err) {
      console.error(err);
      alert('Failed to import file.');
    } finally {
      e.target.value = '';
    }
  };

  const handleNewSermon = () => {
    const newId = Date.now();
    const newSermon: Sermon = {
      id: newId,
      title: 'Untitled Sermon',
      content: '<h1></h1><p></p>',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setOpenSermons(prev => [...prev, newSermon]);
    setActiveSermonId(newId);
    setEditorRemountKey(prev => prev + 1);
    setIsVersionsOpen(true);
  };

  const handleLoadSamples = () => {
    const samples = getSampleSermons();
    // Filter out samples that might already exist (by checking ID collision possibilities, though unlikely with Date.now())
    // Simply appending them
    setOpenSermons(prev => {
      // Create a map to avoid duplicates if user clicks multiple times? 
      // For simplicity, we just add them. The IDs should be unique enough relative to existing ones.
      // Actually, let's offset their IDs to ensure they are unique relative to "now"
      return [...prev, ...samples];
    });
    alert("3 Sample Sermons Loaded!");
  };

  const handleDeleteSermon = async (id: number) => {
    if (confirm('Are you sure you want to delete this sermon?')) {
      if (user) {
        await googleDriveManager.deleteSermon(id);
      }
      setOpenSermons(prev => prev.filter(s => s.id !== id));
      if (activeSermonId === id) {
        setActiveSermonId(null);
      }
    }
  };

  const currentSermon = openSermons.find(s => s.id === activeSermonId);
  const currentEditorContent = currentSermon ? currentSermon.content : '';

  const handleMenuAction = (actionId: string) => {
    switch (actionId) {
      case 'new': handleNewSermon(); break;
      case 'open': setIsSermonManagerOpen(true); break;
      case 'save': handleSaveSermon(); break;
      case 'print': if (editorRef.current) { window.dispatchEvent(new CustomEvent('trigger-print')); } break;
      case 'undo': editorRef.current?.commands.undo(); break;
      case 'redo': editorRef.current?.commands.redo(); break;
      case 'focus-mode': setIsFocusMode(!isFocusMode); break;
      case 'fullscreen': handleToggleFullScreen(); break;
      case 'login': handleLogin(); break;
      case 'bible-search': window.dispatchEvent(new CustomEvent('trigger-bible')); break;
      case 'prompter': window.dispatchEvent(new CustomEvent('trigger-prompter')); break;
      case 'fullscreen': handleToggleFullScreen(); break;
      case 'login': handleLogin(); break;
      case 'logout': handleLogout(); break;
      default:
        // Dynamic Theme Handling
        if (THEMES.some(t => t.id === actionId)) {
          setTheme(actionId as ThemeId);
          break;
        }
        console.log('Action not implemented:', actionId);
    }
  };

  // Global Key Listeners for Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.isTrusted) return;

      if (matchShortcut(e, shortcuts.new)) { e.preventDefault(); handleNewSermon(); }
      if (matchShortcut(e, shortcuts.open)) { e.preventDefault(); setIsSermonManagerOpen(true); }
      if (matchShortcut(e, shortcuts.save)) { e.preventDefault(); handleSaveSermon(); }
      if (matchShortcut(e, shortcuts.focus)) { e.preventDefault(); setIsFocusMode(prev => !prev); }
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
      onNewSermon={handleNewSermon}
      onAction={handleMenuAction}
      user={user}
      syncStatus={syncStatus}
    >
      <ThemeManager theme={theme} />
      <AuthModal
        isOpen={isAuthModalOpen}
        status={authStatus}
        user={user}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <WelcomeMessageModal
        isOpen={isWelcomeModalOpen}
        onClose={() => {
          setIsWelcomeModalOpen(false);
          localStorage.setItem('lumina_last_announcement', ACTIVE_ANNOUNCEMENT.id);
        }}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        defaultFilename={openSermons.find(s => s.id === activeSermonId)?.title || 'My Sermon'}
      />
      <input
        type="file"
        id="import-input"
        className="hidden"
        accept=".md,.markdown,.docx,.txt,.pdf,.hwp"
        onChange={handleFileImport}
      />
      <div className="flex-1 flex overflow-hidden relative">
        {activeSermonId === null ? (
          <Dashboard
            onNewSermon={handleNewSermon}
            onOpenArchive={() => setIsSermonManagerOpen(true)}
            recentSermons={openSermons}
            onSelectSermon={(s) => setActiveSermonId(s.id)}
            onLoadSamples={handleLoadSamples}
            theme={theme}
          />
        ) : (
          <Editor
            onFocusModeChange={setIsFocusMode}
            toolbarPosition='bottom'
            isFocusMode={isFocusMode}
            theme={theme}
            onThemeChange={setTheme}
            initialContent={currentEditorContent}
            key={`editor-${activeSermonId}-${editorRemountKey}`}
            onContentChange={(content) => {
              if (activeSermonId !== null) {
                const newTitle = extractTitleFromHTML(content);
                setOpenSermons(prev => prev.map(s =>
                  s.id === activeSermonId ? { ...s, content, title: newTitle } : s
                ));
              }
            }}
            onEditorReady={(editor) => {
              editorRef.current = editor;
            }}
            onOpenArchive={() => setIsSermonManagerOpen(true)}
            onToggleVersions={() => setIsVersionsOpen(prev => !prev)}
            shortcuts={shortcuts}
            onShortcutsChange={setShortcuts}
            onSave={(content) => handleSaveSermon(content, false)}
            onInstantSave={() => handleSaveSermon(undefined, true)}
            onImport={handleImportClick}
            onExport={() => setIsExportModalOpen(true)}
            onNew={handleNewSermon}
            ref={editorRef}
          />
        )}

        <SermonVersionSidebar
          isOpen={isVersionsOpen}
          onClose={() => setIsVersionsOpen(false)}
          currentSermonId={activeSermonId}
          onRestoreVersion={(version) => {
            // Update editor content
            if (editorRef.current) {
              // Preserve scroll position
              const container = document.querySelector('.paper-container');
              const savedScrollTop = container?.scrollTop;

              editorRef.current.commands.setContent(version.content);

              if (container && savedScrollTop !== undefined) {
                // Restore scroll after render
                requestAnimationFrame(() => {
                  container.scrollTop = savedScrollTop;
                });
              }
            }
            // Sidebar remains open
          }}
          lastSynced={lastCloudSync || undefined}
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
