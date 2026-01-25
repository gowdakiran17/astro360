import { Info, Users } from 'lucide-react';

interface PlanetaryCouncilProps {
    ishtaKashta: Record<string, { ishta: number, kashta: number }>;
    vimsopaka: Record<string, number>;
}

const PlanetaryCouncil = ({ ishtaKashta, vimsopaka }: PlanetaryCouncilProps) => {
    // Sort planets into categories
    const allies: string[] = [];
    const neutrals: string[] = [];
    const challengers: string[] = [];

    Object.keys(ishtaKashta).forEach(planet => {
        const { ishta, kashta } = ishtaKashta[planet];
        const diff = ishta - kashta;

        if (diff > 10) allies.push(planet);
        else if (diff < -10) challengers.push(planet);
        else neutrals.push(planet);
    });

    // Sort allies by Vimsopaka strength (strongest first)
    const sortByStrength = (a: string, b: string) => (vimsopaka[b] || 0) - (vimsopaka[a] || 0);

    allies.sort(sortByStrength);
    neutrals.sort(sortByStrength);
    challengers.sort(sortByStrength);

    const renderPlanet = (planet: string, type: 'ally' | 'neutral' | 'challenger') => {
        const strength = vimsopaka[planet] || 10;
        const sizeClass = strength > 15 ? 'w-10 h-10 text-sm' : (strength > 10 ? 'w-9 h-9 text-xs' : 'w-8 h-8 text-[10px]');

        const colors = {
            ally: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
            neutral: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
            challenger: 'bg-rose-500/20 border-rose-500/50 text-rose-300'
        };

        return (
            <div key={planet} className="flex flex-col items-center gap-1 group relative cursor-pointer">
                <div
                    className={`
                    rounded-full flex items-center justify-center font-bold border-2 transition-transform group-hover:scale-110
                    ${sizeClass} ${colors[type]}
                `}
                >
                    {planet.slice(0, 2)}
                </div>
                <span className="text-[9px] text-slate-500 font-medium">{strength.toFixed(1)}</span>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 w-32 bg-slate-900 border border-slate-700 p-2 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                    <div className="font-bold text-white mb-1">{planet}</div>
                    <div className="text-slate-400">Ishta: {ishtaKashta[planet]?.ishta.toFixed(1)}</div>
                    <div className="text-slate-400">Kashta: {ishtaKashta[planet]?.kashta.toFixed(1)}</div>
                </div>
            </div>
        );
    };

    const renderCategory = (planets: string[], label: string, badgeLabel: string, type: 'ally' | 'neutral' | 'challenger') => {
        if (planets.length === 0) return null;

        const badgeColors = {
            ally: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            neutral: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            challenger: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${badgeColors[type]} font-bold uppercase tracking-tighter`}>
                        {badgeLabel}
                    </span>
                </div>
                <div className="flex flex-wrap gap-4 py-1">
                    {planets.map(p => renderPlanet(p, type))}
                </div>
            </div>
        );
    };

    return (
        <div className="glass-card p-5 border-white/5">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    Planetary Council
                </h3>
                <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
            </div>

            <div className="space-y-5">
                {renderCategory(allies, 'Generous Allies', 'Supportive', 'ally')}
                {renderCategory(neutrals, 'Neutral Observers', 'Balanced', 'neutral')}
                {renderCategory(challengers, 'Strict Teachers', 'Obstruction', 'challenger')}
            </div>
        </div>
    );
};

export default PlanetaryCouncil;
