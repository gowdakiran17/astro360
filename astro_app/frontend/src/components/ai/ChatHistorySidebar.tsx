import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, MessageSquare, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface ChatSession {
    session_id: string;
    title: string;
    timestamp: string;
    message_count: number;
}

interface ChatHistorySidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onSessionSelect: (sessionId: string) => void;
    onNewChat: () => void;
    currentSessionId: string | null;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
    isOpen,
    onToggle,
    onSessionSelect,
    onNewChat,
    currentSessionId
}) => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await api.get('chat/sessions');
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to fetch chat sessions', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className={`relative h-full bg-slate-900/60 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col ${isOpen ? 'w-72' : 'w-12'} overflow-hidden`}>
            {/* Toggle Button - Always Visible */}
            <button
                onClick={onToggle}
                className={`absolute top-4 z-20 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg hover:scale-110 transition-all border border-white/20 ${isOpen ? 'right-4' : 'left-1/2 -translate-x-1/2'}`}
                title={isOpen ? 'Hide History' : 'Show History'}
            >
                {isOpen ? (
                    <ChevronLeft className="w-4 h-4 text-white" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-white" />
                )}
            </button>

            {/* Content */}
            <div className={`flex flex-col h-full ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        Chat History
                    </h3>

                    {/* New Chat Button */}
                    <button
                        onClick={() => {
                            onNewChat();
                            fetchSessions();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center text-slate-400 py-8">
                            <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center text-slate-400 py-8 text-xs">
                            No chat history yet
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <button
                                key={session.session_id}
                                onClick={() => {
                                    onSessionSelect(session.session_id);
                                }}
                                className={`w-full text-left p-3 rounded-lg transition-all ${currentSessionId === session.session_id
                                    ? 'bg-indigo-600/30 border border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                                    : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-xs font-medium text-white line-clamp-2 flex-1">
                                        {session.title}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTimestamp(session.timestamp)}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        {session.message_count} msgs
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHistorySidebar;
