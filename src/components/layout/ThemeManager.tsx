'use client';

import { useEffect } from 'react';
import { THEMES, ThemeId } from '@/utils/themes';

interface ThemeManagerProps {
    theme: ThemeId;
}

export const ThemeManager: React.FC<ThemeManagerProps> = ({ theme }) => {
    useEffect(() => {
        const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];
        const root = document.documentElement;

        // Helper to set variable
        const setVar = (name: string, value: string) => {
            root.style.setProperty(name, value);
        };

        setVar('--editor-bg', currentTheme.colors.editorBg);
        setVar('--paper-bg', currentTheme.colors.paperBg);
        setVar('--text-main', currentTheme.colors.textMain);
        setVar('--text-muted', currentTheme.colors.textMuted);
        setVar('--accent-color', currentTheme.colors.accent);
        setVar('--toolbar-bg', currentTheme.colors.toolbarBg);
        setVar('--toolbar-border', currentTheme.colors.toolbarBorder);
        setVar('--bg-subtle', currentTheme.colors.bgSubtle);

        // Update data-theme attribute for any Tailwind specific overrides
        root.setAttribute('data-theme', currentTheme.type);

        // Also toggle class='dark' if type is dark for Tailwind dark mode
        if (currentTheme.type === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

    }, [theme]);

    return null;
};
