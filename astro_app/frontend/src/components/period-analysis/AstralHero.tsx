import { format } from 'date-fns';
import { Sparkles, Calendar, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface AstralHeroProps {
    date: Date;
    score: number;
    description?: string;
    influences?: string[];
    best?: string;
    caution?: string;
    theme?: string;
}

const AstralHero = ({ date, score, description, influences, best, caution, theme }: AstralHeroProps) => {
    // Determine Color Theme based on Score
    let themeColor = 'from-indigo-500 to-purple-500';
    let shadowColor = 'shadow-indigo-500/20';
    let powerWord = "Balanced";

    if (score >= 80) {
        themeColor = 'from-emerald-400 to-teal-500';
        shadowColor = 'shadow-emerald-500/30';
        powerWord = "Thriving";
    } else if (score >= 65) {
        themeColor = 'from-blue-400 to-indigo-500';
        shadowColor = 'shadow-blue-500/30';
        powerWord = "Stable";
    } else if (score >= 50) {
        themeColor = 'from-indigo-400 to-purple-500';
        shadowColor = 'shadow-indigo-500/20';
        powerWord = "Caution";
    } else {
        themeColor = 'from-rose-500 to-orange-500';
        shadowColor = 'shadow-rose-500/30';
        powerWord = "Critical";
    }

    return (
        <div className="relative overflow-hidden rounded-3xl glass-card p-8 mb-8">
            {/* Dynamic Background Pulse */}
            <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br ${themeColor} opacity-10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse-slow pointer-events-none`}></div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {format(date, 'EEEE, MMM do')}
                        </span>

                        {(influences || []).map((inf, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <Sparkles className="w-2.5 h-2.5" />
                                {inf}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                        <span className="font-light text-slate-400 block text-lg mb-1">{theme || 'Current Energy'}</span>
                        {powerWord} <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Alignment</span>
                    </h1>

                    <p className="text-slate-400 max-w-xl text-lg leading-relaxed mb-6">
                        {description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Best For</span>
                                <span className="text-slate-200 font-medium text-sm">{best || 'Routine Work'}</span>
                            </div>
                        </div>

                        <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 text-rose-400" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-0.5">Cautious With</span>
                                <span className="text-slate-200 font-medium text-sm">{caution || 'High Risks'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Orb Section */}
                <div className="flex flex-col items-center gap-4 shrink-0 self-center lg:self-start">
                    <div className="relative group">
                        <div className={`absolute inset-0 bg-gradient-to-br ${themeColor} opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity duration-500`}></div>
                        <div className={`relative w-40 h-40 rounded-full border-4 border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center justify-center ${shadowColor} shadow-2xl transition-transform duration-500 group-hover:scale-105`}>
                            <div className="text-center">
                                <span className="block text-5xl font-bold text-white tracking-tighter">{score}</span>
                                <span className="block text-[10px] text-slate-400 uppercase tracking-widest mt-1">Daily Score</span>
                            </div>
                        </div>
                        {/* Orbiting Ring Decoration */}
                        <div className="absolute inset-[-10px] border border-white/5 rounded-full animate-spin-slow opacity-20"></div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 italic">
                        <Info className="w-4 h-4 text-indigo-400" />
                        Mathematical Vedic Score
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AstralHero;
