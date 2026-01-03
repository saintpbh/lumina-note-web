export type ThemeId =
    | 'warm-paper'
    | 'solarized-light'
    | 'gruvbox-light'
    | 'soft-minimal'
    | 'nord'
    | 'solarized-dark'
    | 'gruvbox-dark'
    | 'dracula'
    | 'deep-forest'
    | 'midnight-blue';

export interface ThemeConfig {
    id: ThemeId;
    label: string;
    type: 'light' | 'dark';
    colors: {
        editorBg: string;
        paperBg: string;
        textMain: string;
        textMuted: string;
        accent: string;
        toolbarBg: string;
        toolbarBorder: string;
        bgSubtle: string;
    }
}

export const THEMES: ThemeConfig[] = [
    // LIGHT THEMES
    {
        id: 'warm-paper',
        label: 'Warm Paper',
        type: 'light',
        colors: {
            editorBg: '#F5E6C8',
            paperBg: '#FDF6E3', // Slightly lighter for paper
            textMain: '#483D2C',
            textMuted: '#8C7A65',
            accent: '#8B4513',
            toolbarBg: 'rgba(245, 230, 200, 0.95)',
            toolbarBorder: 'rgba(72, 61, 44, 0.1)',
            bgSubtle: 'rgba(72, 61, 44, 0.05)'
        }
    },
    {
        id: 'solarized-light',
        label: 'Solarized Light',
        type: 'light',
        colors: {
            editorBg: '#FDF6E3',
            paperBg: '#EEE8D5',
            textMain: '#586E75', // Adjusted for contrast
            textMuted: '#93A1A1',
            accent: '#268BD2', // Blue
            toolbarBg: 'rgba(253, 246, 227, 0.95)',
            toolbarBorder: 'rgba(88, 110, 117, 0.1)',
            bgSubtle: 'rgba(88, 110, 117, 0.05)'
        }
    },
    {
        id: 'gruvbox-light',
        label: 'Gruvbox Light',
        type: 'light',
        colors: {
            editorBg: '#FBF1C7',
            paperBg: '#F9F5D7',
            textMain: '#3C3836',
            textMuted: '#928374',
            accent: '#D65D0E', // Orange
            toolbarBg: 'rgba(251, 241, 199, 0.95)',
            toolbarBorder: 'rgba(60, 56, 54, 0.1)',
            bgSubtle: 'rgba(60, 56, 54, 0.05)'
        }
    },
    {
        id: 'soft-minimal',
        label: 'Soft Minimal',
        type: 'light',
        colors: {
            editorBg: '#F5F5F7',
            paperBg: '#FFFFFF',
            textMain: '#1D1D1F',
            textMuted: '#86868B',
            accent: '#0066CC',
            toolbarBg: 'rgba(245, 245, 247, 0.95)',
            toolbarBorder: 'rgba(0, 0, 0, 0.05)',
            bgSubtle: 'rgba(0, 0, 0, 0.03)'
        }
    },

    // DARK THEMES
    {
        id: 'nord',
        label: 'Nord',
        type: 'dark',
        colors: {
            editorBg: '#2E3440',
            paperBg: '#3B4252',
            textMain: '#D8DEE9',
            textMuted: '#4C566A',
            accent: '#88C0D0', // Frost
            toolbarBg: 'rgba(46, 52, 64, 0.95)',
            toolbarBorder: 'rgba(216, 222, 233, 0.1)',
            bgSubtle: 'rgba(216, 222, 233, 0.05)'
        }
    },
    {
        id: 'solarized-dark',
        label: 'Solarized Dark',
        type: 'dark',
        colors: {
            editorBg: '#002B36',
            paperBg: '#073642',
            textMain: '#839496',
            textMuted: '#586E75',
            accent: '#268BD2',
            toolbarBg: 'rgba(0, 43, 54, 0.95)',
            toolbarBorder: 'rgba(131, 148, 150, 0.1)',
            bgSubtle: 'rgba(131, 148, 150, 0.05)'
        }
    },
    {
        id: 'gruvbox-dark',
        label: 'Gruvbox Dark',
        type: 'dark',
        colors: {
            editorBg: '#282828',
            paperBg: '#32302F',
            textMain: '#EBDBB2',
            textMuted: '#A89984',
            accent: '#FB4934', // Red
            toolbarBg: 'rgba(40, 40, 40, 0.95)',
            toolbarBorder: 'rgba(235, 219, 178, 0.1)',
            bgSubtle: 'rgba(235, 219, 178, 0.05)'
        }
    },
    {
        id: 'dracula',
        label: 'Dracula',
        type: 'dark',
        colors: {
            editorBg: '#282A36',
            paperBg: '#44475A',
            textMain: '#F8F8F2',
            textMuted: '#6272A4',
            accent: '#FF79C6', // Pink
            toolbarBg: 'rgba(40, 42, 54, 0.95)',
            toolbarBorder: 'rgba(248, 248, 242, 0.1)',
            bgSubtle: 'rgba(248, 248, 242, 0.05)'
        }
    },
    {
        id: 'deep-forest',
        label: 'Deep Forest',
        type: 'dark',
        colors: {
            editorBg: '#3F3F3F',
            paperBg: '#4F4F4F',
            textMain: '#DCDCCC',
            textMuted: '#7F9F7F',
            accent: '#8CD0D3', // Cyan
            toolbarBg: 'rgba(63, 63, 63, 0.95)',
            toolbarBorder: 'rgba(220, 220, 204, 0.1)',
            bgSubtle: 'rgba(220, 220, 204, 0.05)'
        }
    },
    {
        id: 'midnight-blue',
        label: 'Midnight Blue',
        type: 'dark',
        colors: {
            editorBg: '#0F172A',
            paperBg: '#1E293B',
            textMain: '#E2E8F0',
            textMuted: '#64748B',
            accent: '#38BDF8', // Sky
            toolbarBg: 'rgba(15, 23, 42, 0.95)',
            toolbarBorder: 'rgba(226, 232, 240, 0.1)',
            bgSubtle: 'rgba(226, 232, 240, 0.05)'
        }
    }
];
