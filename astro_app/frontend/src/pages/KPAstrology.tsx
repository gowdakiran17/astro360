import { useState, useEffect } from 'react';
import api from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import {
    Info, Activity, RefreshCw, Grid, Shield, Star, Zap, Clock, Users, Calculator, Crosshair, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChartSettings } from '../context/ChartContext';

interface KPLord {
    sign_lord: string;
    star_lord: string;
    sub_lord: string;
    sub_sub_lord: string;
}

interface KPCusp {
    house: number;
    degree: string;
    sign: string;
    lords: KPLord;
}

interface KPPlanet {
    name: string;
    degree: string;
    sign: string;
    is_retrograde: boolean;
    lords: KPLord;
}

interface KPSignificator {
    levels: {
        A: string[];
        B: string[];
        C: string[];
        D: string[];
    };
    description: string;
}

interface KPRulingPlanets {
    day_lord: string;
    moon_star: string;
    moon_sign: string;
    lagna_star: string;
    lagna_sign: string;
}

interface KPPrediction {
    area: string;
    score: number;
    strength: string;
    description: string;
}

interface KPHitScore {
    planet: string;
    nl_house: number;
    sl_house: number;
    rating: string;
}

interface KPRemedy {
    planet: string;
    house: number;
    mantra: string;
    stone: string;
    donation: string;
}

interface KPData {
    ayanamsa: string;
    cusps: KPCusp[];
    planets: KPPlanet[];
    significators: Record<string, KPSignificator>;
    ruling_planets: KPRulingPlanets;
    predictive_iq: KPPrediction[];
    hit_matrix: KPHitScore[];
    remedies: KPRemedy[];
}

const KPAstrology = () => {
    const { currentProfile } = useChartSettings();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [kpData, setKpData] = useState<KPData | null>(null);
    const [activeTab, setActiveTab] = useState<'tables' | 'significators' | 'predictive' | 'horary' | 'ruling' | 'remedies'>('tables');
    const [horaryNumber, setHoraryNumber] = useState<number>(1);

    useEffect(() => {
        if (currentProfile) {
            fetchKPData(currentProfile);
        }
    }, [currentProfile]);

    const fetchKPData = async (profile: any) => {
        setLoading(true);
        setError('');
        try {
            const payload = {
                birth_details: {
                    date: profile.date,
                    time: profile.time,
                    timezone: profile.timezone,
                    latitude: profile.latitude,
                    longitude: profile.longitude
                },
                horary_number: horaryNumber
            };
            const response = await api.post('/chart/kp-astrology', payload);
            setKpData(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch KP Astrology data.');
        } finally {
            setLoading(false);
        }
    };

    const handleHorarySubmit = () => {
        if (currentProfile) {
            fetchKPData(currentProfile);
        }
    };

    const tabs = [
        { id: 'tables', label: 'Lords & Tables', icon: <Grid size={18} /> },
        { id: 'significators', label: 'Significators', icon: <Zap size={18} /> },
        { id: 'predictive', label: 'Predictive IQ', icon: <Activity size={18} /> },
        { id: 'horary', label: 'Horary', icon: <Crosshair size={18} /> },
        { id: 'ruling', label: 'Ruling Planets', icon: <Clock size={18} /> },
        { id: 'remedies', label: 'Remedies', icon: <Shield size={18} /> },
    ];

    return (
        <MainLayout title="KP Astrology" breadcrumbs={['Calculations', 'KP Astrology']}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Grid className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">KP Precision System</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Krishnamurti Padhdhati: Sub Lord & Significator Logic</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 text-xs font-bold rounded-md transition-all capitalize ${activeTab === tab.id
                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-500'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => currentProfile && fetchKPData(currentProfile)}
                            className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 active:scale-95 transition-all"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-4 rounded-xl border border-rose-100 dark:border-rose-500/20 flex items-center gap-3">
                        <Info className="w-5 h-5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-indigo-100 dark:border-slate-800 rounded-full animate-spin"></div>
                            <div className="absolute top-0 w-20 h-20 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Calculating Sub-Sub Lords & Significators...</p>
                    </div>
                ) : kpData ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'tables' && (
                                <div className="space-y-8">
                                    {/* Cusp Table */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-indigo-500" /> KP House Cusps (Placidus)
                                            </h3>
                                            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 px-2 py-1 rounded font-bold uppercase tracking-wider">
                                                Ayanamsa: {kpData.ayanamsa}
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[11px] uppercase tracking-wider">
                                                        <th className="px-6 py-3 text-left font-black">Cusp</th>
                                                        <th className="px-6 py-3 text-left font-black">Degree</th>
                                                        <th className="px-6 py-3 text-left font-black">Sign</th>
                                                        <th className="px-6 py-3 text-left font-black">Sign Lord</th>
                                                        <th className="px-6 py-3 text-left font-black">Star Lord</th>
                                                        <th className="px-6 py-3 text-left font-black text-indigo-600 dark:text-indigo-400">Sub Lord</th>
                                                        <th className="px-6 py-3 text-left font-black">Sub-Sub Lord</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {kpData.cusps.map((cusp) => (
                                                        <tr key={cusp.house} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Cusp {cusp.house}</td>
                                                            <td className="px-6 py-4 text-slate-500 font-mono">{cusp.degree}</td>
                                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{cusp.sign}</td>
                                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{cusp.lords.sign_lord}</td>
                                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{cusp.lords.star_lord}</td>
                                                            <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-bold">{cusp.lords.sub_lord}</td>
                                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{cusp.lords.sub_sub_lord}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Planet Table */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Star className="w-4 h-4 text-amber-500" /> KP Planetary Positions
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[11px] uppercase tracking-wider">
                                                        <th className="px-6 py-3 text-left font-black">Planet</th>
                                                        <th className="px-6 py-3 text-left font-black">Degree</th>
                                                        <th className="px-6 py-3 text-left font-black">Sign</th>
                                                        <th className="px-6 py-3 text-left font-black">Sign Lord</th>
                                                        <th className="px-6 py-3 text-left font-black">Star Lord</th>
                                                        <th className="px-6 py-3 text-left font-black text-indigo-600 dark:text-indigo-400">Sub Lord</th>
                                                        <th className="px-6 py-3 text-left font-black">Sub-Sub Lord</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {kpData.planets.map((planet) => (
                                                        <tr key={planet.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                            <td className="px-6 py-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                                                {planet.name}
                                                                {planet.is_retrograde && <span className="text-[10px] text-rose-500">(R)</span>}
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500 font-mono">{planet.degree}</td>
                                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{planet.sign}</td>
                                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{planet.lords.sign_lord}</td>
                                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{planet.lords.star_lord}</td>
                                                            <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-bold">{planet.lords.sub_lord}</td>
                                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{planet.lords.sub_sub_lord}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'significators' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                                    {Object.entries(kpData.significators).map(([house, sigs]) => (
                                        <div key={house} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-indigo-400 transition-all group">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-slate-900 dark:text-white group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    {house}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Significators</span>
                                            </div>
                                            <div className="space-y-4">
                                                {['A', 'B', 'C', 'D'].map((level) => (
                                                    <div key={level} className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
                                                        <span className="text-xs font-bold text-slate-400">Level {level}</span>
                                                        <div className="flex gap-1">
                                                            {sigs.levels[level as keyof typeof sigs.levels].map((p) => (
                                                                <span key={p} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                                                    {p}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="mt-4 text-[10px] text-slate-400 leading-relaxed italic">
                                                {sigs.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'predictive' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                                <Activity className="text-indigo-500" />
                                                Nakshatranadi Success Ratings
                                            </h3>
                                            <div className="space-y-6">
                                                {kpData.predictive_iq.map((pred, i) => (
                                                    <div key={i} className="group">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-slate-800 dark:text-slate-200 font-bold">{pred.area}</span>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${pred.strength === 'High' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                                    pred.strength === 'Medium' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                                                        'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                                }`}>
                                                                {pred.strength}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(pred.score / 9) * 100}%` }}
                                                                className={`h-full rounded-full ${pred.strength === 'High' ? 'bg-emerald-500' :
                                                                        pred.strength === 'Medium' ? 'bg-blue-500' :
                                                                            'bg-amber-500'
                                                                    }`}
                                                            />
                                                        </div>
                                                        <p className="mt-2 text-[11px] text-slate-400 italic">{pred.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                                <Zap className="text-amber-500" />
                                                Hit Theory Analysis (NL vs SL)
                                            </h3>
                                            <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-2xl">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
                                                            <th className="py-4 px-4">Planet</th>
                                                            <th className="py-4 px-4">NL Pos.</th>
                                                            <th className="py-4 px-4">SL Pos.</th>
                                                            <th className="py-4 px-4">Rating</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-sm">
                                                        {kpData.hit_matrix.map((hit, i) => (
                                                            <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                                <td className="py-4 px-4 text-slate-900 dark:text-white font-bold">{hit.planet}</td>
                                                                <td className="py-4 px-4 text-slate-500 font-medium text-xs">House {hit.nl_house}</td>
                                                                <td className="py-4 px-4 text-slate-500 font-medium text-xs">House {hit.sl_house}</td>
                                                                <td className="py-4 px-4">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${hit.rating === 'E' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                                                                            hit.rating === 'H' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                                                hit.rating === 'M' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                                                                    hit.rating === 'L' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                                                                        'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                        }`}>
                                                                        {hit.rating === 'E' ? 'Excellent' :
                                                                            hit.rating === 'H' ? 'High' :
                                                                                hit.rating === 'M' ? 'Medium' :
                                                                                    hit.rating === 'L' ? 'Low' :
                                                                                        hit.rating === 'B' ? 'Bad' : 'Very Bad'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p className="mt-6 text-[10px] text-slate-400 leading-relaxed">
                                                * Hit Theory calculates success based on the Sub Lord's placement relative to the Nakshatra Lord.
                                                Excellent ratings indicate powerful event fruition.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'remedies' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {kpData.remedies.map((rem, i) => (
                                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all relative overflow-hidden group">
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                                            {rem.planet.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-slate-900 dark:text-white font-black">{rem.planet} Remedy</h4>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">House {rem.house} Affliction</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                                            <span className="text-[9px] uppercase tracking-[0.2em] text-indigo-500 font-black block mb-2">Activated Mantra</span>
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium italic">"{rem.mantra}"</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                                                <span className="text-[9px] uppercase tracking-[0.2em] text-amber-500 font-black block mb-2">Vibrational Stone</span>
                                                                <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">{rem.stone}</p>
                                                            </div>
                                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                                                <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-500 font-black block mb-2">Karmic Donation</span>
                                                                <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">{rem.donation}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-indigo-600 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 text-white">
                                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                                            <Info size={32} />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="text-xl font-black mb-2">Protocol for KP Remedial Success</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-indigo-100 mt-4">
                                                <p><strong className="text-white block mb-1">Mantra Discipline</strong> 108 chants or 27 morning/evening for 21 days.</p>
                                                <p><strong className="text-white block mb-1">Ritual Timing</strong> Wear stones on the planetary day (e.g. Sunday for Sun).</p>
                                                <p><strong className="text-white block mb-1">Donation Ethics</strong> Best performed during the planetary hora or sunrise.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'horary' && (
                                <div className="max-w-2xl mx-auto space-y-8 py-12">
                                    <div className="bg-slate-900 rounded-3xl p-10 text-center relative overflow-hidden shadow-2xl">
                                        <div className="relative z-10">
                                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <Calculator className="w-8 h-8 text-indigo-400" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white mb-2">KP Horary Calculator</h2>
                                            <p className="text-slate-400 mb-10">Enter a number between 1 and 249 to fix the Lagna for your question.</p>

                                            <div className="flex items-center justify-center gap-4 mb-8">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="249"
                                                    value={horaryNumber}
                                                    onChange={(e) => setHoraryNumber(parseInt(e.target.value))}
                                                    className="w-32 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-3xl font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                />
                                                <button
                                                    onClick={handleHorarySubmit}
                                                    className="h-16 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95"
                                                >
                                                    <Crosshair className="w-5 h-5" /> Calculate
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap justify-center gap-2">
                                                {[1, 5, 24, 72, 108, 145, 249].map((n) => (
                                                    <button
                                                        key={n}
                                                        onClick={() => setHoraryNumber(n)}
                                                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-[10px] text-slate-400 rounded-lg transition-colors"
                                                    >
                                                        #{n}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
                                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full"></div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-start gap-4">
                                        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                                            <HelpCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">What is KP Horary?</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                KP Horary (Prashna) uses a unique number system to determine the exact degree of the Ascendant.
                                                Unlike traditional horary which uses the time of the question, KP Horary incorporates the client's
                                                intuition (the number picked) to pinpoint the Sub Lord and Sub-Sub Lord for the outcome.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ruling' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                        {[
                                            { label: 'Day Lord', value: kpData.ruling_planets.day_lord, icon: Clock, color: 'text-amber-500' },
                                            { label: 'Moon Star', value: kpData.ruling_planets.moon_star, icon: Star, color: 'text-slate-400' },
                                            { label: 'Moon Sign', value: kpData.ruling_planets.moon_sign, icon: Activity, color: 'text-indigo-400' },
                                            { label: 'Lagna Star', value: kpData.ruling_planets.lagna_star, icon: Zap, color: 'text-yellow-400' },
                                            { label: 'Lagna Sign', value: kpData.ruling_planets.lagna_sign, icon: Shield, color: 'text-emerald-400' },
                                        ].map((rp) => (
                                            <div key={rp.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                                                <div className={`w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 ${rp.color}`}>
                                                    <rp.icon className="w-6 h-6" />
                                                </div>
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{rp.label}</h4>
                                                <div className="text-xl font-black text-slate-900 dark:text-white">{rp.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-indigo-900 text-white rounded-3xl p-10 relative overflow-hidden">
                                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-black mb-4">The Theory of Ruling Planets</h3>
                                                <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                                                    In KP Astrology, Ruling Planets are the most powerful predictors for timing events.
                                                    The planets ruling the Lagna and the Moon at any given moment reveal the "Cosmic Signature"
                                                    of the situation. If a planet is both a Ruling Planet and a Significator (Levels A-D),
                                                    it becomes a primary time-marker for the event's fruition.
                                                </p>
                                                <div className="flex items-center gap-4 text-xs font-bold text-indigo-300 uppercase tracking-widest">
                                                    <Users className="w-4 h-4" /> Current RP Sync Active
                                                </div>
                                            </div>
                                            <div className="w-full md:w-64 aspect-square bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex flex-col items-center justify-center p-8 text-center">
                                                <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2">Primary Key</div>
                                                <div className="text-4xl font-black mb-1">{kpData.ruling_planets.moon_star}</div>
                                                <div className="text-[10px] font-medium text-indigo-200 opacity-60">Dominant Vibrational Link</div>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] -mr-48 -mt-48"></div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl p-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Grid className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">KP Analysis Ready</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                            Select a birth profile to generate the precision KP Cusp and Planet tables with Sub Lord analysis.
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default KPAstrology;
