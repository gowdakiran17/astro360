
import { 
    Zap, Target, Clock, Star, 
    ArrowRight, AlertTriangle, 
    Activity, Lock, MessageSquare
} from 'lucide-react';

// --- Types ---
export interface Remedy {
    zone: string;
    problem: string;
    action: string;
    details: string;
    astro_reason: string;
    vastu_reason: string;
    priority: string;
    cost: string;
    time: string;
}

export interface Alignment {
    need: string;
    why: string;
    direction: string;
    activity: string;
}

export interface EliteAnalysisResult {
    life_theme_summary: string;
    active_astrology: any;
    diagnosis: string;
    priority_fixes: Remedy[];
    remedies: Remedy[];
    expected_results: string[];
    warnings: string[];
    abundance_activation: {
        direction: string;
        sign: string;
        description: string;
    };
    home_power_score: {
        current: number;
        potential: number;
        message: string;
    };
    personal_alignment: Alignment[];
    time_windows: {
        blockage_active_until: string;
        improvement_starts_in: string;
        summary: string;
    };
    home_damage_map: any[];
}

// --- Sub-Components ---

const IntelligenceBar = ({ data }: { data: EliteAnalysisResult }) => {
    return (
        <div className="space-y-4">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 md:gap-4">
                <div className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider">
                    Life Theme: {data.life_theme_summary.replace('Currently Activated Themes: ', '')}
                </div>
                <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> House Status: Weak
                </div>
                <div className="bg-red-100 text-red-800 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Space Status: Blocked
                </div>
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time Window: Active
                </div>
            </div>

            {/* One Sentence Diagnosis */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-x-10 -translate-y-10"></div>
                <h2 className="text-xl md:text-2xl font-medium leading-snug relative z-10">
                    "{data.diagnosis}"
                </h2>
            </div>
        </div>
    );
};

const AbundanceRadar = ({ data }: { data: EliteAnalysisResult }) => {
    // Simplified Radar Visualization
    return (
        <div className="relative aspect-square max-w-sm mx-auto my-8">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 flex items-center justify-center bg-white shadow-inner">
                {/* Zones */}
                {[...Array(16)].map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute w-full h-full border-slate-50"
                        style={{ transform: `rotate(${i * 22.5}deg)` }}
                    >
                        <div className="w-0.5 h-1/2 bg-slate-100 mx-auto origin-bottom"></div>
                    </div>
                ))}
                
                {/* Center */}
                <div className="relative z-10 text-center">
                    <div className="text-4xl font-black text-slate-800">{data.home_power_score?.current || 60}%</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Power Score</div>
                </div>

                {/* Active Dots (Mock placement for visualization) */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
            </div>
            
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-6 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Blocking</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Supporting</span>
            </div>
        </div>
    );
};

const HomeVsDestiny = ({ data }: { data: EliteAnalysisResult }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Home vs Destiny Connection
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Floor Plan Placeholder */}
                <div className="bg-slate-100 rounded-xl aspect-square flex items-center justify-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-300">
                    Floor Plan Map View
                </div>

                {/* Right: Connection Lines */}
                <div className="space-y-4">
                    {data.home_damage_map.map((d, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                                {i + 1}
                            </div>
                            <div className="flex-grow">
                                <div className="text-xs font-bold text-red-800 uppercase mb-1">{d.life_area} House</div>
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <span>{d.planet}</span>
                                    <ArrowRight className="w-3 h-3 text-slate-400" />
                                    <span>{d.direction}</span>
                                    <ArrowRight className="w-3 h-3 text-slate-400" />
                                    <span className="text-red-600 font-bold">{d.issues.join(", ")}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add positive connections if any */}
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100 opacity-60">
                         <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                ✓
                        </div>
                        <div className="flex-grow">
                            <div className="text-xs font-bold text-emerald-800 uppercase mb-1">Gains House</div>
                            <div className="text-sm text-slate-600">Aligned correctly in West</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PriorityFixes = ({ data }: { data: EliteAnalysisResult }) => {
    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-red-600" />
                What to Fix FIRST
            </h3>
            <div className="space-y-4">
                {data.priority_fixes.map((fix, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500 flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-grow">
                            <h4 className="font-bold text-slate-900 text-lg">
                                {idx + 1}. {fix.zone} {fix.problem}
                            </h4>
                            <p className="text-slate-600 text-sm mt-1">
                                is killing your <span className="font-bold text-red-600">{fix.astro_reason.split('energy of ')[1] || 'Growth'}</span>
                            </p>
                        </div>
                        
                        <div className="bg-slate-50 px-4 py-2 rounded-lg text-xs font-medium text-slate-500 whitespace-nowrap">
                            Expected Relief: <span className="text-emerald-600 font-bold">{fix.time}</span>
                        </div>
                        
                        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                            View Fix
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AbundanceActivation = ({ data }: { data: EliteAnalysisResult }) => {
    return (
        <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <div className="flex items-center gap-2 text-emerald-300 font-bold uppercase tracking-wider text-xs mb-2">
                        <Star className="w-4 h-4" /> Abundance Activation Point
                    </div>
                    <h3 className="text-3xl font-black mb-1">{data.abundance_activation.direction}</h3>
                    <p className="text-emerald-100 opacity-80 text-sm mb-6">
                        {data.abundance_activation.description}
                    </p>
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">1</div>
                            <span>Place your cash box or important goals here.</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">2</div>
                            <span>Keep this zone strictly clutter-free.</span>
                        </div>
                    </div>
                </div>
                
                <div className="hidden md:block w-32 h-32 bg-white/10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-emerald-200">Photo Ref</span>
                </div>
            </div>
        </div>
    );
};

const PersonalAlignment = ({ data }: { data: EliteAnalysisResult }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.personal_alignment?.map((item, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">You Need</div>
                    <div className="font-black text-slate-800 text-lg mb-2">{item.need}</div>
                    <div className="text-xs text-indigo-600 font-medium mb-1">Why? {item.why}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{item.activity}</div>
                </div>
            ))}
        </div>
    );
};

const TimeWindow = ({ data }: { data: EliteAnalysisResult }) => {
    return (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h4 className="font-bold text-indigo-900 mb-1">Time Window Analysis</h4>
                <p className="text-sm text-indigo-800 opacity-80">{data.time_windows.summary}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-center">
                    <div className="text-xs font-bold text-indigo-400 uppercase">Blockage Ends</div>
                    <div className="font-bold text-indigo-900">{data.time_windows.blockage_active_until}</div>
                </div>
                <div className="w-px h-8 bg-indigo-200"></div>
                <div className="text-center">
                    <div className="text-xs font-bold text-indigo-400 uppercase">Improvement Starts</div>
                    <div className="font-bold text-emerald-600">{data.time_windows.improvement_starts_in}</div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const AstroVastuCoreScreen = ({ data }: { data: EliteAnalysisResult }) => {
    if (!data) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
            
            {/* 1. Intelligence Bar */}
            <IntelligenceBar data={data} />

            {/* 2. Radar & Score */}
            <div className="text-center">
                <AbundanceRadar data={data} />
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                    Your home is currently operating at <span className="font-bold text-slate-800">{data.home_power_score?.current}%</span> efficiency. 
                    Fixing the red zones will boost it to <span className="font-bold text-emerald-600">{data.home_power_score?.potential}%</span>.
                </p>
            </div>

            {/* 3. Split View */}
            <HomeVsDestiny data={data} />

            {/* 4. Pressure Cards (Implicit in HomeVsDestiny & Diagnosis) */}
            
            {/* 5. Priority Fixes */}
            <PriorityFixes data={data} />

            {/* 6. Abundance Activation */}
            <AbundanceActivation data={data} />

            {/* 7. Personal Alignment */}
            <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Personal Alignment
                </h3>
                <PersonalAlignment data={data} />
            </div>

            {/* 8. Time Window */}
            <TimeWindow data={data} />

            {/* 10. Ask AI */}
            <div className="bg-slate-900 rounded-2xl p-1 flex items-center shadow-xl">
                <div className="bg-slate-800 p-3 rounded-xl mr-2">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="Ask AI: 'Why is my money blocked?'" 
                    className="bg-transparent flex-grow text-white placeholder-slate-500 focus:outline-none p-2"
                />
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors">
                    Ask
                </button>
            </div>

        </div>
    );
};

export default AstroVastuCoreScreen;
