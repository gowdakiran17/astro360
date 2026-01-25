import React, { useMemo } from 'react';
import { Sun, Moon, Sunrise, Sunset, Star, Clock, Info } from 'lucide-react';

interface SummaryCardsProps {
  chartData: any;
  panchangData: any;
  dashaData: any;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ chartData, panchangData, dashaData }) => {
  if (!chartData) return null;

  const ascendant = chartData.ascendant;
  const sun = chartData.planets.find((p: any) => p.name === 'Sun');
  const moon = chartData.planets.find((p: any) => p.name === 'Moon');
  
  // Helper to format degrees
  const formatDeg = (lon: number) => {
    const d = Math.floor(lon % 30);
    const m = Math.floor(((lon % 30) - d) * 60);
    return `${d}°${m}'`;
  };

  // Process Dasha Data
  const { currentMD, currentAD, nextAD, progressAD } = useMemo(() => {
    if (!dashaData?.dashas) return { currentMD: null, currentAD: null, nextAD: null, progressAD: 0 };

    const dashas = dashaData.dashas;
    const md = dashas.find((d: any) => d.is_current);
    
    if (!md) return { currentMD: null, currentAD: null, nextAD: null, progressAD: 0 };

    const adIndex = md.antardashas?.findIndex((ad: any) => ad.is_current);
    const ad = adIndex !== -1 ? md.antardashas[adIndex] : null;
    
    // Find next Antardasha
    let next = null;
    if (md.antardashas && adIndex !== -1 && adIndex < md.antardashas.length - 1) {
        next = md.antardashas[adIndex + 1];
    } else if (md.antardashas && adIndex === md.antardashas.length - 1) {
        // Next MD's first AD
        const mdIndex = dashas.findIndex((d: any) => d.lord === md.lord);
        if (mdIndex < dashas.length - 1) {
            next = dashas[mdIndex + 1].antardashas?.[0];
        }
    }

    // Calculate Progress of current Antardasha
    let progress = 0;
    if (ad) {
        const now = new Date().getTime();
        const start = new Date(ad.start_date).getTime();
        const end = new Date(ad.end_date).getTime();
        const total = end - start;
        const elapsed = now - start;
        progress = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    }

    return { currentMD: md, currentAD: ad, nextAD: next, progressAD: progress };
  }, [dashaData]);

  const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Card 1: Chart Details */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl hover:bg-white/10 transition-all group">
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                 <span className="text-xs text-slate-500 block mb-1">Sunrise</span>
                 <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Sunrise className="w-3 h-3 text-amber-400" />
                    {panchangData?.sunrise || "06:00 AM"}
                 </span>
            </div>
             <div>
                 <span className="text-xs text-slate-500 block mb-1">Sunset</span>
                 <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Sunset className="w-3 h-3 text-orange-400" />
                    {panchangData?.sunset || "06:00 PM"}
                 </span>
            </div>
          </div>
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
                    <span className="font-medium text-indigo-200">{moon?.nakshatra_info?.deity || "Unknown"}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Symbol</span>
                    <span className="font-medium text-indigo-200">{moon?.nakshatra_info?.symbol || "Unknown"}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Quality</span>
                    <span className="font-medium text-indigo-200">{moon?.nakshatra_info?.quality || "Unknown"}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Card 3: Current Dasha */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl hover:bg-white/10 transition-all">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-lg text-white">Current Dasha</h3>
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-300">
             <Clock className="w-4 h-4" />
          </div>
        </div>

        {currentMD ? (
            <div className="flex flex-col items-center justify-center py-2">
                <div className="w-32 h-32 rounded-full border-4 border-white/5 relative flex items-center justify-center mb-4">
                     <div className="absolute inset-0 rounded-full border-4 border-indigo-500/50 border-t-transparent animate-[spin_8s_linear_infinite]"></div>
                     <div className="text-center">
                         <span className="block text-3xl font-serif text-white">{currentMD.lord}</span>
                         <span className="text-xs text-indigo-300 uppercase tracking-wider">Mahadasha</span>
                     </div>
                </div>
                
                <p className="text-slate-400 text-sm mb-4">Ends on <span className="text-white font-medium">{formatDate(currentMD.end_date)}</span></p>
                
                <div className="w-full bg-black/20 rounded-xl p-3 border border-white/5">
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-slate-400">Current Antardasha</span>
                        <span className="text-slate-300">{currentAD?.lord || 'Unknown'}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full" style={{ width: `${progressAD}%` }}></div>
                    </div>
                     {nextAD && (
                        <div className="flex justify-between items-center text-xs mt-2 text-slate-500">
                            <span>Next: {nextAD.lord} Antardasha</span>
                            <span>{formatDate(currentAD?.end_date || '')}</span>
                        </div>
                    )}
                </div>
            </div>
        ) : (
             <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <p>Dasha data unavailable</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;
