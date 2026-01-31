import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Send, Bot, User, Sparkles, BookOpen, Clock,
    Brain, Trash2, Calendar, MapPin, Hash
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useChartSettings } from '../context/ChartContext';
import ChatHistorySidebar from '../components/ai/ChatHistorySidebar';

const fixHtmlContent = (html: string) => {
    if (!html) return html;

    // Log original for debugging intermittent issues
    console.log('Original Chart HTML:', html);

    // 1. Replace webapi with api subdomain (api is more reliable for public image access)
    let fixed = html.replace(/webapi\.vedastro\.org/g, 'api.vedastro.org');

    // 2. Fix missing slashes before ChartType (Robust fix for finding +05:30ChartType)
    // Ensures 'ChartType' is always preceded by a slash if it's not already
    fixed = fixed.replace(/(?<!\/)(ChartType)/g, '/$1');

    // 3. Fix double slashes in URLs which can break image rendering
    // and ensure URLs are absolute if needed
    fixed = fixed.replace(/src="([^"]+)"/g, (_match, src) => {
        // Only replace double slashes after the protocol
        const cleanSrc = src.replace(/([^:])\/\//g, '$1/');
        return `src="${cleanSrc}"`;
    });

    console.log('Fixed Chart HTML:', fixed);
    return fixed;
};

interface Message {
    role: 'user' | 'assistant';
    content: string;
    htmlContent?: string;
    timestamp: Date;
    suggestions?: string[];
}

const AIChatPage = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { currentProfile } = useChartSettings();

    const [mode, setMode] = useState<'natal' | 'guru' | 'horary'>('natal');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [bookCode, setBookCode] = useState('PrasnaMarga');
    const [horaryNumber, setHoraryNumber] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Determine mode based on URL
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('ai-guru')) setMode('guru');
        else if (path.includes('ai-horary')) setMode('horary');
        else setMode('natal');

        setMessages([]);
        setSessionId(null);
    }, [location.pathname, currentProfile?.name]); // Reset session if profile changes

    // Load Chat History on Mount/Mode Change
    useEffect(() => {
        const loadHistory = async () => {
            if (!user) return;
            try {
                const response = await api.get('chat/history');
                if (response.data && Array.isArray(response.data)) {
                    const history: Message[] = response.data.map((msg: any) => ({
                        role: msg.role,
                        content: msg.content,
                        htmlContent: msg.html_content,
                        timestamp: new Date(msg.timestamp),
                        suggestions: msg.suggestions
                    }));
                    setMessages(history);
                    // Set session ID from last message if available
                    if (history.length > 0) {
                        // Logic to recover session ID could be improved if needed
                    }
                }
            } catch (error) {
                console.error("Failed to load chat history", error);
            }
        };
        loadHistory();
    }, [user, mode]);

    const saveMessageToDB = async (msg: Message, sid: string | null) => {
        if (!user) return;
        try {
            await api.post('chat/message', {
                role: msg.role,
                content: msg.content,
                html_content: msg.htmlContent,
                session_id: sid,
                suggestions: msg.suggestions
            });
        } catch (error) {
            console.error("Failed to save message", error);
        }
    };

    const clearHistory = async () => {
        try {
            await api.delete('chat/history');
            setMessages([]);
            setSessionId(null);
        } catch (error) {
            console.error("Failed to clear history", error);
        }
    };

    const handleSessionSelect = async (selectedSessionId: string) => {
        setSessionId(selectedSessionId);
        setMessages([]);
        setIsLoading(true);
        try {
            const response = await api.get('chat/history', {
                params: { session_id: selectedSessionId }
            });
            if (response.data && Array.isArray(response.data)) {
                const history: Message[] = response.data.map((msg: any) => ({
                    role: msg.role,
                    content: msg.content,
                    htmlContent: msg.html_content,
                    timestamp: new Date(msg.timestamp),
                    suggestions: msg.suggestions
                }));
                setMessages(history);
            }
        } catch (error) {
            console.error("Failed to load session", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setSessionId(null);
        setInput('');
    };

    // Auto-initialize Natal/Horary session if profile is available
    useEffect(() => {
        if (mode !== 'guru' && currentProfile && !sessionId && messages.length === 0 && !isLoading) {
            const initChat = async () => {
                setIsLoading(true);
                try {
                    // Step 1: Initialize session
                    const response = await api.post('ai/chat', {
                        user_query: "", // Empty query triggers initialization
                        context: mode,
                        user_id: user?.id?.toString() || 'anonymous',
                        session_id: null,
                        chart_data: currentProfile
                    });

                    const data = response.data;
                    console.log('🔍 Init Response:', data);
                    console.log('📋 Follow-up questions:', data.follow_up_questions);

                    if (data.status === "Pass") {
                        const sid = data.session_id;
                        setSessionId(sid);

                        // Fallback suggestions if API doesn't provide them
                        const defaultSuggestions = [
                            "💡 Will higher education help me?",
                            "🎉 Will party lifestyle help me?",
                            "👥 Friends or family: who helps me?",
                            "💍 Will marriage bring me happiness?",
                            "🧘 Will monk life benefit me?",
                            "✈️ Can travel improve my life?",
                            "📈 Will I succeed in stock trading?",
                            "⭐ Will I become famous?",
                            "💰 Will I become a millionaire?",
                            "👫 Describe my future spouse",
                            "👨‍👦 Relationship with my father?",
                            "🎰 Can I win the lottery?",
                            "🔍 Special yogas in my chart?",
                            "💼 Best career path for me?",
                            "🌍 Will I get foreign education?"
                        ];

                        const suggestions = data.follow_up_questions && data.follow_up_questions.length > 0
                            ? data.follow_up_questions
                            : defaultSuggestions;

                        // Show chart with suggestions immediately (no detailed text)
                        const firstMsg: Message = {
                            role: 'assistant',
                            content: data.answer,
                            htmlContent: data.html_answer,
                            timestamp: new Date(),
                            suggestions: suggestions
                        };

                        console.log('💬 First message with suggestions:', firstMsg);
                        setMessages([firstMsg]);

                        // Save the initialization message
                        saveMessageToDB(firstMsg, sid);
                    }
                } catch (error) {
                    console.error('Initialization Error:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            initChat();
        }
    }, [mode, currentProfile, sessionId, messages.length, isLoading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent, suggestionText?: string) => {
        if (e) e.preventDefault();

        const messageText = suggestionText || input;
        if (!messageText.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Save User Message
        saveMessageToDB(userMessage, sessionId);

        try {
            const response = await api.post('ai/chat', {
                user_query: messageText,
                context: mode,
                user_id: user?.id?.toString() || 'anonymous',
                session_id: sessionId,
                chart_data: currentProfile,
                book_code: mode === 'guru' ? bookCode : undefined,
                horary_number: mode === 'horary' ? horaryNumber : undefined
            });

            const data = response.data;
            const aiMessage: Message = {
                role: 'assistant',
                content: data.answer,
                htmlContent: data.html_answer,
                timestamp: new Date(),
                suggestions: data.follow_up_questions
            };

            setMessages(prev => [...prev, aiMessage]);
            if (data.session_id) setSessionId(data.session_id);

            // Save AI Message
            saveMessageToDB(aiMessage, data.session_id || sessionId);

        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I apologize, but I encountered an error connecting to the cosmic server. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const getModeTitle = () => {
        switch (mode) {
            case 'natal': return 'VedaAI - Natal Astrologer';
            case 'guru': return 'AI Guru - Spiritual Teacher';
            case 'horary': return 'Horary Prasna - Event Prediction';
            default: return 'AI Astrology Chat';
        }
    };

    const getModeIcon = () => {
        switch (mode) {
            case 'natal': return <Sparkles className="w-6 h-6 text-indigo-400" />;
            case 'guru': return <BookOpen className="w-6 h-6 text-emerald-400" />;
            case 'horary': return <Clock className="w-6 h-6 text-amber-400" />;
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
            {/* Cosmic Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900/40 pointer-events-none z-0" />

            {/* Embedded Sidebar */}
            <ChatHistorySidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                onSessionSelect={handleSessionSelect}
                onNewChat={handleNewChat}
                currentSessionId={sessionId}
            />

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 relative z-10">
                <div className="px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg border border-white/10">
                            {getModeIcon()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight drop-shadow-sm">{getModeTitle()}</h2>
                            <p className="text-[11px] text-indigo-200/70 font-medium tracking-wide">Powered by VedAstro Engine</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearHistory}
                            className="group p-2 text-slate-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-all duration-200"
                            title="Clear History"
                        >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {mode === 'natal' && currentProfile && (
                    <div className="px-6 py-2 bg-indigo-500/5 border-b border-white/5 flex items-center gap-4 text-xs text-indigo-200/80 z-10 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5"><User className="w-3 h-3 opacity-70" /> <span className="font-medium">{currentProfile.name}</span></div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 opacity-70" /> <span>{currentProfile.date}</span></div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 opacity-70" /> <span>{currentProfile.location}</span></div>
                    </div>
                )}

                {mode === 'horary' && (
                    <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-4 z-10">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Horary Context</span>
                        <div className="flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5 text-amber-400" />
                            <input
                                type="number"
                                placeholder="1-249"
                                value={horaryNumber}
                                onChange={(e) => setHoraryNumber(e.target.value)}
                                className="bg-black/40 border border-amber-500/30 text-amber-100 text-xs px-2 py-1 rounded w-20 focus:outline-none focus:border-amber-400 transition-all font-mono"
                            />
                        </div>
                    </div>
                )}

                {mode === 'guru' && (
                    <div className="px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-4 z-10">
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Source Text</span>
                        <select
                            value={bookCode}
                            onChange={(e) => setBookCode(e.target.value)}
                            className="bg-black/40 border border-emerald-500/30 text-emerald-100 text-xs px-3 py-1 rounded focus:outline-none focus:border-emerald-400 transition-all"
                        >
                            <option value="PrasnaMarga">Prasna Marga (Event Prediction)</option>
                            <option value="BrihatParasharaHoraShastra">BPHS (Fundamentals)</option>
                            <option value="Saravali">Saravali (Phala Jyotish)</option>
                        </select>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth custom-scrollbar z-10">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-8 ring-1 ring-white/10 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]">
                                <Brain className="w-12 h-12 text-indigo-300 animate-pulse-slow" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Cosmic Intelligence</h3>
                            <p className="text-indigo-200/60 max-w-sm leading-relaxed mb-8">
                                {mode === 'natal' && "Your personal stargazer is ready. Ask about your planetary placements, career path, or relationships."}
                                {mode === 'guru' && "Tap into the ancient wisdom of the sages. Explore the depths of astrological texts."}
                                {mode === 'horary' && "Divine the answer to specific questions using the time-honored Prasha method."}
                            </p>

                            <div className="flex flex-wrap justify-center gap-2 max-w-md">
                                {mode === 'natal' && [
                                    "What does my Sun placement mean?",
                                    "Check my career prospects",
                                    "When will I have good fortune?"
                                ].map(q => (
                                    <button key={q} onClick={() => { setInput(q); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-indigo-200/80 hover:text-white hover:border-indigo-400/50 transition-all duration-300">
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500 group`}>
                                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 ring-2 ring-indigo-500/30'
                                        : 'bg-slate-900 border border-slate-700 ring-2 ring-slate-800'
                                        }`}>
                                        {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-400" />}
                                    </div>
                                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
                                        {msg.role === 'assistant' && (
                                            <div className="flex items-center justify-between w-full mb-1.5 px-1">
                                                <span className="text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider flex items-center gap-1.5">
                                                    <span>{mode === 'guru' ? '📜 Ancient Text' : '👴 VedaAI'}</span>
                                                </span>
                                            </div>
                                        )}
                                        <div className={`px-5 py-4 rounded-2xl text-[15px] leading-7 shadow-xl backdrop-blur-sm ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white shadow-indigo-900/20 rounded-tr-none'
                                            : 'bg-white/95 text-slate-800 border border-white/20 rounded-tl-none shadow-black/10'
                                            }`}>
                                            {msg.htmlContent ? (
                                                <div className="prose prose-slate prose-sm max-w-none 
                                                prose-img:mx-auto prose-img:rounded-xl prose-img:border prose-img:border-slate-200 prose-img:shadow-md
                                                prose-headings:text-slate-800 prose-headings:font-bold prose-headings:tracking-tight
                                                prose-p:text-slate-700 prose-p:leading-7
                                                prose-strong:text-indigo-900 prose-strong:font-semibold
                                                prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline"
                                                    dangerouslySetInnerHTML={{ __html: fixHtmlContent(msg.htmlContent) }}
                                                />
                                            ) : (
                                                <div className={msg.role === 'assistant' ? 'text-slate-800' : ''}>
                                                    {msg.content}
                                                </div>
                                            )}
                                        </div>
                                        {/* Suggestion Chips */}
                                        {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4 animate-fadeIn px-1 w-full justify-end">
                                                {msg.suggestions.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSend({ preventDefault: () => { } } as any, suggestion)}
                                                        className="px-4 py-2 bg-white/80 backdrop-blur-sm text-blue-600 text-xs font-semibold rounded-lg 
                                                             border border-blue-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5
                                                             transition-all duration-300 shadow-sm flex items-center gap-1.5 active:scale-95"
                                                    >
                                                        <Sparkles className="w-3 h-3 opacity-70" /> {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <span className="mt-2 text-[10px] text-slate-500/60 px-2 font-medium">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start pl-2">
                            <div className="flex gap-4 items-center">
                                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg">
                                    <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
                                </div>
                                <div className="flex gap-1.5 px-4 py-3 bg-white/10 rounded-full border border-white/5 backdrop-blur-md">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/10 z-20">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 relative">
                        <input
                            type="text"
                            placeholder={`Ask your ${mode === 'guru' ? 'guru' : 'astrologer'} anything...`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-6 py-4 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-inner placeholder:text-slate-500"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-0 disabled:scale-90 flex items-center justify-center"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                    <p className="text-[10px] text-center text-slate-500 mt-3 font-medium tracking-wide">
                        {mode === 'horary' ? "Select a number (1-249) before asking." : "The AI provides guidance; use your intuition for big life decisions."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIChatPage;
