import React, { useState } from 'react';
import { 
    TrendingUp, TrendingDown, Minus, 
    ThumbsUp, ThumbsDown, Activity, AlertTriangle 
} from 'lucide-react';

export interface Insight {
    category: 'career' | 'relationships' | 'health' | 'finance' | 'general';
    title: string;
    description: string;
    confidence: number;
    timeframe: string;
    impact: 'positive' | 'negative' | 'neutral';
    type: 'data_driven' | 'predictive_model';
    dataPoints: string[];
}

interface InsightCardProps {
    insight: Insight;
    onFeedback: (helpful: boolean) => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onFeedback }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'positive': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
            case 'negative': return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            default: return 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
        }
    };

    const getIcon = (impact: string) => {
        switch (impact) {
            case 'positive': return <TrendingUp className="w-5 h-5" />;
            case 'negative': return <TrendingDown className="w-5 h-5" />;
            default: return <Minus className="w-5 h-5" />;
        }
    };

    return (
        <div className={`rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg ${getImpactColor(insight.impact)} border-opacity-50`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm`}>
                        {getIcon(insight.impact)}
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-1">
                            {insight.category} • {insight.timeframe}
                        </span>
                        <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white">
                            {insight.title}
                        </h3>
                    </div>
                </div>
                
                {/* Confidence Meter */}
                <div className="flex flex-col items-end">
                    <div className="relative h-10 w-10 flex items-center justify-center">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-200 dark:text-slate-700"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className={`${
                                    insight.confidence > 80 ? 'text-emerald-500' : 
                                    insight.confidence > 50 ? 'text-amber-500' : 'text-red-500'
                                }`}
                                strokeDasharray={`${insight.confidence}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {insight.confidence}%
                        </span>
                    </div>
                    <span className="text-[9px] font-medium uppercase text-slate-400 mt-1">Confidence</span>
                </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                {insight.description}
            </p>

            {/* Explanability Section */}
            <div className="border-t border-black/5 dark:border-white/5 pt-3">
                <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mb-2"
                >
                    <Activity className="w-3 h-3" />
                    {showDetails ? "Hide Data Sources" : "View Data Sources"}
                </button>
                
                {showDetails && (
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
                        <p className="font-semibold text-slate-500 mb-1">Algorithmic Factors:</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                            {insight.dataPoints.map((point, idx) => (
                                <li key={idx}>{point}</li>
                            ))}
                        </ul>
                        <div className="flex items-start gap-2 mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-slate-400 italic">
                            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>This prediction is based on planetary positions and historical patterns. It is not deterministic.</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Feedback Loop */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                <span className="text-[10px] text-slate-400">Was this helpful?</span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => { setFeedbackGiven('yes'); onFeedback(true); }}
                        className={`p-1.5 rounded-md transition-colors ${
                            feedbackGiven === 'yes' ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                        }`}
                        disabled={feedbackGiven !== null}
                    >
                        <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button 
                        onClick={() => { setFeedbackGiven('no'); onFeedback(false); }}
                        className={`p-1.5 rounded-md transition-colors ${
                            feedbackGiven === 'no' ? 'bg-red-100 text-red-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                        }`}
                        disabled={feedbackGiven !== null}
                    >
                        <ThumbsDown className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InsightCard;
