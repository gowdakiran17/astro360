import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import {
    Diamond, Shield, Sparkles, Info, Flame, AlertTriangle,
    Droplets, Calendar, Star
} from 'lucide-react';
import api from '../services/api';
import AIReportButton from '../components/ai/AIReportButton';
import { useChartSettings } from '../context/ChartContext';
import { motion, AnimatePresence } from 'framer-motion';

interface GemAnalysis {
    suitability: "Highly Recommended" | "Suitable" | "Caution" | "Avoid";
    analysis: string;
    strength_score: number;
}

interface GemstoneData {
    type: string;
    gem_name: string;
    indian_name: string;
    planet: string;
    benefits: string;
    wear_finger: string;
    wear_metal: string;
    wearing_day: string;
    mantra: string;
    ritual: string;
    caution: string;
    substitute: string;
    analysis?: GemAnalysis;
}

interface GemstoneResponse {
    ascendant: string;
    recommendations: {
        life_stone: GemstoneData;
        lucky_stone: GemstoneData;
        benefic_stone: GemstoneData;
    };
    note: string;
}

const Gemstones = () => {
    const { currentProfile } = useChartSettings();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<GemstoneResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentProfile) {
            fetchGemstones();
        }
    }, [currentProfile]);

    const fetchGemstones = async () => {
        if (!currentProfile) return;
        setLoading(true);
        setError(null);
        try {
            const payload = {
                date: currentProfile.date,
                time: currentProfile.time,
                latitude: currentProfile.latitude,
                longitude: currentProfile.longitude,
                timezone: currentProfile.timezone
            };
            const response = await api.post('/tools/gemstones', payload);
            setData(response.data);
        } catch (err: any) {
            console.error("Failed to fetch gemstones", err);
            setError("Failed to load gemstone recommendations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Helper for Suitability Badge Colors (Light Theme)
    const getSuitabilityColor = (suitability?: string) => {
        switch (suitability) {
            case "Highly Recommended": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Suitable": return "bg-indigo-50 text-indigo-700 border-indigo-200";
            case "Caution": return "bg-amber-50 text-amber-700 border-amber-200";
            case "Avoid": return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-slate-50 text-slate-600 border-slate-200";
        }
    };

    // Component for Individual Gemstone Showcase
    const GemShowcase = ({ data, category, icon: Icon, delay }: { data: GemstoneData, category: string, icon: any, delay: number }) => {
        const [activeTab, setActiveTab] = useState<'essence' | 'ritual' | 'mantra'>('essence');

        return (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay }}
                className="relative group"
            >
                {/* Royal Light Card */}
                <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(79,70,229,0.1)] hover:-translate-y-1">

                    {/* Subtle Decorative Backgrounds */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-50/50 to-transparent rounded-tr-full" />

                    <div className="relative p-8 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-indigo-600 shadow-sm">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{category}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 uppercase tracking-wide">
                                            {data.planet}
                                        </span>
                                        {data.analysis && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-dashed uppercase tracking-wide ${getSuitabilityColor(data.analysis.suitability)}`}>
                                                {data.analysis.suitability}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Title & Gem Name */}
                        <div className="text-center mb-8 relative">
                            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-2 drop-shadow-sm tracking-tight">
                                {data.gem_name}
                            </h2>
                            <p className="font-serif italic text-xl text-indigo-500/80">"{data.indian_name}"</p>

                            {/* Decorative Line */}
                            <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto mt-6" />
                        </div>

                        {/* Strength Meter */}
                        {data.analysis && (
                            <div className="mb-8 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Planetary Vigor</span>
                                    <span className="text-sm font-bold text-slate-800">{data.analysis?.strength_score}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(data.analysis.strength_score, 100)}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.5 }}
                                        className={`h-full rounded-full ${data.analysis.strength_score < 100 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed text-center">
                                    {data.analysis.analysis}
                                </p>
                            </div>
                        )}

                        {/* Navigation Tabs */}
                        <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
                            {[
                                { id: 'essence', label: 'Essence' },
                                { id: 'ritual', label: 'Ritual' },
                                { id: 'mantra', label: 'Mantra' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${activeTab === tab.id
                                            ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 min-h-[180px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'essence' && (
                                    <motion.div
                                        key="essence"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4 text-center"
                                    >
                                        <p className="text-sm leading-7 text-slate-600 font-light">
                                            {data.benefits}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Metal</div>
                                                <div className="text-sm font-medium text-slate-800">{data.wear_metal}</div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Finger</div>
                                                <div className="text-sm font-medium text-slate-800">{data.wear_finger}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'ritual' && (
                                    <motion.div
                                        key="ritual"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                                                <Droplets className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Purification</h4>
                                                <p className="text-xs text-indigo-800/70 leading-relaxed">{data.ritual}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                                <Calendar className="w-4 h-4 text-amber-500" />
                                                <span className="text-xs text-slate-600">Wear on <strong>{data.wearing_day}</strong> (Shukla Paksha)</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'mantra' && (
                                    <motion.div
                                        key="mantra"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-center space-y-5"
                                    >
                                        <div className="relative p-6 rounded-2xl bg-amber-50 border border-amber-100 overflow-hidden">
                                            <Flame className="w-6 h-6 text-amber-500 mx-auto mb-3 animate-pulse" />
                                            <p className="text-lg font-serif italic text-amber-900 leading-relaxed">
                                                "{data.mantra}"
                                            </p>
                                            <div className="mt-3 inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                                                Chant 108 Times
                                            </div>
                                        </div>

                                        {data.caution && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-left">
                                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                                <p className="text-xs text-red-900/80 leading-tight">
                                                    <strong>Caution:</strong> {data.caution}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <MainLayout title="Gemstone Recommendations" breadcrumbs={['Tools', 'Gemstones']}>
            {/* Elegant Light Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 -z-10" />

            <div className="w-full min-h-screen pb-24 px-4 sm:px-6 relative z-10 font-sans">

                {/* Header Section */}
                <header className="pt-12 pb-16 text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-indigo-600 mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Vedic Gemology</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif text-slate-900 mb-6 tracking-tight leading-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-800">Crystalline</span> <span className="font-light text-slate-400">Harmony</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
                            Discover the stones that resonate with your unique cosmic blueprint. Expertly curated for power, protection, and prosperity.
                        </p>
                    </motion.div>
                </header>

                {/* Error State */}
                {error && (
                    <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
                        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-red-900 mb-2">Something went wrong</h3>
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            onClick={fetchGemstones}
                            className="mt-6 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[600px] rounded-[2rem] bg-white animate-pulse border border-slate-100" />
                        ))}
                    </div>
                )}

                {/* Main Content */}
                {!loading && data && (
                    <div className="max-w-7xl mx-auto">
                        {/* Ascendant Info */}
                        <div className="text-center mb-16">
                            <div className="inline-block p-1 rounded-full bg-gradient-to-r from-transparent via-slate-200 to-transparent">
                                <div className="px-8 py-3 rounded-full bg-white border border-slate-100 flex items-center gap-3 shadow-lg">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ascendant</span>
                                    <div className="w-px h-4 bg-slate-200" />
                                    <span className="text-xl font-serif text-indigo-900 tracking-wide">{data.ascendant}</span>
                                </div>
                            </div>
                        </div>

                        {/* Gem Showcase Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 px-4">
                            <GemShowcase
                                category="Life Stone"
                                data={data.recommendations.life_stone}
                                icon={Shield}
                                delay={0.2}
                            />
                            <GemShowcase
                                category="Lucky Stone"
                                data={data.recommendations.lucky_stone}
                                icon={Star}
                                delay={0.4}
                            />
                            <GemShowcase
                                category="Benefic Stone"
                                data={data.recommendations.benefic_stone}
                                icon={Diamond}
                                delay={0.6}
                            />
                        </div>

                        {/* AI Report CTA */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex justify-center mt-20"
                        >
                            <AIReportButton
                                context={`Deep Astro-Gemology Analysis for ${data.ascendant} Ascendant`}
                                data={data}
                                buttonText="Consult the Oracle AI"
                                className="!bg-slate-900 hover:!bg-slate-800 !text-white !border-none !shadow-xl !px-8 !py-4 !text-sm !tracking-widest !uppercase"
                            />
                        </motion.div>

                        {/* Footer Note */}
                        <div className="mt-20 text-center max-w-3xl mx-auto pb-12">
                            <Info className="w-5 h-5 text-slate-300 mx-auto mb-4" />
                            <p className="text-xs text-slate-400 leading-relaxed font-light tracking-wide uppercase">
                                Astrological gemstones amplify planetary resonance. While our algorithms account for Shadbala and House Placement,
                                we recommend a personal initiation ceremony (Pran Pratishta) for maximum efficacy.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Gemstones;
