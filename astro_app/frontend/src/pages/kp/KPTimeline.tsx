import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useChart } from '../../context/ChartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import DashaTimeline from '../../components/kp/DashaTimeline';
import { Calendar, History, ArrowRight, Info } from 'lucide-react';

const KPTimeline: React.FC = () => {
    const { currentProfile } = useChart();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [yearsAhead, setYearsAhead] = useState(5);

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
            const response = await api.post('kp/dasha-timeline', {
                birth_details: payload,
                years_ahead: yearsAhead
            });
            setData(response.data);
        } catch (err: any) {
            console.error("Error fetching KP timeline:", err);
            setError("Failed to load Dasha timeline. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [currentProfile, yearsAhead]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;
    if (error) return <div className="p-8 text-center text-red-400 bg-red-900/20 rounded-xl border border-red-900/50 m-6">{error}</div>;
    if (!data) return null;

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                        <History className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">KP Dasha Timeline</h1>
                        <p className="text-slate-400">Detailed Mahadasha and Antardasha roadmap for your life events.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/10">
                    {[5, 10, 20].map((y) => (
                        <button
                            key={y}
                            onClick={() => setYearsAhead(y)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${yearsAhead === y ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {y} Years
                        </button>
                    ))}
                </div>
            </div>

            {/* Current Period Insight */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] uppercase font-bold tracking-widest border border-indigo-500/30 mb-2 inline-block">
                            Currently Running
                        </span>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-white">{data.current_period.mahadasha}</span>
                            <ArrowRight className="w-5 h-5 text-slate-500" />
                            <span className="text-2xl font-bold text-white">{data.current_period.antardasha}</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">
                            Started on {data.current_period.start_date.split(' ')[0]}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10 max-w-md">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                        In KP Astrology, the Sub Lord (Antardasha) indicates the final result of an event, while the Star Lord indicates the general trend.
                    </p>
                </div>
            </div>

            {/* Timeline Visualization */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 px-2">
                    Predictions Roadmap
                </h2>
                <DashaTimeline timeline={data.timeline} currentPeriod={data.current_period} />
            </div>
        </div>
    );
};

export default KPTimeline;
