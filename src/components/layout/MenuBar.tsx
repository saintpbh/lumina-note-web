'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import {
    FileText, Edit3, Settings, HelpCircle, Plus, FolderOpen,
    Save, Download, Printer, Undo2, Redo2, Scissors,
    Copy, Clipboard, Layout, Maximize2, Palette, Zap,
    BookOpen, Activity, PlayCircle, Eye
} from 'lucide-react';

interface MenuBarProps {
    onAction: (actionId: string) => void;
    activeDocumentId: number | null;
    theme: string;
}

interface MenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    disabled?: boolean;
    divider?: boolean;
}

interface MenuSection {
    id: string;
    label: string;
    items: MenuItem[];
}

export const MenuBar: React.FC<MenuBarProps> = ({ onAction, activeDocumentId, theme }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const menus: MenuSection[] = [
        {
            id: 'file',
            label: 'File',
            items: [
                { id: 'new', label: 'New Sermon', icon: <Plus size={14} />, shortcut: 'Alt+N' },
                { id: 'open', label: 'Open Archive...', icon: <FolderOpen size={14} />, shortcut: 'Alt+O' },
                { id: 'divider1', label: '', divider: true },
                { id: 'save', label: 'Save', icon: <Save size={14} />, shortcut: 'Alt+S', disabled: !activeDocumentId },
                { id: 'export-pdf', label: 'Export as PDF', icon: <Download size={14} />, disabled: !activeDocumentId },
                { id: 'print', label: 'Print...', icon: <Printer size={14} />, shortcut: 'Alt+P', disabled: !activeDocumentId },
            ]
        },
        {
            id: 'edit',
            label: 'Edit',
            items: [
                { id: 'undo', label: 'Undo', icon: <Undo2 size={14} />, shortcut: '⌘Z' },
                { id: 'redo', label: 'Redo', icon: <Redo2 size={14} />, shortcut: '⌘⇧Z' },
                { id: 'divider1', label: '', divider: true },
                { id: 'cut', label: 'Cut', icon: <Scissors size={14} />, shortcut: '⌘X' },
                { id: 'copy', label: 'Copy', icon: <Copy size={14} />, shortcut: '⌘C' },
                { id: 'paste', label: 'Paste', icon: <Clipboard size={14} />, shortcut: '⌘V' },
            ]
        },
        {
            id: 'view',
            label: 'View',
            items: [
                { id: 'toggle-sidebar', label: 'Sidebar', icon: <Layout size={14} />, shortcut: 'Alt+\\' },
                { id: 'focus-mode', label: 'Focus Mode', icon: <Maximize2 size={14} />, shortcut: 'Alt+Shift+F' },
                { id: 'divider1', label: '', divider: true },
                { id: 'theme-default', label: 'Theme: Default', icon: <Palette size={14} /> },
                { id: 'theme-sepia', label: 'Theme: Sepia', icon: <Palette size={14} /> },
                { id: 'theme-dark', label: 'Theme: Dark', icon: <Palette size={14} /> },
            ]
        },
        {
            id: 'tools',
            label: 'Tools',
            items: [
                { id: 'ai-insights', label: 'AI Sermon Insights', icon: <Zap size={14} />, shortcut: 'Alt+I' },
                { id: 'bible-search', label: 'Bible Search', icon: <BookOpen size={14} />, shortcut: 'Alt+L' },
                { id: 'prompter', label: 'Prompter Mode', icon: <PlayCircle size={14} /> },
                { id: 'divider1', label: '', divider: true },
                { id: 'stats', label: 'Analytics', icon: <Activity size={14} /> },
            ]
        },
        {
            id: 'help',
            label: 'Help',
            items: [
                { id: 'guide', label: 'Usage Guide', icon: <HelpCircle size={14} /> },
                { id: 'settings', label: 'Settings', icon: <Settings size={14} />, shortcut: 'Alt+,' },
            ]
        }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (id: string) => {
        if (openMenu === id) {
            setOpenMenu(null);
        } else {
            setOpenMenu(id);
        }
    };

    const handleAction = (itemId: string, disabled?: boolean) => {
        if (disabled) return;
        onAction(itemId);
        setOpenMenu(null);
    };

    return (
        <div
            ref={menuRef}
            className={cn(
                "h-8 flex items-center px-4 select-none border-b transition-all duration-300 backdrop-blur-md z-[100]",
                theme === 'dark'
                    ? "bg-[#1C1C1E]/80 border-white/5 text-slate-300"
                    : "bg-white/80 border-gray-200 text-slate-700"
            )}
        >
            <div className="flex items-center space-x-1">
                {menus.map((menu) => (
                    <div key={menu.id} className="relative">
                        <button
                            onClick={() => handleMenuClick(menu.id)}
                            onMouseEnter={() => openMenu && setOpenMenu(menu.id)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded transition-colors",
                                openMenu === menu.id
                                    ? (theme === 'dark' ? "bg-white/10 text-white" : "bg-gray-100 text-black")
                                    : (theme === 'dark' ? "hover:bg-white/5" : "hover:bg-gray-100")
                            )}
                        >
                            {menu.label}
                        </button>

                        {openMenu === menu.id && (
                            <div
                                className={cn(
                                    "absolute top-full left-0 mt-1 w-56 rounded-lg shadow-2xl border p-1 animate-in fade-in slide-in-from-top-2 duration-150",
                                    theme === 'dark'
                                        ? "bg-[#2C2C2E]/95 border-white/10"
                                        : "bg-white/95 border-gray-200"
                                )}
                            >
                                {menu.items.map((item, idx) => (
                                    item.divider ? (
                                        <div key={`div-${idx}`} className={cn("my-1 border-t", theme === 'dark' ? "border-white/5" : "border-gray-100")} />
                                    ) : (
                                        <button
                                            key={item.id}
                                            disabled={item.disabled}
                                            onClick={() => handleAction(item.id, item.disabled)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-2 py-1.5 text-xs rounded transition-all",
                                                item.disabled
                                                    ? "opacity-30 cursor-not-allowed"
                                                    : theme === 'dark'
                                                        ? "hover:bg-blue-600 text-slate-200 hover:text-white"
                                                        : "hover:bg-blue-600 text-slate-700 hover:text-white"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 flex justify-center">{item.icon}</span>
                                                <span>{item.label}</span>
                                            </div>
                                            {item.shortcut && (
                                                <span className="opacity-50 text-[10px] ml-4">{item.shortcut}</span>
                                            )}
                                        </button>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex-1" />

            {activeDocumentId ? (
                <div className="flex items-center gap-2 text-[10px] font-medium opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>Autosaved to Browser Storage</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-[10px] font-medium opacity-50">
                    <span>Lumina Note Web v1.0.0</span>
                </div>
            )}
        </div>
    );
};
