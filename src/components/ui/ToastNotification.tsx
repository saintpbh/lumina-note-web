import { useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastNotificationProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

export function ToastNotification({
    message,
    type = 'success',
    duration = 3000,
    onClose
}: ToastNotificationProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <Check className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <AlertCircle className="w-5 h-5" />
    };

    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 fade-in duration-300">
            <div className={`
        ${colors[type]}
        px-4 py-3 rounded-lg shadow-2xl 
        flex items-center gap-3 min-w-[280px] max-w-[400px]
        backdrop-blur-sm
      `}>
                <div className="flex-shrink-0">
                    {icons[type]}
                </div>
                <div className="flex-1 text-sm font-medium">
                    {message}
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:opacity-70 transition-opacity"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
