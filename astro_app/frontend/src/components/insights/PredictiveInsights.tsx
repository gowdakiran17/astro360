import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InsightCard, { Insight } from './InsightCard';
import { Sparkles, Filter, RefreshCw, BrainCircuit } from 'lucide-react';

interface Planet {
    name: string;
    zodiac_sign: string;
    longitude?: number;
    is_retrograde?: boolean;
    nakshatra?: string;
    pada?: number;
}

interface ChartData {
    planets: Planet[];
}

interface PredictiveInsightsProps {
    transitData: ChartData | null;
    birthData: ChartData | null;
    dashaData?: unknown;
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ 
    transitData, 
    birthData, 
    dashaData,
    activeCategory,
    onCategoryChange
}) => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const categories = [
        { id: 'all', label: 'All Insights' },
        { id: 'career', label: 'Career & Growth' },
        { id: 'relationships', label: 'Relationships' },
        { id: 'finance', label: 'Finance' },
        { id: 'health', label: 'Health' }
    ];

    const generateInsights = async () => {
        if (!transitData) return;
        
        setLoading(true);
        try {
            // Prepare payload for the predictive engine
            const payload = {
                context: "predictive_engine",
                data: {
                    birth_planets: birthData?.planets || [],
                    transit_planets: transitData.planets || [],
                    dasha: dashaData || { current_mahadasha: "Unknown", current_antardasha: "Unknown" }
                }
            };

            const response = await api.post('/ai/generate', payload);
            if (response.data && response.data.insights) {
                setInsights(response.data.insights);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to generate predictive insights:", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate on mount or data change
    useEffect(() => {
        if (transitData) {
            generateInsights();
        }
    }, [transitData, birthData, dashaData]);

    const handleFeedback = (insightTitle: string, helpful: boolean) => {
        console.log(`Feedback for ${insightTitle}: ${helpful ? 'Helpful' : 'Not Helpful'}`);
        // In a real app, send this to backend to retrain/adjust weights
    };

    const filteredInsights = activeCategory === 'all' 
        ? insights 
        : insights.filter(i => i.category === activeCategory);

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <Filter className="w-4 h-4 text-slate-400" />
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                                activeCategory === cat.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">
                        UPDATED: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'NEVER'}
                    </span>
                    <button 
                        onClick={generateInsights}
                        disabled={loading}
                        className={`p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors ${loading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Insights Grid */}
            {loading && insights.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <BrainCircuit className="w-12 h-12 mb-4 animate-pulse text-indigo-500" />
                    <p className="font-medium">Analyzing planetary vectors...</p>
                    <p className="text-xs mt-2 opacity-70">Running predictive models</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInsights.map((insight, idx) => (
                        <InsightCard 
                            key={idx} 
                            insight={insight} 
                            onFeedback={(helpful) => handleFeedback(insight.title, helpful)}
                        />
                    ))}
                    
                    {filteredInsights.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400">
                            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No specific insights for {activeCategory} at this moment.</p>
                            <p className="text-xs">The planets are silent on this matter.</p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Footer / Disclaimer */}
            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-400 max-w-2xl mx-auto">
                    **Ethical Disclaimer:** These insights are generated by algorithmic analysis of planetary positions (`Predictive Engine v1.0`). 
                    They are intended for guidance and entertainment purposes only. Astrology is not a substitute for professional medical, legal, or financial advice. 
                    Confidence scores reflect the astrological strength of the signal, not a guarantee of outcome.
                </p>
            </div>
        </div>
    );
};

export default PredictiveInsights;
