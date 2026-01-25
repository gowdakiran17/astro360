import React, { useState } from 'react';
import { Sparkles, X, RotateCcw } from 'lucide-react';
import api from '../../services/api';
// We simple render markdown by converting newlines to <br/> and bold to <strong> for now to avoid huge dependencies
// or use a lightweight renderer if available. User didn't ask for full markdown support but it's good practice.

interface AIReportButtonProps {
    context: string;
    data: unknown;
    buttonText?: string;
    className?: string;
}

const AIReportButton: React.FC<AIReportButtonProps> = ({ context, data, buttonText = "Get AI Insight", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userQuery, setUserQuery] = useState('');

    const isChatMode = context.includes('chat');

    const handleGenerate = async (query?: string) => {
        setLoading(true);
        setError(null);
        setIsOpen(true);

        try {
            const response = await api.post('/ai/generate', {
                context,
                data,
                user_query: query || userQuery
            });
            setReport(response.data.insight);
        } catch {
            setError("Failed to generate AI insight. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const renderMarkdown = (text: string) => {
        // Basic parser for Bold and Newlines
        return text.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={i} className="min-h-[1.5em]">
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                        }
                        return <span key={j}>{part}</span>;
                    })}
                </div>
            );
        });
    };

    return (
        <>
            <button
                onClick={() => handleGenerate()}
                className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-md ${className}`}
            >
                <Sparkles className="w-4 h-4" />
                {buttonText}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slideUp">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-2 text-indigo-900">
                                <Sparkles className="w-5 h-5 text-indigo-500" />
                                <h3 className="font-bold text-lg">AI Astrologer Insight</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 text-slate-700 leading-relaxed">
                            {isChatMode && !report && !loading && (
                                <div className="mb-6 space-y-4">
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <p className="text-sm text-indigo-800 font-medium">Suggested questions:</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {['Analyze my name correction', 'What are my lucky colors?', 'How is my career path?', 'Relationships and numbers'].map(q => (
                                                <button 
                                                    key={q}
                                                    onClick={() => {
                                                        setUserQuery(q);
                                                        handleGenerate(q);
                                                    }}
                                                    className="text-xs bg-white px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            value={userQuery}
                                            onChange={(e) => setUserQuery(e.target.value)}
                                            placeholder="Ask anything about your numerology chart..."
                                            className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px] p-4 text-sm"
                                        />
                                        <button
                                            onClick={() => handleGenerate()}
                                            disabled={!userQuery.trim() || loading}
                                            className="absolute bottom-3 right-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            Ask Bot
                                        </button>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-indigo-600" />
                                        </div>
                                    </div>
                                    <p className="text-slate-500 font-medium animate-pulse">Consulting the stars...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3">
                                    <div className="mt-0.5">⚠️</div>
                                    <div>{error}</div>
                                </div>
                            ) : report ? (
                                <div className="prose prose-indigo max-w-none">
                                    {renderMarkdown(report)}
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            {report && (
                                <button
                                    onClick={() => {
                                        if (!isChatMode) handleGenerate();
                                        else {
                                            setReport(null);
                                            setUserQuery('');
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    {isChatMode ? 'New Question' : 'Regenerate'}
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIReportButton;
