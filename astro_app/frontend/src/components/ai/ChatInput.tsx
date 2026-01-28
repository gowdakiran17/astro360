import React, { useState } from 'react';
import { Send, Mic, Sparkles, Paperclip, BarChart2, FileText, Lightbulb } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    onShowChart?: () => void;
    onShowTechnical?: () => void;
    onGenerateReport?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    isLoading,
    placeholder,
    onShowChart,
    onShowTechnical,
    onGenerateReport
}) => {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        onSend(input);
        setInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsListening(!isListening);
            setTimeout(() => setIsListening(false), 2000);
        } else {
            alert("Voice input is not supported in this browser.");
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 pb-4">
            {/* 1. Action Buttons Row */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={onShowChart}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium transition-colors border border-indigo-500/20"
                >
                    <BarChart2 className="w-4 h-4" />
                    Show Chart
                </button>
                <button
                    onClick={onShowTechnical}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-[#1E232F] hover:bg-slate-200 dark:hover:bg-[#2A3040] text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors border border-transparent dark:border-white/5"
                >
                    <Lightbulb className="w-4 h-4" />
                    Technical Details
                </button>
                <button
                    onClick={onGenerateReport}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-[#1E232F] hover:bg-slate-200 dark:hover:bg-[#2A3040] text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors border border-transparent dark:border-white/5"
                >
                    <FileText className="w-4 h-4" />
                    Generate Report
                </button>
            </div>

            {/* 2. Input Capsule */}
            <div className="relative group bg-white dark:bg-[#1E232F] border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm focus-within:shadow-md focus-within:border-indigo-500/50 transition-all">
                <div className="flex items-center px-4 py-2 min-h-[60px]">
                    {/* Attachment Icon */}
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <Paperclip className="w-5 h-5 -rotate-45" />
                    </button>

                    {/* Text Area */}
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={placeholder || "Ask me anything about your astrological chart..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none py-3 px-3 max-h-32 focus:outline-none"
                        rows={1}
                        disabled={isLoading}
                    />

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Mic */}
                        <button
                            onClick={toggleListening}
                            className={`p-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <Mic className="w-5 h-5" />
                        </button>

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            {isLoading ? (
                                <Sparkles className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 ml-0.5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Footer Text */}
            <div className="flex justify-between items-center mt-2 px-2">
                <span className="text-[11px] text-slate-400">
                    AI responses are based on Vedic astrology principles
                </span>
                <span className="text-[11px] text-slate-400">
                    Press Enter to send
                </span>
            </div>
        </div>
    );
};

export default ChatInput;
