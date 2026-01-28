import React, { useRef, useEffect } from 'react';
import { Compass, Sparkles } from 'lucide-react';
import MessageCard from './MessageCard';
import ChatInput from './ChatInput';
import CosmicBackground from '../layout/CosmicBackground';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    chartImage?: string; // Legacy
    suggestions?: string[];
}


interface AIChatAreaProps {
    messages: Message[];
    isLoading: boolean;
    onSend: (message: string) => void;
    // Header props removed/moved to parent, but some callbacks needed for input
    onShowChart: () => void;
    onShowTechnical: () => void;
    onGenerateReport: () => void; // Parent handles this now
    containerRef: React.RefObject<HTMLDivElement>; // Ref for export
    chartData?: any; // New prop for inline rendering
}

const AIChatArea: React.FC<AIChatAreaProps> = ({
    messages,
    isLoading,
    onSend,
    onShowChart,
    onShowTechnical,
    onGenerateReport,
    containerRef,
    chartData
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // ... code ...



    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-full relative overflow-hidden bg-slate-950">
            {/* Immersive Background */}
            <CosmicBackground />

            {/* Chat Messages Area */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 relative z-10">
                <div className="max-w-4xl mx-auto space-y-6 pb-24">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                            {/* Hero Visual */}
                            <div className="relative mb-8 group cursor-default">
                                <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full animate-pulse-slow"></div>
                                <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-700">
                                    <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center animate-spin-slow-reverse">
                                        <Compass className="w-12 h-12 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-3 tracking-tight">
                                Cosmic Insights
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-10 text-lg leading-relaxed">
                                Connect with Anusha. Explore your destiny, relationships, and spiritual path.
                            </p>

                            {/* Suggestions Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                                {[
                                    { icon: "📅", text: "What's my prediction for 2024?" },
                                    { icon: "💼", text: "Is this a good time for a job change?" },
                                    { icon: "❤️", text: "When will I meet my soulmate?" },
                                    { icon: "🧘", text: "What are my lucky gemstones?" }
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onSend(item.text)}
                                        className="group p-4 bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-emerald-500/50 rounded-2xl text-left transition-all hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
                                    >
                                        <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                                        <span className="text-sm font-medium text-slate-300 group-hover:text-emerald-400 transition-colors">
                                            {item.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <MessageCard
                                key={msg.id}
                                role={msg.role}
                                content={msg.content}
                                timestamp={msg.timestamp}
                                chartImage={msg.chartImage}
                                chartData={chartData}
                                suggestions={msg.suggestions}
                                onSuggestionClick={onSend}
                            />
                        ))
                    )}

                    {isLoading && (
                        <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 pl-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Floating Input Area - Positioned absolutely/fixed within the relative container or just bottom aligned but floating style */}
            <div className="relative z-30 p-4 pt-0 bg-gradient-to-t from-slate-50/90 via-slate-50/0 to-transparent dark:from-[#0B0F19]/90 dark:via-[#0B0F19]/0 pointer-events-none">
                {/* Visual gradient fade at bottom */}
                <div className="pointer-events-auto max-w-4xl mx-auto">
                    <ChatInput
                        onSend={onSend}
                        isLoading={isLoading}
                        onShowChart={onShowChart}
                        onShowTechnical={onShowTechnical}
                        onGenerateReport={onGenerateReport}
                    />
                </div>
            </div>
        </div>
    );
};

export default AIChatArea;
