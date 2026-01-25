import { useState, useEffect } from 'react';
import api from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import UniversalChart from '../components/charts/UniversalChart';
import { Info, LayoutGrid, RefreshCw } from 'lucide-react';
import AIReportButton from '../components/ai/AIReportButton';
import { useChartSettings } from '../context/ChartContext';

const Shodashvarga = () => {
    // const navigate = useNavigate();
    const { currentProfile } = useChartSettings();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [vargaData, setVargaData] = useState<any>(null);
    const [activeVarga, setActiveVarga] = useState<string>('D1');

    // Fetch varga data when chart changes
    useEffect(() => {
        if (currentProfile) {
            fetchShodashvarga(currentProfile);
        }
    }, [currentProfile]);

    const fetchShodashvarga = async (profile: any) => {
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

            const response = await api.post('/chart/shodashvarga', payload);
            setVargaData(response.data);
        } catch (err: any) {
            console.error(err);
            setError('Failed to calculate divisional charts.');
        } finally {
            setLoading(false);
        }
    };

    const vargaOrder = [
        "D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12",
        "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60"
    ];

    return (
        <MainLayout title="Shodashvarga Charts" breadcrumbs={['Calculations', 'Shodashvarga']}>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                            <LayoutGrid className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Shodashvarga Charts</h1>
                            <p className="text-sm text-slate-500">16 Divisional Charts for detailed analysis</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        {vargaData && (
                            <AIReportButton
                                buttonText="AI Varga Analysis"
                                context={`Shodashvarga Analysis (${activeVarga}) for ${currentProfile?.name}`}
                                data={{ active_varga: activeVarga, data: vargaData.vargas[activeVarga] }}
                                className="mr-2"
                            />
                        )}
                        <button
                            onClick={() => currentProfile && fetchShodashvarga(currentProfile)}
                            className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : vargaData ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* 16 Charts Grid */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vargaOrder.map(vName => {
                                const varga = vargaData.vargas[vName];
                                if (!varga) return null;
                                return (
                                    <div
                                        key={vName}
                                        className={`bg-white border rounded-xl overflow-hidden cursor-pointer transition-all ${activeVarga === vName ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                                        onClick={() => setActiveVarga(vName)}
                                    >
                                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            <span>{vName}</span>
                                            <span className="text-slate-400">{vName === 'D1' ? 'Rashi' : vName === 'D9' ? 'Navamsa' : ''}</span>
                                        </div>
                                        <div className="p-2 flex justify-center border-b border-slate-50">
                                            <div className="scale-[0.85] origin-top">
                                                <UniversalChart data={{
                                                    ascendant: varga.ascendant,
                                                    planets: varga.planets
                                                }} />
                                            </div>
                                        </div>
                                        <div className="p-3 text-[10px] text-slate-500 italic line-clamp-2">
                                            {varga.significance}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sidebar: Details of Active Varga */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sticky top-24">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Info className="w-5 h-5 text-indigo-500" />
                                    <h2 className="font-bold text-slate-800">{activeVarga} Details</h2>
                                </div>
                                <p className="text-sm text-slate-600 mb-6 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    {vargaData.vargas[activeVarga]?.significance}
                                </p>

                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Planetary Positions</h3>
                                    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {vargaData.vargas[activeVarga]?.planets.map((p: any) => (
                                            <div key={p.name} className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100 text-sm">
                                                <span className="font-medium text-slate-700">{p.name}</span>
                                                <div className="text-right">
                                                    <div className="text-indigo-600 font-bold">{p.zodiac_sign}</div>
                                                    <div className="text-[10px] text-slate-400">House {p.house}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 -m-4 opacity-10">
                                    <LayoutGrid className="w-24 h-24" />
                                </div>
                                <h3 className="font-bold mb-2 relative z-10">Shodashvarga Analysis</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-4 relative z-10">
                                    Advanced vargottama and strength analysis across all 16 divisional charts provides the most accurate results in Vedic Astrology.
                                </p>
                                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-bold transition-colors">
                                    Download Full Report
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center">
                        <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No Plot Data</h3>
                        <p className="text-slate-500">Please select or create a chart to view Shodashvarga analysis.</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Shodashvarga;
