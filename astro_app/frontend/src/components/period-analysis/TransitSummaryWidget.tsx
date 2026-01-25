import { ArrowRight, Move, AlertTriangle, CheckCircle, Globe } from 'lucide-react';

interface TransitImpact {
    transit_planet: string;
    natal_planet?: string;
    house?: number;
    type?: string;
    aspect?: string;
    nature: 'Favorable' | 'Challenging' | 'Mixed';
    description: string;
}

interface TransitSummaryWidgetProps {
    impacts: TransitImpact[];
}

const ImpactRow = ({ impact }: { impact: TransitImpact }) => {
    const isChallenging = impact.nature === 'Challenging';
    const isFavorable = impact.nature === 'Favorable';

    const iconColor = isChallenging ? 'text-rose-400' : isFavorable ? 'text-emerald-400' : 'text-amber-400';
    const bgColor = isChallenging ? 'bg-rose-500/10 border-rose-500/20' : isFavorable ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20';
    const Icon = isChallenging ? AlertTriangle : isFavorable ? CheckCircle : Move;

    return (
        <div className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-white/[0.03] transition-all duration-300 border border-transparent hover:border-white/5 hover:translate-x-1 group">
            <div className={`p-2.5 rounded-lg border flex-shrink-0 transition-colors ${bgColor} ${iconColor}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${bgColor} ${iconColor}`}>
                        {impact.nature}
                    </span>
                    {impact.aspect && (
                        <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                            {impact.aspect} Aspect
                        </span>
                    )}
                </div>
                <p className="text-[13px] leading-relaxed text-slate-300 group-hover:text-slate-100 transition-colors">
                    {impact.description}
                </p>
            </div>
        </div>
    );
};

const TransitSummaryWidget = ({ impacts }: TransitSummaryWidgetProps) => {
    // Prioritize impacts: Aspects first, then significant house transits
    const significantImpacts = impacts.filter(i => i.aspect).slice(0, 4);
    const houseTransits = impacts.filter(i => !i.aspect).slice(0, 2);

    const displayList = [...significantImpacts, ...houseTransits].slice(0, 6);

    return (
        <div className="glass-card p-6 h-full border-white/5">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                        <Move className="w-4 h-4 text-blue-400" />
                    </div>
                    Today's Planetary Transits
                </h3>
            </div>

            {displayList.length > 0 ? (
                <div className="space-y-1">
                    {displayList.map((impact, idx) => (
                        <ImpactRow key={idx} impact={impact} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                        <Globe className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-sm">
                        No major transit impacts detected
                    </p>
                </div>
            )}

            <button className="w-full mt-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-white hover:bg-white/[0.02] border border-white/5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                View Detailed Transits <ArrowRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

export default TransitSummaryWidget;
