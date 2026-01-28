import React from 'react';
import { MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
    profileName?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ profileName }) => {
    return (
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
                <span className="text-2xl">🔮</span>
                <div>
                    <h2 className="font-bold text-slate-800 dark:text-white">AI Astrologer</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {profileName ? `Analyzing: ${profileName}` : 'Ready to guide you'}
                    </p>
                </div>
            </div>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-500" />
            </button>
        </div>
    );
};

export default ChatHeader;
