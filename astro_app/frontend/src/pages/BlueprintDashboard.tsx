import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import api from '../services/api';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
    ArrowLeft, Calendar, Activity, Star, User, Heart, Briefcase, Zap, History, Layout, CheckCircle2, AlertTriangle, Crown, Shield, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Interfaces for All Sections ---

interface ForecastMonth {
    month: number;
    personal_month: number;
    importance: 'high' | 'challenge' | 'normal';
}

interface ForecastYear {
    year: number;
    personal_year: number;
    months: ForecastMonth[];
}


interface Talent {
    number: number;
    name: string;
    theme: string;
    development_roadmap: string[];
}

interface LifePathSection {
    id: 'life_path_deep_dive';
    title: string;
    content: {
        life_path_number: number;
        core_theme: string;
        purpose_alignment: {
            inner_drivers: string;
            outer_expression: string;
            integration_note: string;
        };
        pinnacle_phases: Array<{
            pinnacle: number;
            value: number;
            start_age: number;
            end_age: number;
        }>;
        inspirational_figures: string[];
        reflection_prompts: string[];
    };
}

interface RelationshipSection {
    id: 'relationships';
    title: string;
    content: {
        psychic_root: number;
        destiny_root: number;
        communication_style: string;
        compatibility_matrix: {
            psychic_based: Array<{ partner_number: number; relation: string; score: number }>;
            destiny_based: Array<{ partner_number: number; relation: string; score: number }>;
        };
        conflict_resolution: string[];
    };
}

interface CareerSection {
    id: 'career_finance';
    title: string;
    ideal_careers: string[];
    financial_cycles: Array<{ year: number; personal_year: number; cycle_type: string }>;
    entrepreneurial_potential: string;
}

interface AncestralSpiritSection {
    id: 'ancestral_spirit';
    ancestral: {
        surname: string;
        number: number;
        theme: string;
        description: string;
    };
    diamond: {
        current_age: number;
        cause: { number: number; desc: string };
        challenge: { number: number; desc: string };
        outcome: { number: number; desc: string };
    };
}

interface VocationIntelligenceSection {
    id: 'vocation_intelligence';
    profile: {
        business: number;
        science: number;
        arts: number;
        leadership: number;
        writing: number;
    };
    talents_list: string[];
}

interface GrowthSection {
    id: 'growth_tools';
    title: string;
    affirmations: string[];
    daily_mantras: Array<{ number: number; text: string }>;
    meditation_focus: { primary_number: number; theme: string };
}

interface KarmicSection {
    id: 'karmic_history';
    title: string;
    karmic_lessons: number[];
    hidden_passion: number[];
    interpretation: string;
}

interface PersonalitySection {
    id: 'personality_profile';
    title: string;
    content: {
        core_indicators: Record<string, { number: number; desc: string }>;
        initials: Record<string, { letter: string; meaning: string }>;
        planes: Record<string, { count: number; percentage: number }>;
        planes_summary: string;
        bridges: Record<string, { number: number; description: string }>;
    };
}

interface TransitYear {
    age: number;
    year: number;
    physical_letter: string;
    physical_value: number;
    mental_letter: string;
    mental_value: number;
    spiritual_letter: string;
    spiritual_value: number;
    essence: number;
}

interface TransitSection {
    id: 'transit_streams';
    title: string;
    timeline: TransitYear[];
    current_essence: TransitYear;
}

interface Blueprint {
    meta: {
        full_name: string;
        dob: string;
        generated_at: string;
        psychic_number: number;
        destiny_number: number;
        life_path: number;
        maturity_number: number;
        balance_number: number;
        subconscious_self: number;
        estimated_pages: number;
    };
    sections: any[];
}

const BlueprintDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { fullName?: string; dob?: string } | null;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const currentIdx = tabs.findIndex(t => t.id === activeTab);
        const p = Math.round(((currentIdx + 1) / tabs.length) * 100);
        setProgress(p);
    }, [activeTab]);

    useEffect(() => {
        let name = state?.fullName;
        let date = state?.dob;

        // Fallback to localStorage if state is missing (e.g. refresh)
        if (!name || !date) {
            name = localStorage.getItem('numerology_fullName') || undefined;
            date = localStorage.getItem('numerology_dob') || undefined;
        }

        if (!name || !date) {
            setError('No base numerology data. Please generate your blueprint from the Numerology tool first.');
            return;
        }

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.post('tools/numerology/blueprint', {
                    date: date,
                    full_name: name
                });
                setBlueprint(response.data);
            } catch (err: any) {
                const msg = err.response?.data?.detail || 'Failed to load blueprint dashboard data.';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [state]);

    // --- Helpers to extract sections ---
    const getSection = (id: string) => blueprint?.sections.find(s => s.id === id);

    const luckyYearsParams = getSection('lucky_years');
    const talentParams = getSection('talent_discovery');
    const transitParams = getSection('transit_streams') as TransitSection | undefined;
    const lifePathParams = getSection('life_path_deep_dive') as LifePathSection | undefined;
    const relationshipParams = getSection('relationships') as RelationshipSection | undefined;
    const careerParams = getSection('career_finance') as CareerSection | undefined;
    const growthParams = getSection('growth_tools') as GrowthSection | undefined;
    const karmicParams = getSection('karmic_history') as KarmicSection | undefined;
    const ancestralParams = getSection('ancestral_spirit') as AncestralSpiritSection | undefined;
    const vocationParams = getSection('vocation_intelligence') as VocationIntelligenceSection | undefined;
    const personalityParams = getSection('personality_profile') as PersonalitySection | undefined;

    // --- Chart Data Builder ---
    const buildTimelineData = () => {
        if (!luckyYearsParams) return [];
        const data: { label: string; importance: number }[] = [];
        luckyYearsParams.forecast_years.forEach((year: ForecastYear) => {
            year.months.forEach(m => {
                let value = 1;
                if (m.importance === 'high') value = 3;
                else if (m.importance === 'challenge') value = 0;
                data.push({
                    label: `${year.year}-${m.month.toString().padStart(2, '0')}`,
                    importance: value
                });
            });
        });
        return data;
    };

    const buildCompatData = () => {
        if (!relationshipParams) return [];
        return relationshipParams.content.compatibility_matrix.psychic_based.map(d => ({
            number: `No. ${d.partner_number}`,
            score: d.score,
            fullMark: 100
        }));
    };

    // --- Navigation Tabs ---
    const tabs = [
        { id: 'overview', label: 'Timeline & Forecasts', icon: Calendar },
        { id: 'identity', label: 'Personality Profile', icon: Crown },
        { id: 'transits', label: 'Transit Streams', icon: Activity },
        { id: 'ancestral', label: 'Ancestral & Spirit', icon: Shield },
        { id: 'vocation', label: 'Professional Vocation', icon: Briefcase },
        { id: 'life_path', label: 'Life Path Deep Dive', icon: User },
        { id: 'talents', label: 'Talents & High-Impact', icon: Star },
        { id: 'relationships', label: 'Relationships', icon: Heart },
        { id: 'growth', label: 'Growth Tools', icon: Zap },
        { id: 'karmic', label: 'Karmic History', icon: History },
    ];

    return (
        <MainLayout title="Advanced Blueprint Dashboard" breadcrumbs={['Tools', 'Numerology', 'Blueprint']}>
            <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] bg-slate-50/50">

                {/* Sidebar Navigation */}
                <div className="w-full lg:w-72 bg-white border-r border-slate-200 overflow-y-auto shrink-0 flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to Numerology
                        </button>

                        {blueprint && (
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                    {blueprint.meta.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 leading-tight">{blueprint.meta.full_name}</h2>
                                    <p className="text-xs text-slate-500">{blueprint.meta.dob}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <nav className="p-4 space-y-1 flex-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 bg-slate-50 m-4 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-amber-500" />
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Reading Progress</span>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-600">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-indigo-600 rounded-full"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            This Imperial Blueprint contains over 120 pages of personalized depth. Follow the path to full self-discovery.
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <AnimatePresence mode="wait">

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-slate-500"
                            >
                                <div className="relative w-16 h-16 mb-4">
                                    <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                                </div>
                                <p className="text-sm font-medium">Decoding Blueprint Matrix...</p>
                            </motion.div>
                        )}

                        {!loading && error && (
                            <div className="max-w-xl mx-auto mt-20 p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
                                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-red-900 mb-2">Analysis Failed</h3>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {!loading && !error && blueprint && (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-5xl mx-auto space-y-8"
                            >
                                {/* Header */}
                                <div className="mb-8">
                                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        {tabs.find(t => t.id === activeTab)?.icon && (
                                            <div className="p-2 rounded-lg bg-indigo-600 text-white">
                                                {(() => {
                                                    const Icon = tabs.find(t => t.id === activeTab)?.icon || Activity;
                                                    return <Icon className="w-5 h-5" />;
                                                })()}
                                            </div>
                                        )}
                                        {tabs.find(t => t.id === activeTab)?.label}
                                    </h1>
                                </div>

                                {/* CONTENT: OVERVIEW / TIMELINE */}
                                {activeTab === 'overview' && luckyYearsParams && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800">5-Year Energy Flow</h3>
                                                    <p className="text-sm text-slate-500">Your personal rhythm of high-opportunity and challenge months.</p>
                                                </div>
                                            </div>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={buildTimelineData()}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                        <XAxis
                                                            dataKey="label"
                                                            tick={{ fontSize: 10, fill: '#64748b' }}
                                                            interval={3}
                                                            tickMargin={10}
                                                        />
                                                        <YAxis hide domain={[0, 4]} />
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="importance"
                                                            stroke="#4f46e5"
                                                            strokeWidth={3}
                                                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                                            activeDot={{ r: 6, fill: '#4f46e5' }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {luckyYearsParams.lucky_years.map((year: any, i: number) => (
                                                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="text-3xl font-black text-indigo-600">{year.year}</div>
                                                        <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${year.personal_year === 1 || year.personal_year === 8 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                                                            Personal Year {year.personal_year}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {year.events.map((ev: string, j: number) => (
                                                            <div key={j} className="flex items-start gap-2 text-sm text-slate-600">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                                {ev}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: PERSONALITY & IDENTITY */}
                                {activeTab === 'identity' && personalityParams && (
                                    <div className="space-y-12 animate-fade-in pb-12">
                                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                                            <div className="relative z-10">
                                                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-[0.3em] mb-8">Part I: Detailed Personality Insights</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                                    {Object.entries(personalityParams.content.core_indicators).map(([key, data]: [string, any]) => (
                                                        <div key={key} className="space-y-3 group">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{key.replace('_', ' ')}</span>
                                                                <span className="text-3xl font-black text-white">{data.number}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 leading-relaxed border-l border-slate-700 pl-4 py-1">
                                                                {data.desc}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] -mr-48 -mt-48" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="bg-white p-8 rounded-3xl border border-slate-200">
                                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                                    <Zap className="w-5 h-5 text-indigo-600" /> The Power of Initials
                                                </h3>
                                                <div className="space-y-6">
                                                    {Object.entries(personalityParams.content.initials).map(([key, data]: [string, any]) => (
                                                        <div key={key} className="flex items-start gap-4">
                                                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shrink-0">
                                                                {data.letter}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{key}</h4>
                                                                <p className="text-xs text-slate-600 leading-relaxed">{data.meaning}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-white p-8 rounded-3xl border border-slate-200">
                                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                                    <Star className="w-5 h-5 text-indigo-600" /> Planes of Expression
                                                </h3>
                                                <div className="space-y-5">
                                                    {Object.entries(personalityParams.content.planes).map(([key, data]: [string, any]) => (
                                                        <div key={key} className="group">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{key}</span>
                                                                <span className="text-xs font-black text-slate-900">{data.count} ({data.percentage}%)</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${data.percentage}%` }}
                                                                    className="h-full bg-slate-900 rounded-full group-hover:bg-indigo-600 transition-colors"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-8 p-4 bg-slate-50 rounded-xl border-l-4 border-slate-300">
                                                    <p className="text-xs text-slate-700 italic leading-relaxed">
                                                        "{personalityParams.content.planes_summary}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-indigo-50 rounded-3xl p-10 border border-indigo-100">
                                            <h3 className="text-xl font-bold text-indigo-950 mb-8 flex items-center gap-3">
                                                <Layout className="w-6 h-6 text-indigo-700" /> Evolutionary Bridges
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                {Object.entries(personalityParams.content.bridges).map(([key, data]: [string, any]) => (
                                                    <div key={key} className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100/50">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">{key.replace(/_/g, ' ')}</h4>
                                                            <span className="w-10 h-10 bg-indigo-950 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
                                                                {data.number}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-indigo-800/80 leading-relaxed italic">
                                                            "{data.description}"
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: ANCESTRAL SPIRIT */}
                                {activeTab === 'ancestral' && ancestralParams && (
                                    <div className="space-y-12 animate-fade-in pb-12">
                                        <div className="bg-slate-900 text-white rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center text-5xl font-black shadow-2xl rotate-3">
                                                    {ancestralParams.ancestral.number}
                                                </div>
                                                <div className="flex-1 text-center md:text-left">
                                                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Part II: Ancestral Heritage (Surname)</h3>
                                                    <h2 className="text-4xl font-black mb-4">{ancestralParams.ancestral.surname} Influence</h2>
                                                    <p className="text-lg text-slate-400 leading-relaxed font-playfair italic">
                                                        "{ancestralParams.ancestral.description}"
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 right-0 opacity-5 -mb-20 -mr-20">
                                                <Shield className="w-96 h-96" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {[
                                                { id: 'cause', data: ancestralParams.diamond.cause, icon: HelpCircle },
                                                { id: 'challenge', data: ancestralParams.diamond.challenge, icon: AlertTriangle },
                                                { id: 'outcome', data: ancestralParams.diamond.outcome, icon: CheckCircle2 }
                                            ].map((item) => (
                                                <div key={item.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-all">
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="p-2 bg-indigo-50 rounded-lg">
                                                                <item.icon className="w-4 h-4 text-indigo-600" />
                                                            </div>
                                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.id}</h4>
                                                        </div>
                                                        <div className="text-5xl font-black text-slate-900 mb-4">{item.data.number}</div>
                                                        <p className="text-xs text-slate-500 leading-relaxed">{item.data.desc}</p>
                                                    </div>
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rotate-45 -mr-12 -mt-12 group-hover:bg-indigo-50 transition-colors" />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-amber-50 rounded-3xl p-10 border border-amber-100 flex items-start gap-6">
                                            <div className="p-4 bg-white rounded-2xl shadow-sm rotate-3">
                                                <Star className="w-8 h-8 text-amber-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-amber-900 mb-2">The Diamond Spirit Insight</h3>
                                                <p className="text-sm text-amber-800/80 leading-relaxed">
                                                    At age {ancestralParams.diamond.current_age}, your Diamond Chart reveals a critical intersection between your inherited DNA and your soul's current mission.
                                                    The transition from the Cause ({ancestralParams.diamond.cause.number}) to the Outcome ({ancestralParams.diamond.outcome.number}) is the major theme of the next 12 months.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: VOCATION INTELLIGENCE */}
                                {activeTab === 'vocation' && vocationParams && (
                                    <div className="space-y-12 animate-fade-in pb-12">
                                        <div className="bg-indigo-950 text-white rounded-3xl p-10 border border-slate-800 shadow-2xl">
                                            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-[0.3em] mb-10">Part III: Professional Intelligence Profile</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                                {Object.entries(vocationParams.profile).map(([key, value]: [string, any]) => (
                                                    <div key={key} className="text-center group">
                                                        <div className="relative w-full aspect-square flex flex-col items-center justify-center mb-4">
                                                            <svg className="w-full h-full -rotate-90">
                                                                <circle
                                                                    cx="50%" cy="50%" r="45%"
                                                                    className="fill-none stroke-slate-800 stroke-[5px]"
                                                                />
                                                                <motion.circle
                                                                    cx="50%" cy="50%" r="45%"
                                                                    initial={{ pathLength: 0 }}
                                                                    animate={{ pathLength: (value as number) / 300 }}
                                                                    className="fill-none stroke-indigo-500 stroke-[5px] stroke-round shadow-glow"
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                <span className="text-2xl font-black text-white">{Math.round((value as number) / 3)}%</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{key}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white p-10 rounded-3xl border border-slate-200">
                                            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                                <Zap className="w-6 h-6 text-indigo-600" /> Talent Inventory & High-Impact Zones
                                            </h3>
                                            <div className="columns-1 md:columns-2 gap-10 space-y-4">
                                                {vocationParams.talents_list.map((talent: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                                                            {i + 1}
                                                        </div>
                                                        <span className="text-sm text-slate-700 font-medium">{talent}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: TRANSITS */}
                                {activeTab === 'transits' && transitParams && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                                            <div className="flex items-start justify-between mb-8">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">Vibrational Essence Timeline</h3>
                                                    <p className="text-sm text-slate-500">How your name letters activate cycles of energy throughout your life.</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Current Year ({transitParams.current_essence.year})</div>
                                                    <div className="text-3xl font-black text-indigo-600">Essence {transitParams.current_essence.essence}</div>
                                                </div>
                                            </div>

                                            <div className="h-64 mb-8">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={transitParams.timeline.slice(0, 50).filter((_, i) => i % 2 === 0)}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} tick={{ fontSize: 10 }} />
                                                        <YAxis domain={[0, 9]} hide />
                                                        <Tooltip
                                                            cursor={{ fill: '#f8fafc' }}
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                        <Bar dataKey="essence" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                                    <div className="text-xs font-bold text-indigo-400 uppercase mb-1">Physical Transit</div>
                                                    <div className="text-2xl font-black text-indigo-700">{transitParams.current_essence.physical_letter} ({transitParams.current_essence.physical_value})</div>
                                                    <p className="text-[10px] text-indigo-500 mt-1 uppercase">Physical Health & Energy</p>
                                                </div>
                                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                                    <div className="text-xs font-bold text-purple-400 uppercase mb-1">Mental Transit</div>
                                                    <div className="text-2xl font-black text-purple-700">{transitParams.current_essence.mental_letter} ({transitParams.current_essence.mental_value})</div>
                                                    <p className="text-[10px] text-purple-500 mt-1 uppercase">Focus & Emotional State</p>
                                                </div>
                                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                    <div className="text-xs font-bold text-emerald-400 uppercase mb-1">Spiritual Transit</div>
                                                    <div className="text-2xl font-black text-emerald-700">{transitParams.current_essence.spiritual_letter} ({transitParams.current_essence.spiritual_value})</div>
                                                    <p className="text-[10px] text-emerald-500 mt-1 uppercase">Inner Growth & Wisdom</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 rounded-3xl p-8 text-white overflow-hidden relative">
                                            <h3 className="text-lg font-bold mb-6">Upcoming Decade Essence</h3>
                                            <div className="space-y-3">
                                                {transitParams.timeline
                                                    .filter(t => t.year >= (new Date()).getFullYear() && t.year < (new Date()).getFullYear() + 10)
                                                    .map(year => (
                                                        <div key={year.year} className="flex items-center gap-4 group">
                                                            <div className="text-sm font-bold text-slate-500 w-12">{year.year}</div>
                                                            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden relative">
                                                                <div
                                                                    className="h-full bg-indigo-500 transition-all duration-500"
                                                                    style={{ width: `${(year.essence / 9) * 100}%` }}
                                                                />
                                                            </div>
                                                            <div className="text-sm font-black text-indigo-400 group-hover:scale-110 transition-transform">{year.essence}</div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: LIFE PATH */}
                                {activeTab === 'life_path' && lifePathParams && (
                                    <div className="space-y-6">
                                        <div className="bg-indigo-900 text-white rounded-3xl p-8 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-12 opacity-10">
                                                <User className="w-64 h-64" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-2">Core Purpose</div>
                                                <h2 className="text-4xl font-black mb-4">Life Path {lifePathParams.content.life_path_number}</h2>
                                                <div className="text-lg text-indigo-100 leading-relaxed max-w-2xl">
                                                    "{lifePathParams.content.core_theme}"
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                                <h3 className="font-bold text-slate-800 mb-2">Inner Drivers</h3>
                                                <p className="text-sm text-slate-600 leading-relaxed">{lifePathParams.content.purpose_alignment.inner_drivers}</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                                <h3 className="font-bold text-slate-800 mb-2">Outer Expression</h3>
                                                <p className="text-sm text-slate-600 leading-relaxed">{lifePathParams.content.purpose_alignment.outer_expression}</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                                <h3 className="font-bold text-slate-800 mb-2">Famous Figures</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {lifePathParams.content.inspirational_figures.map(fig => (
                                                        <span key={fig} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                                            {fig}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                            <h3 className="text-lg font-bold text-slate-800 mb-6">The 4 Pinnacle Phases</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {lifePathParams.content.pinnacle_phases.map((p, i) => (
                                                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Ages {p.start_age}-{p.end_age}</div>
                                                        <div className="text-3xl font-bold text-indigo-600 mb-1">{p.value}</div>
                                                        <div className="text-xs text-slate-500">Pinnacle {p.pinnacle}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: TALENTS */}
                                {activeTab === 'talents' && talentParams && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {talentParams.talents.map((talent: Talent) => (
                                            <div key={talent.number} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-lg">{talent.name}</h3>
                                                        <p className="text-sm text-slate-500 italic">{talent.theme}</p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                                                        {talent.number}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Action Plan</div>
                                                    <ul className="space-y-3">
                                                        {talent.development_roadmap.map((step, k) => (
                                                            <li key={k} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                                                {step}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* CONTENT: CAREER & FINANCE */}
                                {activeTab === 'career' && careerParams && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-8">
                                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                    <Briefcase className="w-5 h-5 text-indigo-600" /> Ideal Career Paths
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {careerParams.ideal_careers.map(job => (
                                                        <span key={job} className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-medium">
                                                            {job}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="mt-8 flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                                        <Crown className="w-6 h-6 text-amber-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-400 uppercase">Entrepreneurial Potential</div>
                                                        <div className="text-lg font-bold text-slate-800 capitalize">{careerParams.entrepreneurial_potential}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
                                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-emerald-400" /> Financial Cycles
                                                </h3>
                                                <div className="space-y-4">
                                                    {careerParams.financial_cycles.map((cyc, i) => (
                                                        <div key={i} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0 last:pb-0">
                                                            <div className="font-bold text-xl">{cyc.year}</div>
                                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${cyc.cycle_type === 'expansion' ? 'bg-emerald-500/20 text-emerald-300' :
                                                                cyc.cycle_type === 'consolidation' ? 'bg-amber-500/20 text-amber-300' :
                                                                    'bg-slate-700 text-slate-300'
                                                                }`}>
                                                                {cyc.cycle_type}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: RELATIONSHIPS */}
                                {activeTab === 'relationships' && relationshipParams && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row gap-8 items-center">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-800 mb-2">Communication Style</h3>
                                                <p className="text-slate-600 leading-relaxed italic">
                                                    "{relationshipParams.content.communication_style}"
                                                </p>
                                            </div>
                                            <div className="w-full md:w-80 h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={buildCompatData()}>
                                                        <PolarGrid />
                                                        <PolarAngleAxis dataKey="number" tick={{ fontSize: 10 }} />
                                                        <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                                                        <Radar name="Compatibility" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                                                        <Tooltip />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Conflict Resolution</div>
                                                <ul className="space-y-3">
                                                    {relationshipParams.content.conflict_resolution.map((item, i) => (
                                                        <li key={i} className="flex gap-3 text-sm text-slate-600">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
                                                <h3 className="font-bold text-indigo-900 mb-4">Best Matches</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {relationshipParams.content.compatibility_matrix.psychic_based
                                                        .filter(p => p.score >= 80)
                                                        .map(p => (
                                                            <div key={p.partner_number} className="px-3 py-1.5 bg-white rounded-lg shadow-sm border border-indigo-100 text-indigo-600 text-sm font-bold flex items-center gap-2">
                                                                <Heart className="w-3 h-3 fill-current" /> Number {p.partner_number}
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: GROWTH TOOLS */}
                                {activeTab === 'growth' && growthParams && (
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl p-8 text-center shadow-lg">
                                            <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-4">Daily Mantra</div>
                                            <div className="text-2xl font-serif italic mb-6">
                                                "{growthParams.daily_mantras[0]?.text}"
                                            </div>
                                            <div className="inline-block px-4 py-1 rounded-full bg-white/20 text-xs font-bold">
                                                Repeat 3 times every morning
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-amber-500" /> Affirmations
                                                </h3>
                                                <ul className="space-y-4">
                                                    {growthParams.affirmations.map((aff, i) => (
                                                        <li key={i} className="p-3 bg-slate-50 rounded-xl text-sm text-slate-700 italic border-l-4 border-indigo-400">
                                                            "{aff}"
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                    <Layout className="w-4 h-4 text-emerald-500" /> Meditation Focus
                                                </h3>
                                                <p className="text-slate-600 leading-relaxed mb-4">
                                                    Focus your meditation on the energy of <strong>Number {growthParams.meditation_focus.primary_number}</strong>.
                                                </p>
                                                <div className="p-4 bg-emerald-50 rounded-xl text-emerald-800 text-sm font-medium border border-emerald-100">
                                                    Theme: {growthParams.meditation_focus.theme}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: KARMIC HISTORY */}
                                {activeTab === 'karmic' && karmicParams && (
                                    <div className="space-y-6">
                                        <div className="bg-slate-800 text-slate-300 rounded-3xl p-8 shadow-xl">
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="p-3 bg-slate-700 rounded-xl text-white">
                                                    <History className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">Karmic & Generational Patterns</h3>
                                                    <p className="text-sm opacity-70 mt-1">
                                                        Lessons carried over from past experiences that seek balance in this lifetime.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {karmicParams.karmic_lessons.length > 0 ? (
                                                    karmicParams.karmic_lessons.map(lesson => (
                                                        <div key={lesson} className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 flex justify-between items-center">
                                                            <span className="font-medium">Missing Vibration {lesson}</span>
                                                            <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md border border-amber-500/30 font-bold uppercase">
                                                                Karmic Lesson
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-center">
                                                        No major karmic lessons detected in this name vibration. You have a balanced foundational energy.
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-8 pt-8 border-t border-slate-700">
                                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Hidden Passions</div>
                                                <div className="flex gap-2">
                                                    {karmicParams.hidden_passion.map(hp => (
                                                        <div key={hp} className="px-4 py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-sm font-bold">
                                                            Passion Number {hp}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </MainLayout>
    );
};

export default BlueprintDashboard;
