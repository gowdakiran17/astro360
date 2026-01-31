import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useChart } from '../../context/ChartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CheckCircle2, AlertCircle, Timer, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const KPAccurateTiming: React.FC = () => {
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
            const response = await api.post('kp/dasha-timeline', { birth_details: payload, years_ahead: 2 });
            setData(response.data);
        } catch (err: any) {
            console.error("Error fetching timing data:", err);
            setError("Failed to load timing data. Please try again.");
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

    // Mock quality logic for visualization (in a real app, this would come from the backend scoring)
    const getQuality = (lord: string) => {
        const qualities: Record<string, any> = {
            'Sun': { label: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            'Moon': { label: 'Neutral', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            'Mars': { label: 'Mixed', color: 'text-amber-400', bg: 'bg-amber-500/10' },
            'Mercury': { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
            'Jupiter': { label: 'Superior', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            'Venus': { label: 'Bountiful', color: 'text-rose-400', bg: 'bg-rose-500/10' },
            'Saturn': { label: 'Delayed', color: 'text-slate-500', bg: 'bg-slate-500/10' },
            'Rahu': { label: 'Sudden', color: 'text-violet-400', bg: 'bg-violet-500/10' },
            'Ketu': { label: 'Unpredictable', color: 'text-rose-600', bg: 'bg-rose-600/10' }
        };
        return qualities[lord] || qualities['Sun'];
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-600/20">
                        <Timer className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Accurate Timing</h1>
                        <p className="text-slate-400">Micro-precision analysis of Antardasha quality for decisive action.</p>
                    </div>
                </div>
            </div>

            {/* Best/Worst Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                        <h2 className="text-xl font-bold text-white">Peak Performance Periods</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-emerald-500/10 rounded-lg flex justify-between items-center">
                            <span className="text-white font-medium">Next Favorable Window</span>
                            <span className="text-emerald-400 text-xs font-bold">Starts March 2026</span>
                        </div>
                        <p className="text-xs text-slate-500">Best for: New investments, Marriage, Job change</p>
                    </div>
                </div>

                <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <ArrowDownRight className="w-6 h-6 text-rose-500" />
                        <h2 className="text-xl font-bold text-white">Cautionary Phases</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-rose-500/10 rounded-lg flex justify-between items-center">
                            <span className="text-white font-medium">Rahu Antardasha Transition</span>
                            <span className="text-rose-400 text-xs font-bold">Duration: 1.5 Years</span>
                        </div>
                        <p className="text-xs text-slate-500">Avoid: Legal conflicts, Bulk purchases, Surgery</p>
                    </div>
                </div>
            </div>

            {/* Timing Roadmap */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white px-2">Antardasha Quality Roadmap</h2>
                <div className="space-y-4">
                    {data.timeline[0].antardashas.map((ad: any, i: number) => {
                        const quality = getQuality(ad.lord);
                        return (
                            <div key={i} className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                                <div className="w-24 text-center">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Starts</div>
                                    <div className="text-sm font-medium text-white">{ad.start_date.split(' ')[0]}</div>
                                </div>

                                <div className="h-10 w-px bg-white/10" />

                                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{ad.lord} Period</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Influenced by {data.timeline[0].mahadasha.lord} Mahadasha</p>
                                    </div>

                                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${quality.bg} ${quality.color} border border-white/5`}>
                                        {quality.label} Result
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    {quality.label === 'Excellent' || quality.label === 'Superior' ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-slate-700" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default KPAccurateTiming;
