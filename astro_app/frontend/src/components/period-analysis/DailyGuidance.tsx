import { AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

interface DailyGuidanceProps {
    predictions: string[];
    luckyFactors: Record<string, string>;
}

const DailyGuidance = ({ predictions, luckyFactors }: DailyGuidanceProps) => {
    // Basic sentiment analysis to split predictions (Mock logic if no category provided)
    const highlights = predictions.filter(p => !p.toLowerCase().includes('avoid') && !p.toLowerCase().includes('caution'));
    const cautions = predictions.filter(p => p.toLowerCase().includes('avoid') || p.toLowerCase().includes('caution'));

    const hasHighlights = highlights.length > 0;
    const hasCautions = cautions.length > 0;

    if (!hasHighlights && !hasCautions) {
        return (
            <div className="glass-card p-6 border-white/5 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-slate-500">
                    <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold mb-1">Neutral Cosmic Flow</h3>
                <p className="text-xs text-slate-500 max-w-[200px]">No specific highlights or warnings for this period. Maintain your current course.</p>

                <div className="mt-6 w-full pt-6 border-t border-white/5 grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest">
                    <div>
                        <span className="text-slate-500 block mb-1">Lucky Color</span>
                        <span className="text-indigo-400 font-bold">{luckyFactors?.color || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block mb-1">Direction</span>
                        <span className="text-indigo-400 font-bold">{luckyFactors?.direction || 'N/A'}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Cosmic Guidance</h3>

            <div className="grid grid-cols-1 gap-4">
                {/* Highlights Section */}
                {hasHighlights && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                        <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Highlights
                        </h3>
                        <ul className="space-y-2.5">
                            {highlights.slice(0, 3).map((p, i) => (
                                <li key={i} className="flex gap-2.5 text-emerald-100/90 text-[13px] leading-snug">
                                    <div className="mt-1.5 w-1 h-1 bg-emerald-400 rounded-full flex-shrink-0"></div>
                                    <span>{p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Caution Section */}
                {hasCautions && (
                    <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                        <h3 className="text-rose-400 font-bold mb-3 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Areas for Attention
                        </h3>
                        <ul className="space-y-2.5">
                            {cautions.slice(0, 3).map((p, i) => (
                                <li key={i} className="flex gap-2.5 text-rose-100/90 text-[13px] leading-snug">
                                    <div className="mt-1.5 w-1 h-1 bg-rose-400 rounded-full flex-shrink-0"></div>
                                    <span>{p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Lucky Factors Compact */}
                <div className="glass-card p-4 border-white/5 bg-white/[0.02]">
                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-slate-500 block uppercase tracking-tighter text-[9px]">Lucky Color</span>
                                <span className="text-white font-medium">{luckyFactors?.color || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <i className="w-4 h-4" /> {/* Generic Icon or Compass if imported */}
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-slate-500 block uppercase tracking-tighter text-[9px]">Direction</span>
                                <span className="text-white font-medium">{luckyFactors?.direction || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyGuidance;
