import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    type: ToastType;
    message: string;
    description?: string;
    onClose?: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({
    type,
    message,
    description,
    onClose,
    duration = 5000
}) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose?.(), 300);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            iconColor: 'text-emerald-600',
            textColor: 'text-emerald-900',
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600',
            textColor: 'text-red-900',
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            iconColor: 'text-amber-600',
            textColor: 'text-amber-900',
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-900',
        },
    };

    const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type];

    if (!isVisible) return null;

    return (
        <div
            className={`${bgColor} ${borderColor} border-2 rounded-xl p-4 shadow-lg animate-slide-down max-w-md`}
            role="alert"
        >
            <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${textColor} text-sm`}>{message}</p>
                    {description && (
                        <p className={`${textColor} text-xs mt-1 opacity-80`}>{description}</p>
                    )}
                </div>
                {onClose && (
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(() => onClose(), 300);
                        }}
                        className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Toast;

interface ToastContainerProps {
    toasts: Array<{ id: string; type: ToastType; message: string; description?: string }>;
    onRemove: (id: string) => void;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
    toasts,
    onRemove,
    position = 'top-right'
}) => {
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
    };

    return (
        <div className={`fixed ${positionClasses[position]} z-50 space-y-3`}>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    type={toast.type}
                    message={toast.message}
                    description={toast.description}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};
