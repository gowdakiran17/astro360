import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { astrologyService } from '../services/astrology';
import MainLayout from '../components/layout/MainLayout';
import {
    Zap, Clock, RefreshCw,
    Sunrise, Sunset, Info, Star, ChevronRight, ChevronLeft, Calendar, AlertCircle, Search
} from 'lucide-react';

const Muhurata = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [muhurataData, setMuhurataData] = useState<any>(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [selectedDate, setSelectedDate] = useState(new Date());

    // FInder Mode State
    const [mode, setMode] = useState<'Daily' | 'Finder'>('Daily');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 7)));
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Default location (Bengaluru)
    const [location] = useState({
        name: "Bengaluru, Karnataka, IN",
        latitude: 12.97,
        longitude: 77.59,
        timezone: "+05:30"
    });

    useEffect(() => {
        if (user && mode === 'Daily') {
            fetchMuhurata();
        }
    }, [user, selectedDate, mode]);

    const fetchMuhurata = async () => {
        setLoading(true);
        setError('');
        try {
            const dateStr = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
            const timeStr = `${selectedDate.getHours().toString().padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}`;

            const response = await api.post('chart/muhurata', {
                birth_details: {
                    date: dateStr,
                    time: timeStr,
                    timezone: location.timezone,
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            });
            setMuhurataData(response.data.data);
        } catch (err: any) {
            console.error("Failed to fetch muhurata", err);
            let errorMessage = "Failed to load Muhurata data.";
            if (err.response?.data?.detail) {
                if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                } else {
                    errorMessage = JSON.stringify(err.response.data.detail);
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const searchMuhurata = async () => {
        setLoading(true);
        setError('');
        try {
            const startStr = `${startDate.getDate().toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')}/${startDate.getFullYear()}`;
            const endStr = `${endDate.getDate().toString().padStart(2, '0')}/${(endDate.getMonth() + 1).toString().padStart(2, '0')}/${endDate.getFullYear()}`;

            // Fixed: Pass as object
            const result = await astrologyService.findMuhurata({
                date: startStr,
                end_date: endStr,
                latitude: location.latitude,
                longitude: location.longitude,
                target_quality: ["Excellent", "Good"]
            });
            setSearchResults(result.results || []);
        } catch (err: any) {
            console.error("Failed to search muhurata", err);
            setError("Failed to search muhurata.");
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const formatJDToTime = (jd: number) => {
        if (!jd) return '--:--';
        const date = new Date((jd - 2440587.5) * 86400000);
        const tzStr = location.timezone;
        const sign = tzStr[0] === '+' ? 1 : -1;
        const [hours, minutes] = tzStr.substring(1).split(':').map(Number);
        const offsetMs = sign * (hours * 3600000 + minutes * 60000);

        const localDate = new Date(date.getTime() + offsetMs);
        return localDate.getUTCHours().toString().padStart(2, '0') + ':' +
            localDate.getUTCMinutes().toString().padStart(2, '0');
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'Excellent': return 'bg-emerald-500';
            case 'Good': return 'bg-teal-400';
            case 'Poor': return 'bg-amber-500';
            case 'Avoid': return 'bg-rose-500';
            default: return 'bg-slate-400';
        }
    };

    const getQualityLightBg = (quality: string) => {
        switch (quality) {
            case 'Excellent': return 'bg-emerald-50 border-emerald-100 text-emerald-700';
            case 'Good': return 'bg-teal-50 border-teal-100 text-teal-700';
            case 'Poor': return 'bg-amber-50 border-amber-100 text-amber-700';
            case 'Avoid': return 'bg-rose-50 border-rose-100 text-rose-700';
            default: return 'bg-slate-50 border-slate-100 text-slate-700';
        }
    };

    const SummaryCard = ({ label, count, color, lightColor }: any) => (
        <div className={`${lightColor} border p-6 rounded-3xl flex-1 min-w-[150px] shadow-sm transition-all hover:scale-[1.02]`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-black tracking-widest opacity-70">{label}</span>
                <div className={`w-2 h-2 rounded-full ${color}`} />
            </div>
            <div className="text-3xl font-black">{count}</div>
        </div>
    );

    const filteredPeriods = muhurataData?.periods?.filter((p: any) =>
        activeTab === 'All' || p.type.includes(activeTab) || p.quality === activeTab
    ) || [];

    return (
        <MainLayout title="Muhurata" breadcrumbs={['Global Tools', 'Muhurata']}>
            <div className="w-full space-y-6 pb-20 px-6">

                {/* Header Section */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900">Auspicious Times</h1>
                            <p className="text-sm text-slate-500">Find the best times for your important activities</p>
                        </div>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setMode('Daily')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'Daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Daily View
                        </button>
                        <button
                            onClick={() => setMode('Finder')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'Finder' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Finder
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {mode === 'Finder' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Search Criteria */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Find Auspicious Timings</h3>
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate.toISOString().split('T')[0]}
                                        onChange={(e) => setStartDate(new Date(e.target.value))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate.toISOString().split('T')[0]}
                                        onChange={(e) => setEndDate(new Date(e.target.value))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                                    />
                                </div>
                                <button
                                    onClick={searchMuhurata}
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
                                >
                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    Find Muhurta
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        {searchResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {searchResults.map((result, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{result.date}</div>
                                            <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getQualityLightBg(result.quality)}`}>
                                                {result.quality}
                                            </div>
                                        </div>
                                        <h4 className="font-black text-slate-900 mb-1">{result.name}</h4>
                                        <div className="text-sm font-medium text-slate-600 mb-3">
                                            {formatJDToTime(result.start)} - {formatJDToTime(result.end)}
                                        </div>
                                        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {result.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {searchResults.length === 0 && !loading && (
                            <div className="text-center py-12 text-slate-400">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="font-medium">Adjust dates and search to find auspicious moments</p>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'Daily' && (
                    <>
                        {/* Summary Cards */}
                        {muhurataData && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <SummaryCard label="Excellent" count={muhurataData.summary.Excellent} color="bg-emerald-500" lightColor="bg-emerald-50 border-emerald-100 text-emerald-700" />
                                <SummaryCard label="Good" count={muhurataData.summary.Good} color="bg-teal-400" lightColor="bg-teal-50 border-teal-100 text-teal-700" />
                                <SummaryCard label="Poor" count={muhurataData.summary.Poor} color="bg-amber-500" lightColor="bg-amber-50 border-amber-100 text-amber-700" />
                                <SummaryCard label="Avoid" count={muhurataData.summary.Avoid} color="bg-rose-500" lightColor="bg-rose-50 border-rose-100 text-rose-700" />
                            </div>
                        )}

                        {/* Date Selection Bar */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-2 flex items-center justify-center gap-4 self-center shadow-sm">
                            <button
                                onClick={() => handleDateChange(-1)}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={selectedDate.toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-32 cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={() => handleDateChange(1)}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="w-px h-8 bg-slate-100 mx-2" />

                            <button
                                onClick={() => setSelectedDate(new Date())}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg hover:bg-slate-800 transition-all"
                            >
                                Today
                            </button>
                        </div>

                        {/* Timeline Section */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-slate-400" />
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Today's Timeline</h3>
                                </div>
                                <div className="flex gap-2">
                                    {['Excellent', 'Good', 'Poor', 'Avoid'].map(q => (
                                        <div key={q} className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${getQualityLightBg(q)}`}>
                                            {q[0]}: {muhurataData?.summary[q]}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {muhurataData && (
                                <div className="space-y-12">
                                    {/* Sunrise/Sunset Markers */}
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2 border border-dashed border-amber-400 bg-amber-50 px-3 py-1 rounded-full text-amber-600">
                                            <Sunrise className="w-3 h-3" /> SUNRISE {formatJDToTime(muhurataData.sunrise)}
                                        </div>
                                        <div className="flex items-center gap-2 border border-dashed border-orange-400 bg-orange-50 px-3 py-1 rounded-full text-orange-600">
                                            <Sunset className="w-3 h-3" /> SUNSET {formatJDToTime(muhurataData.sunset)}
                                        </div>
                                    </div>

                                    {/* Main Timeline Bar */}
                                    <div className="h-10 bg-slate-50 rounded-2xl overflow-hidden flex relative border border-slate-100 p-1">
                                        {muhurataData.periods.filter((p: any) => p.type === 'Choghadiya').map((p: any, i: number) => {
                                            const total = muhurataData.next_sunrise - muhurataData.sunrise;
                                            const width = ((p.end - p.start) / total) * 100;
                                            const left = ((p.start - muhurataData.sunrise) / total) * 100;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`absolute h-full rounded-lg transition-all hover:brightness-95 hover:scale-y-105 shadow-sm ${getQualityColor(p.quality)}`}
                                                    style={{ width: `${width}%`, left: `${left}%` }}
                                                    title={`${p.name}: ${formatJDToTime(p.start)} - ${formatJDToTime(p.end)}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Period Grid/List */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Detail Periods</h3>
                                    <div className="flex gap-2">
                                        {['All', 'Choghadiya', 'Hora', 'Muhurata'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setActiveTab(t)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === t ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="overflow-y-auto max-h-[600px] divide-y divide-slate-50">
                                    {filteredPeriods.map((p: any, i: number) => (
                                        <div key={i} className="p-4 hover:bg-slate-50 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-10 rounded-full ${getQualityColor(p.quality)}`} />
                                                <div>
                                                    <div className="font-black text-slate-900 text-sm">{p.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {p.type} • {p.ruler ? `Ruler: ${p.ruler}` : 'Standard'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-slate-900 tabular-nums">
                                                        {formatJDToTime(p.start)} - {formatJDToTime(p.end)}
                                                    </div>
                                                    <div className={`text-[9px] font-black uppercase tracking-widest ${getQualityLightBg(p.quality).split(' ')[2]}`}>
                                                        {p.quality}
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-all" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                        <Star className="w-32 h-32" />
                                    </div>
                                    <h3 className="font-black text-indigo-400 text-xs uppercase tracking-[0.2em] mb-6 relative z-10">Calculations Info</h3>
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/5 rounded-xl text-white">
                                                <Info className="w-4 h-4" />
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                Calculations are for <span className="text-white font-bold">{location.name}</span>. Total of {muhurataData?.periods?.length || 0} periods analyzed.
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-white/5 space-y-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Updated</p>
                                            <p className="text-sm font-black tabular-nums">{muhurataData ? new Date().toLocaleTimeString() : '--:--:--'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                                    <h4 className="font-black text-indigo-900 text-xs uppercase tracking-widest mb-4">Legend</h4>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Excellent', color: 'bg-emerald-500', desc: 'Highly auspicious for all tasks' },
                                            { label: 'Good', color: 'bg-teal-400', desc: 'Favorable for general success' },
                                            { label: 'Poor', color: 'bg-amber-500', desc: 'Avoid important beginnings' },
                                            { label: 'Avoid', color: 'bg-rose-500', desc: 'Critical negative period' }
                                        ].map(l => (
                                            <div key={l.label} className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${l.color}`} />
                                                <div>
                                                    <div className="text-[10px] font-black text-indigo-900 uppercase leading-none">{l.label}</div>
                                                    <div className="text-[9px] text-indigo-500 font-medium">{l.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    );
};
export default Muhurata;
