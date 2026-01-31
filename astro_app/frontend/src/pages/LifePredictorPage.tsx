import React, { useState, useEffect } from 'react';
import { useChart } from '../context/ChartContext';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Zap } from 'lucide-react';
import apiClient from '../services/api';
import { LifePredictorCalendar } from '../components/life-predictor/LifePredictorCalendar';
import { DailyPredictionList } from '../components/life-predictor/DailyPredictionList';
import FilterPanel from '../components/life-predictor/FilterPanel';
import { CosmicTimeline } from '../components/life-predictor/CosmicTimeline';

import { Prediction } from '../types/prediction';

const LifePredictorPage: React.FC = () => {
    const { currentProfile } = useChart();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [smartSummary, setSmartSummary] = useState<Record<string, any>>({});
    const [timeline, setTimeline] = useState<any[]>([]);
    const [todayAdvanced, setTodayAdvanced] = useState<any>(null);
    const [narrative, setNarrative] = useState<any>(null);

    // Calendar State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Filters
    const [selectedHouses, setSelectedHouses] = useState<number[]>([]);
    const [selectedPlanets, setSelectedPlanets] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (!currentProfile) {
            setLoading(false);
            return;
        }

        fetchLifePredictorData();
    }, [currentProfile]);

    const fetchLifePredictorData = async () => {
        if (!currentProfile) return;

        setLoading(true);
        setError(null);

        try {
            const now = new Date();
            const startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            const endDate = new Date(now);
            endDate.setFullYear(now.getFullYear() + 1);

            const formatDate = (dateStr: string) => {
                if (dateStr.includes('-')) {
                    const [y, m, d] = dateStr.split('-');
                    return `${d}/${m}/${y}`;
                }
                return dateStr;
            };

            const birthDetails = {
                date: formatDate(currentProfile.date),
                time: currentProfile.time,
                timezone: currentProfile.timezone,
                latitude: currentProfile.latitude,
                longitude: currentProfile.longitude,
                gender: currentProfile.gender || 'male'
            };

            const response = await apiClient.post('/chart/life-predictor', birthDetails, {
                params: {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                }
            });

            if (response.data.status === 'success') {
                const data = response.data;

                // 1. Map Timeline to Calendar (Smart Summary)
                const summary: Record<string, string> = {};
                data.timeline.forEach((item: any) => {
                    const colorMap: Record<string, string> = {
                        'Green': 'good',
                        'Amber': 'mixed',
                        'Red': 'bad'
                    };
                    summary[item.date] = colorMap[item.color] || 'neutral';
                });
                setSmartSummary(summary);
                setTimeline(data.timeline);

                // 2. Map VedAstro Raw to Predictions for the list
                if (data.vedastro_raw) {
                    const mappedPreds: Prediction[] = data.vedastro_raw.map((p: any) => ({
                        name: p.Name,
                        description: p.Description,
                        category: p.PredictionType === 'Good' ? 'General' : 'Caution',
                        house: parseInt(p.RelatedProperty?.replace('House', '') || '0'),
                        planet: p.RelatedBody || 'Unknown',
                        daily_status: { [now.toISOString().split('T')[0]]: p.PredictionType === 'Good' ? 'good' : 'bad' }
                    }));
                    setPredictions(mappedPreds);
                }

                setTodayAdvanced(data.today_advanced);
                setNarrative(data.narrative);
            } else {
                setError(response.data.message || 'Failed to fetch life predictor data');
            }
        } catch (err: any) {
            console.error('Life predictor error:', err);
            setError(err.response?.data?.detail || err.message || 'Failed to load life predictor data');
        } finally {
            setLoading(false);
        }
    };

    const getDailyPredictions = () => {
        // Filter by date if possible, or just use mapped predictions
        // Applying visual filters
        return predictions.filter(pred => {
            if (selectedHouses.length > 0 && pred.house > 0 && !selectedHouses.includes(pred.house)) {
                return false;
            }
            if (selectedPlanets.length > 0 && pred.planet !== 'Unknown' && !selectedPlanets.includes(pred.planet)) {
                return false;
            }
            if (selectedCategories.length > 0 && !selectedCategories.includes(pred.category)) {
                return false;
            }
            return true;
        });
    };

    const dailyPredictions = getDailyPredictions();

    // Helper for selected day favorability
    const getSelectedDayFavorability = () => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        return timeline.find(t => t.date === dateStr);
    };

    const dayFav = getSelectedDayFavorability();

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-8 bg-red-500/10 rounded-3xl border border-red-500/20 max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Cosmic Interruption</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={() => fetchLifePredictorData()}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!currentProfile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2 text-slate-900 dark:text-white">No Chart Selected</h2>
                    <p className="text-slate-600 dark:text-slate-400">Please select a birth chart to view life predictions</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Calculating your Cosmic Journey...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-xl">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Advanced Life Predictor</h1>
                        {dayFav && (
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${dayFav.color === 'Green' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                dayFav.color === 'Red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                {dayFav.color} Day
                            </div>
                        )}
                    </div>
                    <p className="text-slate-400 font-medium">
                        Personalized weighted scoring & Panchapakshi intra-day timing.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all flex items-center gap-2 font-medium"
                    >
                        Detailed Filters
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                >
                    <FilterPanel
                        selectedHouses={selectedHouses}
                        selectedPlanets={selectedPlanets}
                        selectedCategories={selectedCategories}
                        onHousesChange={setSelectedHouses}
                        onPlanetsChange={setSelectedPlanets}
                        onCategoriesChange={setSelectedCategories}
                    />
                </motion.div>
            )}

            {/* Narrative Section */}
            {narrative && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-2xl border border-indigo-500/20 shadow-xl"
                >
                    <div className="flex items-start gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${narrative.element === 'Fire' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            narrative.element === 'Water' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                            <Zap size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">{narrative.headline}</h2>
                            <p className="text-slate-300 leading-relaxed max-w-4xl">{narrative.body}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-5 space-y-8">
                    <LifePredictorCalendar
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        smartSummary={smartSummary}
                        isLoading={loading}
                    />

                    {/* Day Score Breakdown if selected */}
                    {dayFav && (
                        <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800 backdrop-blur-md">
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Daily Score Insights</h3>
                            <div className="space-y-4">
                                {Object.entries(dayFav.components).map(([key, val]: [string, any]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${val >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                    style={{ width: `${Math.abs(val) * 10}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-bold w-6 text-right ${val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {val > 0 ? '+' : ''}{val}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Cosmic Timeline for Today */}
                    {todayAdvanced && (
                        <CosmicTimeline moments={todayAdvanced.moments} isLoading={loading} />
                    )}

                    {/* Daily Detailed List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                Detailed Influences
                                <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                    {dailyPredictions.length} Found
                                </span>
                            </h3>
                        </div>

                        <DailyPredictionList
                            selectedDate={selectedDate}
                            predictions={dailyPredictions}
                            isLoading={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-xs text-slate-600 max-w-2xl mx-auto mt-12">
                Astrological predictions are for guidance only. The planets indicate trends and energies; your free will determines how you use them.
            </div>
        </div>
    );
};

export default LifePredictorPage;
