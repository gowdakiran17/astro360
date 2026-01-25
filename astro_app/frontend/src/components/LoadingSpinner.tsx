import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = true, message = "Loading..." }: { fullScreen?: boolean, message?: string }) => {
    const content = (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 rounded-full animate-pulse"></div>
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
            </div>
            <p className="text-slate-500 font-medium animate-pulse">{message}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {content}
        </div>
    );
};

export default LoadingSpinner;
