import React from 'react';

interface KPSignificatorsProps {
    significators: {
        planets: Record<string, number[]>;
        houses: Record<string, string[]>;
    };
}

const KPSignificatorsTable: React.FC<KPSignificatorsProps> = ({ significators }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Planetary Significators */}
            <div>
                <h3 className="text-lg font-serif text-white mb-4">Planetary Significators</h3>
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <table className="w-full text-left text-sm text-slate-200">
                        <thead className="bg-white/10 text-xs font-semibold uppercase text-slate-400">
                            <tr>
                                <th className="px-4 py-3">Planet</th>
                                <th className="px-4 py-3">Signifying Houses</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {Object.entries(significators.planets).map(([planet, houses]) => (
                                <tr key={planet} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{planet}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {houses.map((house) => (
                                                <span key={house} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs border border-indigo-500/30">
                                                    {house}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* House Significators */}
            <div>
                <h3 className="text-lg font-serif text-white mb-4">House Significators</h3>
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <table className="w-full text-left text-sm text-slate-200">
                        <thead className="bg-white/10 text-xs font-semibold uppercase text-slate-400">
                            <tr>
                                <th className="px-4 py-3">House</th>
                                <th className="px-4 py-3">Signifying Planets</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {Object.entries(significators.houses).map(([house, planets]) => (
                                <tr key={house} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">House {house}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {planets.map((planet) => (
                                                <span key={planet} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-xs border border-emerald-500/30">
                                                    {planet}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default KPSignificatorsTable;
