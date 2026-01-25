import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import {
    RefreshCw, Sun, Moon, Clock, Calendar,
    Zap, Layers, Sunrise, Sunset, MoveUp, MoveDown, Info
} from 'lucide-react';

const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const LivePanchang = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [panchangData, setPanchangData] = useState<any>(null);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Default location (Bengaluru)
    const [location] = useState({
        name: "Bengaluru, Karnataka, IN",
        latitude: 12.97,
        longitude: 77.59,
        timezone: "+05:30"
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (user) {
            fetchPanchang();
        }
    }, [user]);

    const fetchPanchang = async () => {
        setLoading(true);
        setError('');
        try {
            const now = new Date();
            const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const response = await api.post('/chart/live-panchang', {
                date: dateStr,
                time: timeStr,
                timezone: location.timezone,
                latitude: location.latitude,
                longitude: location.longitude
            });
            setPanchangData(response.data);
        } catch (err: any) {
            console.error("Failed to fetch panchang", err);
            const msg = err.response?.data?.detail || "Unable to load Panchang data. Please check your connection.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour12: false });
    const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const formatJDToTime = (jd: number) => {
        if (!jd) return '--:--';
        const date = new Date((jd - 2440587.5) * 86400000);

        // Parse timezone offset from meta or location (e.g., "+05:30")
        const tzStr = panchangData?.meta?.timezone || location.timezone;
        const sign = tzStr[0] === '+' ? 1 : -1;
        const [hours, minutes] = tzStr.substring(1).split(':').map(Number);
        const offsetMs = sign * (hours * 3600000 + minutes * 60000);

        const localDate = new Date(date.getTime() + offsetMs);
        return localDate.getUTCHours().toString().padStart(2, '0') + ':' +
            localDate.getUTCMinutes().toString().padStart(2, '0');
    };

    const TimelineBar = ({ label, segments, currentMinutes, color }: any) => {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
                </div>
                <div className="h-8 bg-slate-100 rounded-lg overflow-hidden flex relative border border-slate-200/50">
                    {segments.map((seg: any, idx: number) => {
                        const width = ((seg.end - seg.start) / 1440) * 100;
                        const left = (seg.start / 1440) * 100;
                        return (
                            <div
                                key={`${label}-${idx}-${seg.start}-${seg.end}`}
                                className={`absolute h-full flex items-center px-4 transition-all hover:brightness-95 cursor-default ${idx % 2 === 0 ? 'bg-amber-400' : 'bg-amber-500'}`}
                                style={{
                                    width: `${width}%`,
                                    left: `${left}%`,
                                    backgroundColor: label === 'Tithi' ? (idx % 2 === 0 ? '#f59e0b' : '#d97706') :
                                        label === 'Nakshatra' ? (idx % 2 === 0 ? '#10b981' : '#059669') :
                                            label === 'Yoga' ? (idx % 2 === 0 ? '#6366f1' : '#4f46e5') : '#f43f5e'
                                }}
                            >
                                <span className="text-[10px] font-bold text-white truncate">{seg.name}</span>
                            </div>
                        );
                    })}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                        style={{ left: `${(currentMinutes / 1440) * 100}%` }}
                    />
                </div>
            </div>
        );
    };

    const MoonGraphic = ({ illumination, phaseName }: any) => {
        const isWaxing = !phaseName.includes('Waning');

        return (
            <div className="relative w-40 h-40 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl border border-white/5 overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute bg-white rounded-full" style={{
                            width: 1.5,
                            height: 1.5,
                            top: `${(i * 17) % 100}%`,
                            left: `${(i * 23) % 100}%`
                        }} />
                    ))}
                </div>
                <svg width="80" height="80" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#1e293b" />
                    <path
                        d={`M 50 5 A 45 45 0 1 ${isWaxing ? 1 : 0} 50 95 A ${45 * (Math.abs(50 - illumination) / 50)} 45 0 1 ${illumination > 50 ? (isWaxing ? 1 : 0) : (isWaxing ? 0 : 1)} 50 5`}
                        fill="#f8fafc"
                    />
                </svg>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{illumination.toFixed(1)}% Illuminated</p>
                </div>
            </div>
        );
    };

    return (
        <MainLayout title="Live Panchang" breadcrumbs={['Global Tools', 'Panchang']}>
            <div className="w-full space-y-6 pb-20 px-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                Live Panchang
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] uppercase tracking-widest rounded-md font-bold">Live</span>
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">Real-time vedic calendar information • {location.name}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">
                            {formatTime(currentTime)}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            LIVE • {formatDate(currentTime)}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-3xl flex items-center gap-4">
                        <Info className="w-5 h-5" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center animate-pulse">
                        <div className="h-12 w-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Calculating Panchang...</p>
                    </div>
                ) : panchangData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Panchang Timeline</h3>
                                </div>
                                <TimelineBar
                                    label="Tithi"
                                    segments={panchangData.timeline.tithi}
                                    currentMinutes={currentTime.getHours() * 60 + currentTime.getMinutes()}
                                    color="bg-amber-500"
                                />
                                <TimelineBar
                                    label="Nakshatra"
                                    segments={panchangData.timeline.nakshatra}
                                    currentMinutes={currentTime.getHours() * 60 + currentTime.getMinutes()}
                                    color="bg-emerald-500"
                                />
                                <TimelineBar
                                    label="Yoga"
                                    segments={panchangData.timeline.yoga}
                                    currentMinutes={currentTime.getHours() * 60 + currentTime.getMinutes()}
                                    color="bg-indigo-500"
                                />
                                <TimelineBar
                                    label="Karana"
                                    segments={panchangData.timeline.karana}
                                    currentMinutes={currentTime.getHours() * 60 + currentTime.getMinutes()}
                                    color="bg-rose-500"
                                />
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-3 mb-6">
                                    <Layers className="w-5 h-5 text-slate-400" />
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Lagna Journey Across the Day</h3>
                                </div>
                                <div className="h-[300px] w-full relative pt-4 pb-8">
                                    <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-[8px] font-black text-slate-300 uppercase tracking-tighter pr-2 border-r border-slate-100">
                                        {ZODIAC_SIGNS.slice().reverse().map(sign => <div key={sign}>{sign}</div>)}
                                    </div>
                                    <div className="ml-12 h-full relative">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="absolute w-full border-t border-slate-50" style={{ top: `${(i / 11) * 100}%` }} />
                                        ))}
                                        {[...Array(7)].map((_, j) => (
                                            <div key={j} className="absolute h-full border-l border-slate-50" style={{ left: `${(j / 6) * 100}%` }} />
                                        ))}
                                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                            <path
                                                d={`M 0 ${((11 - panchangData.lagna_journey[0].sign_idx) / 11) * 100}% ${panchangData.lagna_journey.map((pt: any) => `L ${(pt.time / 1440) * 100}% ${((11 - pt.sign_idx) / 11) * 100}%`).join(' ')}`}
                                                fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-12 mt-2 flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                        {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map((t, i) => <div key={`${t}-${i}`}>{t}</div>)}
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase text-center mt-4">Lagna changes roughly every 2 hours. The step chart tracks each zodiac sign until the next transition.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                                <div className="flex items-center gap-3 w-full mb-6">
                                    <Moon className="w-5 h-5 text-slate-400" />
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Moon Visualization</h3>
                                </div>
                                <MoonGraphic illumination={panchangData.current.illumination} phaseName={panchangData.current.phase_name} />
                                <div className="mt-6 space-y-1">
                                    <p className="text-xl font-black text-slate-900 tracking-tight">{panchangData.current.phase_name}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Lunar Phase</p>
                                </div>
                                <div className="grid grid-cols-2 w-full gap-4 mt-8 pt-6 border-t border-slate-100">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Direction</p>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-sm font-black text-slate-900 tabular-nums">{panchangData.current.azimuth.toFixed(1)}°</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Azimuth</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Elevation</p>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-sm font-black text-slate-900 tabular-nums">{panchangData.current.elevation.toFixed(1)}°</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Alt/Alt</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <Zap className="w-5 h-5 text-slate-400" />
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Tithi Progress</h3>
                                </div>
                                <div className="text-center mb-6">
                                    <p className="text-2xl font-black text-slate-900 tracking-tight">{panchangData.current.tithi}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: Active</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                        <span>Lunar Month Progress</span>
                                        <span>{(panchangData.current.tithi_progress * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-sm transition-all duration-1000"
                                            style={{ width: `${panchangData.current.tithi_progress * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase tracking-widest pt-1">
                                        <span>{formatJDToTime(panchangData.current.tithi_start)}</span>
                                        <span>{formatJDToTime(panchangData.current.tithi_end)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 transform translate-x-1/4 -translate-y-1/4 opacity-10 rotate-12">
                                    <Sunrise className="w-32 h-32 text-indigo-400" />
                                </div>
                                <div className="flex items-center gap-3 mb-8 relative z-10">
                                    <Sun className="w-5 h-5 text-indigo-400" />
                                    <h3 className="font-black text-indigo-400 text-sm uppercase tracking-widest">Sun & Moon Timeline</h3>
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 group-hover:bg-amber-500/20 transition-all">
                                                <Sunrise className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-white tracking-wide">Sunrise</span>
                                        </div>
                                        <div className="text-sm font-black text-white tabular-nums">{formatJDToTime(panchangData.current.sunrise)}</div>
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500 group-hover:bg-orange-500/20 transition-all">
                                                <Sunset className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-white tracking-wide">Sunset</span>
                                        </div>
                                        <div className="text-sm font-black text-white tabular-nums">{formatJDToTime(panchangData.current.sunset)}</div>
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                                                <MoveUp className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-white tracking-wide">Moonrise</span>
                                        </div>
                                        <div className="text-sm font-black text-white tabular-nums">
                                            {panchangData.current.moonrise ? formatJDToTime(panchangData.current.moonrise) : '--:--'}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                                                <MoveDown className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-white tracking-wide">Moonset</span>
                                        </div>
                                        <div className="text-sm font-black text-white tabular-nums">
                                            {panchangData.current.moonset ? formatJDToTime(panchangData.current.moonset) : '--:--'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && panchangData && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-600">
                                <Info className="w-5 h-5" />
                            </div>
                            <p className="text-sm text-indigo-700 font-medium leading-relaxed max-w-2xl">
                                Panchang is the ancient Vedic calendar based on 5 parameters. It defines the energy and quality of time for any given moment. Study the Lagna Journey and Tithi status for auspicious timing selection.
                            </p>
                        </div>
                        <button
                            onClick={fetchPanchang}
                            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> REFRESH DATA
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default LivePanchang;
