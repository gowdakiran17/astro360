import React from 'react';
import { 
    Sun, Moon, Star, AlertTriangle, CheckCircle, 
    ShieldAlert, Activity, Sparkles, TrendingUp, Clock
} from 'lucide-react';
import ActivityList from './ActivityList';

interface GocharDetail {
    planet: string;
    house: number;
    status: 'Good' | 'Bad' | 'Neutral' | 'Obstructed';
    score: number;
    is_obstructed: boolean;
}

interface PanchangData {
    tithi: string;
    tithi_quality: string;
    nakshatra: string;
    tara: string;
    yoga_idx: number;
    yoga_quality: string;
    karana: string;
}

interface Muhurtas {
    rahu_kaal: string;
    yamaganda: string;
    sunrise: string;
    sunset: string;
}

interface DayDetailProps {
    data: {
        date: string;
        score: number;
        day_lord: string;
        is_chandrashtama: boolean;
        details?: {
            panchang: PanchangData;
            gochar: GocharDetail[];
            muhurtas?: Muhurtas;
        };
        components: {
            tara_bala: number;
            gochar: number;
            lunar_phase: number;
        };
    };
}

const getActivityType = (score: number): 'favorable' | 'unfavorable' | 'mixed' | 'neutral' => {
    if (score >= 70) return 'favorable';
    if (score <= 35) return 'unfavorable';
    if (score >= 50) return 'neutral';
    return 'mixed';
};

const DayDetailView: React.FC<DayDetailProps> = ({ data }) => {
    if (!data) return null;

    const { details, score, is_chandrashtama, day_lord } = data;
    const panchang = details?.panchang;
    const gochar = details?.gochar || [];
    const muhurtas = details?.muhurtas;

    // Helper for Status Colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Good': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Bad': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Obstructed': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-emerald-600';
        if (s >= 50) return 'text-indigo-600';
        if (s >= 30) return 'text-amber-600';
        return 'text-rose-600';
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            
            {/* 1. Hero Section: Score & Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Daily Prognosis</h3>
                    <div className={`text-6xl font-black ${getScoreColor(score)}`}>
                        {score}
                    </div>
                    <div className="text-sm font-medium text-slate-500 mt-1">/ 100</div>
                    
                    {/* Day Lord Badge */}
                    <div className="mt-4 px-3 py-1 bg-slate-50 rounded-full border border-slate-200 text-xs font-bold text-slate-600 flex items-center">
                        <Sun className="w-3 h-3 mr-1.5 text-amber-500" />
                        {day_lord}'s Day
                    </div>
                </div>

                {/* Chandrashtama Warning (Conditional) */}
                {is_chandrashtama && (
                    <div className="md:col-span-2 bg-rose-50 rounded-2xl p-6 border border-rose-100 flex items-start space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-rose-800">Chandrashtama (8th House Moon)</h3>
                            <p className="text-rose-600 mt-1 text-sm leading-relaxed">
                                The Moon is transiting the 8th house from your natal Moon today. This indicates potential mental stress, 
                                obstacles, or misunderstandings. Avoid major decisions, new ventures, or arguments today. 
                                Focus on routine work and meditation.
                            </p>
                        </div>
                    </div>
                )}
                
                {/* Standard Positive/Negative Highlights if not Chandrashtama */}
                {!is_chandrashtama && (
                    <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                            Key Highlights
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Mind & Emotions</div>
                                <div className="font-semibold text-slate-800">
                                    {panchang?.tara || "Calculating..."}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Energy Level</div>
                                <div className="font-semibold text-slate-800">
                                    {panchang?.tithi_quality === 'Bad' ? 'Low (Rikta Tithi)' : 
                                     panchang?.tithi_quality === 'Excellent' ? 'High (Purna Tithi)' : 'Moderate'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Detailed Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left: Panchang Details */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center">
                            <Moon className="w-4 h-4 mr-2 text-indigo-500" />
                            Vedic Panchang
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Tithi */}
                        <div className="flex items-start justify-between group">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                    <span className="text-indigo-600 font-bold text-xs">Ti</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tithi (Lunar Day)</p>
                                    <p className="text-base font-bold text-slate-800">{panchang?.tithi}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                panchang?.tithi_quality === 'Bad' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                                {panchang?.tithi_quality}
                            </div>
                        </div>

                        {/* Nakshatra */}
                        <div className="flex items-start justify-between group">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                    <Star className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nakshatra (Star)</p>
                                    <p className="text-base font-bold text-slate-800">{panchang?.nakshatra}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium text-slate-500">Tara Bala</p>
                                <p className="text-sm font-bold text-indigo-600">{panchang?.tara}</p>
                            </div>
                        </div>

                        {/* Yoga */}
                        <div className="flex items-start justify-between group">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                    <Activity className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yoga</p>
                                    <p className="text-base font-bold text-slate-800">
                                        {panchang?.yoga_quality === 'Bad' ? 'Malefic Yoga' : 'Benefic Yoga'}
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                panchang?.yoga_quality === 'Bad' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                                {panchang?.yoga_quality}
                            </div>
                        </div>

                        {/* Karana */}
                        <div className="flex items-start justify-between group">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                    <Activity className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Karana</p>
                                    <p className="text-base font-bold text-slate-800">{panchang?.karana || "Unknown"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Planetary Gochar & Timings */}
                <div className="space-y-6">
                    {/* Muhurtas / Timings Card */}
                    {muhurtas && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                             <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                                    Daily Timings
                                </h3>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-4">
                                <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <div className="text-xs font-bold text-orange-400 uppercase">Rahu Kaal</div>
                                    <div className="text-sm font-bold text-slate-800">{muhurtas.rahu_kaal || "--:--"}</div>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                                    <div className="text-xs font-bold text-yellow-600 uppercase">Yamaganda</div>
                                    <div className="text-sm font-bold text-slate-800">{muhurtas.yamaganda || "--:--"}</div>
                                </div>
                                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                                    <div className="text-xs font-bold text-sky-600 uppercase">Sunrise</div>
                                    <div className="text-sm font-bold text-slate-800">{muhurtas.sunrise || "--:--"}</div>
                                </div>
                                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <div className="text-xs font-bold text-indigo-600 uppercase">Sunset</div>
                                    <div className="text-sm font-bold text-slate-800">{muhurtas.sunset || "--:--"}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gochar Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
                                Planetary Transits
                            </h3>
                            <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                                Ref: Moon Sign
                            </span>
                        </div>
                        <div className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Planet</th>
                                            <th className="px-6 py-3 font-semibold">House</th>
                                            <th className="px-6 py-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {gochar.map((planet) => (
                                            <tr key={planet.planet} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-slate-800">
                                                    {planet.planet}
                                                </td>
                                                <td className="px-6 py-3 text-slate-600">
                                                    {planet.house}th House
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center w-fit ${getStatusColor(planet.status)}`}>
                                                        {planet.status === 'Obstructed' && <ShieldAlert className="w-3 h-3 mr-1" />}
                                                        {planet.status === 'Good' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                        {planet.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            {/* 3. Activity Recommendations */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <ActivityList dayQuality={getActivityType(score)} />
            </div>
        </div>
    );
};

export default DayDetailView;