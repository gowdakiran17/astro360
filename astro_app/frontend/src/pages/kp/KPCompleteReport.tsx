import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useChart } from '../../context/ChartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import KPPlanetTable from '../../components/kp/KPPlanetTable';
import KPHouseTable from '../../components/kp/KPHouseTable';
import KPSignificatorsTable from '../../components/kp/KPSignificatorsTable';
import { FileText, Printer, Download, Star, Map, History, BarChart2, Target } from 'lucide-react';

const KPCompleteReport: React.FC = () => {
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
            const response = await api.post('kp/complete-report', { birth_details: payload });
            setData(response.data);
        } catch (err: any) {
            console.error("Error fetching complete KP report:", err);
            setError("Failed to load the complete report. Please try again.");
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
        <div className="p-6 md:p-12 space-y-16 animate-in fade-in duration-700 max-w-6xl mx-auto">
            {/* Report Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-white/10 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                            <Star className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Premium Astrological Certificate</span>
                    </div>
                    <h1 className="text-5xl font-black text-white leading-tight">Comprehensive KP<br />Astrology Report</h1>
                    <div className="flex items-center gap-6 mt-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Name</span>
                            <span className="text-white font-medium">{currentProfile?.name}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Birth Date</span>
                            <span className="text-white font-medium">{currentProfile?.date}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Location</span>
                            <span className="text-white font-medium">{currentProfile?.location}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all shadow-xl">
                        <Printer className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-indigo-600/20">
                        <Download className="w-5 h-5" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* 1. Planetary Script */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Map className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Planetary Positions & Script</h2>
                </div>
                <KPPlanetTable planets={data.chart.planets} />
            </section>

            {/* 2. House Cusps */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Target className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">House Cusp Significance</h2>
                </div>
                <KPHouseTable houses={data.chart.house_cusps} />
            </section>

            {/* 3. Predictions Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section className="space-y-8 p-10 bg-indigo-600/5 border border-indigo-500/20 rounded-3xl">
                    <div className="flex items-center gap-4">
                        <History className="w-6 h-6 text-indigo-400" />
                        <h2 className="text-2xl font-bold text-white">Current Period Insight</h2>
                    </div>
                    <p className="text-xl text-slate-200 leading-relaxed font-serif italic">
                        "{data.predictions?.prediction || 'Your current Mahadasha is guiding you toward self-realization and professional growth. This is a foundational period for future success.'}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {data.predictions?.house_activations?.map((h: number) => (
                            <span key={h} className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/20">
                                House {h} Active
                            </span>
                        ))}
                    </div>
                </section>

                <section className="space-y-8 p-10 bg-white/5 border border-white/10 rounded-3xl">
                    <div className="flex items-center gap-4">
                        <BarChart2 className="w-6 h-6 text-emerald-400" />
                        <h2 className="text-2xl font-bold text-white">Precision Scores</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {Object.entries(data.scores?.scores || {}).slice(0, 6).map(([planet, score]: [string, any]) => (
                            <div key={planet} className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-slate-400 text-sm">{planet}</span>
                                <span className="text-white font-bold">{score}%</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* 4. Significators */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-amber-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Full Significator Matrix</h2>
                </div>
                <KPSignificatorsTable significators={data.chart.significators} />
            </section>

            {/* Report Footer */}
            <div className="pt-16 border-t border-white/10 text-center space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mx-auto">
                    This report is generated using advanced Placidus house system algorithms and the 249 sub-division Krishnamurti Padhdhati methodology. The results are calculated based on the precise lat/long coordinates provided.
                </p>
                <p className="text-[10px] text-indigo-400/50 font-bold uppercase tracking-widest">© 2026 ASTRO360 KP ANALYTICS ENGINE</p>
            </div>
        </div>
    );
};

export default KPCompleteReport;
