import { 
    AlertTriangle, CheckCircle, Clock, 
    ArrowRight, Star, Shield, Zap, Target
} from 'lucide-react';

interface Remedy {
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

interface EliteAnalysisResult {
    life_theme_summary: string;
    active_astrology: any;
    diagnosis: string;
    priority_fixes: Remedy[];
    remedies: Remedy[];
    expected_results: string[];
    warnings: string[];
    abundance_activation: string;
}

const EliteVastuReport = ({ data }: { data: EliteAnalysisResult }) => {
    if (!data) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* 1. Consultant Diagnosis (Hero Section) */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-indigo-300 font-bold uppercase tracking-wider text-xs">
                        <Zap className="w-4 h-4" />
                        Elite Consultant Diagnosis
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6">
                        {data.diagnosis}
                    </h2>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                        <h3 className="text-indigo-200 font-bold text-sm uppercase mb-2">Life Theme Analysis</h3>
                        <p className="text-lg text-indigo-50 leading-relaxed">
                            {data.life_theme_summary}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Priority Fixes (The "Do This First" Section) */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                    <Target className="w-6 h-6 text-red-600" />
                    Top 3 Priority Fixes
                    <span className="text-xs font-normal bg-red-100 text-red-700 px-3 py-1 rounded-full">Urgent Action Required</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.priority_fixes.map((fix, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 flex flex-col relative overflow-hidden group hover:border-indigo-300 transition-all">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            
                            <div className="mb-4">
                                <span className="text-xs font-bold text-slate-400 uppercase">Priority #{idx + 1}</span>
                                <h4 className="text-xl font-black text-slate-800 mt-1">{fix.zone} Zone</h4>
                                <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded inline-block mt-2">
                                    Fix: {fix.problem}
                                </span>
                            </div>

                            <div className="flex-grow space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Action</p>
                                    <p className="font-bold text-indigo-900 text-lg leading-tight">{fix.action}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Details</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{fix.details}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                    <Clock className="w-3 h-3" /> Result in: <span className="text-emerald-600">{fix.time}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 italic">
                                    "{fix.vastu_reason}"
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Abundance Activation */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 flex flex-col md:flex-row items-center gap-8">
                <div className="bg-white p-4 rounded-full shadow-lg shadow-emerald-100/50">
                    <Star className="w-12 h-12 text-emerald-500 fill-emerald-500" />
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-2xl font-black text-emerald-900 mb-2">Abundance Activation Point</h3>
                    <p className="text-emerald-800 mb-4">
                        Based on your Sun, Moon, and Ascendant, your personal powerhouse zone is:
                    </p>
                    <div className="inline-block bg-emerald-600 text-white text-3xl font-black px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/30 transform hover:scale-105 transition-transform">
                        {data.abundance_activation}
                    </div>
                </div>
                <div className="w-full md:w-1/3 bg-white/60 rounded-xl p-4 text-sm text-emerald-900 border border-emerald-100">
                    <strong>Instructions:</strong> Keep this zone strictly clutter-free. Place your most important documents, cash box, or a symbol of your goal here to accelerate results.
                </div>
            </div>

            {/* 4. Detailed Remedial Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        Detailed Remedial Plan
                    </h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {data.remedies.map((remedy, idx) => (
                        <div key={idx} className="p-6 hover:bg-slate-50 transition-colors group">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/4 shrink-0">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 mb-2">
                                        {remedy.zone} Zone
                                    </span>
                                    <h4 className="font-bold text-slate-800 text-lg mb-1">{remedy.problem}</h4>
                                    <p className="text-xs text-slate-400">Priority: <span className={remedy.priority === 'Urgent' ? 'text-red-600 font-bold' : 'text-orange-600'}>{remedy.priority}</span></p>
                                </div>
                                
                                <div className="w-full md:w-1/2">
                                    <h5 className="font-bold text-indigo-900 mb-2">{remedy.action}</h5>
                                    <p className="text-sm text-slate-600 mb-3">{remedy.details}</p>
                                    
                                    <div className="flex gap-4">
                                        <div className="bg-indigo-50 p-3 rounded-lg flex-1">
                                            <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Astro Reason</p>
                                            <p className="text-xs text-indigo-900">{remedy.astro_reason}</p>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-lg flex-1">
                                            <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Vastu Reason</p>
                                            <p className="text-xs text-orange-900">{remedy.vastu_reason}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-1/4 flex flex-col justify-center gap-2 border-l border-slate-100 md:pl-6">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Cost:</span>
                                        <span className="font-bold text-slate-800">{remedy.cost}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Time to Effect:</span>
                                        <span className="font-bold text-emerald-600">{remedy.time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Expected Results & Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Expected Results
                    </h3>
                    <ul className="space-y-3">
                        {data.expected_results.map((res, i) => (
                            <li key={i} className="flex gap-3 text-sm text-emerald-800">
                                <ArrowRight className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                                {res}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                    <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Critical Warnings
                    </h3>
                    <ul className="space-y-3">
                        {data.warnings.map((warn, i) => (
                            <li key={i} className="flex gap-3 text-sm text-amber-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                {warn}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
};

export default EliteVastuReport;