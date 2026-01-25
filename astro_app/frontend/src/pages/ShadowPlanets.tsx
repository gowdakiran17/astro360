import { useState, useEffect } from 'react';
import api from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import UniversalChart from '../components/charts/UniversalChart';
import {
    Info, Layers, RefreshCw, Star, Sun, Table as TableIcon
} from 'lucide-react';
import AIReportButton from '../components/ai/AIReportButton';
import { useChartSettings } from '../context/ChartContext';

const ShadowPlanets = () => {
    // const navigate = useNavigate();
    const { currentProfile } = useChartSettings();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shadowData, setShadowData] = useState<any[]>([]);
    const [birthData, setBirthData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'Overview' | 'Aprakasha' | 'Upagrahas' | 'Charts'>('Charts');

    useEffect(() => {
        if (currentProfile) {
            fetchShadowPlanets(currentProfile);
        }
    }, [currentProfile]);

    const fetchShadowPlanets = async (profile: any) => {
        setLoading(true);
        setError('');
        try {
            const birthPayload = {
                date: profile.date,
                time: profile.time,
                timezone: profile.timezone,
                latitude: profile.latitude,
                longitude: profile.longitude
            };

            // Fetch Birth Chart for D1
            const birthResponse = await api.post('/chart/birth', birthPayload);
            setBirthData(birthResponse.data);

            // Fetch Shadow Planets for S1
            const shadowResponse = await api.post('/chart/shadow-planets', {
                birth_details: birthPayload
            });
            setShadowData(shadowResponse.data);
        } catch (err) {
            console.error(err);
            setError('Failed to calculate shadow planets.');
        } finally {
            setLoading(false);
        }
    };

    const int = (n: number) => Math.floor(n);
    const getS1ChartData = () => {
        if (!birthData || !shadowData) return null;

        const ascendant = birthData.ascendant;
        const planets = shadowData.map(p => {
            // Calculate house based on shadow planet longitude and ascendant longitude
            const p_sign_index = int(p.longitude / 30);
            const asc_sign_index = int(ascendant.longitude / 30);

            let diff = p_sign_index - asc_sign_index;
            if (diff < 0) diff += 12;
            const house = diff + 1;

            return {
                name: p.symbol, // Use symbol for chart display (Dh, Vy, etc.)
                longitude: p.longitude,
                zodiac_sign: p.sign,
                house: house
            };
        });

        return { ascendant, planets };
    };

    return (
        <MainLayout title="Shadow Planets" breadcrumbs={['Home', 'Tools', 'Shadow Planets']}>
            <div className="w-full space-y-6 pb-20 px-6">
                
                {/* Header */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-slate-900 rounded-xl text-white">
                                <Layers className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    Shadow Planets
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider rounded-md font-bold">Aprakasha & Upagraha</span>
                                </h1>
                                <p className="text-sm text-slate-500 max-w-xl mt-1">
                                    Shadow planets are mathematical calculations that represent hidden or subtle influences. They include Rahu, Ketu, and other sensitive points that reveal karmic patterns.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 w-full md:w-auto">
                            {shadowData.length > 0 && birthData && (
                                <AIReportButton
                                    buttonText="AI Shadow Insight"
                                    context={`Shadow Planet Analysis (Upagrahas) for ${currentProfile?.name}`}
                                    data={{ birthData, shadowData }}
                                    className="mr-2"
                                />
                            )}
                            <button
                                onClick={() => currentProfile && fetchShadowPlanets(currentProfile)}
                                className="p-2.5 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 hover:border-indigo-100 bg-slate-50 transition-all"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center space-x-1 p-1 bg-slate-50 rounded-xl border border-slate-100 w-fit">
                        {['Overview', 'Aprakasha', 'Upagrahas', 'Charts'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-medium">{error}</div>}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="text-slate-500 animate-pulse font-medium">Calculating sensitive shadow points...</p>
                    </div>
                ) : shadowData.length > 0 && birthData ? (
                    <div className="space-y-6">
                        {/* Tab Content: Charts */}
                        {activeTab === 'Charts' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* S1 Chart */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <div className="flex items-center space-x-2">
                                            <Star className="w-4 h-4 text-amber-500" />
                                            <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">Shadow Planets Chart (S1)</span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex justify-center bg-white">
                                        <div className="scale-110">
                                            {getS1ChartData() && <UniversalChart data={getS1ChartData()!} />}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sensitive Points & Upagrahas</p>
                                    </div>
                                </div>

                                {/* D1 Chart */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <div className="flex items-center space-x-2">
                                            <Sun className="w-4 h-4 text-orange-500" />
                                            <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">Birth Chart (D1)</span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex justify-center bg-white">
                                        <div className="scale-110">
                                            <UniversalChart data={{
                                                ascendant: birthData.ascendant,
                                                planets: birthData.planets
                                            }} />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Main Planetary Grid</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Interpretation Info Card */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-md font-bold text-indigo-900 flex items-center gap-2 mb-3">
                                <Info className="w-5 h-5" />
                                Chart Interpretation
                            </h3>
                            <p className="text-sm text-indigo-700/80 leading-relaxed max-w-4xl">
                                The S1 chart shows the positions of all shadow planets and sensitive points alongside the D1 birth chart for comparison. Pay special attention to:
                                <br /><br />
                                • Houses occupied by Rahu and Ketu
                                <br />
                                • Aspects to/from shadow planets
                                <br />
                                • Conjunctions with visible planets
                                <br />
                                • Nodal axis across houses
                                <br />
                                • Clusters of shadow planets
                            </p>
                        </div>

                        {/* Position Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-2">
                                <TableIcon className="w-4 h-4 text-slate-400" />
                                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Shadow Planet Positions</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Symbol</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shadow</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zodiac</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Degree</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {shadowData.map((p, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-black uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        {p.symbol}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-700 text-sm">{p.name}</td>
                                                <td className="px-6 py-4 text-slate-600 text-sm font-medium">{p.sign}</td>
                                                <td className="px-6 py-4 text-slate-900 text-sm font-black tracking-tighter tabular-nums">{p.degree}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Interpretation Guidelines */}
                        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                                <Star className="w-64 h-64 text-white" />
                            </div>
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <Star className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
                                        Interpretation Guidelines
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Key Principles:</h4>
                                            <ul className="space-y-3 text-xs text-slate-400 list-disc list-inside leading-relaxed">
                                                <li>Shadow planets amplify the houses they occupy</li>
                                                <li>They create karmic lessons and spiritual growth opportunities</li>
                                                <li>Rahu brings material desires and worldly focus</li>
                                                <li>Ketu brings detachment and spiritual wisdom</li>
                                                <li>Other shadows influence specific life areas subtly</li>
                                                <li>Their effects are often felt during their transits and periods</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                        <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">Analysis Approach:</h4>
                                        <ul className="space-y-4 text-xs text-slate-400 leading-relaxed">
                                            <li className="flex gap-3">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1 shrink-0" />
                                                <span>Study the Rahu-Ketu axis first (houses and signs)</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1 shrink-0" />
                                                <span>Look for conjunctions with natal planets</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1 shrink-0" />
                                                <span>Consider aspects from other planets</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1 shrink-0" />
                                                <span>Analyze the house lords where shadows are placed</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1 shrink-0" />
                                                <span>Study their relationship with Lagna and Moon</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1 shrink-0" />
                                                <span>Consider current transits for timing predictions</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-24 text-center">
                        <Layers className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Shadow Planets Map Ready</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Select a birth chart to reveal the 11 sensitive shadow points and their impact on your astrological profile.</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default ShadowPlanets;
