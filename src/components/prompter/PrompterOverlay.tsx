'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, X, ChevronUp, ChevronDown, RotateCcw, Settings as SettingsIcon } from 'lucide-react';
import { PrompterSettings, PrompterTheme } from '@/shared/types';
import { PrompterSettingsModal } from './PrompterSettingsModal';

interface PrompterOverlayProps {
    content: string;
    onClose: () => void;
    settings: PrompterSettings;
    onSettingsChange: (settings: Partial<PrompterSettings>) => void;
}

const THEME_STYLES: Record<PrompterTheme, { bg: string; text: string }> = {
    dark: { bg: 'bg-black', text: 'text-white' },
    light: { bg: 'bg-white', text: 'text-slate-900' },
    sepia: { bg: 'bg-[#f4ecd8]', text: 'text-[#433422]' },
    night: { bg: 'bg-[#1a1b26]', text: 'text-[#a9b1d6]' },
    contrast: { bg: 'bg-black', text: 'text-yellow-400' },
};

export const PrompterOverlay: React.FC<PrompterOverlayProps> = ({ content, onClose, settings, onSettingsChange }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [speed, setSpeed] = useState(2); // Base speed
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);
    const scrollPosRef = useRef(0);

    const animate = useCallback((time: number) => {
        if (lastTimeRef.current !== null) {
            const deltaTime = time - lastTimeRef.current;
            const pixelsPerMs = (speed * 30) / 1000;
            const moveBy = pixelsPerMs * deltaTime;

            if (scrollContainerRef.current) {
                scrollPosRef.current += moveBy;
                scrollContainerRef.current.scrollTop = scrollPosRef.current;

                if (scrollPosRef.current >= scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight) {
                    setIsPlaying(false);
                }
            }
        }
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }, [speed]);

    useEffect(() => {
        if (isPlaying) {
            lastTimeRef.current = performance.now();
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            lastTimeRef.current = null;
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, animate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsPlaying(prev => !prev);
            } else if (e.code === 'ArrowUp') {
                setSpeed(prev => Math.min(10, prev + 0.5));
            } else if (e.code === 'ArrowDown') {
                setSpeed(prev => Math.max(0.5, prev - 0.5));
            } else if (e.code === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleRestart = () => {
        scrollPosRef.current = 0;
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
        setIsPlaying(false);
    };

    const themeStyle = THEME_STYLES[settings.primary_theme] || THEME_STYLES.dark;

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col transition-colors duration-700 ${themeStyle.bg} ${themeStyle.text}`}>
            {/* Controls Header */}
            <div className="flex items-center justify-between p-6 bg-black/5 dark:bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                    </button>

                    <div className="flex items-center gap-4 bg-black/10 dark:bg-white/10 px-4 py-2 rounded-2xl">
                        <button onClick={() => setSpeed(Math.max(0.5, speed - 0.5))} className="p-1 hover:text-blue-500"><ChevronDown size={20} /></button>
                        <span className="luxury-mono font-bold w-12 text-center text-sm">x{speed.toFixed(1)}</span>
                        <button onClick={() => setSpeed(Math.min(10, speed + 0.5))} className="p-1 hover:text-blue-500"><ChevronUp size={20} /></button>
                    </div>

                    <button
                        onClick={handleRestart}
                        className="p-3 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all text-slate-500"
                    >
                        <RotateCcw size={20} />
                    </button>

                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all text-slate-500"
                        title="Prompter Settings"
                    >
                        <SettingsIcon size={20} />
                    </button>
                </div>

                <div className="flex-1 text-center">
                    <span className="text-[10px] luxury-mono font-black uppercase tracking-[0.3em] opacity-30">
                        High-Performance Prompter
                    </span>
                </div>

                <button
                    onClick={onClose}
                    className="p-3 rounded-full hover:bg-red-500 hover:text-white transition-all text-slate-400"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Content Area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-[10vw] py-[20vh] custom-scrollbar selection:bg-blue-500/30"
                style={{ scrollBehavior: 'auto' }}
            >
                <div
                    className={`mx-auto leading-[1.6] pointer-events-none transition-all duration-300`}
                    style={{
                        maxWidth: `${settings.content_width}%`,
                        fontSize: `${settings.font_size}px`,
                        lineHeight: settings.line_height,
                        textAlign: settings.text_align as any,
                        fontFamily: settings.font_family === 'serif' ? 'KoPub Batang, serif' : settings.font_family === 'mono' ? 'monospace' : 'sans-serif'
                    }}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
                {/* Visual Guide Line */}
                <div className="fixed top-1/2 left-0 right-0 h-px bg-blue-500/20 pointer-events-none" />
            </div>

            {/* Instructions */}
            <div className="p-4 text-center text-[10px] luxury-mono uppercase tracking-widest opacity-20 pointer-events-none">
                Press SPACE to Play/Pause • Use Arrows for Speed • Click X to Exit
            </div>

            <PrompterSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSettingsChange={onSettingsChange}
            />
        </div>
    );
};
