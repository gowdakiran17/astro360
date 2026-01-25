'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import { useChartSettings } from '../context/ChartContext';
import {
    ShieldAlert, Sparkles,
    ChevronRight, CheckCircle2,
    XCircle, Activity, Info, Heart,
    Users, Briefcase
} from 'lucide-react';

import UniversalChart from '../components/charts/UniversalChart';

type CompatibilityMode = 'relationship' | 'business';

const ChartCompatibility = () => {
    // const { user } = useAuth();
    const { availableProfiles, currentProfile } = useChartSettings();
    // const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [loading, setLoading] = useState(false);
    const [matchData, setMatchData] = useState<any>(null);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<CompatibilityMode>('relationship');

    const [selectedBoyId, setSelectedBoyId] = useState('');
    const [selectedGirlId, setSelectedGirlId] = useState('');

    // Auto-select based on available profiles and current selection
    useEffect(() => {
        if (availableProfiles.length > 0) {
            // Try to set one of the slots to the current profile
            if (currentProfile?.raw?.id) {
                const currentId = currentProfile.raw.id;
                const currentGender = currentProfile.raw.gender?.toLowerCase();
                
                if (currentGender === 'male') {
                    setSelectedBoyId(prev => prev || currentId);
                } else if (currentGender === 'female') {
                    setSelectedGirlId(prev => prev || currentId);
                } else {
                    // Fallback or unknown gender, maybe default to Boy slot if empty?
                    if (!selectedBoyId) setSelectedBoyId(currentId);
                }
            }

            // Fill empty slots with defaults
            if (!selectedBoyId) {
                const boy = availableProfiles.find((c: any) => c.gender?.toLowerCase() === 'male' && c.id !== selectedGirlId);
                if (boy) setSelectedBoyId(boy.id);
            }
            if (!selectedGirlId) {
                const girl = availableProfiles.find((c: any) => c.gender?.toLowerCase() === 'female' && c.id !== selectedBoyId);
                if (girl) setSelectedGirlId(girl.id);
            }
        }
    }, [availableProfiles, currentProfile]); // Only run when these change

    const handleCalculate = async () => {
        if (!selectedBoyId || !selectedGirlId) {
            setError("Please select both charts to compare.");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const boyChart = availableProfiles.find(c => c.id == selectedBoyId);
            const girlChart = availableProfiles.find(c => c.id == selectedGirlId);

            if (!boyChart || !girlChart) throw new Error("Chart details not found");

            const endpoint = mode === 'business' ? '/chart/business' : '/chart/compatibility';
            const response = await api.post(endpoint, {
                boy: {
                    date: boyChart.date_str,
                    time: boyChart.time_str,
                    timezone: boyChart.timezone_str,
                    latitude: boyChart.latitude,
                    longitude: boyChart.longitude
                },
                girl: {
                    date: girlChart.date_str,
                    time: girlChart.time_str,
                    timezone: girlChart.timezone_str,
                    latitude: girlChart.latitude,
                    longitude: girlChart.longitude
                }
            });
            setMatchData(response.data);
        } catch (err: any) {
            console.error("Failed to fetch compatibility", err);
            setError(err.response?.data?.detail || "Failed to calculate compatibility.");
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 25) return 'bg-emerald-500';
        if (score >= 18) return 'bg-teal-400';
        if (score >= 12) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 25) return 'Excellent';
        if (score >= 18) return 'Good';
        if (score >= 12) return 'Average';
        return 'Low';
    };

    const KootaCard = ({ data }: any) => (
        <div className="card-base card-hover p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.score > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-500'}`}>
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{data.label}</div>
                    <div className="font-bold text-slate-800 text-sm">{data.desc}</div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{data.score} / {data.max}</div>
                    <div className={`text-[9px] font-bold uppercase ${data.score / data.max > 0.5 ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {data.score === data.max ? 'Full Points' : data.score > 0 ? 'Partial' : 'No Points'}
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400" />
            </div>
        </div>
    );

    return (
        <MainLayout title="Chart Compatibility" breadcrumbs={['Home', 'Matching']} showHeader={false}>
            <div className="max-w-5xl mx-auto space-y-6 pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Compatibility Analysis</h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">Check compatibility between two charts.</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        <button
                            onClick={() => { setMode('relationship'); setMatchData(null); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                mode === 'relationship'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <Users className="w-4 h-4" /> Relationship
                        </button>
                        <button
                            onClick={() => { setMode('business'); setMatchData(null); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                mode === 'business'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <Briefcase className="w-4 h-4" /> Business
                        </button>
                    </div>
                </div>

                {/* Selection Card */}
                <div className="card-base p-6 md:p-8 space-y-6">
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                        <div className="flex gap-4 items-start mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Info className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-xs font-semibold text-slate-600 leading-relaxed">
                                Vedic compatibility analysis requires one male and one female chart for traditional calculations. Select your charts below to begin the analysis.
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label htmlFor="male-chart-select" className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">First Chart (Male)</label>
                                <select
                                    id="male-chart-select"
                                    value={selectedBoyId}
                                    onChange={(e) => setSelectedBoyId(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                                    aria-label="Select Male Chart Profile"
                                >
                                    <option value="">Select Male Profile</option>
                                    {availableProfiles.map(c => (
                                        <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="female-chart-select" className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">Second Chart (Female)</label>
                                <select
                                    id="female-chart-select"
                                    value={selectedGirlId}
                                    onChange={(e) => setSelectedGirlId(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                                    aria-label="Select Female Chart Profile"
                                >
                                    <option value="">Select Female Profile</option>
                                    {availableProfiles.map(c => (
                                        <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handleCalculate}
                                disabled={loading || !selectedBoyId || !selectedGirlId}
                                className="w-full btn-primary flex items-center justify-center gap-3"
                            >
                                <Heart className="w-4 h-4" />
                                {loading ? 'Calculating Compatibility...' : 'Calculate Compatibility'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Match Details Section */}
                {matchData && (
                    <div className="space-y-6 pt-10 animate-slide-up">
                        
                        {/* Charts - Only show if available (Relationship mode usually has them) */}
                        {matchData.boy_charts && matchData.girl_charts && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="card-base p-6 aspect-square flex flex-col items-center justify-center relative">
                                    <div className="absolute top-4 left-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Partner 1 (Male)</div>
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UniversalChart data={matchData.boy_charts} className="w-full max-w-[300px]" />
                                    </div>
                                </div>
                                <div className="card-base p-6 aspect-square flex flex-col items-center justify-center relative">
                                    <div className="absolute top-4 left-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Partner 2 (Female)</div>
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UniversalChart data={matchData.girl_charts} className="w-full max-w-[300px]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Score Card */}
                        <div className="card-base p-8 space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                        {mode === 'relationship' ? 'Guna Milan Score' : 'Business Compatibility Score'}
                                    </div>
                                    <div className="text-5xl font-display font-bold text-slate-900">
                                        {matchData.total_score} 
                                        <span className="text-xl text-slate-300">/ {matchData.maximum_score || 36}</span>
                                    </div>
                                    {mode === 'business' && (
                                        <div className="text-sm font-medium text-slate-500 mt-2">
                                            {matchData.conclusion}
                                        </div>
                                    )}
                                </div>
                                {mode === 'relationship' && (
                                    <div className={`px-4 py-2 rounded-2xl text-white font-bold text-xs uppercase tracking-widest shadow-lg ${getScoreColor(matchData.total_score)}`}>
                                        {getScoreLabel(matchData.total_score)} Match
                                    </div>
                                )}
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex p-1">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        mode === 'relationship' 
                                            ? getScoreColor(matchData.total_score) 
                                            : (matchData.total_score > 75 ? 'bg-emerald-500' : matchData.total_score > 50 ? 'bg-amber-500' : 'bg-rose-500')
                                    }`}
                                    style={{ width: `${(matchData.total_score / (matchData.maximum_score || 36)) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Business Compatibility Details */}
                        {mode === 'business' && matchData.details && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Moon Compatibility */}
                                <div className="card-base p-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-bold uppercase text-slate-400 tracking-widest">Mental Sync</div>
                                        <div className="text-lg font-black text-indigo-600">{matchData.details.moon_compatibility.score} / {matchData.details.moon_compatibility.max}</div>
                                    </div>
                                    <h3 className="font-bold text-slate-800">Mind & Thought Process</h3>
                                    <p className="text-sm text-slate-500">{matchData.details.moon_compatibility.desc}</p>
                                </div>
                                {/* Ascendant Compatibility */}
                                <div className="card-base p-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-bold uppercase text-slate-400 tracking-widest">Work Style</div>
                                        <div className="text-lg font-black text-indigo-600">{matchData.details.ascendant_compatibility.score} / {matchData.details.ascendant_compatibility.max}</div>
                                    </div>
                                    <h3 className="font-bold text-slate-800">Personality & Approach</h3>
                                    <p className="text-sm text-slate-500">{matchData.details.ascendant_compatibility.desc}</p>
                                </div>
                                {/* Wealth Planets */}
                                <div className="card-base p-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-bold uppercase text-slate-400 tracking-widest">Financial Growth</div>
                                        <div className="text-lg font-black text-indigo-600">{matchData.details.wealth_planets.score} / {matchData.details.wealth_planets.max}</div>
                                    </div>
                                    <h3 className="font-bold text-slate-800">Jupiter & Mercury Strength</h3>
                                    <p className="text-sm text-slate-500">{matchData.details.wealth_planets.desc}</p>
                                </div>
                            </div>
                        )}

                        {/* Relationship Compatibility Details */}
                        {mode === 'relationship' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <Sparkles className="w-4 h-4 text-slate-400" />
                                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Ashtakoot Milan Breakdown</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(matchData.details).map(([key, val]: any) => (
                                            <KootaCard key={key} data={val} />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="card-base p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Manglik Dosha</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                                                <span className="text-xs font-bold text-slate-600">Partner 1</span>
                                                {matchData.manglik.boy ? (
                                                    <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase">
                                                        <XCircle className="w-3 h-3" /> Manglik
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase">
                                                        <CheckCircle2 className="w-3 h-3" /> Non-Manglik
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                                                <span className="text-xs font-bold text-slate-600">Partner 2</span>
                                                {matchData.manglik.girl ? (
                                                    <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase">
                                                        <XCircle className="w-3 h-3" /> Manglik
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase">
                                                        <CheckCircle2 className="w-3 h-3" /> Non-Manglik
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`p-4 rounded-2xl border ${matchData.manglik.compatible ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'} text-xs font-bold text-center`}>
                                                {matchData.manglik.compatible
                                                    ? "Manglik Dosha is balanced/absent."
                                                    : "Manglik Dosha mismatch detected."}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                            <Activity className="w-32 h-32" />
                                        </div>
                                        <h3 className="font-bold text-indigo-400 text-[10px] uppercase tracking-[0.2em] mb-6 relative z-10">7th House Analysis</h3>
                                        <div className="space-y-4 relative z-10">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-[9px] font-black text-slate-500 uppercase">P1 Strength</div>
                                                    <div className="text-xl font-black">{matchData.house_7_analysis.boy.strength}%</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[9px] font-black text-slate-500 uppercase">Sign</div>
                                                    <div className="text-xs font-bold">{matchData.house_7_analysis.boy.sign}</div>
                                                </div>
                                            </div>
                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-400" style={{ width: `${matchData.house_7_analysis.boy.strength}%` }} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-[9px] font-black text-slate-500 uppercase">P2 Strength</div>
                                                    <div className="text-xl font-black">{matchData.house_7_analysis.girl.strength}%</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[9px] font-black text-slate-500 uppercase">Sign</div>
                                                    <div className="text-xs font-bold">{matchData.house_7_analysis.girl.sign}</div>
                                                </div>
                                            </div>
                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-400" style={{ width: `${matchData.house_7_analysis.girl.strength}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default ChartCompatibility;
