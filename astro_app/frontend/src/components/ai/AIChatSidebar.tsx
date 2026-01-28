import { Plus, Trash2, Zap, FileText, Compass } from 'lucide-react';

export interface ChatSession {
    id: string;
    title: string;
    date: Date;
    preview: string;
}

interface AIChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
    onDeleteSession: (id: string, e: React.MouseEvent) => void;
    isOpen: boolean;
    onClose: () => void;
}

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    isOpen,
    onClose
}) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-white dark:bg-[#131722] border-r border-slate-200 dark:border-white/5 
                transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-full flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>

                {/* Header / New Chat */}
                <div className="p-4">
                    <button
                        onClick={() => {
                            onNewChat();
                            onClose();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group mb-6"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                        New Conversation
                    </button>

                    {/* Analysis Modes */}
                    <div className="mb-8">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Analysis Modes</h3>
                        <div className="space-y-1">
                            <button className="w-full flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                                <Zap className="w-4 h-4" />
                                <div className="text-left">
                                    <div className="text-xs font-semibold">Quick Answer</div>
                                    <div className="text-[10px] opacity-70">Brief & direct</div>
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 border border-transparent transition-colors">
                                <FileText className="w-4 h-4" />
                                <div className="text-left">
                                    <div className="text-xs font-medium">Detailed Analysis</div>
                                    <div className="text-[10px] opacity-70">In-depth reasoning</div>
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 border border-transparent transition-colors">
                                <Compass className="w-4 h-4" />
                                <div className="text-left">
                                    <div className="text-xs font-medium">Actionable Guidance</div>
                                    <div className="text-[10px] opacity-70">Steps & timing</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Recent Conversations */}
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Recent Conversations</h3>
                </div>

                {/* Scrollable History List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
                    {sessions.length === 0 ? (
                        <div className="text-center py-8 opacity-40">
                            <p className="text-xs text-slate-400">No recent chats</p>
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => {
                                    onSelectSession(session.id);
                                    onClose();
                                }}
                                className={`
                                    group relative p-2.5 rounded-lg cursor-pointer transition-all
                                    ${currentSessionId === session.id
                                        ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white'
                                        : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-sm font-medium truncate w-[80%] block">{session.title}</span>
                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => onDeleteSession(session.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                <span className="text-[10px] opacity-50 block">
                                    {new Date(session.date).toLocaleDateString()} • {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default AIChatSidebar;
