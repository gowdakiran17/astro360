import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useChart } from '../../context/ChartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Layers, ChevronRight, Info, Zap } from 'lucide-react';

const KPThreeLayerScript: React.FC = () => {
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
            const response = await api.post('kp/chart', { birth_details: payload });
            setData(response.data);
        } catch (err: any) {
            console.error("Error fetching KP chart for script:", err);
            setError("Failed to load 3-Layer Script data. Please try again.");
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

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 p-8 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
                        <Layers className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">3-Layer Script</h1>
                        <p className="text-indigo-100/70">The fundamental "Engine" of KP Astrology: Planet → Star Lord → Sub Lord.</p>
                    </div>
                </div>
            </div>

            {/* Script Grid */}
            <div className="grid grid-cols-1 gap-6">
                {data.planets.map((p: any) => (
                    <div key={p.planet} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all">
                        <div className="flex flex-col md:flex-row items-stretch">
                            {/* Planet Label */}
                            <div className="w-full md:w-48 bg-white/5 p-6 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-white/10">
                                <span className="text-2xl font-black text-white">{p.planet}</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Planet</span>
                            </div>

                            {/* Layers */}
                            <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-around gap-8">
                                {/* Layer 1: Planet */}
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center mb-2 shadow-lg">
                                        <span className="text-xl font-bold text-indigo-400">{p.planet}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Source</span>
                                </div>

                                <ChevronRight className="w-6 h-6 text-slate-700 hidden md:block" />

                                {/* Layer 2: Star Lord */}
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-2 shadow-lg">
                                        <span className="text-xl font-bold text-amber-500">{p.star_lord}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Nature / Result</span>
                                </div>

                                <ChevronRight className="w-6 h-6 text-slate-700 hidden md:block" />

                                {/* Layer 3: Sub Lord */}
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2 shadow-lg">
                                        <span className="text-xl font-bold text-emerald-500">{p.sub_lord}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Event (Yes/No)</span>
                                </div>

                                <ChevronRight className="w-6 h-6 text-slate-700 hidden md:block" />

                                {/* Layer 4: Sub-Sub Lord */}
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-2 shadow-lg">
                                        <span className="text-xl font-bold text-indigo-500">{p.sub_sub_lord}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Precise Detail</span>
                                </div>
                            </div>

                            {/* Significations */}
                            <div className="w-full md:w-64 bg-black/20 p-6 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-3 h-3 text-amber-400" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signifies Houses</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.significators.planets[p.planet]?.map((h: number) => (
                                        <span key={h} className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Educational Note */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4">
                <Info className="w-6 h-6 text-indigo-400 shrink-0" />
                <div className="space-y-4">
                    <p className="text-sm text-slate-300">
                        <strong>The KP Theorem:</strong> A planet gives the results of its <strong>Star Lord</strong>. The quality and final outcome (success or failure) is determined by the <strong>Sub Lord</strong>. The Sub-Sub Lord provides the ultimate precision in timing and depth.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-slate-500 uppercase font-bold tracking-widest">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Planet = Source</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Star Lord = Trend</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Sub Lord = Finality</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPThreeLayerScript;
