import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface PlanetRow {
  name: string;
  sign: string;
  degree: number;
  nakshatra: string;
  pada: number;
  house: number;
  status: string; // 'Direct', 'Retrograde', 'Combust'
  is_retrograde: boolean;
}

interface ModernPlanetaryTableProps {
  planets: any[];
  ascendant: any;
}

const ModernPlanetaryTable: React.FC<ModernPlanetaryTableProps> = ({ planets, ascendant }) => {
  if (!planets) return null;

  // Helper to format degree
  const formatDeg = (lon: number) => {
     const d = Math.floor(lon % 30);
     const m = Math.floor(((lon % 30) - d) * 60);
     const s = Math.floor(((((lon % 30) - d) * 60) - m) * 60);
     return `${d}° ${m}' ${s}"`;
  };

  // Helper to get status color
  const getStatusColor = (status: string, isRetro: boolean) => {
    if (isRetro) return "text-red-300 bg-red-500/20 border-red-500/30";
    if (status === 'Combust') return "text-orange-300 bg-orange-500/20 border-orange-500/30";
    return "text-green-300 bg-green-500/20 border-green-500/30";
  };

  // Prepare data
  const rows = [
    {
        name: 'Asc',
        sign: ascendant?.zodiac_sign,
        degree: ascendant?.longitude,
        nakshatra: ascendant?.nakshatra,
        pada: 1, // Placeholder if not available
        house: 1,
        status: 'Direct',
        is_retrograde: false,
        icon: '🌅'
    },
    ...planets.map((p: any) => ({
        name: p.name,
        sign: p.zodiac_sign,
        degree: p.longitude,
        nakshatra: p.nakshatra,
        pada: p.pada || 2, // Placeholder
        house: p.house,
        status: p.is_retrograde ? 'Retrograde' : 'Direct',
        is_retrograde: p.is_retrograde,
        icon: getPlanetIcon(p.name)
    }))
  ];

  function getPlanetIcon(name: string) {
    const icons: Record<string, string> = {
        Sun: '☀️', Moon: '🌙', Mars: 'Mars', Mercury: '☿️', Jupiter: '♃', 
        Venus: '♀️', Saturn: '♄', Rahu: '☊', Ketu: '☋'
    };
    return icons[name] || '🪐';
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden mb-8">
        <div className="px-6 py-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-serif text-xl text-white">Planetary Positions</h3>
            <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="text-xs text-slate-400">Retrograde</span>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-indigo-200 uppercase tracking-wider text-xs font-semibold">
                    <tr>
                        <th className="px-6 py-4">Planet</th>
                        <th className="px-6 py-4">Sign</th>
                        <th className="px-6 py-4">Degree</th>
                        <th className="px-6 py-4">Nakshatra</th>
                        <th className="px-6 py-4 text-center">Pada</th>
                        <th className="px-6 py-4 text-center">House</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                                    {row.icon === 'Mars' ? '♂️' : row.icon}
                                </span>
                                {row.name}
                            </td>
                            <td className="px-6 py-4 text-slate-300">{row.sign}</td>
                            <td className="px-6 py-4 text-indigo-300 font-mono text-xs">{formatDeg(row.degree)}</td>
                            <td className="px-6 py-4 text-slate-300">{row.nakshatra}</td>
                            <td className="px-6 py-4 text-slate-400 text-center">{row.pada}</td>
                            <td className="px-6 py-4 text-slate-400 text-center">{row.house}</td>
                            <td className="px-6 py-4">
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium border ${getStatusColor(row.status, row.is_retrograde)}`}>
                                    {row.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ModernPlanetaryTable;
