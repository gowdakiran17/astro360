import React from 'react';
import { Sparkles, Quote, Info } from 'lucide-react';

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

    // Get current dasha info
    const currentDasha = dashaData?.summary?.current_mahadasha?.planet || 'Unknown';
    const currentAntardasha = dashaData?.summary?.current_antardasha?.planet || 'Unknown';

    // Get key transit (Moon)
    const moonTransit = transits.find((t: any) => t.name === 'Moon');
    const moonSign = moonTransit?.zodiac_sign || 'Unknown';

    return (
        <div className="mb-8">
            <div className="bg-gradient-to-br from-indigo-900/60 via-purple-900/60 to-slate-900/60 backdrop-blur-md rounded-2xl p-1 border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="bg-black/20 rounded-xl p-6 md:p-8 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Main Summary */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/40">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-xl font-serif text-white tracking-wide">Your Cosmic Briefing</h3>
                            </div>

                            <div className="relative">
                                <Quote className="absolute -top-2 -left-4 w-8 h-8 text-indigo-500/20 transform -scale-x-100" />
                                <p className="text-slate-200 leading-relaxed text-lg font-light italic pl-2">
                                    "{recommendation}"
                                </p>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-4">
                                <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                                    <span className="text-xs text-indigo-300 uppercase tracking-wider font-bold mb-1">Key Focus</span>
                                    <span className="text-sm text-slate-200">{best}</span>
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                                    <span className="text-xs text-rose-300 uppercase tracking-wider font-bold mb-1">Watch Out</span>
                                    <span className="text-sm text-slate-200">{caution}</span>
                                </div>
                            </div>
                        </div>

                        {/* Astrological Recipe */}
                        <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Info className="w-3 h-3" />
                                The Astrological Recipe
                            </h4>

                            <div className="space-y-4">
                                {moonTransit && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg flex-shrink-0">🌙</div>
                                        <div>
                                            <div className="text-sm font-bold text-indigo-200">Moon in {moonSign}</div>
                                            <div className="text-xs text-slate-400">{panchang?.nakshatra?.name || 'Nakshatra'}</div>
                                        </div>
                                    </div>
                                )}
                                {currentAntardasha !== 'Unknown' && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg flex-shrink-0">🪐</div>
                                        <div>
                                            <div className="text-sm font-bold text-amber-200">{currentAntardasha} Antardasha</div>
                                            <div className="text-xs text-slate-400">Under {currentDasha} Mahadasha</div>
                                        </div>
                                    </div>
                                )}
                                {panchang?.day_lord && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg flex-shrink-0">☀️</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-200">{panchang.day_lord} Day</div>
                                            <div className="text-xs text-slate-400">Tithi: {panchang.tithi?.name || 'N/A'}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyBriefing;
