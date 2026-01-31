import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useChart } from '../../context/ChartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Target, Sparkles, AlertTriangle, Lightbulb, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

const KPDetailedPredictions: React.FC = () => {
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
            const response = await api.post('kp/detailed-predictions', { birth_details: payload });
            setData(response.data);
        } catch (err: any) {
            console.error("Error fetching KP predictions:", err);
            setError("Failed to load detailed predictions. Please try again.");
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
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Target className="w-48 h-48 rotate-12" />
                </div>
                <div className="relative z-10">
                    <span className="px-4 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                        Period Analysis
                    </span>
                    <h1 className="text-4xl font-bold text-white mb-4">Detailed Predictions</h1>
                    <p className="text-blue-100/80 max-w-2xl text-lg">
                        High-precision event forecasting based on your current Mahadasha and Antardasha activations.
                    </p>
                </div>
            </div>

            {/* Main Prediction Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Key Focus */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="w-6 h-6 text-amber-400" />
                            <h2 className="text-2xl font-bold text-white">Central Theme</h2>
                        </div>
                        <p className="text-slate-200 text-lg leading-relaxed mb-8">
                            {data.prediction || "Your current period is activating key sectors of your life. Expect significant developments in the areas highlighted below."}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-blue-400" />
                                    <span className="font-bold text-blue-300">Key Opportunities</span>
                                </div>
                                <p className="text-sm text-slate-300">
                                    Planetary alignments suggest favorable outcomes in ventures requiring communication and strategic thinking during this period.
                                </p>
                            </div>
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                    <span className="font-bold text-emerald-300">Success Factor</span>
                                </div>
                                <p className="text-sm text-slate-300">
                                    Your Sub Lord's position indicates that persistence in career matters will yield tangible results by the end of this Antardasha.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cautions */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                            <h2 className="text-xl font-bold text-white">Caution & Warnings</h2>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                <p className="text-slate-300">Avoid making major financial commitments on Tuesdays or during Rahu Kaal in this period.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                <p className="text-slate-300">Verify all documentation twice before signing, as Mercury's influence may cause minor oversights.</p>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right: Activations & Stats */}
                <div className="space-y-8">
                    {/* House Activations */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                            House Activations
                            <Lightbulb className="w-4 h-4 text-emerald-400" />
                        </h3>
                        <div className="space-y-4">
                            {data.house_activations?.map((house: number) => (
                                <div key={house} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                    <span className="text-slate-400 text-sm">House {house}</span>
                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase">Active</span>
                                </div>
                            ))}
                            {!data.house_activations && [1, 5, 9, 10].map(h => (
                                <div key={h} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                    <span className="text-slate-400 text-sm">House {h}</span>
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded uppercase">Pending</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Advice */}
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-600/20">
                        <h3 className="text-lg font-bold mb-4">Action Compass</h3>
                        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                            Based on your current script, focusing on networking and expanding your knowledge base will provide the highest ROI for your energy right now.
                        </p>
                        <button className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                            View Detailed Remedy
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPDetailedPredictions;
