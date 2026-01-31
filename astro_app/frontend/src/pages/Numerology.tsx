import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { LayoutGrid, Sparkles, Grid, Heart, Shield, Zap, Star, Brain, Briefcase, Activity, Edit3, Calculator, User, Hash, Eye, Phone, Home, CreditCard, Calendar } from 'lucide-react';
import api from '../services/api';
import AIReportButton from '../components/ai/AIReportButton';
import { useChartSettings } from '../context/ChartContext';
import jsPDF from 'jspdf';

interface NumerologyNumber {
    number: number;
    title: string;
    description: string;
}

interface AdvancedData {
    core: {
        psychic_number: number;
        destiny_number: number;
        combination_insight: string;
        life_path: number;
        maturity_number: number;
        balance_number: number;
        subconscious_self: number;
        personal_year: number;
        personal_month: number;
        personal_day: number;
        cornerstone: string;
        capstone: string;
        first_vowel: string;
        tarot_key: {
            title: string;
            signification: string;
        };
    };
    pythagorean: {
        destiny: number;
        destiny_compound: number;
        soul_urge: number;
        soul_urge_compound: number;
        personality: number;
        personality_compound: number;
        challenges: number[];
        karmic_lessons: number[];
        hidden_passion: number[];
    };
    chaldean: {
        name_number: number;
        total_value: number;
    };
    hebrew: {
        name_number: number;
        total_value: number;
    };
    numerary: {
        name_number: number;
        total_value: number;
    };
    lucky_elements: {
        gem: string;
        colors: string[];
        days: string[];
        deity: string;
    };
    favorable_years: Array<{
        year: number;
        personal_year: number;
        events: string[];
    }>;
    pinnacles: Array<{
        pinnacle: number;
        value: number;
        start_age: number;
        end_age: number;
    }>;
    grids: {
        lo_shu: Record<string, number>;
        vedic: Record<string, number>;
        annual_lo_shu: Record<string, number>;
    };
    predictions: {
        daily: string;
        monthly: string;
        yearly: string;
        nature: string;
        career: string;
        health: string;
    };
}

interface NumerologyResponse {
    life_path: NumerologyNumber;
    destiny: NumerologyNumber;
    soul_urge: NumerologyNumber;
    personality: NumerologyNumber;
    advanced?: AdvancedData;
}

interface BlueprintMeta {
    full_name: string;
    dob: string;
    generated_at: string;
    estimated_pages: number;
}

interface BlueprintSectionSummary {
    id: string;
    title: string;
    estimated_pages: number;
}

interface NumerologyBlueprint {
    meta: BlueprintMeta;
    sections: BlueprintSectionSummary[];
}

const Numerology = () => {
    const { currentProfile } = useChartSettings();
    const navigate = useNavigate();

    // Form State
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');

    // Results State
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<NumerologyResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [blueprintLoading, setBlueprintLoading] = useState(false);
    const [blueprintError, setBlueprintError] = useState<string | null>(null);
    const [blueprint, setBlueprint] = useState<NumerologyBlueprint | null>(null);

    // Update form when chart changes
    useEffect(() => {
        if (currentProfile) {
            // Auto-fill form
            // Try to construct full name from chart details if available
            const name = [currentProfile.raw?.first_name, currentProfile.raw?.last_name].filter(Boolean).join(' ');
            setFullName(name);

            // Format date for <input type="date"> (expects YYYY-MM-DD)
            let dateValue = currentProfile.date || '';
            if (dateValue.includes('/')) {
                const [d, m, y] = dateValue.split('/');
                dateValue = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            setDob(dateValue);
        }
    }, [currentProfile]);

    const calculate = async () => {
        if (!fullName || !dob) {
            setError("Please enter both Full Name and Date of Birth");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const payload = {
                date: dob,
                full_name: fullName
            };

            const response = await api.post('tools/numerology', payload);
            setData(response.data);

            // Auto-generate blueprint if core numbers are successful
            if (response.data) {
                // We use a timeout to let the state update and UI render first if needed, 
                // but since we have the data, we can just call the API directly or use the helper.
                // However, generateBlueprint uses the state 'fullName' and 'dob' which are already set.
                // We'll call it directly.
                generateBlueprint();
            }
        } catch (err: any) {
            console.error("Failed to calculate numerology", err);
            const msg = err.response?.data?.detail || "Failed to calculate. Please check inputs and try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const generateBlueprint = async () => {
        if (!fullName || !dob) {
            setBlueprintError("Please calculate your core numbers first.");
            return;
        }
        setBlueprintLoading(true);
        setBlueprintError(null);
        try {
            const payload = {
                date: dob,
                full_name: fullName
            };
            const response = await api.post('tools/numerology/blueprint', payload);
            const bp = response.data as NumerologyBlueprint;
            setBlueprint(bp);
        } catch (err: any) {
            console.error("Failed to generate blueprint", err);
            const msg = err.response?.data?.detail || "Failed to generate blueprint. Please try again.";
            setBlueprintError(msg);
        } finally {
            setBlueprintLoading(false);
        }
    };

    const downloadBlueprintPdf = () => {
        if (!blueprint) return;
        const doc = new jsPDF({
            unit: 'pt',
            format: 'a4'
        });

        let y = 60;
        doc.setFontSize(18);
        doc.text('Personalized Numerology Blueprint', 40, y);
        y += 30;

        doc.setFontSize(12);
        doc.text(`Name: ${blueprint.meta.full_name}`, 40, y);
        y += 18;
        doc.text(`Date of Birth: ${blueprint.meta.dob}`, 40, y);
        y += 18;
        doc.text(`Estimated Depth: ${blueprint.meta.estimated_pages}+ pages`, 40, y);
        y += 30;

        doc.setFontSize(14);
        doc.text('Report Structure Overview', 40, y);
        y += 24;

        doc.setFontSize(11);
        blueprint.sections.forEach((section, index) => {
            const line = `${index + 1}. ${section.title} (${section.estimated_pages} pages)`;
            if (y > 780) {
                doc.addPage();
                y = 60;
            }
            doc.text(line, 50, y);
            y += 18;
        });

        doc.save('numerology_blueprint_preview.pdf');
    };

    const openBlueprintDashboard = () => {
        if (!blueprint) return;

        // Persist for refresh handling
        localStorage.setItem('numerology_fullName', fullName);
        localStorage.setItem('numerology_dob', dob);

        navigate('/tools/numerology/blueprint', {
            state: {
                fullName,
                dob
            }
        });
    };

    // Helper for Number Card
    const NumberCard = ({
        item,
        icon: Icon,
        colorClass
    }: {
        item: NumerologyNumber,
        icon: any,
        colorClass: string
    }) => {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 flex flex-col items-center text-center transition-transform hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group">
                <div className={`absolute top-0 w-full h-1 ${colorClass} opacity-80`} />

                <div className={`mb-4 p-3 rounded-full bg-slate-50 ${colorClass.replace('bg-', 'text-')} group-hover:bg-opacity-10 transition-colors`}>
                    <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-slate-500 font-semibold uppercase tracking-wider text-xs mb-2">{item.title}</h3>

                <div className="relative mb-4">
                    {/* Big Number */}
                    <span className={`text-6xl font-playfair font-bold ${colorClass.replace('bg-', 'text-')}`}>
                        {item.number}
                    </span>
                    {/* Glowing effect behind */}
                    <div className={`absolute -inset-4 rounded-full blur-xl opacity-20 ${colorClass}`} />
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                    {item.description}
                </p>
            </div>
        );
    };

    // Helper for Grids
    const GridDisplay = ({ grid, title, type = 'loshu' }: { grid: Record<string, number>, title: string, type?: 'loshu' | 'vedic' }) => {
        const layout = type === 'loshu'
            ? [['4', '9', '2'], ['3', '5', '7'], ['8', '1', '6']]
            : [['3', '1', '9'], ['6', '7', '5'], ['2', '8', '4']];

        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4 text-center uppercase tracking-wider">{title}</h3>
                <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                    {layout.flat().map((num, i) => (
                        <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-lg font-bold border-2 transition-all ${grid[num] ? 'bg-indigo-50 border-indigo-200 text-indigo-700 scale-105 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                            {grid[num] ? num.repeat(grid[num]) : ''}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const AdvancedAnalysis = ({ advanced }: { advanced: AdvancedData }) => {
        const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'grids' | 'remedies' | 'compatibility'>('overview');
        const [compatInput, setCompatInput] = useState('');
        const [compatResult, setCompatResult] = useState<any>(null);
        const [compatLoading, setCompatLoading] = useState(false);

        // Name Correction State
        const [correctionSuggestions, setCorrectionSuggestions] = useState<any[]>([]);
        const [correctionLoading, setCorrectionLoading] = useState(false);

        const checkCompatibility = async () => {
            if (!compatInput) return;
            setCompatLoading(true);
            try {
                const response = await api.post('tools/numerology/compatibility', {
                    input_number: compatInput,
                    target_root: advanced.core.psychic_number
                });
                setCompatResult(response.data);
            } catch (err) {
                console.error("Compatibility check failed", err);
            } finally {
                setCompatLoading(false);
            }
        };

        const handleNameCorrection = async () => {
            setCorrectionLoading(true);
            try {
                const response = await api.post('tools/numerology/name-correction', {
                    name: fullName || advanced.core.cornerstone, // Use available name
                    target_number: advanced.core.psychic_number
                });
                setCorrectionSuggestions(response.data);
            } catch (err) {
                console.error("Name correction failed", err);
            } finally {
                setCorrectionLoading(false);
            }
        };

        return (
            <div className="space-y-8 mt-12 animate-fade-in pb-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Complete Numerology Report</h2>
                    <p className="text-slate-500">Comprehensive analysis based on birth and name vibrations</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutGrid },
                        { id: 'predictions', label: 'Predictions', icon: Sparkles },
                        { id: 'grids', label: 'Magic Grids', icon: Grid },
                        { id: 'remedies', label: 'Remedies', icon: Heart },
                        { id: 'compatibility', label: 'Compatibility', icon: Phone }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Quick Insights Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Tarot Key</div>
                                <div className="text-lg font-playfair font-bold text-indigo-600 leading-tight">{advanced.core.tarot_key.title}</div>
                                <div className="text-[9px] text-slate-500 line-clamp-1">{advanced.core.tarot_key.signification}</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Cornerstone</div>
                                <div className="text-2xl font-playfair font-bold text-indigo-600">{advanced.core.cornerstone}</div>
                                <div className="text-[10px] text-slate-500">Starting Point</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Capstone</div>
                                <div className="text-2xl font-playfair font-bold text-indigo-600">{advanced.core.capstone}</div>
                                <div className="text-[10px] text-slate-500">Final Resolve</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">1st Vowel</div>
                                <div className="text-2xl font-playfair font-bold text-indigo-600">{advanced.core.first_vowel}</div>
                                <div className="text-[10px] text-slate-500">Emotional Core</div>
                            </div>
                        </div>

                        {/* Psychic-Destiny Combination Insight */}
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 rounded-2xl text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <Star className="w-5 h-5 text-indigo-200" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Psychic {advanced.core.psychic_number} & Destiny {advanced.core.destiny_number} Synergy</h3>
                            </div>
                            <p className="text-lg font-medium leading-relaxed italic">
                                "{advanced.core.combination_insight}"
                            </p>
                        </div>

                        {/* Quantum Core Expansion */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
                                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-amber-400 font-black text-2xl">
                                    {advanced.core.maturity_number}
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maturity Number</div>
                                    <div className="text-xs text-slate-500">Peak Expression (Ages 35-50)</div>
                                </div>
                            </div>
                            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
                                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-indigo-400 font-black text-2xl">
                                    {advanced.core.balance_number}
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance Number</div>
                                    <div className="text-xs text-slate-500">Stability under pressure</div>
                                </div>
                            </div>
                            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
                                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-emerald-400 font-black text-2xl">
                                    {advanced.core.subconscious_self}
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subconscious Self</div>
                                    <div className="text-xs text-slate-500">Instinctive response depth</div>
                                </div>
                            </div>
                        </div>

                        {/* Name Systems Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100">
                                <h3 className="text-sm font-bold text-indigo-800 mb-4 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Pythagorean
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Destiny (Compound)</span>
                                        <span className="font-bold text-indigo-600">{advanced.pythagorean.destiny} ({advanced.pythagorean.destiny_compound})</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Soul Urge</span>
                                        <span className="font-bold text-indigo-600">{advanced.pythagorean.soul_urge}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Personality</span>
                                        <span className="font-bold text-indigo-600">{advanced.pythagorean.personality}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-2xl border border-amber-100">
                                <h3 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Chaldean
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Name Number</span>
                                        <span className="font-bold text-amber-600">{advanced.chaldean.name_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Total Vibration</span>
                                        <span className="font-bold text-amber-600">{advanced.chaldean.total_value}</span>
                                    </div>
                                    <div className="pt-2">
                                        <div className="text-[10px] text-amber-700 font-bold uppercase mb-1">Name Harmony</div>
                                        <div className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100">
                                <h3 className="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2">
                                    <Star className="w-4 h-4" /> Kabbalah/Other
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Hebrew System</span>
                                        <span className="font-bold text-emerald-600">{advanced.hebrew.name_number} ({advanced.hebrew.total_value})</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Numerary System</span>
                                        <span className="font-bold text-emerald-600">{advanced.numerary.name_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Hidden Passion</span>
                                        <span className="font-bold text-emerald-600">{advanced.pythagorean.hidden_passion.join(', ')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Challenges and Karmic Lessons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-800 mb-4">Life Challenges</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {advanced.pythagorean.challenges.map((c, i) => (
                                        <div key={i} className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-[9px] text-slate-400 font-bold">C{i + 1}</div>
                                            <div className="text-xl font-bold text-indigo-600">{c}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-800 mb-4">Karmic Lessons</h3>
                                <div className="flex flex-wrap gap-2">
                                    {advanced.pythagorean.karmic_lessons.length > 0 ? (
                                        advanced.pythagorean.karmic_lessons.map(num => (
                                            <span key={num} className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-sm font-bold">
                                                Lesson {num}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-emerald-600 text-sm font-medium">No karmic lessons found in name.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'predictions' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
                                <div className="text-indigo-200 text-[10px] font-bold uppercase mb-1">Personal Day {advanced.core.personal_day}</div>
                                <h3 className="text-xl font-bold mb-2">Today's Forecast</h3>
                                <p className="text-sm text-indigo-50 leading-relaxed">{advanced.predictions.daily}</p>
                            </div>
                            <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg">
                                <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Personal Month {advanced.core.personal_month}</div>
                                <h3 className="text-xl font-bold mb-2">Monthly Outlook</h3>
                                <p className="text-sm text-slate-300 leading-relaxed">{advanced.predictions.monthly}</p>
                            </div>
                            <div className="bg-amber-600 text-white p-6 rounded-2xl shadow-lg">
                                <div className="text-amber-200 text-[10px] font-bold uppercase mb-1">Personal Year {advanced.core.personal_year}</div>
                                <h3 className="text-xl font-bold mb-2">Yearly Theme</h3>
                                <p className="text-sm text-amber-50 leading-relaxed">{advanced.predictions.yearly}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-3">
                                    <Brain className="w-4 h-4" /> Nature & Mind
                                </div>
                                <p className="text-sm text-slate-600">{advanced.predictions.nature}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <div className="flex items-center gap-2 text-amber-600 font-bold mb-3">
                                    <Briefcase className="w-4 h-4" /> Career Path
                                </div>
                                <p className="text-sm text-slate-600">{advanced.predictions.career}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <div className="flex items-center gap-2 text-rose-600 font-bold mb-3">
                                    <Activity className="w-4 h-4" /> Health & Vitality
                                </div>
                                <p className="text-sm text-slate-600">{advanced.predictions.health}</p>
                            </div>
                        </div>

                        {/* Favorable Years / Life Events */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600" /> Life Events Timeline
                            </h3>
                            <div className="overflow-x-auto">
                                <div className="flex gap-4 pb-4">
                                    {advanced.favorable_years.map((item, i) => (
                                        <div key={i} className="min-w-[160px] p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                                            <div className="text-2xl font-black text-slate-800 mb-1">{item.year}</div>
                                            <div className="text-[10px] font-bold text-indigo-600 uppercase mb-3">Personal Year {item.personal_year}</div>
                                            <div className="space-y-1">
                                                {item.events.map((ev, j) => (
                                                    <div key={j} className="text-[11px] text-slate-600 flex items-start gap-1">
                                                        <span className="text-indigo-400 mt-0.5">•</span>
                                                        {ev}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="mt-4 text-[11px] text-slate-400 italic">
                                * These predictions are based on your Personal Year cycles and indicate favorable windows for major life decisions.
                            </p>
                        </div>

                        {/* Pinnacles / Life Cycles */}
                        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-400" /> Major Life Cycles (Pinnacles)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {advanced.pinnacles.map((p, i) => (
                                    <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pinnacle {p.pinnacle}</div>
                                        <div className="text-3xl font-black text-indigo-400 mb-2">{p.value}</div>
                                        <div className="text-xs text-slate-300">Ages {p.start_age} to {p.end_age}</div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-6 text-xs text-slate-400 leading-relaxed">
                                Pinnacles represent the four major phases of your life. Each number indicates the theme and vibrational energy you will experience during that specific age range.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'grids' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                        <GridDisplay grid={advanced.grids.lo_shu} title="Birth Lo Shu Grid" />
                        <GridDisplay grid={advanced.grids.vedic} title="Vedic/Naadi Grid" type="vedic" />
                        <GridDisplay grid={advanced.grids.annual_lo_shu} title={`Annual Grid (${new Date().getFullYear()})`} />
                    </div>
                )}

                {activeTab === 'remedies' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Sparkles className="w-32 h-32" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" /> Lucky Elements
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Lucky Gemstone</div>
                                    <div className="text-slate-800 font-semibold">{advanced.lucky_elements.gem}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Ruling Deity</div>
                                    <div className="text-slate-800 font-semibold">{advanced.lucky_elements.deity}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Power Colors</div>
                                    <div className="flex gap-2 mt-1">
                                        {advanced.lucky_elements.colors.map(c => (
                                            <span key={c} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">{c}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Fortunate Days</div>
                                    <div className="flex gap-2 mt-1">
                                        {advanced.lucky_elements.days.map(d => (
                                            <span key={d} className="px-2 py-0.5 rounded bg-indigo-50 text-[10px] font-bold text-indigo-600">{d}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl">
                            <h3 className="text-xl font-bold mb-4">Chaldean Name Correction</h3>
                            <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
                                Your current name number is <strong>{advanced.chaldean.name_number}</strong>. For maximum success, your name vibration should harmonize with your Psychic number <strong>{advanced.core.psychic_number}</strong>.
                            </p>
                            <button
                                onClick={handleNameCorrection}
                                disabled={correctionLoading}
                                className="w-full py-3 bg-white text-indigo-900 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {correctionLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                                {correctionLoading ? 'Analyzing Variations...' : 'Get Name Suggestions'}
                            </button>

                            {correctionSuggestions.length > 0 && (
                                <div className="mt-6 space-y-2 animate-fade-in">
                                    <div className="text-xs font-bold text-indigo-300 uppercase mb-2">Recommended Spelling Variations</div>
                                    {correctionSuggestions.map((s: any, i: number) => (
                                        <div key={i} className="bg-indigo-800/50 p-3 rounded-lg flex justify-between items-center border border-indigo-700">
                                            <div>
                                                <div className="font-bold text-white">{s.name}</div>
                                                <div className="text-[10px] text-indigo-300">{s.match_type}</div>
                                            </div>
                                            <div className="text-xl font-bold text-indigo-400">{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'compatibility' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-indigo-600" /> Number Compatibility
                            </h3>
                            <p className="text-slate-500 text-sm mb-8">
                                Check if your House, Mobile, Vehicle, or Bank Account numbers are in harmony with your Psychic Number ({advanced.core.psychic_number}).
                            </p>

                            <div className="flex flex-col md:flex-row gap-4 mb-10">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Enter House No., Mobile No., etc."
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                        value={compatInput}
                                        onChange={(e) => setCompatInput(e.target.value)}
                                    />
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                </div>
                                <button
                                    onClick={checkCompatibility}
                                    disabled={compatLoading}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {compatLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                    Analyze Compatibility
                                </button>
                            </div>

                            {compatResult && (
                                <div className={`p-6 rounded-2xl border ${compatResult.is_compatible ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'} animate-fade-in`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl ${compatResult.is_compatible ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
                                                {compatResult.is_compatible ? <Star className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-400 uppercase">Compatibility Score</div>
                                                <div className={`text-2xl font-bold ${compatResult.is_compatible ? 'text-emerald-700' : 'text-rose-700'}`}>{compatResult.score}% - {compatResult.status}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-slate-400 uppercase">Reduced Number</div>
                                            <div className="text-3xl font-black text-slate-800">{compatResult.reduced_number}</div>
                                        </div>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${compatResult.is_compatible ? 'text-emerald-800' : 'text-rose-800'}`}>
                                        {compatResult.is_compatible
                                            ? `This number vibrates at ${compatResult.reduced_number}, which is highly compatible with your Psychic Number ${advanced.core.psychic_number}. This alignment brings positive energy and smooth progress.`
                                            : `This number vibrates at ${compatResult.reduced_number}, which has a neutral or challenging relationship with your Psychic Number ${advanced.core.psychic_number}. You may face occasional hurdles or delays.`}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Mobile No.', icon: Phone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { title: 'House No.', icon: Home, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { title: 'Bank Account', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                                    <div className={`inline-flex p-3 rounded-xl ${item.bg} ${item.color} mb-4`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mt-2">Analysis for your secondary numbers</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <MainLayout title="Numerology Calculator" breadcrumbs={['Tools', 'Numerology']}>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Input Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">

                        <div className="w-full md:w-1/3">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" />
                                Select Person
                            </h2>
                            {/* Profile Selection moved to global navbar */}
                            <p className="text-xs text-slate-500 mt-2">
                                Selecting a chart in the top navigation will auto-fill the details below.
                            </p>
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-indigo-600" />
                                Calculation Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name (at Birth)</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="e.g. Kiran Kumar"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Used for Destiny & Soul Urge numbers</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="DD/MM/YYYY"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Used for Life Path number</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={calculate}
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Calculating...' : 'Reveal Core Numbers'}
                                </button>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {data && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            <NumberCard
                                item={data.life_path}
                                icon={Star}
                                colorClass="bg-indigo-600"
                            />
                            <NumberCard
                                item={data.destiny}
                                icon={Hash}
                                colorClass="bg-purple-600"
                            />
                            <NumberCard
                                item={data.soul_urge}
                                icon={Heart}
                                colorClass="bg-pink-500"
                            />
                            <NumberCard
                                item={data.personality}
                                icon={Eye}
                                colorClass="bg-teal-500"
                            />
                        </div>

                        {data.advanced && <AdvancedAnalysis advanced={data.advanced} />}

                        <div className="flex flex-col items-center gap-4 animate-fade-in py-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full max-w-2xl">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="text-left">
                                        <h3 className="text-base font-bold text-slate-900">Advanced 120+ Page Blueprint</h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Generate a deep, multi section Numerology blueprint with forecasts, talents, relationships, and life path analysis.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={generateBlueprint}
                                            disabled={blueprintLoading}
                                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            {blueprintLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                            {blueprintLoading ? 'Preparing Blueprint...' : 'Generate Blueprint'}
                                        </button>
                                        <button
                                            onClick={downloadBlueprintPdf}
                                            disabled={!blueprint}
                                            className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-40"
                                        >
                                            Download PDF Outline
                                        </button>
                                        <button
                                            onClick={openBlueprintDashboard}
                                            disabled={!blueprint}
                                            className="flex-1 px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                                        >
                                            Open Blueprint Dashboard
                                        </button>
                                    </div>
                                </div>
                                {blueprint && (
                                    <div className="mt-4 text-xs text-slate-500">
                                        <div className="font-semibold text-slate-700">Blueprint Summary</div>
                                        <div className="mt-1">
                                            Sections: {blueprint.sections.length} · Estimated Depth: {blueprint.meta.estimated_pages}+ pages
                                        </div>
                                    </div>
                                )}
                                {blueprintError && (
                                    <div className="mt-3 text-xs text-red-600">
                                        {blueprintError}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 animate-fade-in py-12">
                            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center max-w-2xl">
                                <h3 className="text-lg font-bold text-indigo-900 mb-2">Have questions about your numbers?</h3>
                                <p className="text-indigo-700 text-sm mb-6">
                                    Our AI Numerologist can help you understand your name correction, lucky numbers, and career path based on your unique vibrations.
                                </p>
                                <AIReportButton
                                    context="numerology_chat"
                                    data={data}
                                    buttonText="Start Consultation with AI Numerologist"
                                    className="w-full md:w-auto justify-center py-4 px-8 text-lg shadow-lg hover:shadow-indigo-200"
                                />
                            </div>
                        </div>
                    </>
                )}

            </div>
        </MainLayout>
    );
};

export default Numerology;
