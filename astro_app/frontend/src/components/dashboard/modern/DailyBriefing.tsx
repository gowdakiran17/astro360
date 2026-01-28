import React from 'react';
import { Sparkles, Info, Compass, Palette, Hash, Music, Sun, Zap, Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const NAKSHATRA_ACTIVITIES: Record<string, { good: string[], avoid: string[] }> = {
    'Ashwini': { good: ['Travel', 'Healing', 'Learning'], avoid: ['Legal disputes', 'Endings'] },
    'Bharani': { good: ['Resolving debts', 'Competition'], avoid: ['Travel', 'Lending money'] },
    'Krittika': { good: ['Cooking', 'Debates', 'Cutting'], avoid: ['Socializing', 'Diplomacy'] },
    'Rohini': { good: ['Planting', 'Romance', 'Finance'], avoid: ['Confrontation', 'Decisions'] },
    'Mrigashira': { good: ['Research', 'Travel', 'Art'], avoid: ['Hard labor', 'Confrontation'] },
    'Ardra': { good: ['Research', 'Destruction', 'Confronting'], avoid: ['Marriage', 'Travel'] },
    'Punarvasu': { good: ['Travel', 'Healing', 'Starting new'], avoid: ['Borrowing', 'Conflict'] },
    'Pushya': { good: ['Learning', 'Legal', 'Investment'], avoid: ['Marriage', 'Harsh speech'] },
    'Ashlesha': { good: ['Kundalini', 'Research', 'Poisons'], avoid: ['Business', 'Starting new'] },
    'Magha': { good: ['Ancestors', 'Ceremonies', 'Authority'], avoid: ['Lending', 'Travel'] },
    'Purva Phalguni': { good: ['Rest', 'Romance', 'Art'], avoid: ['New beginnings', 'Health'] },
    'Uttara Phalguni': { good: ['Marriage', 'Career', 'Authority'], avoid: ['Endings', 'Conflict'] },
    'Hasta': { good: ['Handiwork', 'Sales', 'Humor'], avoid: ['Long travel', 'Stress'] },
    'Chitra': { good: ['Design', 'Architecture', 'Style'], avoid: ['Investigation', 'Routine'] },
    'Swati': { good: ['Business', 'Travel', 'Learning'], avoid: ['Fierce actions', 'War'] },
    'Vishakha': { good: ['Goals', 'Competition', 'Resolve'], avoid: ['Diplomacy', 'Partnership'] },
    'Anuradha': { good: ['Friendship', 'Travel', 'Healing'], avoid: ['Confrontation', 'Startups'] },
    'Jyeshtha': { good: ['Occult', 'Strategy', 'Admin'], avoid: ['Marriage', 'Tact'] },
    'Mula': { good: ['Research', 'Rooting out', 'Gardening'], avoid: ['Lending', 'Marriage'] },
    'Purva Ashadha': { good: ['Debate', 'Confrontation', 'Water'], avoid: ['Quiet reflection', 'Rest'] },
    'Uttara Ashadha': { good: ['Planning', 'Laying foundation'], avoid: ['Endings', 'Illegal acts'] },
    'Shravana': { good: ['Listening', 'Learning', 'Music'], avoid: ['Lawsuits', 'Aggression'] },
    'Dhanishta': { good: ['Music', 'Gemstones', 'Finance'], avoid: ['Routine', 'Giving up'] },
    'Shatabhisha': { good: ['Healing', 'Media', 'Astronomy'], avoid: ['Socializing', 'Lawsuits'] },
    'Purva Bhadrapada': { good: ['Occult', 'Penance', 'Risks'], avoid: ['Travel', 'Marriage'] },
    'Uttara Bhadrapada': { good: ['Meditation', 'Rest', 'Charity'], avoid: ['Litigation', 'Action'] },
    'Revati': { good: ['Travel', 'Marriage', 'Business'], avoid: ['Risks', 'Conflict'] }
};

interface DailyBriefingProps {
    dailyData?: any;
    dashaData?: any;
}

const DailyBriefing: React.FC<DailyBriefingProps> = ({ dailyData, dashaData }) => {
    // Extract data from API response
    const recommendation = dailyData?.recommendation || 'Loading your cosmic briefing...';
    const best = dailyData?.best || 'Routine Activities';
    const caution = dailyData?.caution || 'Extreme Risks';
    const panchang = dailyData?.panchang;
    const transits = dailyData?.transits || [];
    const lucky = dailyData?.lucky_factors;
    const influences = dailyData?.influences || [];
    const score = dailyData?.score || 0;
    const quality = dailyData?.quality || 'Neutral';

    // Get current dasha info
    const currentDasha = dashaData?.summary?.current_mahadasha?.planet || 'Unknown';
    const currentAntardasha = dashaData?.summary?.current_antardasha?.planet || 'Unknown';

    // Get Best Muhurta (Golden Window) - Prioritize Abhijit, then Excellent/Good periods
    const muhuratas = dailyData?.muhuratas || [];
    let bestMuhurta = muhuratas.find((m: any) => m.name === 'Abhijit' && (m.quality === 'Excellent' || m.quality === 'Good'));
    
    if (!bestMuhurta) {
        bestMuhurta = muhuratas.find((m: any) => m.quality === 'Excellent');
    }
    
    if (!bestMuhurta) {
        bestMuhurta = muhuratas.find((m: any) => m.quality === 'Good');
    }

    // Get key transit (Moon)
    const moonTransit = transits.find((t: any) => t.name === 'Moon');
    const moonSign = moonTransit?.zodiac_sign || 'Unknown';

    const getScoreColor = (s: number) => {
        if (s >= 75) return 'text-emerald-400';
        if (s >= 50) return 'text-indigo-400';
        if (s >= 25) return 'text-amber-400';
        return 'text-rose-400';
    };

    // Helper to format time safely
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        try {
            // Handle ISO strings or simple time strings
            const date = new Date(timeStr);
            if (!isNaN(date.getTime())) {
                 return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            return timeStr; // Return as is if already formatted or not a date
        } catch (e) {
            return timeStr;
        }
    };

    return (
        <div className="mb-8">
            <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-indigo-900/60 dark:via-purple-900/60 dark:to-slate-900/60 backdrop-blur-md rounded-3xl p-1 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden group">
                {/* Background glow effects */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="bg-white/50 dark:bg-black/20 rounded-[22px] p-6 md:p-8 backdrop-blur-sm relative z-10">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Summary Section */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/40">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-serif text-slate-900 dark:text-white tracking-wide">Your Cosmic Briefing</h3>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium uppercase tracking-wider mt-0.5">
                                                Daily Executive Summary
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Energy Meter */}
                                    <div className="flex items-center gap-3 bg-white dark:bg-white/5 rounded-full px-4 py-1.5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                                        <Activity className={`w-4 h-4 ${getScoreColor(score)}`} />
                                        <div className="flex flex-col items-end">
                                            <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}/100</span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">{quality} Energy</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative mb-8 pl-1">
                                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base md:text-lg font-light">
                                        {recommendation}
                                    </p>
                                </div>

                                {/* Golden Window Section - New Feature in White Space */}
                                {bestMuhurta && (
                                <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/5 rounded-xl p-4 border border-amber-200 dark:border-amber-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center border border-amber-200 dark:border-amber-500/30">
                                            <Sun className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-amber-700 dark:text-amber-200 font-bold text-sm uppercase tracking-wider">Golden Window</h4>
                                            <p className="text-slate-600 dark:text-slate-300 text-xs mt-1">Best time for important actions today</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
                                            {formatTime(bestMuhurta.start)} - {formatTime(bestMuhurta.end)}
                                        </div>
                                        <div className="text-[10px] text-amber-600 dark:text-amber-300/80 font-medium uppercase tracking-widest">
                                            {bestMuhurta.name}
                                        </div>
                                    </div>
                                </div>
                                )}

                                {/* NEW FEATURE: Current Cosmic Vibe & Active Influences */}
                                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Current Time Quality */}
                                    <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm dark:shadow-none">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <Activity className="w-12 h-12 text-slate-900 dark:text-white" />
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Zap className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                                            Current Vibe (Now)
                                        </h4>
                                        {(() => {
                                            const now = new Date();
                                            // Helper to convert JD to Date (JD epoch is -4712 BC, JS Date is 1970 AD)
                                            // JD 2440587.5 = 1970-01-01 00:00:00 UTC
                                            const jdToDate = (jd: number) => new Date((jd - 2440587.5) * 86400000);
                                            
                                            const currentM = muhuratas.find((m: any) => {
                                                // Prioritize raw JD values if available (from orchestrator update)
                                                if (m.start_jd && m.end_jd) {
                                                    const start = jdToDate(m.start_jd);
                                                    const end = jdToDate(m.end_jd);
                                                    return now >= start && now <= end;
                                                }
                                                // Fallback for older data or if JD missing
                                                const start = new Date(m.start);
                                                const end = new Date(m.end);
                                                return now >= start && now <= end;
                                            });

                                            if (currentM) {
                                                return (
                                                    <div>
                                                        <div className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                                                            {currentM.name}
                                                        </div>
                                                        <div className={`text-xs font-bold px-2 py-0.5 rounded inline-block mb-2 ${
                                                            currentM.quality === 'Excellent' || currentM.quality === 'Good' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' :
                                                            currentM.quality === 'Poor' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' :
                                                            'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                                                        }`}>
                                                            {currentM.quality}
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                                                            Ends at {formatTime(currentM.end)}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return <div className="text-sm text-slate-400 italic">Calculating current energy...</div>;
                                        })()}
                                    </div>

                                    {/* Active Influences (Moved/Promoted) */}
                                    <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                                            Active Influences
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {influences.slice(0, 4).map((inf: string, i: number) => (
                                                <span key={i} className="px-2 py-1 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                                    {inf}
                                                </span>
                                            ))}
                                            {influences.length === 0 && <span className="text-xs text-slate-500">No major influences</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Key Focus & Watch Out Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/5 border border-indigo-200 dark:border-indigo-500/20 group-hover:border-indigo-300 dark:group-hover:border-indigo-500/30 transition-colors h-full">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-300">
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm text-indigo-800 dark:text-indigo-200 font-bold uppercase tracking-wider">
                                            Your Personal Focus
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {best.split(',').map((item: string, i: number) => (
                                            <span key={i} className="text-sm font-medium text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/10 px-2.5 py-1 rounded-md">
                                                {item.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/5 border border-rose-500/20 group-hover:border-rose-500/30 transition-colors h-full">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-rose-500/20 rounded-lg text-rose-300">
                                            <Activity className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm text-rose-200 font-bold uppercase tracking-wider">
                                            Your Personal Caution
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {caution.split(',').map((item: string, i: number) => (
                                            <span key={i} className="text-sm font-medium text-slate-200 bg-rose-500/10 border border-rose-500/10 px-2.5 py-1 rounded-md">
                                                {item.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Detailed Breakdown - Slightly Wider */}
                        <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8 flex flex-col gap-6">
                            
                            {/* Astrological Recipe */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Info className="w-3 h-3" />
                                    The Astrological Recipe
                                </h4>

                                <div className="space-y-3">
                                    {moonTransit && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">🌙</div>
                                            <div>
                                                <div className="text-sm font-bold text-indigo-200">Moon in {moonSign}</div>
                                                <div className="text-xs text-slate-400 font-medium">
                                                    {panchang?.nakshatra?.name || 'Nakshatra'} • {panchang?.tithi?.name || 'Tithi'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {panchang?.yoga && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">🧘</div>
                                            <div>
                                                <div className="text-sm font-bold text-purple-200">{panchang.yoga.name} Yoga</div>
                                                <div className="text-xs text-slate-400 font-medium">Karana: {panchang.karana?.name}</div>
                                            </div>
                                        </div>
                                    )}

                                    {currentAntardasha !== 'Unknown' && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">🪐</div>
                                            <div>
                                                <div className="text-sm font-bold text-amber-200">{currentAntardasha} Antardasha</div>
                                                <div className="text-xs text-slate-400 font-medium">Mahadasha: {currentDasha}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Key Influences (Moved to Main Section) */}

                            {/* Lucky Factors */}
                            {lucky && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                        Daily Lucky Factors
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                                                <Palette className="w-2.5 h-2.5" /> Color
                                            </div>
                                            <div className="text-xs text-slate-200 font-medium truncate" title={lucky.color}>{lucky.color}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                                                <Compass className="w-2.5 h-2.5" /> Direction
                                            </div>
                                            <div className="text-xs text-slate-200 font-medium truncate" title={lucky.direction}>{lucky.direction}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                                                <Hash className="w-2.5 h-2.5" /> Number
                                            </div>
                                            <div className="text-xs text-slate-200 font-medium truncate" title={lucky.number}>{lucky.number}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                                                <Music className="w-2.5 h-2.5" /> Mantra
                                            </div>
                                            <div className="text-xs text-slate-200 font-medium truncate" title={lucky.mantra}>{lucky.mantra}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cosmic Activity Guide - New Feature */}
                            {panchang?.nakshatra?.name && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-purple-400" />
                                        Cosmic Activity Guide
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 gap-3">
                                        {/* Recommended */}
                                        <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                                            <div className="text-[10px] text-emerald-400 uppercase font-bold mb-2 flex items-center gap-1.5">
                                                <CheckCircle className="w-3 h-3" /> Best For
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(NAKSHATRA_ACTIVITIES[panchang.nakshatra.name]?.good || ['Routine Work', 'Planning']).map((act, i) => (
                                                    <span key={i} className="text-xs font-medium text-emerald-200 bg-emerald-500/20 px-2 py-0.5 rounded">
                                                        {act}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Avoid */}
                                        <div className="bg-rose-500/10 rounded-lg p-3 border border-rose-500/20">
                                            <div className="text-[10px] text-rose-400 uppercase font-bold mb-2 flex items-center gap-1.5">
                                                <XCircle className="w-3 h-3" /> Avoid
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(NAKSHATRA_ACTIVITIES[panchang.nakshatra.name]?.avoid || ['High Risks', 'Conflicts']).map((act, i) => (
                                                    <span key={i} className="text-xs font-medium text-rose-200 bg-rose-500/20 px-2 py-0.5 rounded">
                                                        {act}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Travel Caution (Disha Shool) */}
                                        <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20 flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] text-amber-400 uppercase font-bold mb-1 flex items-center gap-1.5">
                                                    <AlertTriangle className="w-3 h-3" /> Travel Caution
                                                </div>
                                                <div className="text-xs text-amber-200">
                                                    Avoid traveling <span className="font-bold">
                                                        {(() => {
                                                            const day = dailyData?.weekday || new Date().toLocaleDateString('en-US', { weekday: 'long' });
                                                            const map: Record<string, string> = {
                                                                'Sunday': 'West', 'Monday': 'East', 'Tuesday': 'North', 'Wednesday': 'North',
                                                                'Thursday': 'South', 'Friday': 'West', 'Saturday': 'East'
                                                            };
                                                            return map[day] || 'West';
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-amber-500/70 font-medium">
                                                (Disha Shool)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyBriefing;
