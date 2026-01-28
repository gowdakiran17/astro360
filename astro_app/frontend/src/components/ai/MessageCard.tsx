import { useState } from 'react';
import { Volume2, Copy, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SuggestionChips from './SuggestionChips';
import SouthIndianChart from '../charts/SouthIndianChart';

interface MessageCardProps {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
    chartImage?: string;
    chartData?: any; // Received from parent for inline rendering
    suggestions?: string[];
    onSuggestionClick?: (suggestion: string) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ role, content, timestamp, chartData, suggestions, onSuggestionClick }) => {
    const [copied, setCopied] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    // Parse Content for Special Tokens
    const showChartToken = "[SHOW_CHART]";
    const shouldShowChart = content.includes(showChartToken);
    const displayContent = content.replace(showChartToken, "").trim();

    const handleCopy = () => {
        navigator.clipboard.writeText(displayContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSpeak = () => {
        if ('speechSynthesis' in window) {
            if (speaking) {
                window.speechSynthesis.cancel();
                setSpeaking(false);
            } else {
                const utterance = new SpeechSynthesisUtterance(displayContent);
                utterance.rate = 0.9;
                utterance.pitch = 1;
                utterance.onend = () => setSpeaking(false);
                window.speechSynthesis.speak(utterance);
                setSpeaking(true);
            }
        }
    };

    if (role === 'assistant') {
        return (
            <div className="flex gap-4 max-w-4xl mx-auto my-6">
                <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                        {/* Persona Header */}
                        <div className="bg-slate-100 dark:bg-slate-800/80 px-5 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wide">
                                    Anusha
                                </span>
                            </div>

                            <div className="flex gap-1">
                                <button
                                    onClick={handleSpeak}
                                    className={`p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all ${speaking ? 'text-indigo-600' : 'text-slate-400'}`}
                                    title="Listen"
                                >
                                    <Volume2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-400"
                                    title="Copy"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-5 md:p-6 bg-white dark:bg-slate-900">
                            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-sans leading-7">
                                <ReactMarkdown
                                    components={{
                                        // ... (Keep existing markdown components but remove extra paddings if needed)
                                        h3: ({ node, ...props }) => (
                                            <div className="mt-6 mb-3">
                                                <h3 className="text-sm font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2" {...props} />
                                            </div>
                                        ),
                                        strong: ({ node, ...props }) => (
                                            <span className="font-bold text-slate-900 dark:text-slate-100" {...props} />
                                        ),
                                        p: ({ node, ...props }) => (
                                            <div className="mb-4 text-[15px] last:mb-0 text-slate-700 dark:text-slate-300 font-medium" {...props} />
                                        ),
                                        blockquote: ({ node, ...props }) => (
                                            <blockquote className="pl-4 py-2 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/10 italic text-slate-700 dark:text-slate-300 my-4 rounded-r-lg" {...props} />
                                        ),
                                        code: ({ className, children, ...props }) => {
                                            const content = String(children);
                                            const isInline = !className;
                                            if (isInline) {
                                                if (content.startsWith('red:')) {
                                                    return <span className="text-red-500 dark:text-red-400 font-bold">{content.slice(4)}</span>;
                                                }
                                                if (content.startsWith('green:')) {
                                                    return <span className="text-emerald-600 dark:text-emerald-400 font-bold">{content.slice(6)}</span>;
                                                }
                                                if (content.startsWith('gold:')) {
                                                    return <span className="text-amber-600 dark:text-amber-500 font-bold">{content.slice(5)}</span>;
                                                }
                                            }
                                            return isInline ? (
                                                <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono text-slate-600 dark:text-slate-400" {...props}>
                                                    {children}
                                                </code>
                                            ) : (
                                                <div className="bg-slate-950 rounded-lg p-3 my-3">
                                                    <code className="text-xs font-mono text-slate-300" {...props}>
                                                        {children}
                                                    </code>
                                                </div>
                                            );
                                        },
                                    }}
                                >
                                    {displayContent}
                                </ReactMarkdown>
                            </div>

                            {/* Inline Chart Rendering */}
                            {shouldShowChart && chartData && (
                                <div className="mt-6">
                                    <div className="border border-amber-200 dark:border-amber-900/30 rounded-xl overflow-hidden bg-amber-50/50 dark:bg-slate-900">
                                        <div className="bg-amber-100/50 dark:bg-amber-900/20 py-2 px-4 text-center border-b border-amber-200 dark:border-amber-900/30">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500">Your Birth Chart</h4>
                                        </div>
                                        <div className="p-4 flex justify-center">
                                            <SouthIndianChart data={chartData} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Timestamp */}
                            {timestamp && (
                                <div className="flex justify-end mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                                        ANUSHA • {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Suggestions (Outside bubble) */}
                    {suggestions && suggestions.length > 0 && onSuggestionClick && (
                        <div className="mt-3 ml-2">
                            <SuggestionChips suggestions={suggestions} onSelect={onSuggestionClick} />
                        </div>
                    )}
                </div>
            </div >
        );
    }

    // User Message (Green Bubble Style)
    return (
        <div className="flex gap-4 max-w-4xl mx-auto flex-row-reverse my-6">
            <div className="flex-1 min-w-0 flex justify-end">
                <div className="bg-emerald-600 dark:bg-emerald-700 text-white rounded-2xl rounded-tr-sm p-4 shadow-md max-w-[85%] relative group">
                    <p className="whitespace-pre-wrap leading-relaxed font-medium text-[15px]">{content}</p>
                    {timestamp && (
                        <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                            <span className="text-[10px] uppercase font-bold tracking-wider">You</span>
                            <span className="text-[10px]">•</span>
                            <span className="text-[10px]">
                                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageCard;
