
import React, { useEffect, useState } from 'react';
import { ACTIVE_ANNOUNCEMENT } from '@/config/announcements';
import { Sparkles, X } from 'lucide-react';
import { Analytics } from '@/utils/analytics';

interface WelcomeMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WelcomeMessageModal: React.FC<WelcomeMessageModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-white dark:bg-[#1C1C1E] text-center p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full mx-4 border border-white/20 overflow-hidden transform animate-in zoom-in-95 duration-300">

                {/* Decorative background glow */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointing-events-none" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointing-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner rotate-3">
                        <Sparkles className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
                    </div>

                    <h2 className="text-3xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">
                        {ACTIVE_ANNOUNCEMENT.title}
                    </h2>

                    <div
                        className="text-slate-600 dark:text-slate-300 mb-10 leading-relaxed text-lg prose dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: ACTIVE_ANNOUNCEMENT.content }}
                    />

                    <button
                        onClick={() => {
                            Analytics.logEvent('WelcomeModal_FiatLux_Clicked');
                            onClose();
                        }}
                        className="group relative inline-flex items-center justify-center px-8 py-3.5 text-lg font-bold text-white transition-all duration-200 bg-slate-900 dark:bg-white dark:text-black rounded-full hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-white"
                    >
                        <span>{ACTIVE_ANNOUNCEMENT.actionLabel || 'Fiat Lux'}</span>
                        <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
                    </button>

                    <p className="mt-4 text-[10px] text-slate-400 uppercase tracking-widest opacity-60">
                        Let there be light
                    </p>
                </div>
            </div>
        </div>
    );
};
