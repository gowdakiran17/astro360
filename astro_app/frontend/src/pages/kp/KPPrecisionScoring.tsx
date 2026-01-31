import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useChart } from '../../context/ChartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChart3, TrendingUp, Minus, Info, Award } from 'lucide-react';

const KPPrecisionScoring: React.FC = () => {
    const { currentProfile } = useChart();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!currentProfile) return;

        setIsLoading(true);
        setError(null);

        const formatDate = (dateStr: string) => {
            if (dateStr.includes('-')) {
                const [y, m, d] = dateStr.split('-');
                return `${d}/${m}/${y}`;
            }
            return dateStr;
        };

        const payload = {
            date: formatDate(currentProfile.date),
            time: currentProfile.time,
            latitude: currentProfile.latitude,
            longitude: currentProfile.longitude,
            timezone: currentProfile.timezone
        };

        try {
            const response = await api.post('kp/precision-scores', { birth_details: payload });
            setData(response.data);
        } catch (err: any) {
            console.error("Error fetching KP scores:", err);
            setError("Failed to load precision scores. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [currentProfile]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;
    if (error) return <div className="p-8 text-center text-red-400 bg-red-900/20 rounded-xl border border-red-900/50 m-6">{error}</div>;
    if (!data) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 40) return 'text-amber-400';
        return 'text-rose-400';
    };

    const getBgColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
        if (score >= 60) return 'bg-blue-500/10 border-blue-500/20';
        if (score >= 40) return 'bg-amber-500/10 border-amber-500/20';
        return 'bg-rose-500/10 border-rose-500/20';
    };


    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Precision Scoring</h1>
                        <p className="text-slate-400">Quantitative analysis of planetary results based on Star Lord and Sub Lord power.</p>
                    </div>
                </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(data.scores).map(([planet, scoreData]: [string, any]) => (
                    <div key={planet} className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] duration-300 ${getBgColor(scoreData.score)}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xl font-bold text-white">{planet}</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 ${getScoreColor(scoreData.score)}`}>
                                {scoreData.rating}
                            </span>
                        </div>

                        <div className="flex items-end gap-2 mb-4">
                            <span className={`text-4xl font-black ${getScoreColor(scoreData.score)}`}>{scoreData.score}%</span>
                            <span className="text-slate-500 text-xs mb-1.5 font-medium">Efficiency</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden mb-6">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${scoreData.score >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                    scoreData.score >= 60 ? 'bg-blue-500' :
                                        scoreData.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                style={{ width: `${scoreData.score}%` }}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold">
                                <span className="text-emerald-400">Positive Houses</span>
                                <span className="text-slate-500">{scoreData.favorable_count}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {scoreData.favorable_houses.map((h: number) => (
                                    <span key={h} className="w-5 h-5 flex items-center justify-center rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px]">
                                        {h}
                                    </span>
                                ))}
                                {scoreData.favorable_houses.length === 0 && <span className="text-slate-600 italic text-[9px]">None</span>}
                            </div>

                            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold pt-1">
                                <span className="text-rose-400">Negative Houses</span>
                                <span className="text-slate-500">{scoreData.unfavorable_count}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {scoreData.unfavorable_houses.map((h: number) => (
                                    <span key={h} className="w-5 h-5 flex items-center justify-center rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px]">
                                        {h}
                                    </span>
                                ))}
                                {scoreData.unfavorable_houses.length === 0 && <span className="text-slate-600 italic text-[9px]">None</span>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-4 border-t border-white/5 mt-4 opacity-50">
                            <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                <span className="text-slate-300">Total: {scoreData.total_count}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* House Potentials */}
            <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-400" />
                    Summary of Potentials
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Favorable */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            High Potential Sectors
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 5, 9, 10, 11].map(h => (
                                <div key={h} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between">
                                    <span className="text-slate-300">House {h}</span>
                                    <Award className="w-4 h-4 text-emerald-500" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Neutral/Weak */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                            <Minus className="w-4 h-4" />
                            Neutral / Weak Sectors
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[3, 4, 6, 7, 8, 12].map(h => (
                                <div key={h} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                                    <span className="text-slate-500">House {h}</span>
                                    <Info className="w-4 h-4 text-slate-600" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* KP Logic Note */}
            <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-indigo-500 rounded-lg shrink-0">
                    <Info className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    <strong>KP Note:</strong> These scores are calculated by analyzing the planet's Star Lord and Sub Lord. A planet is considered strong (80%+) if its Sub Lord signifies favorable houses for the respective event, regardless of its own placement.
                </p>
            </div>
        </div>
    );
};

export default KPPrecisionScoring;
