import { DashboardOverviewResponse } from '../../types/periodAnalysis';
import { Star, Sunrise, Sunset, Info } from 'lucide-react';
import { NAKSHATRA_DATA } from '../../utils/nakshatraData';

interface QuickReferenceWidgetProps {
    data: DashboardOverviewResponse;
}

const QuickReferenceWidget = ({ data }: QuickReferenceWidgetProps) => {
    const { chart_details, dasha_info } = data;

    // Fallbacks if chart_details not yet populated fully in all envs
    const lagna = chart_details?.lagna || { sign: "Unknown", degree_str: "0°0'" };
    const moon = chart_details?.moon_sign || { sign: "Unknown", degree_str: "0°0'" };
    const sun = chart_details?.sun_sign || { sign: "Unknown", degree_str: "0°0'" };
    const nak = chart_details?.nakshatra || { name: "Unknown", pada: 1 };

    // Helper to get nakshatra data case-insensitively
    const getNakshatraMeta = (name: string) => {
        // Debug logging
        // console.log("Lookup Nakshatra:", name);
        // console.log("Available keys:", Object.keys(NAKSHATRA_DATA));

        if (!name || name === "Unknown") return { deity: "Unknown", symbol: "Unknown", quality: "Unknown" };
        
        // 1. Try exact match
        if (NAKSHATRA_DATA[name]) return NAKSHATRA_DATA[name];
        
        // 2. Try case-insensitive match (trimmed)
        const cleanName = name.toLowerCase().trim();
        const key = Object.keys(NAKSHATRA_DATA).find(k => k.toLowerCase().trim() === cleanName);
        if (key) return NAKSHATRA_DATA[key];

        // 3. Try fuzzy match (remove spaces and special chars) - e.g. "PurvaAshadha" vs "Purva Ashadha"
        const fuzzyName = cleanName.replace(/[^a-z0-9]/g, '');
        const fuzzyKey = Object.keys(NAKSHATRA_DATA).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === fuzzyName);
        if (fuzzyKey) return NAKSHATRA_DATA[fuzzyKey];

        return { deity: "Unknown", symbol: "Unknown", quality: "Unknown" };
    };

    const meta = getNakshatraMeta(nak.name);

    // Dasha Logic
    const currentMD = dasha_info?.current?.current_mahadasha;
    const currentAD = dasha_info?.current?.current_antardasha;

    // Dasha Progress
    // We can try to parsse dates if available, or just fallback to simple display
    // Assuming dasha object has start_date, end_date strings "YYYY-MM-DD"
    // Calculating rough percentage for progress bar if not provided
    const mdProgress = currentMD?.progress_percent || 50;
    const adProgress = currentAD?.progress_percent || 30;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">

            {/* CARD 1: CHART DETAILS */}
            <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden h-[260px] bg-slate-900/50">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-white font-display font-medium text-lg">Chart Details</h3>
                    <Info className="w-4 h-4 text-slate-500" />
                </div>

                <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400 text-sm">Lagna</span>
                        <div className="text-right">
                            <span className="text-white font-medium block">{lagna.sign}</span>
                            <span className="text-[10px] text-slate-500">{lagna.degree_str}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400 text-sm">Moon Sign</span>
                        <div className="text-right">
                            <span className="text-white font-medium block">{moon.sign}</span>
                            <span className="text-[10px] text-slate-500">{moon.degree_str}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400 text-sm">Sun Sign</span>
                        <div className="text-right">
                            <span className="text-white font-medium block">{sun.sign}</span>
                            <span className="text-[10px] text-slate-500">{sun.degree_str}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <Sunrise className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-slate-300">{chart_details?.sunrise || "06:00 AM"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sunset className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs text-slate-300">{chart_details?.sunset || "06:00 PM"}</span>
                    </div>
                </div>
            </div>

            {/* CARD 2: MOON NAKSHATRA */}
            <div className="glass-card p-6 relative overflow-hidden h-[260px] bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20">
                {/* Background Decoration */}
                <Star className="absolute -top-6 -right-6 w-32 h-32 text-indigo-500/10 rotate-12" />

                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-indigo-200 font-display font-medium text-lg">Moon Nakshatra</h3>
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <Star className="w-4 h-4 text-indigo-400" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-3xl font-display font-bold text-white mb-2">{nak.name}</h2>
                        <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                            Pada {nak.pada} / 4
                        </span>
                    </div>

                    <div className="mt-auto space-y-3 bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Deity</span>
                            <span className="text-white font-medium">{meta.deity}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Symbol</span>
                            <span className="text-white font-medium">{meta.symbol}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Quality</span>
                            <span className="text-white font-medium">{meta.quality}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 3: CURRENT DASHA */}
            <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden h-[260px] bg-slate-900/50">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-white font-display font-medium text-lg">Current Dasha</h3>
                    <div className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 text-xs font-bold">
                        MD
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center flex-1">
                    {/* Simplified Circular Progress Visualization */}
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                        {/* Outer Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                        {/* Progress Ring (Approximate via conic gradient) */}
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/50" style={{ clipPath: `inset(0 0 ${100 - mdProgress}% 0)` }}></div>

                        <div className="text-center">
                            <span className="text-3xl font-display font-bold text-white block">{currentMD?.lord || "Unknown"}</span>
                            <span className="text-[10px] uppercase tracking-widest text-indigo-400">Mahadasha</span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-400">
                        Ends on <span className="text-white font-medium">{currentMD?.end_date || "Unknown"}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 w-full">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                        <span>Current Antardasha</span>
                        <span className="text-white">{currentAD?.lord || "Unknown"}</span>
                    </div>
                    {/* Linear Progress for Antardasha */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${adProgress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                        <span>Next: {currentAD?.next_lord || "Unknown"}</span>
                        <span>{currentAD?.end_date || "Unknown"}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default QuickReferenceWidget; // Using new name internally, but will replace ActiveDashaCards file content
