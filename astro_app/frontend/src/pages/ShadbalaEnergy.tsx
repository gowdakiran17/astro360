import { useState, useEffect } from 'react';
import api from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import {
    Info, Activity, RefreshCw, TrendingUp, Shield, Star, Target, Home
} from 'lucide-react';
import AIReportButton from '../components/ai/AIReportButton';
import { useChartSettings } from '../context/ChartContext';

const ShadbalaEnergy = () => {
    // const navigate = useNavigate();
    const { currentProfile } = useChartSettings();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shadbalaData, setShadbalaData] = useState<any>(null);
    const [bhavaData, setBhavaData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'visuals' | 'table'>('visuals');

    useEffect(() => {
        if (currentProfile) {
            fetchShadbala(currentProfile);
        }
    }, [currentProfile]);

    const fetchShadbala = async (profile: any) => {
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
                }
            };
            const response = await api.post('chart/shadbala', payload);

            // Handle both old and new response structures
            if (response.data.shadbala) {
                setShadbalaData(response.data.shadbala);
                setBhavaData(response.data.bhava_bala || []);
            } else {
                setShadbalaData(response.data);
                setBhavaData([]);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to calculate Shadbala strength.');
        } finally {
            setLoading(false);
        }
    };

    const fonts = {
        Sun: "text-amber-600",
        Moon: "text-slate-400",
        Mars: "text-rose-600",
        Mercury: "text-emerald-600",
        Jupiter: "text-yellow-600",
        Venus: "text-pink-500",
        Saturn: "text-indigo-600"
    };

    // Custom Radar Chart (Spider Chart)
    const RadarChart = ({ components, planetName, size = 180 }: { components: any, planetName: string, size?: number }) => {
        const keys = ["Sthana", "Dig", "Kaala", "Cheshta", "Naisargika", "Drik"];
        const labels = ["Position", "Direction", "Time", "Motion", "Natural", "Aspect"];
        const center = size / 2;
        const radius = size * 0.35;
        const pointCount = keys.length;
        const maxVal = 60; // Max expected value for normalization

        const getPoints = () => {
            return keys.map((key, i) => {
                const angle = (Math.PI * 2 / pointCount) * i - Math.PI / 2;
                const value = Math.min(components[key], maxVal);
                const factor = (value / maxVal) * radius;
                const x = center + Math.cos(angle) * factor;
                const y = center + Math.sin(angle) * factor;
                return `${x},${y}`;
            }).join(' ');
        };

        const gridLines = [0.25, 0.5, 0.75, 1].map(scale => {
            return keys.map((_, i) => {
                const angle = (Math.PI * 2 / pointCount) * i - Math.PI / 2;
                const x = center + Math.cos(angle) * radius * scale;
                const y = center + Math.sin(angle) * radius * scale;
                return `${x},${y}`;
            }).join(' ');
        });

        return (
            <div className="flex flex-col items-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                    {/* Grid Background */}
                    {gridLines.map((points, i) => (
                        <polygon key={i} points={points} className="fill-none stroke-slate-200" strokeWidth="1" />
                    ))}

                    {/* Axes */}
                    {keys.map((_, i) => {
                        const angle = (Math.PI * 2 / pointCount) * i - Math.PI / 2;
                        const x = center + Math.cos(angle) * radius;
                        const y = center + Math.sin(angle) * radius;
                        return (
                            <line key={i} x1={center} y1={center} x2={x} y2={y} className="stroke-slate-100" strokeWidth="1" />
                        );
                    })}

                    {/* Data Polygon */}
                    <polygon
                        points={getPoints()}
                        className={`fill-indigo-500/20 stroke-indigo-600 transition-all duration-700`}
                        strokeWidth="2"
                        style={{ filter: 'drop-shadow(0 0 2px rgba(79, 70, 229, 0.2))' }}
                    />

                    {/* Labels */}
                    {labels.map((label, i) => {
                        const angle = (Math.PI * 2 / pointCount) * i - Math.PI / 2;
                        const x = center + Math.cos(angle) * (radius + 20);
                        const y = center + Math.sin(angle) * (radius + 20);
                        return (
                            <text
                                key={i}
                                x={x}
                                y={y}
                                className="text-[10px] fill-slate-400 font-medium"
                                textAnchor="middle"
                                alignmentBaseline="middle"
                            >
                                {label}
                            </text>
                        );
                    })}
                </svg>
                <div className={`mt-2 font-bold ${fonts[planetName as keyof typeof fonts]}`}>{planetName}</div>
            </div>
        );
    };

    return (
        <MainLayout title="Shadbala Energy" breadcrumbs={['Calculations', 'Shadbala']}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Shadbala Energy</h1>
                            <p className="text-sm text-slate-500">Six sources of planetary strength analysis</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        {shadbalaData && (
                            <AIReportButton
                                buttonText="AI Energy Analysis"
                                context={`Shadbala Energy Analysis for ${currentProfile?.name}`}
                                data={{ shadbala: shadbalaData, bhava: bhavaData }}
                                className="mr-2"
                            />
                        )}
                        <button
                            onClick={() => currentProfile && fetchShadbala(currentProfile)}
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
                        <p className="text-slate-500 animate-pulse">Calculating 6-fold planetary potencies...</p>
                    </div>
                ) : shadbalaData ? (
                    <div className="space-y-8">
                        {/* Top Analysis Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
                                    <TrendingUp className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strongest Planet</div>
                                    <div className={`text-2xl font-black ${fonts[shadbalaData.summary.strongest as keyof typeof fonts]}`}>
                                        {shadbalaData.summary.strongest}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                                <div className="p-4 bg-rose-50 text-rose-600 rounded-full">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weakest Planet</div>
                                    <div className={`text-2xl font-black ${fonts[shadbalaData.summary.weakest as keyof typeof fonts]}`}>
                                        {shadbalaData.summary.weakest}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
                                    <Star className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Strength</div>
                                    <div className="text-2xl font-black text-slate-900">
                                        {(shadbalaData.planets.reduce((acc: number, p: any) => acc + p.percentage, 0) / shadbalaData.planets.length).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Strength Chart */}
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Total Shadbala Strength</h2>
                                    <p className="text-sm text-slate-500">Comparison of current strength vs standard requirement</p>
                                </div>
                                <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                                    <button
                                        onClick={() => setActiveTab('visuals')}
                                        className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'visuals' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 shadow-none'}`}
                                    >
                                        Visual Signatures
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('table')}
                                        className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'table' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 shadow-none'}`}
                                    >
                                        Detailed Table
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                {activeTab === 'visuals' ? (
                                    <div className="space-y-12">
                                        {/* Main Bar Comparison Chart */}
                                        <div className="grid grid-cols-7 gap-4 h-[300px] items-end pb-8 relative pt-4">
                                            {/* Grid Horizontal Lines */}
                                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                                                {[100, 75, 50, 25, 0].map(val => (
                                                    <div key={val} className="w-full border-t border-slate-100 flex items-center">
                                                        <span className="text-[8px] text-slate-300 -ml-8 w-6 text-right pr-1">{val}%</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {shadbalaData.planets.map((p: any) => (
                                                <div key={p.name} className="flex flex-col items-center justify-end h-full group relative">
                                                    {/* Requirement Marker Line */}
                                                    <div className="absolute w-[120%] h-px bg-slate-200 border-t border-dashed border-slate-300 z-0 bottom-[80%]" style={{ bottom: '100px', display: 'none' }}></div>

                                                    <div
                                                        className={`w-12 rounded-t-lg transition-all duration-1000 relative group/bar mb-2 ${p.percentage >= 100 ? 'bg-emerald-500' : 'bg-rose-400'}`}
                                                        style={{ height: `${Math.min(p.percentage, 120) * 0.8}%` }}
                                                    >
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md transition-all whitespace-nowrap z-20">
                                                            {p.total_rupas} / {p.requirement_rupas} Rupas
                                                        </div>
                                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-all rounded-t-lg"></div>
                                                    </div>
                                                    <div className={`text-xs font-bold ${fonts[p.name as keyof typeof fonts]}`}>{p.name.substring(0, 3)}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium">{p.percentage}%</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Radar Charts Grid */}
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-8 text-center flex items-center justify-center space-x-2">
                                                <Activity className="w-5 h-5 text-indigo-600" />
                                                <span>Planetary Energy Signatures</span>
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                                                {shadbalaData.planets.map((p: any) => (
                                                    <RadarChart key={p.name} components={p.components} planetName={p.name} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse rounded-xl overflow-hidden border border-slate-100">
                                            <thead>
                                                <tr className="bg-slate-50 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                                                    <th className="px-6 py-4 text-left border-b border-slate-100">Planet</th>
                                                    <th className="px-4 py-4 text-center border-b border-slate-100">Sthana</th>
                                                    <th className="px-4 py-4 text-center border-b border-slate-100">Dig</th>
                                                    <th className="px-4 py-4 text-center border-b border-slate-100">Kaala</th>
                                                    <th className="px-4 py-4 text-center border-b border-slate-100">Cheshta</th>
                                                    <th className="px-4 py-4 text-center border-b border-slate-100">Naisargika</th>
                                                    <th className="px-4 py-4 text-center border-b border-slate-100">Drik</th>
                                                    <th className="px-4 py-4 text-center border-b border-slate-100 bg-indigo-50/30 text-indigo-700">Total (R)</th>
                                                    <th className="px-4 py-4 text-center border-b border-slate-100">Req.</th>
                                                    <th className="px-4 py-4 text-center border-b border-slate-100">Strength</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {shadbalaData.planets.map((p: any) => (
                                                    <tr key={p.name} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                                                        <td className="px-6 py-4 font-bold text-slate-800 flex items-center space-x-3">
                                                            <div className={`w-2 h-2 rounded-full ${fonts[p.name as keyof typeof fonts].replace('text-', 'bg-')}`}></div>
                                                            <span>{p.name}</span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-slate-500">{p.components.Sthana}</td>
                                                        <td className="px-4 py-4 text-center text-slate-500">{p.components.Dig}</td>
                                                        <td className="px-4 py-4 text-center text-slate-500">{p.components.Kaala}</td>
                                                        <td className="px-4 py-4 text-center text-slate-500">{p.components.Cheshta}</td>
                                                        <td className="px-4 py-4 text-center text-slate-500">{p.components.Naisargika}</td>
                                                        <td className="px-4 py-4 text-center text-slate-500">{p.components.Drik}</td>
                                                        <td className="px-4 py-4 text-center font-bold text-indigo-600 bg-indigo-50/10">{p.total_rupas}</td>
                                                        <td className="px-4 py-4 text-center text-slate-400 font-medium">{p.requirement_rupas}</td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-[80px]">
                                                                    <div
                                                                        className={`h-full rounded-full ${p.percentage >= 100 ? 'bg-emerald-500' : p.percentage >= 80 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                                                        style={{ width: `${Math.min(p.percentage, 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-[10px] font-bold mt-1 text-slate-500">{p.percentage}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Bhava Bala (House Strength) Section */}
                        {bhavaData.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Home className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Bhava Bala</h2>
                                        <p className="text-sm text-slate-500">House strength analysis (Mean ~8 Rupas)</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="overflow-x-auto p-4">
                                        <div className="min-w-[700px] h-[200px] flex items-end justify-between gap-2 px-4">
                                            {bhavaData.map((house: any) => {
                                                const heightPct = Math.min((house.strength / 12) * 100, 100);
                                                const isStrong = house.strength > 8;
                                                return (
                                                    <div key={house.house} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                                        <div className="relative w-full flex justify-center">
                                                            <div
                                                                className={`w-full max-w-[40px] rounded-t-lg transition-all ${isStrong ? 'bg-indigo-500' : 'bg-slate-300'} group-hover:brightness-110`}
                                                                style={{ height: `${heightPct * 1.5}px` }}
                                                            >
                                                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                                                    {house.strength.toFixed(1)} Rupas
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs font-bold text-slate-600">H{house.house}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Interpretation Guide */}
                        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-10 scale-150 rotate-12">
                                <Activity className="w-64 h-64" />
                            </div>
                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-2xl font-black mb-6 flex items-center space-x-3">
                                        <Info className="w-8 h-8 text-indigo-400" />
                                        <span>Understanding Shadbala</span>
                                    </h3>
                                    <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
                                        <p>
                                            <strong className="text-white">Positional (Sthana) Strength:</strong> Derived from planet's sign placement, exaltation, and varga positions. Indicates the solid foundation of a planet's power.
                                        </p>
                                        <p>
                                            <strong className="text-white">Directional (Dig) Strength:</strong> Planets gain specific power when located in certain cardinal points (Houses 1, 4, 7, 10). Represents the correct orientation of energy.
                                        </p>
                                        <p>
                                            <strong className="text-white">Temporal (Kaala) Strength:</strong> Focuses on the time of birth, lunar phase, and ruling planetary period. Represents the "timing" and availability of force.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                    <h4 className="text-lg font-bold text-white mb-4">Key Insight</h4>
                                    <p className="text-slate-400 text-sm italic mb-6">
                                        "Shadbala reveals a planet's raw potential to deliver its promise. A planet might look well-placed in a chart, but without sufficient Shadbala, its results may be inconsistent or delayed."
                                    </p>
                                    <div className="flex items-center space-x-3 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                                        <Target className="w-4 h-4" />
                                        <span>Remedial Focus House {shadbalaData.summary.weakest}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 border-dashed rounded-xl p-20 text-center">
                        <Activity className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Shadbala Analysis Ready</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Select a birth chart to unlock advanced 6-fold planetary energy calculations and radar signature analysis.</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default ShadbalaEnergy;
