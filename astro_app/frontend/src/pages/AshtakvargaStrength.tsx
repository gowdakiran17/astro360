import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import {
    BarChart2, Info, RefreshCw, Shield, AlertTriangle, Star, Target, Layout, Table
} from 'lucide-react';
import AIReportButton from '../components/ai/AIReportButton';
import { useChartSettings } from '../context/ChartContext';

const AshtakvargaStrength = () => {
    const { currentProfile } = useChartSettings();
    // const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [avData, setAvData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'charts' | 'table'>('charts');

    useEffect(() => {
        if (currentProfile) {
            fetchAshtakvarga();
        }
    }, [currentProfile]);

    const fetchAshtakvarga = async () => {
        if (!currentProfile) return;
        
        setLoading(true);
        setError('');

        try {
            const payload = {
                birth_details: {
                    date: currentProfile.date,
                    time: currentProfile.time,
                    timezone: currentProfile.timezone,
                    latitude: currentProfile.latitude,
                    longitude: currentProfile.longitude
                }
            };
            const response = await api.post('/chart/ashtakvarga', payload);
            setAvData(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to calculate Ashtakvarga strength.');
        } finally {
            setLoading(false);
        }
    };

    const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

    const getStrengthLabel = (points: number) => {
        if (points >= 30) return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        if (points >= 25) return { label: 'Good', color: 'bg-blue-100 text-blue-700 border-blue-200' };
        if (points >= 20) return { label: 'Average', color: 'bg-amber-100 text-amber-700 border-amber-200' };
        return { label: 'Weak', color: 'bg-rose-100 text-rose-700 border-rose-200' };
    };

    const getHeatmapColor = (points: number) => {
        if (points >= 6) return 'bg-emerald-100 text-emerald-800';
        if (points >= 4) return 'bg-amber-100 text-amber-800';
        return 'bg-rose-50 text-rose-800';
    };

    // Custom Simple Bar Chart Component
    const BarChart = ({ data, height = 150, showLabels = true, highlightIdx = -1 }: { data: number[], height?: number, showLabels?: boolean, highlightIdx?: number }) => {
        const max = Math.max(...data, 1);
        return (
            <div className="flex items-end justify-between w-full h-full gap-1 group" style={{ minHeight: height }}>
                {data.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div
                            className={`w-full rounded-t-sm transition-all duration-300 relative group/bar ${i === highlightIdx ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-indigo-400 opacity-90 hover:opacity-100'}`}
                            style={{ height: `${(val / max) * 85}%` }}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none z-10">
                                {val} pts
                            </div>
                        </div>
                        {showLabels && (
                            <span className="text-[10px] text-slate-400 font-medium">{i + 1}</span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <MainLayout title="Ashtakvarga Strength" breadcrumbs={['Calculations', 'Ashtakvarga']}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                            <BarChart2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Ashtakvarga Strength</h1>
                            <p className="text-sm text-slate-500">Numerical strength analysis of life areas</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                             {/* Global profile selector used in nav */}
                        </div>

                        {avData && (
                            <AIReportButton
                                buttonText="AI Strength Report"
                                context={`Ashtakvarga Strength Analysis for Chart: ${currentProfile?.name}`}
                                data={avData}
                                className="mr-2"
                            />
                        )}
                        <button
                            onClick={() => currentProfile && fetchAshtakvarga()}
                            className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg bg-slate-50 border border-slate-100 active:scale-95 transition-all"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 animate-pulse">{error}</div>}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="text-slate-500 animate-pulse">Computing planetary algorithms...</p>
                    </div>
                ) : avData ? (
                    <div className="space-y-6">
                        {/* Intro Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-3">
                                    <Shield className="w-4 h-4" />
                                    <span>Strongest Houses</span>
                                </div>
                                <div className="space-y-2">
                                    {avData.strongest_houses.map((h: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">House {h.house_idx}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold text-slate-900">{h.points}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStrengthLabel(h.points).color}`}>
                                                    {getStrengthLabel(h.points).label}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-3">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Weakest Houses</span>
                                </div>
                                <div className="space-y-2">
                                    {avData.weakest_houses.map((h: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">House {h.house_idx}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold text-slate-900">{h.points}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStrengthLabel(h.points).color}`}>
                                                    {getStrengthLabel(h.points).label}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-3">
                                    <Star className="w-4 h-4" />
                                    <span>Best Performing Planet</span>
                                </div>
                                <div className="flex flex-col space-y-2 mt-4">
                                    <div className="text-2xl font-bold text-slate-900">Jupiter</div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-slate-500">Avg Points:</span>
                                        <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">4.7 / house</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-3">
                                    <Target className="w-4 h-4" />
                                    <span>Areas of Focus</span>
                                </div>
                                <div className="text-xs text-slate-500 leading-relaxed mt-2">
                                    House {avData.weakest_houses[0].house_idx} points are low, indicating potential need for remedial measures or extra caution in related life departments.
                                </div>
                                <div className="mt-3 flex items-center space-x-2 text-amber-700 bg-amber-50 p-2 rounded border border-amber-100 font-bold text-[10px] uppercase">
                                    House {avData.weakest_houses[0].house_idx} Weak
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Total House Strengths (Sarvashtakvarga)</h2>
                                    <p className="text-xs text-slate-500">Combined planetary strength for each house</p>
                                </div>
                                <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                                    <button
                                        onClick={() => setActiveTab('charts')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'charts' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Layout className="w-3 h-3 inline mr-1" /> Visuals
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('table')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'table' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Table className="w-3 h-3 inline mr-1" /> Table
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {activeTab === 'charts' ? (
                                    <div className="space-y-8">
                                        <div className="w-full max-w-4xl mx-auto pt-6 pb-6 bg-slate-50/50 rounded-xl border border-slate-100 px-8">
                                            <div className="h-[250px] w-full">
                                                <BarChart data={avData.sav} />
                                            </div>
                                            <div className="mt-4 flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-center">
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Strongest</div>
                                                    <div className="text-lg font-bold text-slate-900">House {avData.strongest_houses[0].house_idx}</div>
                                                </div>
                                                <div className="w-px h-8 bg-slate-200 mx-4"></div>
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Weakest</div>
                                                    <div className="text-lg font-bold text-slate-900">House {avData.weakest_houses[0].house_idx}</div>
                                                </div>
                                                <div className="w-px h-8 bg-slate-200 mx-4"></div>
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Average</div>
                                                    <div className="text-lg font-bold text-slate-900">{avData.average_points.toFixed(1)}</div>
                                                </div>
                                                <div className="w-px h-8 bg-slate-200 mx-4"></div>
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Total Points</div>
                                                    <div className="text-lg font-bold text-slate-900">{avData.total_points}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                                            {planets.map(p_name => (
                                                <div key={p_name} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-bold text-slate-800">{p_name}</span>
                                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">BAV Points</span>
                                                    </div>
                                                    <div className="h-[120px] w-full">
                                                        <BarChart data={avData.bavs[p_name]} showLabels={false} />
                                                    </div>
                                                    <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                                                        <span>Max: {Math.max(...avData.bavs[p_name])}</span>
                                                        <span>Total: {avData.bavs[p_name].reduce((a: number, b: number) => a + b, 0)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left border-collapse bg-slate-50/30 rounded-lg overflow-hidden border border-slate-200">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-widest border-b border-slate-200">
                                                    <th className="px-4 py-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">Planet</th>
                                                    {[...Array(12)].map((_, i) => (
                                                        <th key={i} className="px-3 py-3 text-center border-r border-slate-200">H{i + 1}</th>
                                                    ))}
                                                    <th className="px-4 py-3 text-center">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {planets.map(p_name => (
                                                    <tr key={p_name} className="border-b border-slate-200 hover:bg-white transition-colors">
                                                        <td className="px-4 py-3 font-bold text-slate-700 sticky left-0 bg-inherit z-10 border-r border-slate-200">{p_name.substring(0, 2)}</td>
                                                        {avData.bavs[p_name].map((val: number, i: number) => (
                                                            <td key={i} className={`px-2 py-3 text-center font-medium border-r border-slate-100/50 ${getHeatmapColor(val)}`}>
                                                                {val}
                                                            </td>
                                                        ))}
                                                        <td className="px-4 py-3 text-center font-bold text-slate-900">
                                                            {avData.bavs[p_name].reduce((a: number, b: number) => a + b, 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-slate-900 text-white font-bold">
                                                    <td className="px-4 py-4 sticky left-0 bg-slate-900 border-r border-slate-800">SAV</td>
                                                    {avData.sav.map((val: number, i: number) => (
                                                        <td key={i} className="px-2 py-4 text-center border-r border-slate-800/20">{val}</td>
                                                    ))}
                                                    <td className="px-4 py-4 text-center bg-indigo-600">{avData.total_points}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className="mt-4 flex items-center space-x-2 text-xs text-slate-500">
                                            <Info className="w-4 h-4 text-indigo-500" />
                                            <span>Houses are calculated relative to the Lagna (Ascendant).</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Tip Section */}
                        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 -m-8 opacity-10">
                                <BarChart2 className="w-48 h-48" />
                            </div>
                            <div className="max-w-2xl relative z-10">
                                <h3 className="text-xl font-bold mb-2">Ashtakvarga interpretation Guide</h3>
                                <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                                    A house with 30 or more points is considered very strong, while a house with less than 20 points may indicate challenges or areas where extra effort is required. Planets with high average points across houses generally have a more positive influence on the native's life.
                                </p>
                                <div className="flex space-x-4">
                                    <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                                        How to use Ashtakvarga?
                                    </button>
                                    <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-bold border border-indigo-400 hover:bg-indigo-400 transition-colors">
                                        Predictive Insights
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 border-dashed rounded-xl p-20 text-center">
                        <BarChart2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Ready for Strength Analysis</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Select a birth chart to compute planetary distributions and house strengths using the Ashtakvarga system.</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default AshtakvargaStrength;
