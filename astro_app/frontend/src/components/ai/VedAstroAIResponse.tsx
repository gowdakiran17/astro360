import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';

interface VedAstroAIResponseProps {
    response: string;
    htmlResponse?: string;
    followUpQuestions?: string[];
    onFollowUpClick?: (question: string) => void;
}

const VedAstroAIResponse: React.FC<VedAstroAIResponseProps> = ({
    response,
    htmlResponse,
    followUpQuestions = [],
    onFollowUpClick
}) => {
    // Use HTML response if available, otherwise use plain text
    const displayContent = htmlResponse || response;
    const isHtml = !!htmlResponse;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">VedAstro AI</h3>
                    <p className="text-xs text-indigo-100">Vedic Astrology Insights</p>
                </div>
            </div>

            {/* Response Content */}
            <div className="p-6">
                {isHtml ? (
                    <div
                        className="prose dark:prose-invert max-w-none
                                   prose-p:text-slate-700 dark:prose-p:text-slate-300
                                   prose-p:leading-relaxed prose-p:mb-3
                                   prose-strong:text-slate-900 dark:prose-strong:text-white
                                   prose-strong:font-bold"
                        dangerouslySetInnerHTML={{ __html: displayContent }}
                    />
                ) : (
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {displayContent}
                    </div>
                )}
            </div>

            {/* Follow-up Questions */}
            {followUpQuestions && followUpQuestions.length > 0 && (
                <div className="px-6 pb-6">
                    <div className="border-t border-indigo-200 dark:border-indigo-800 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Suggested Follow-ups:
                            </span>
                        </div>
                        <div className="space-y-2">
                            {followUpQuestions.map((question, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onFollowUpClick?.(question)}
                                    className="w-full text-left px-4 py-2 rounded-lg 
                                             bg-white dark:bg-slate-800 
                                             border border-indigo-200 dark:border-indigo-700
                                             hover:bg-indigo-50 dark:hover:bg-slate-700
                                             hover:border-indigo-300 dark:hover:border-indigo-600
                                             transition-colors text-sm
                                             text-slate-700 dark:text-slate-300"
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VedAstroAIResponse;
