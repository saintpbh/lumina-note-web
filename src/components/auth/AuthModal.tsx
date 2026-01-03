
import React from 'react';
import { Loader2, CheckCircle2, Cloud } from 'lucide-react';
import { GoogleUser } from '@/utils/googleDriveManager';

interface AuthModalProps {
    isOpen: boolean;
    status: 'idle' | 'checking' | 'creating' | 'welcome' | 'success';
    user: GoogleUser | null;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, status, user, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden">

                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <div className="flex flex-col items-center text-center space-y-6">

                    {/* Icon State */}
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        {status === 'checking' || status === 'creating' ? (
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        ) : status === 'success' || status === 'welcome' ? (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        ) : (
                            <Cloud className="w-8 h-8 text-blue-500" />
                        )}
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {status === 'checking' && 'Connecting to Google Drive...'}
                            {status === 'creating' && 'Setting up your workspace...'}
                            {status === 'welcome' && `Welcome, ${user?.name?.split(' ')[0]}!`}
                            {status === 'success' && 'Sync Complete'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {status === 'checking' && 'Verifying your account details.'}
                            {status === 'creating' && 'Creating "LuminaFlow" folder in your Drive to keep your sermons safe.'}
                            {status === 'welcome' && 'Your secure sermon workspace is ready. We’ve added a welcome note to get you started.'}
                            {status === 'success' && 'Your sermons are up to date.'}
                        </p>
                    </div>

                    {/* Actions */}
                    {(status === 'welcome' || status === 'success') && (
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                        >
                            {status === 'welcome' ? "Let's Start Writing" : "Open Workspace"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
