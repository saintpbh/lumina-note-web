
import React, { useState, useRef, useEffect } from 'react';
import { GoogleUser } from '@/utils/googleDriveManager';
import { LogOut, Cloud, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

interface UserProfileProps {
    user: GoogleUser;
    onLogout: () => void;
    syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
    theme: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, syncStatus, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const isDark = theme === 'dark' || (theme && ['nord', 'solarized-dark', 'gruvbox-dark', 'dracula', 'deep-forest', 'midnight-blue'].includes(theme));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 p-0.5 pr-2 rounded-full transition-all border",
                    isDark
                        ? "bg-white/5 border-white/10 hover:bg-white/10"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                )}
            >
                {user.picture ? (
                    <img
                        src={user.picture}
                        alt={user.name}
                        className="w-6 h-6 rounded-full"
                    />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                        {user.name.charAt(0)}
                    </div>
                )}
                <span className={cn(
                    "text-xs font-medium max-w-[100px] truncate hidden sm:block",
                    isDark ? "text-gray-300" : "text-gray-700"
                )}>
                    {user.name}
                </span>
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute top-full right-0 mt-2 w-64 rounded-xl shadow-2xl border p-4 animate-in fade-in zoom-in-95 duration-200 z-[150]",
                    isDark
                        ? "bg-[#2C2C2E] border-white/10"
                        : "bg-white border-gray-200"
                )}>
                    <div className="flex items-center gap-3 mb-4">
                        {user.picture ? (
                            <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white/10" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-lg text-white font-bold">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className={cn("font-bold text-sm truncate", isDark ? "text-white" : "text-gray-900")}>
                                {user.name}
                            </h4>
                            <p className={cn("text-xs truncate", isDark ? "text-gray-400" : "text-gray-500")}>
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-3",
                        syncStatus === 'synced' ? "bg-green-500/10 text-green-500" :
                            syncStatus === 'syncing' ? "bg-blue-500/10 text-blue-500" :
                                syncStatus === 'error' ? "bg-red-500/10 text-red-500" :
                                    "bg-gray-500/10 text-gray-500"
                    )}>
                        <Cloud size={14} className={syncStatus === 'syncing' ? 'animate-bounce' : ''} />
                        {syncStatus === 'synced' && 'All Synced & Safe'}
                        {syncStatus === 'syncing' && 'Syncing...'}
                        {syncStatus === 'error' && 'Sync Error - check connection'}
                        {syncStatus === 'idle' && 'Drive Connected'}
                    </div>

                    <div className={cn("h-px w-full my-1", isDark ? "bg-white/10" : "bg-gray-100")} />

                    <a
                        href="https://drive.google.com/drive/u/0/search?q=LuminaFlow"
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                            "flex items-center gap-2 w-full px-2 py-2 rounded-lg text-xs transition-colors mb-1",
                            isDark
                                ? "text-gray-300 hover:bg-white/5 hover:text-white"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <ExternalLink size={14} /> View in Google Drive
                    </a>

                    <button
                        onClick={onLogout}
                        className={cn(
                            "flex items-center gap-2 w-full px-2 py-2 rounded-lg text-xs transition-colors text-red-500",
                            isDark
                                ? "hover:bg-white/5"
                                : "hover:bg-red-50"
                        )}
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};
