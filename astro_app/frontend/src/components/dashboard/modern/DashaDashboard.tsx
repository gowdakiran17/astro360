import React, { useState, useMemo } from 'react';
import { Clock, BarChart3, Download, Bell } from 'lucide-react';

interface DashaPeriod {
  lord: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  is_current: boolean;
  antardashas?: DashaPeriod[];
  pratyantardashas?: DashaPeriod[];
}

interface DashaData {
  dashas: DashaPeriod[];
}

interface DashaDashboardProps {
  dashaData: DashaData | null;
  shadbalaData?: any;
}

const DashaDashboard: React.FC<DashaDashboardProps> = ({ dashaData, shadbalaData }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'timeline' | 'compare'>('visual');

  const { currentMD, currentAD, currentPD, nextAD, progressMD, progressAD } = useMemo(() => {
    if (!dashaData?.dashas) return { currentMD: null, currentAD: null, currentPD: null, nextAD: null, progressMD: 0, progressAD: 0 };

    const findCurrent = (periods: DashaPeriod[] | undefined) => periods?.find(p => p.is_current);

    const md = findCurrent(dashaData.dashas);
    const ad = md ? findCurrent(md.antardashas) : null;
    const pd = ad ? findCurrent(ad.pratyantardashas) : null;

    // Find next Antardasha
    let next: DashaPeriod | null = null;
    if (md && md.antardashas) {
        const adIndex = md.antardashas.findIndex(p => p.is_current);
        if (adIndex !== -1 && adIndex < md.antardashas.length - 1) {
            next = md.antardashas[adIndex + 1];
        } else if (adIndex === md.antardashas.length - 1) {
             // Logic to find first AD of next MD could go here
        }
    }

    const calculateProgress = (start: string, end: string) => {
        const now = new Date().getTime();
        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        const total = e - s;
        const elapsed = now - s;
        return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    };

    const pMD = md ? calculateProgress(md.start_date, md.end_date) : 0;
    const pAD = ad ? calculateProgress(ad.start_date, ad.end_date) : 0;

    return { currentMD: md, currentAD: ad, currentPD: pd, nextAD: next, progressMD: pMD, progressAD: pAD };
  }, [dashaData]);

  const getPlanetStrength = (planetName: string) => {
       if (!shadbalaData || !shadbalaData.planets) return { score: 0, strength: 'Unknown', normalized: 0 };
       
       // Find planet in the planets array
       const planetData = shadbalaData.planets.find((p: any) => 
           p.name.toLowerCase() === planetName.toLowerCase() || 
           planetName.toLowerCase().includes(p.name.toLowerCase())
       );
       
       if (!planetData) return { score: 0, strength: 'Unknown', normalized: 0 };
       
       const score = planetData.total_rupas || 0;
       const percentage = planetData.percentage || 0;
       const strength = planetData.status || 'Average';
       
       // Normalize: 100% requirement = full bar? Or relative?
       // Let's use percentage directly, max 100 for bar (or allow overflow visually if needed, but for bar width 100 is max)
       // Actually, shadbala percentage can be > 100 (e.g. 140%). Let's cap at 100 for width or scale it.
       // A planet with 100% requirement met is strong.
       // Let's simply use the percentage value but cap at 100 for the CSS width, 
       // or maybe scale it so 150% is full width? 
       // Standard: 100% is 'required strength met'. Let's show it as full or nearly full.
       
       return { 
           score: score, 
           strength: strength,
           normalized: Math.min(100, percentage) 
       };
   };

  const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  const formatDateFull = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (!dashaData) {
      return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6 text-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-32 bg-slate-700 rounded mb-4"></div>
                <div className="h-2 w-48 bg-slate-800 rounded"></div>
            </div>
        </div>
      );
  }

  if (!currentMD) {
      return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6 text-center">
            <p className="text-slate-400">Dasha information not available.</p>
        </div>
      );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-xl font-serif text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    Cosmic Chapters (Dasha)
                </h2>
                <p className="text-sm text-slate-400">Your life cycles and current timeline</p>
            </div>
            
            <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                <button 
                    onClick={() => setActiveTab('visual')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all ${activeTab === 'visual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Dashboard
                </button>
                <button 
                    onClick={() => setActiveTab('timeline')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all ${activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Timeline
                </button>
                 <button 
                    onClick={() => setActiveTab('compare')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all ${activeTab === 'compare' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Compare
                </button>
            </div>
        </div>

        <div className="p-6">
            {activeTab === 'visual' && (
                <div className="space-y-8">
                    {/* Mahadasha */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Chapter (Mahadasha)</div>
                                <div className="text-2xl font-serif text-white">{currentMD.lord} Mahadasha</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-indigo-300">{formatDate(currentMD.start_date)} — {formatDate(currentMD.end_date)}</div>
                                <div className="text-xs text-slate-500">{progressMD}% Complete</div>
                            </div>
                        </div>
                        <div className="h-4 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.4)] relative" style={{ width: `${progressMD}%` }}>
                                <div className="absolute inset-0 bg-noise opacity-20"></div>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <div className="text-xs text-slate-400 mb-1">Core Theme</div>
                                <div className="text-sm text-slate-200">Major influence of {currentMD.lord} on life path.</div>
                             </div>
                             <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <div className="text-xs text-slate-400 mb-1">Duration</div>
                                <div className="text-sm text-slate-200">{currentMD.duration_years} Years Cycle</div>
                             </div>
                        </div>
                    </div>

                    {/* Antardasha */}
                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10"></div>
                        
                        <div className="relative pl-12">
                             <div className="absolute left-[21px] top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                             <div className="flex justify-between items-end mb-2">
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Sub-Chapter (Antardasha)</div>
                                    <div className="text-xl font-serif text-amber-200">{currentAD?.lord || 'Unknown'} Antardasha</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-amber-200/80">
                                      {currentAD ? `${formatDate(currentAD.start_date)} — ${formatDate(currentAD.end_date)}` : 'N/A'}
                                    </div>
                                    <div className="text-xs text-slate-500">{progressAD}% Complete</div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden border border-white/5 mb-3">
                                <div className="h-full bg-gradient-to-r from-amber-900 via-amber-600 to-amber-400" style={{ width: `${progressAD}%` }}></div>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                <p className="text-sm text-amber-100 italic">"Influence of {currentAD?.lord} within the period of {currentMD.lord}."</p>
                            </div>
                        </div>
                    </div>

                     {/* Pratyantardasha */}
                     <div className="relative pl-12">
                         <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/10 w-fit">
                            <span className="text-xs font-bold uppercase text-slate-500">Micro-Period</span>
                            <span className="font-serif text-indigo-300">
                              {currentMD.lord} - {currentAD?.lord} - {currentPD?.lord || '...'}
                            </span>
                            {currentPD && (
                              <span className="text-xs text-slate-500 ml-2">Ends {formatDateFull(currentPD.end_date)}</span>
                            )}
                         </div>
                     </div>
                </div>
            )}

            {activeTab === 'timeline' && currentMD && currentMD.antardashas && (
                <div className="relative space-y-8 py-4">
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10"></div>
                    
                    {(() => {
                        const currentIndex = currentMD.antardashas.findIndex(p => p.is_current);
                        const periodsToShow = currentMD.antardashas.slice(Math.max(0, currentIndex - 1), currentIndex + 3);
                        
                        return periodsToShow.map((ad, idx) => {
                            const isPast = new Date(ad.end_date) < new Date();
                            const isCurrent = ad.is_current;
                            
                            return (
                                <div key={idx} className={`relative pl-16 ${isPast ? 'opacity-50' : ''}`}>
                                    <div className={`absolute ${isCurrent ? 'left-3 top-1 w-6 h-6 border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'left-4 top-2 w-4 h-4 border-2 border-slate-600'} rounded-full ${isCurrent ? 'bg-indigo-500/20' : 'bg-slate-800'} flex items-center justify-center`}>
                                        {isCurrent ? (
                                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                                        ) : isPast ? (
                                             <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                        ) : null}
                                    </div>
                                    
                                    <div className={`text-sm font-bold ${isCurrent ? 'text-indigo-400' : 'text-slate-400'}`}>
                                        {isCurrent ? `Current Phase (${new Date(ad.start_date).getFullYear()} - ${new Date(ad.end_date).getFullYear()})` : `${new Date(ad.start_date).getFullYear()} - ${new Date(ad.end_date).getFullYear()}`}
                                    </div>
                                    <div className={`text-xl font-serif ${isCurrent ? 'text-white' : isPast ? 'text-slate-300' : 'text-white'}`}>
                                        {currentMD.lord} - {ad.lord}
                                    </div>
                                    
                                    {isCurrent && (
                                         <div className="mt-2 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                            <h4 className="text-sm font-bold text-indigo-200 mb-2">Current Influence</h4>
                                            <p className="text-sm text-slate-300">Active period of {ad.lord} under {currentMD.lord}.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>
            )}

            {activeTab === 'compare' && currentMD && currentAD && (
                <div className="space-y-6">
                    {/* Comparison Header */}
                    <div className="grid grid-cols-2 gap-4 text-center mb-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                            <div className="relative">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Period</div>
                                <div className="text-lg font-serif text-white">{currentMD.lord} - {currentAD.lord}</div>
                                <div className="text-xs text-indigo-300 mt-1">Ends {formatDate(currentAD.end_date)}</div>
                            </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden group">
                             <div className="absolute inset-0 bg-slate-800/20 group-hover:bg-slate-700/30 transition-colors"></div>
                            <div className="relative opacity-80">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{nextAD ? 'Next Period' : 'Previous Period'}</div>
                                <div className="text-lg font-serif text-slate-300">
                                    {nextAD ? `${currentMD.lord} - ${nextAD.lord}` : 'End of Cycle'}
                                </div>
                                {nextAD && <div className="text-xs text-slate-500 mt-1">Starts {formatDate(nextAD.start_date)}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Comparative Metrics (Simulated based on Shadbala if available) */}
                    <div className="space-y-6">
                        {/* Lord Strength Comparison */}
                         <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-indigo-400" />
                                Planetary Strength (Shadbala)
                            </h3>
                            
                            {(() => {
                                const currentStrength = getPlanetStrength(currentAD.lord);
                                const nextStrength = nextAD ? getPlanetStrength(nextAD.lord) : { score: 0, strength: 'N/A', normalized: 0 };
                                
                                return (
                                    <div className="space-y-4">
                                        {/* Current AD Lord */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-400">{currentAD.lord} (Current)</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${currentStrength.strength === 'Strong' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                    {currentStrength.strength}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${currentStrength.normalized}%` }}></div>
                                            </div>
                                        </div>

                                        {/* Next AD Lord */}
                                        {nextAD && (
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-slate-400">{nextAD.lord} (Next)</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${nextStrength.strength === 'Strong' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                        {nextStrength.strength}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-slate-500 rounded-full transition-all duration-1000" style={{ width: `${nextStrength.normalized}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Duration Comparison */}
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-400" />
                                Duration Analysis
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex-1">
                                    <div className="text-slate-400 text-xs mb-1">{currentAD.lord} Period</div>
                                    <div className="text-white font-medium">{currentAD.duration_years ? `${(currentAD.duration_years * 12).toFixed(1)} Months` : 'N/A'}</div>
                                </div>
                                {nextAD && (
                                    <div className="flex-1 border-l border-white/10 pl-4">
                                        <div className="text-slate-400 text-xs mb-1">{nextAD.lord} Period</div>
                                        <div className="text-slate-300 font-medium">{nextAD.duration_years ? `${(nextAD.duration_years * 12).toFixed(1)} Months` : 'N/A'}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3">
                             <Bell className="w-5 h-5 text-indigo-400 shrink-0" />
                             <div>
                                 <h4 className="text-sm font-bold text-indigo-200 mb-1">Transition Insight</h4>
                                 <p className="text-sm text-slate-300 leading-relaxed">
                                     Transitioning from <strong>{currentAD.lord}</strong> to <strong>{nextAD?.lord || 'Next Cycle'}</strong> represents a shift in energy. 
                                     Prepare for changes in focus as planetary influences evolve.
                                 </p>
                             </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'compare' && (!currentMD || !currentAD) && (
                 <div className="text-center p-8 text-slate-400">
                    <p>Comparison data unavailable.</p>
                </div>
            )}
        </div>
        
        <div className="bg-white/5 p-4 border-t border-white/5 flex justify-center">
             <button className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" /> Download Detailed Dasha Report
             </button>
        </div>
    </div>
  );
};

export default DashaDashboard;
