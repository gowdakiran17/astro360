import React from 'react';

interface KPHouse {
    house: number;
    longitude: number;
    sign: string;
    degree_in_sign: number;
    nakshatra: string;
    pada: number;
    star_lord: string;
    sub_lord: string;
    sub_sub_lord: string;
}

interface KPHouseTableProps {
    houses: KPHouse[];
}

const KPHouseTable: React.FC<KPHouseTableProps> = ({ houses }) => {
    const formatDegrees = (deg: number) => {
        const d = Math.floor(deg);
        const m = Math.floor((deg - d) * 60);
        const s = Math.floor(((deg - d) * 60 - m) * 60);
        return `${d}°${m}'${s}"`;
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
            <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-white/10 text-xs font-semibold uppercase text-slate-400">
                    <tr>
                        <th className="px-4 py-3">House</th>
                        <th className="px-4 py-3">Longitude</th>
                        <th className="px-4 py-3">Sign</th>
                        <th className="px-4 py-3">Nakshatra (Pada)</th>
                        <th className="px-4 py-3">Star Lord</th>
                        <th className="px-4 py-3">Sub Lord</th>
                        <th className="px-4 py-3">Sub-Sub Lord</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {houses.map((h) => (
                        <tr key={h.house} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 font-semibold text-white">House {h.house}</td>
                            <td className="px-4 py-3 font-mono">{formatDegrees(h.degree_in_sign)}</td>
                            <td className="px-4 py-3">{h.sign}</td>
                            <td className="px-4 py-3">{h.nakshatra} ({h.pada})</td>
                            <td className="px-4 py-3 text-amber-400">{h.star_lord}</td>
                            <td className="px-4 py-3 text-indigo-400">{h.sub_lord}</td>
                            <td className="px-4 py-3 text-emerald-400">{h.sub_sub_lord}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default KPHouseTable;
