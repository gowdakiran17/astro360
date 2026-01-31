import React from 'react';
import { Sunrise, Sunset, Star, Info } from 'lucide-react';
import { NAKSHATRA_DATA } from '../../../utils/nakshatraData';
import SouthIndianChart from '../../charts/SouthIndianChart';

interface SummaryCardsProps {
  chartData: any;
  panchangData: any;
  birthPanchangData?: any; // Added Birth Panchang
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ chartData, panchangData, birthPanchangData }) => {
  if (!chartData) return null;

  const ascendant = chartData.ascendant;
  const sun = chartData.planets.find((p: any) => p.name === 'Sun');
  const moon = chartData.planets.find((p: any) => p.name === 'Moon');

  // Use birth panchang if available, otherwise fallback to daily panchang (though strictly should be birth)
  const panchang = birthPanchangData || panchangData;

  // Helper to get nakshatra data case-insensitively
  const getNakshatraMeta = (name: string) => {
    if (!name || name === "Unknown") return { deity: "Unknown", symbol: "Unknown", quality: "Unknown" };

    // 1. Try exact match
    if (NAKSHATRA_DATA[name]) return NAKSHATRA_DATA[name];

    // 2. Try case-insensitive match (trimmed)
    const cleanName = name.toLowerCase().trim();
    const key = Object.keys(NAKSHATRA_DATA).find(k => k.toLowerCase().trim() === cleanName);
    if (key) return NAKSHATRA_DATA[key];

    // 3. Try fuzzy match (remove spaces and special chars)
    const fuzzyName = cleanName.replace(/[^a-z0-9]/g, '');
    const fuzzyKey = Object.keys(NAKSHATRA_DATA).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === fuzzyName);
    if (fuzzyKey) return NAKSHATRA_DATA[fuzzyKey];

    return { deity: "Unknown", symbol: "Unknown", quality: "Unknown" };
  };

  const nakshatraMeta = getNakshatraMeta(moon?.nakshatra);

  // Helper to format degrees
  const formatDeg = (lon: number) => {
    const d = Math.floor(lon % 30);
    const m = Math.floor(((lon % 30) - d) * 60);
    return `${d}°${m}'`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Card 1: Visual D1 Chart */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-2xl hover:bg-white/10 transition-all flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-lg text-white">Lagna Chart (D1)</h3>
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
            <Info className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center -my-4">
          <div className="w-full max-w-[280px] aspect-square">
            <SouthIndianChart data={chartData} />
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-2">
          <span>Asc: {ascendant?.zodiac_sign}</span>
          <span>Moon: {moon?.zodiac_sign}</span>
        </div>
      </div>

      {/* Card 2: Moon Nakshatra */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl hover:border-indigo-500/30 transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Star className="w-32 h-32 text-indigo-400 rotate-12" />
        </div>
        <div className="flex justify-between items-center mb-2 relative z-10">
          <h3 className="font-serif text-lg text-white">Moon Nakshatra</h3>
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
            <Star className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-6 relative z-10">
          <h2 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 mb-2">{moon?.nakshatra || "Unknown"}</h2>
          <div className="flex items-center gap-2 mb-6">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-slate-200 border border-white/5">Pada {moon?.pada || 1} / 4</span>
          </div>

          <div className="space-y-3 mt-4 bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Deity</span>
              <span className="font-medium text-indigo-200">{nakshatraMeta.deity || moon?.nakshatra_info?.deity || "Unknown"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Symbol</span>
              <span className="font-medium text-indigo-200">{nakshatraMeta.symbol || moon?.nakshatra_info?.symbol || "Unknown"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Quality</span>
              <span className="font-medium text-indigo-200">{nakshatraMeta.quality || moon?.nakshatra_info?.quality || "Unknown"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Chart Details */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-2xl hover:bg-white/10 transition-all group">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-lg text-white">Chart Details</h3>
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300 group-hover:text-indigo-200 transition-colors">
            <Info className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm group/item">
            <span className="text-slate-400 group-hover/item:text-slate-300 transition-colors">Lagna</span>
            <div className="text-right">
              <span className="font-semibold text-white block">{ascendant?.zodiac_sign}</span>
              <span className="text-xs text-slate-500">{formatDeg(ascendant?.longitude || 0)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm group/item">
            <span className="text-slate-400 group-hover/item:text-slate-300 transition-colors">Moon Sign</span>
            <div className="text-right">
              <span className="font-semibold text-white block">{moon?.zodiac_sign}</span>
              <span className="text-xs text-slate-500">{formatDeg(moon?.longitude || 0)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm group/item">
            <span className="text-slate-400 group-hover/item:text-slate-300 transition-colors">Sun Sign</span>
            <div className="text-right">
              <span className="font-semibold text-white block">{sun?.zodiac_sign}</span>
              <span className="text-xs text-slate-500">{formatDeg(sun?.longitude || 0)}</span>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>

          {/* Birth Panchang Details */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div className="group/item">
              <span className="text-xs text-slate-500 block mb-0.5">Tithi</span>
              <span className="font-medium text-slate-300 group-hover/item:text-white transition-colors truncate block" title={panchang?.tithi}>
                {panchang?.tithi?.split(' ')[1] || panchang?.tithi || '-'}
              </span>
            </div>
            <div className="group/item">
              <span className="text-xs text-slate-500 block mb-0.5">Yoga</span>
              <span className="font-medium text-slate-300 group-hover/item:text-white transition-colors truncate block" title={panchang?.yoga}>
                {panchang?.yoga || '-'}
              </span>
            </div>
            <div className="group/item">
              <span className="text-xs text-slate-500 block mb-0.5">Karana</span>
              <span className="font-medium text-slate-300 group-hover/item:text-white transition-colors truncate block" title={panchang?.karana}>
                {panchang?.karana || '-'}
              </span>
            </div>
            <div className="group/item">
              <span className="text-xs text-slate-500 block mb-0.5">Day</span>
              <span className="font-medium text-slate-300 group-hover/item:text-white transition-colors truncate block" title={panchang?.day_of_week}>
                {panchang?.day_of_week || panchang?.vara || '-'}
              </span>
            </div>
            {panchang?.panchaka && (
              <div className="group/item col-span-2 border-t border-white/5 pt-2 mt-1">
                <span className="text-xs text-slate-500 block mb-0.5">Panchaka</span>
                <span className={`font-medium transition-colors truncate block ${(typeof panchang.panchaka === 'object' ? panchang.panchaka.status : String(panchang.panchaka)).toLowerCase().includes('good') ||
                    (typeof panchang.panchaka === 'object' ? panchang.panchaka.status : String(panchang.panchaka)).toLowerCase().includes('auspicious') ? 'text-emerald-400' : 'text-rose-400'
                  }`} title={typeof panchang.panchaka === 'object' ? `${panchang.panchaka.type}: ${panchang.panchaka.description}` : String(panchang.panchaka)}>
                  {typeof panchang.panchaka === 'object' ? panchang.panchaka.type : panchang.panchaka}
                </span>
              </div>
            )}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500 block mb-1">Sunrise</span>
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Sunrise className="w-3 h-3 text-amber-400" />
                {panchang?.sunrise || "06:00 AM"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-1">Sunset</span>
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Sunset className="w-3 h-3 text-orange-400" />
                {panchang?.sunset || "06:00 PM"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
