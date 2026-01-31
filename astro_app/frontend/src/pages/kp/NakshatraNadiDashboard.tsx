import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Sparkles, Bot, ChevronDown, ChevronUp, Loader2, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { useChart } from '../../context/ChartContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 transition-all duration-300 ${className}`}>
        {children}
    </div>
);

const NakshatraNadiDashboard: React.FC = () => {
    const { currentProfile } = useChart();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'gold' | 'predictions'>('gold');
    const [selectedEvent, setSelectedEvent] = useState<string>('career');

    // AI Insight State
    const [periodInsight, setPeriodInsight] = useState<string | null>(null);
    const [eventInsight, setEventInsight] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);
    const [cachedInsights, setCachedInsights] = useState<Record<string, string>>({});

    useEffect(() => {
        if (currentProfile) {
            fetchNadiAnalysis();
        }
    }, [currentProfile]);

    const fetchNadiAnalysis = async () => {
        if (!currentProfile) return;
        setLoading(true);
        try {
            const response = await api.post('kp/nakshatra-nadi', {
                birth_details: currentProfile
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching Nadi analysis:', error);
        } finally {
            setLoading(false);
        }
    };



    // Fetch AI Insight
    const fetchAIInsight = async (type: 'period' | 'event', eventName?: string) => {
        if (!data?.current_bukthi?.hierarchy) return;

        const cacheKey = type === 'period' ? 'period_insight' : `event_${eventName}`;
        if (cachedInsights[cacheKey]) {
            if (type === 'period') setPeriodInsight(cachedInsights[cacheKey]);
            else setEventInsight(cachedInsights[cacheKey]);
            return;
        }

        setInsightLoading(true);
        try {
            const response = await api.post('kp/ai-insight', {
                dasha_hierarchy: data.current_bukthi.hierarchy,
                event_name: eventName || null
            });

            const insightText = response.data.insight;
            setCachedInsights(prev => ({ ...prev, [cacheKey]: insightText }));

            if (type === 'period') setPeriodInsight(insightText);
            else setEventInsight(insightText);

        } catch (error) {
            console.error('Error fetching AI insight:', error);
        } finally {
            setInsightLoading(false);
        }
    };

    // Auto-fetch Period Insight when data loads
    useEffect(() => {
        if (data && !periodInsight) {
            fetchAIInsight('period');
        }
    }, [data]);

    useEffect(() => {
        // Reset event insight when event changes
        setEventInsight(null);
    }, [selectedEvent]);

    const GoldNadiGrid = ({ planets, houseLordships }: { planets: any[], houseLordships?: any }) => {
        const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

        const getColorClass = (planet: string) => {
            const colors: Record<string, string> = {
                'Sun': 'border-amber-500 bg-amber-500/10 text-amber-200',
                'Moon': 'border-slate-500 bg-slate-500/10 text-slate-200',
                'Mars': 'border-rose-600 bg-rose-600/10 text-rose-200',
                'Mercury': 'border-emerald-600 bg-emerald-600/10 text-emerald-200',
                'Jupiter': 'border-yellow-600 bg-yellow-600/10 text-yellow-200',
                'Venus': 'border-slate-400 bg-slate-400/10 text-slate-200',
                'Saturn': 'border-blue-700 bg-blue-700/10 text-blue-200',
                'Rahu': 'border-slate-500 bg-slate-500/10 text-slate-200',
                'Ketu': 'border-rose-700 bg-rose-700/10 text-rose-200'
            };
            return colors[planet] || 'border-slate-600 bg-slate-600/10 text-slate-200';
        };

        const getPlanetAbbr = (planet: string) => {
            const abbr: Record<string, string> = {
                'Sun': 'SU', 'Moon': 'MO', 'Mars': 'MA', 'Mercury': 'ME',
                'Jupiter': 'JU', 'Venus': 'VE', 'Saturn': 'SA', 'Rahu': 'RA', 'Ketu': 'KE'
            };
            return abbr[planet] || planet.substring(0, 2).toUpperCase();
        };

        const LayerRow = ({ label, layerData }: { label: string, layerData: any }) => {
            if (!layerData) return null;
            const { name, sig } = layerData;
            return (
                <div className="flex items-center gap-2 py-2 border-b last:border-0 border-slate-700/50">
                    <span className="text-[10px] text-slate-500 font-bold w-8">{label}</span>
                    <span className="font-bold text-sm min-w-[24px]">{getPlanetAbbr(name)}</span>
                    <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                        {sig.pos || '-'}
                    </span>
                    <span className="text-xs text-slate-400 flex-1 truncate">
                        {sig.lords && sig.lords.length > 0 ? sig.lords.join(', ') : '-'}
                    </span>
                </div>
            );
        };

        return (
            <div className="space-y-6">
                {/* House Lordship Reference Table */}
                {houseLordships && Object.keys(houseLordships).length > 0 && (
                    <Card className="bg-slate-900/50 border-slate-800 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold text-amber-500/50 uppercase tracking-widest">Lordship Reference</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-y-3 gap-x-2 text-[10px]">
                            {Object.entries(houseLordships).map(([house, lord]: [string, any]) => (
                                <div key={house} className="flex flex-col items-center">
                                    <span className="text-slate-500 mb-1">H{house}</span>
                                    <span className="text-slate-200 font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 w-full text-center">
                                        {getPlanetAbbr(lord)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Planet Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {planetOrder.map(planetName => {
                        const planet = planets.find(p => p.planet === planetName);
                        if (!planet || !planet.layers) return null;

                        return (
                            <Card
                                key={planetName}
                                className={`p-4 border-2 ${getColorClass(planetName)}`}
                            >
                                <LayerRow label="PL" layerData={planet.layers.pl} />
                                <LayerRow label="NL" layerData={planet.layers.nl} />
                                <LayerRow label="SL" layerData={planet.layers.sl} />
                                <LayerRow label="SSL" layerData={planet.layers.ssl} />
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><LoadingSpinner /></div>;
    if (!data) return <div className="p-8 text-center text-slate-500 bg-slate-950 min-h-screen">Unable to load analysis. Please check backend connection.</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Nakshatra Nadi Analysis
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Specialized Pt. Dinesh Guruji Technique</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchNadiAnalysis}
                        className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-indigo-400 text-sm transition-all"
                    >
                        Refresh Calculation
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('gold')}
                    className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'gold'
                        ? 'text-amber-400'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Gold Nadi Combination
                    {activeTab === 'gold' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('predictions')}
                    className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'predictions'
                        ? 'text-indigo-400'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    All Predictions
                    {activeTab === 'predictions' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"></div>
                    )}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'gold' ? (
                <div className="space-y-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-amber-400 mb-2">GOLD NADI COMBINATION</h2>
                        <p className="text-sm text-slate-400">
                            PL: Planet Lord | NL: Nakshatra Lord | SL: Sub Lord | SSL: Sub-Sub Lord
                        </p>
                    </div>
                    <GoldNadiGrid planets={data.planets} houseLordships={data.house_lordships} />
                </div>
            ) : (
                <>
                    {/* All Predictions Content */}
                    {data.current_bukthi?.lord && (
                        <div className="space-y-4">
                            {/* Dasha Hierarchy Display */}
                            {data.current_bukthi.hierarchy && (
                                <Card className="p-4 bg-slate-900/50 border-slate-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Running Period Hierarchy</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {/* Mahadasha */}
                                        <div className="bg-slate-900 rounded-lg border border-slate-800 p-3 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                                            <div className="absolute -right-2 -top-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-100 group-hover:rotate-0">
                                                <span className="text-5xl font-black text-amber-500">MD</span>
                                            </div>
                                            <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-0.5">Mahadasha</div>
                                            <div className="text-lg font-bold text-slate-200">{data.current_bukthi.hierarchy.mahadasha?.lord}</div>
                                            <div className="text-[10px] text-slate-500 mt-1 truncate">
                                                {data.current_bukthi.hierarchy.mahadasha?.end_date?.split(' ')[0]}
                                            </div>
                                        </div>

                                        {/* Antardasha */}
                                        <div className="bg-slate-900 rounded-lg border border-indigo-500/50 p-3 relative overflow-hidden shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]">
                                            <div className="absolute -right-2 -top-2 opacity-10 rotate-12">
                                                <span className="text-5xl font-black text-indigo-500">AD</span>
                                            </div>
                                            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5">Antardasha</div>
                                            <div className="text-lg font-bold text-white">{data.current_bukthi.hierarchy.antardasha?.lord}</div>
                                            <div className="text-[10px] text-indigo-300/60 mt-1 truncate">
                                                {data.current_bukthi.hierarchy.antardasha?.end_date?.split(' ')[0]}
                                            </div>
                                        </div>

                                        {/* Antara */}
                                        <div className="bg-slate-900 rounded-lg border border-slate-800 p-3 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                                            <div className="absolute -right-2 -top-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-100 group-hover:rotate-0">
                                                <span className="text-5xl font-black text-emerald-500">PD</span>
                                            </div>
                                            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-0.5">Pratyantar</div>
                                            <div className="text-lg font-bold text-slate-200">{data.current_bukthi.hierarchy.antara?.lord || '-'}</div>
                                            <div className="text-[10px] text-slate-500 mt-1 truncate">
                                                {data.current_bukthi.hierarchy.antara?.end_date?.split(' ')[0]}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* AI Period Insight */}
                            <Card className="bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500/30 overflow-hidden">
                                <div className="p-4 flex justify-between items-start gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 mt-1">
                                            {insightLoading && !periodInsight ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-slate-200">Current Cosmic Scope</h3>
                                                    <p className="text-xs text-slate-400 mb-2">AI-powered analysis of your current time period</p>
                                                </div>
                                            </div>

                                            {periodInsight ? (
                                                <div className="prose prose-invert prose-sm max-w-none text-slate-300 bg-black/20 p-3 rounded-lg border border-indigo-500/10">
                                                    <ReactMarkdown>{periodInsight}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                <div className="text-slate-500 text-xs italic">
                                                    {insightLoading ? "Analyzing planetary vibrations..." : "Waiting for insight..."}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Event Selector */}
                            <Card className="bg-slate-900/50 border-slate-800 p-4">
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Select Life Event</label>
                                <select
                                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-indigo-500 focus:outline-none"
                                    value={selectedEvent}
                                    onChange={(e) => setSelectedEvent(e.target.value)}
                                >
                                    <option value="education">Education</option>
                                    <option value="career">Job/Career</option>
                                    <option value="government_job">Government Job</option>
                                    <option value="business">Business</option>
                                    <option value="finance">Finance/Wealth</option>
                                    <option value="marriage">Marriage</option>
                                    <option value="child_birth">Child Birth</option>
                                    <option value="property">Property/Vehicle</option>
                                    <option value="health">Health</option>
                                    <option value="travel">Travel</option>
                                    <option value="litigation">Litigation (Prashna)</option>
                                </select>
                            </Card>

                            {/* AI Event Advice */}
                            <Card className="bg-slate-900/50 border-slate-800 p-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bot className="w-4 h-4 text-emerald-500" />
                                            <h3 className="text-sm font-bold text-slate-200">AI Guidance for {selectedEvent.replace('_', ' ').toUpperCase()}</h3>
                                        </div>

                                        {eventInsight ? (
                                            <div className="prose prose-invert prose-sm max-w-none text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                                <ReactMarkdown>{eventInsight}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-500 italic">
                                                {insightLoading ? "Consulting the stars..." : "Get specific astrological advice for this area of life."}
                                            </p>
                                        )}
                                    </div>

                                    {!eventInsight && !insightLoading && (
                                        <button
                                            onClick={() => fetchAIInsight('event', selectedEvent)}
                                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 transition-all flex items-center gap-1 shrink-0"
                                        >
                                            <BrainCircuit className="w-3 h-3" />
                                            Analyze
                                        </button>
                                    )}
                                </div>
                            </Card>

                            {/* Grid of 9 Planet Prediction Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-6">
                                {data.event_analysis[selectedEvent]?.map((planetData: any) => {
                                    const getStatusConfig = (potential: string) => {
                                        switch (potential) {
                                            case 'YES': return {
                                                border: 'border-emerald-500/50',
                                                text: 'text-emerald-400',
                                                badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                                icon: 'bg-emerald-500'
                                            };
                                            case 'NO': return {
                                                border: 'border-rose-500/50',
                                                text: 'text-rose-400',
                                                badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                                                icon: 'bg-rose-500'
                                            };
                                            default: return {
                                                border: 'border-amber-500/50',
                                                text: 'text-amber-400',
                                                badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                                                icon: 'bg-amber-500'
                                            };
                                        }
                                    };

                                    const isMD = data.current_bukthi?.hierarchy?.mahadasha?.lord === planetData.planet;
                                    const isAD = data.current_bukthi?.hierarchy?.antardasha?.lord === planetData.planet;
                                    const isPD = data.current_bukthi?.hierarchy?.antara?.lord === planetData.planet;

                                    const status = getStatusConfig(planetData.potential);

                                    return (
                                        <div key={planetData.planet} className={`bg-slate-900/50 rounded-xl overflow-hidden shadow-sm flex flex-col transition-all hover:scale-[1.01] duration-300 border ${status.border}`}>
                                            {/* Header */}
                                            <div className="px-4 py-3 flex justify-between items-center bg-slate-900 border-b border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${status.icon} shadow-[0_0_8px_rgba(var(--tw-shadow-color),0.5)]`}></div>
                                                    <span className={`font-bold tracking-wide ${status.text}`}>{planetData.planet.toUpperCase()}</span>

                                                    {/* Dasha Badges */}
                                                    <div className="flex gap-1 ml-1">
                                                        {isMD && <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">MD</span>}
                                                        {isAD && <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">AD</span>}
                                                        {isPD && <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">PD</span>}
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${status.badge}`}>
                                                    {planetData.potential === 'YES' ? 'Good' : planetData.potential === 'NO' ? 'Bad' : 'Mixed'}
                                                </span>
                                            </div>

                                            {/* Table Body */}
                                            <div className="flex-1">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-slate-800 text-slate-400">
                                                        <tr>
                                                            <th className="px-2 py-1.5 text-left w-12">Lvl</th>
                                                            <th className="px-2 py-1.5 text-center w-8">%</th>
                                                            <th className="px-2 py-1.5 text-center text-emerald-500 font-bold border-l border-slate-700">Good</th>
                                                            <th className="px-2 py-1.5 text-center text-rose-500 font-bold border-l border-slate-700">Bad</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800">
                                                        {/* Planet Level */}
                                                        <tr>
                                                            <td className="px-2 py-2 font-medium text-amber-500">
                                                                {planetData.planet.substring(0, 2).toUpperCase()} <span className="text-[10px] text-slate-500">(PL)</span>
                                                            </td>
                                                            <td className="px-2 py-2 text-center text-slate-400">20%</td>
                                                            <td className="px-2 py-2 text-center text-emerald-400 border-l border-slate-800 leading-tight">
                                                                {planetData.houses.planet.good?.join(', ') || '-'}
                                                            </td>
                                                            <td className="px-2 py-2 text-center text-rose-400 border-l border-slate-800 leading-tight">
                                                                {planetData.houses.planet.bad?.join(', ') || '-'}
                                                            </td>
                                                        </tr>

                                                        {/* NL Level */}
                                                        <tr>
                                                            <td className="px-2 py-2 font-medium text-cyan-500">
                                                                {planetData.houses.star_lord.name.substring(0, 2).toUpperCase()} <span className="text-[10px] text-slate-500">(NL)</span>
                                                            </td>
                                                            <td className="px-2 py-2 text-center text-slate-400">30%</td>
                                                            <td className="px-2 py-2 text-center text-emerald-400 border-l border-slate-800 leading-tight">
                                                                {planetData.houses.star_lord.good?.join(', ') || '-'}
                                                            </td>
                                                            <td className="px-2 py-2 text-center text-rose-400 border-l border-slate-800 leading-tight">
                                                                {planetData.houses.star_lord.bad?.join(', ') || '-'}
                                                            </td>
                                                        </tr>

                                                        {/* SL Level */}
                                                        <tr className="bg-slate-800/30">
                                                            <td className="px-2 py-2 font-medium text-pink-500">
                                                                {planetData.houses.sub_lord.name.substring(0, 2).toUpperCase()} <span className="text-[10px] text-slate-500">(SL)</span>
                                                            </td>
                                                            <td className="px-2 py-2 text-center text-slate-400">50%</td>
                                                            <td className="px-2 py-2 text-center text-emerald-400 border-l border-slate-800 font-medium leading-tight">
                                                                {planetData.houses.sub_lord.good?.join(', ') || '-'}
                                                            </td>
                                                            <td className="px-2 py-2 text-center text-rose-400 border-l border-slate-800 font-medium leading-tight">
                                                                {planetData.houses.sub_lord.bad?.join(', ') || '-'}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px]">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-500">Indication</span>
                                                    <span className={`font-medium ${planetData.rating === 'E' || planetData.rating === 'H' ? 'text-emerald-400' :
                                                        planetData.rating === 'M' ? 'text-amber-400' : 'text-rose-400'
                                                        }`}>
                                                        {planetData.rating === 'E' ? 'Excellent' :
                                                            planetData.rating === 'H' ? 'High' :
                                                                planetData.rating === 'M' ? 'Medium' :
                                                                    planetData.rating === 'L' ? 'Low' : 'Bad'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-slate-500">Success Rate</span>
                                                    <span className={`font-bold ${planetData.score >= 80 ? 'text-emerald-400' :
                                                        planetData.score >= 50 ? 'text-amber-400' : 'text-rose-400'
                                                        }`}>
                                                        {planetData.score}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Combination Summary */}
                                            <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[10px] flex justify-between items-center text-slate-500">
                                                <span>Combination</span>
                                                <div className="flex gap-2">
                                                    <span className="text-emerald-600 font-medium tracking-tight truncate max-w-[80px]">
                                                        {Array.from(new Set([
                                                            ...(planetData.houses.planet.good || []),
                                                            ...(planetData.houses.star_lord.good || []),
                                                            ...(planetData.houses.sub_lord.good || [])
                                                        ])).sort((a: any, b: any) => a - b).join(',')}
                                                    </span>
                                                    <span>vs</span>
                                                    <span className="text-rose-600 font-medium tracking-tight truncate max-w-[80px]">
                                                        {Array.from(new Set([
                                                            ...(planetData.houses.planet.bad || []),
                                                            ...(planetData.houses.star_lord.bad || []),
                                                            ...(planetData.houses.sub_lord.bad || [])
                                                        ])).sort((a: any, b: any) => a - b).join(',')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NakshatraNadiDashboard;
