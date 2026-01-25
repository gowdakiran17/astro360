import React, { useState, useMemo } from 'react';
import { Star, Info, Sparkles, User, Briefcase, Heart, AlertCircle, ChevronDown, ChevronUp, Sun, Moon, Hand } from 'lucide-react';
import { NAKSHATRA_DATA, NakshatraInfo } from '../../../utils/nakshatraData';

interface NakshatraCenterProps {
  chartData: any;
}

const NakshatraCenter: React.FC<NakshatraCenterProps> = ({ chartData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { moonNakshatra, sunNakshatra, lagnaNakshatra } = useMemo(() => {
    if (!chartData?.planets) {
      return { moonNakshatra: null, sunNakshatra: null, lagnaNakshatra: null };
    }

    const getNakshatraData = (name: string | undefined): NakshatraInfo | null => {
      if (!name) return null;
      // Handle potential spelling differences or case
      const key = Object.keys(NAKSHATRA_DATA).find(k => k.toLowerCase() === name.toLowerCase());
      return key ? NAKSHATRA_DATA[key] : null;
    };

    const moon = chartData.planets.find((p: any) => p.name === 'Moon');
    const sun = chartData.planets.find((p: any) => p.name === 'Sun');
    const ascendant = chartData.ascendant;

    // Helper to get formatted details (degrees, pada) if available
    // Assuming planet objects have 'nakshatra' name. 
    // If 'nakshatra_info' is already populated by backend, we could use that, 
    // but we use our local NAKSHATRA_DATA for rich descriptions.
    
    return {
      moonNakshatra: {
        data: getNakshatraData(moon?.nakshatra),
        details: moon
      },
      sunNakshatra: {
        data: getNakshatraData(sun?.nakshatra),
        details: sun
      },
      lagnaNakshatra: {
        data: getNakshatraData(ascendant?.nakshatra),
        details: ascendant
      }
    };
  }, [chartData]);

  if (!moonNakshatra?.data) {
    return null; // Or a loading state/placeholder
  }

  const moonData = moonNakshatra.data;
  const sunData = sunNakshatra?.data;
  const lagnaData = lagnaNakshatra?.data;

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                <Sparkles className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-xl font-serif text-white">Nakshatra Intelligence Center</h2>
                <p className="text-sm text-slate-400">Deep psychological and karmic analysis</p>
            </div>
        </div>
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
        >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Primary: Moon Nakshatra */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Primary: Moon Nakshatra</h3>
                <span className="text-xs px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Psychological Core</span>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-xl p-6 border border-indigo-500/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Star className="w-32 h-32 text-indigo-400 rotate-12" />
                </div>
                
                <div className="relative z-10">
                    <div className="text-3xl font-serif text-white mb-1">{moonData.name}</div>
                    <div className="text-sm text-indigo-300 mb-6">
                        {moonNakshatra.details?.zodiac_sign} • Pada {moonNakshatra.details?.pada || 1}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-black/20 rounded-lg p-3">
                            <div className="text-xs text-slate-500 mb-1">Deity</div>
                            <div className="text-sm font-medium text-slate-200">{moonData.deity}</div>
                        </div>
                        <div className="bg-black/20 rounded-lg p-3">
                            <div className="text-xs text-slate-500 mb-1">Symbol</div>
                            <div className="text-sm font-medium text-slate-200">{moonData.symbol}</div>
                        </div>
                         <div className="bg-black/20 rounded-lg p-3">
                            <div className="text-xs text-slate-500 mb-1">Ruling Planet</div>
                            <div className="text-sm font-medium text-slate-200">{moonData.planet}</div>
                        </div>
                         <div className="bg-black/20 rounded-lg p-3">
                            <div className="text-xs text-slate-500 mb-1">Power</div>
                            <div className="text-sm font-medium text-slate-200 line-clamp-2" title={moonData.power}>{moonData.power}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase">Core Traits</h4>
                        <div className="flex flex-wrap gap-2">
                            {moonData.traits.slice(0, 5).map(trait => (
                                <span key={trait} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-slate-300 border border-white/10">{trait}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <Briefcase className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-slate-200">Life Purpose</div>
                                <div className="text-xs text-slate-400 mt-1">{moonData.purpose}</div>
                            </div>
                        </div>
                         <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <Heart className="w-4 h-4 text-rose-400 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-slate-200">Quality</div>
                                <div className="text-xs text-slate-400 mt-1">{moonData.quality}</div>
                            </div>
                        </div>
                         <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-slate-200">Description</div>
                                <div className="text-xs text-slate-400 mt-1">{moonData.description}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Secondary: Sun Nakshatra */}
        {sunData && (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Secondary: Sun Nakshatra</h3>
                <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Soul Purpose</span>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-black rounded-xl p-6 border border-white/10 relative overflow-hidden">
                <div className="text-2xl font-serif text-white mb-1">{sunData.name}</div>
                <div className="text-sm text-amber-300 mb-6">{sunNakshatra.details?.zodiac_sign}</div>

                <p className="text-sm text-slate-300 leading-relaxed italic mb-4">
                    "{sunData.description}"
                </p>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Key Themes</h4>
                    <ul className="space-y-2">
                        {sunData.traits.slice(0, 3).map((trait, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            {trait}
                        </li>
                        ))}
                    </ul>
                </div>
            </div>
             
             {!isExpanded && (
                <div className="text-center">
                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors border-b border-indigo-400/30 hover:border-indigo-300"
                    >
                        View Full Analysis
                    </button>
                </div>
            )}
        </div>
        )}

        {/* Tertiary: Lagna Nakshatra */}
        {lagnaData ? (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tertiary: Lagna</h3>
                <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Surface</span>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-emerald-950/40 rounded-xl p-6 border border-white/10 relative overflow-hidden">
                <div className="text-2xl font-serif text-white mb-1">{lagnaData.name}</div>
                <div className="text-sm text-emerald-300 mb-6">{lagnaNakshatra.details?.zodiac_sign}</div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-black/20 text-slate-400">
                            <Sun className="w-4 h-4" />
                         </div>
                         <div>
                            <div className="text-xs text-slate-500">Deity</div>
                            <div className="text-sm font-medium text-slate-200">{lagnaData.deity}</div>
                         </div>
                    </div>
                     <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-black/20 text-slate-400">
                            <Moon className="w-4 h-4" />
                         </div>
                         <div>
                            <div className="text-xs text-slate-500">Ruling Planet</div>
                            <div className="text-sm font-medium text-slate-200">{lagnaData.planet}</div>
                         </div>
                    </div>
                     <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-black/20 text-slate-400">
                            <Hand className="w-4 h-4" />
                         </div>
                         <div>
                            <div className="text-xs text-slate-500">Symbol</div>
                            <div className="text-sm font-medium text-slate-200">{lagnaData.symbol}</div>
                         </div>
                    </div>
                </div>

                {isExpanded && (
                     <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Key Traits</h4>
                        <div className="flex flex-wrap gap-2">
                             {lagnaData.traits.slice(0, 4).map(trait => (
                                <span key={trait} className="px-2 py-1 rounded-md bg-emerald-500/10 text-xs text-emerald-200 border border-emerald-500/20">{trait}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
        ) : (
             /* Fallback if Lagna nakshatra data is missing but we want to show something or just empty div */
             <div className="hidden lg:block"></div>
        )}
      </div>
      
      {/* Footer Actions */}
      <div className="p-4 border-t border-white/5 bg-black/20 flex justify-center gap-4 text-xs text-slate-400">
          <button className="hover:text-white transition-colors">Full Nakshatra Report</button>
          <span>•</span>
          <button className="hover:text-white transition-colors">Compatibility by Nakshatra</button>
          <span>•</span>
          <button className="hover:text-white transition-colors">Remedial Measures</button>
      </div>
    </div>
  );
};

export default NakshatraCenter;
