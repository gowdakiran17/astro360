import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { apiClient } from '../../services/api';

interface DailyAnalysisProps {
    selectedDate: Date;
    predictions: any[];
    isLoading: boolean;
}

export const AIDailyAnalysis: React.FC<DailyAnalysisProps> = ({
    selectedDate,
    predictions,
    isLoading
}) => {
    const [analysis, setAnalysis] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    // Generate analysis when date or predictions change
    useEffect(() => {
        // Only analyze if we have predictions and haven't analyzed this batch yet
        if (!isLoading && predictions.length > 0) {
            generateAnalysis();
        } else if (!isLoading && predictions.length === 0) {
            setAnalysis("No major planetary events detected for today. This generally indicates a balanced, neutral day suitable for routine work and maintenance. Without specific transits or dashas triggering events, rely on your general intuition.");
            setHasAnalyzed(true);
        }
    }, [selectedDate, predictions, isLoading]);

    const generateAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysis(""); // Clear previous

        // Mocking the AI response for now to bypass invalid API key issues
        // In production, this would call /ai/chat
        setTimeout(() => {
            const goodCount = predictions.filter(p => p.daily_status[selectedDate.toISOString().split('T')[0]] === 'good').length;
            const badCount = predictions.filter(p => p.daily_status[selectedDate.toISOString().split('T')[0]] === 'bad').length;

            let sentiment = "balanced";
            if (goodCount > badCount) sentiment = "highly positive";
            if (badCount > goodCount) sentiment = "challenging";

            const categories = Array.from(new Set(predictions.map(p => p.category))).join(", ");

            const mockAnalysis = `
        <p class="mb-3">Based on the <strong>${predictions.length} planetary influences</strong> active today, your day appears to be <span class="${sentiment === 'challenging' ? 'text-red-400' : 'text-emerald-400'} font-bold">${sentiment}</span>.</p>
        
        <p class="mb-3">Key themes affecting you involve <strong>${categories}</strong>. ${goodCount > 0 ? `The <span class="text-emerald-300">positive alignment</span> of ${predictions.find(p => p.daily_status[selectedDate.toISOString().split('T')[0]] === 'good')?.planet || 'planets'} creates opportunities.` : ''} ${badCount > 0 ? `However, use caution due to <span class="text-red-300">adverse aspects</span> affecting ${predictions.find(p => p.daily_status[selectedDate.toISOString().split('T')[0]] === 'bad')?.house ? `House ${predictions.find(p => p.daily_status[selectedDate.toISOString().split('T')[0]] === 'bad')?.house}` : 'your chart'}.` : ''}</p>
        
        <div class="bg-purple-900/20 border-l-2 border-purple-500 p-3 rounded-r text-sm">
          <strong>Guidance:</strong> Focus on ${sentiment === 'challenging' ? 'maintenance and avoiding risks' : 'taking initiative and capitalizing on momentum'}.
        </div>
      `;

            setAnalysis(mockAnalysis);
            setIsAnalyzing(false);
            setHasAnalyzed(true);
        }, 1500);
    };

    if (isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden"
        >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Bot size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 text-indigo-300">
                        <Bot size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">AI Cosmic Insight</h3>
                    {isAnalyzing && (
                        <span className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-full animate-pulse">
                            <RefreshCw size={12} className="animate-spin" /> Analyzing stars...
                        </span>
                    )}
                </div>

                <div className="prose prose-invert prose-sm max-w-none text-indigo-100/90 leading-relaxed">
                    {isAnalyzing ? (
                        <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-indigo-500/20 rounded w-3/4"></div>
                            <div className="h-4 bg-indigo-500/20 rounded w-full"></div>
                            <div className="h-4 bg-indigo-500/20 rounded w-5/6"></div>
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: analysis }} />
                    )}
                </div>

                {!isAnalyzing && hasAnalyzed && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={generateAnalysis}
                            className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <RefreshCw size={12} /> Regenerate Analysis
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
