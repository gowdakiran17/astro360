import { useState } from 'react';
import { 
  Briefcase, Heart, Activity, Sparkles, 
  ChevronRight, Calendar, Home, Users
} from 'lucide-react';

const LifeDomains = () => {
  const [activeTab, setActiveTab] = useState<'career' | 'relationships' | 'health' | 'spiritual'>('career');

  const tabs = [
    { id: 'career', label: 'Career & Finance', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'relationships', label: 'Relationships', icon: <Heart className="w-4 h-4" /> },
    { id: 'health', label: 'Health & Wellness', icon: <Activity className="w-4 h-4" /> },
    { id: 'spiritual', label: 'Spiritual Growth', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden mb-12">
      {/* Tabs Header */}
      <div className="border-b border-white/5 overflow-x-auto custom-scrollbar">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-white bg-white/10 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 md:p-8 min-h-[400px]">
        {activeTab === 'career' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-serif text-white mb-1">Professional Trajectory</h3>
                    <p className="text-sm text-slate-400">Analysis for next 3 months</p>
                </div>
                <div className="flex gap-4">
                     <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Career Momentum</div>
                        <div className="text-emerald-400 font-bold">78% (Good)</div>
                     </div>
                     <div className="w-px h-8 bg-white/10"></div>
                     <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Financial Growth</div>
                        <div className="text-emerald-400 font-bold">85% (Strong)</div>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2">Key Insights</h4>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm text-slate-300">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>Jupiter's aspect on 10th house brings authority and recognition from seniors.</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-300">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>2nd house strength indicates income stability.</span>
                        </li>
                         <li className="flex items-start gap-3 text-sm text-slate-300">
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>Saturn influence suggests slow but steady progress. Patience is key.</span>
                        </li>
                    </ul>
                </div>
                
                <div className="space-y-4">
                     <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2">Action Plan</h4>
                     <div className="space-y-3">
                        <div className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs group-hover:scale-110 transition-transform">
                                Feb
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">Submit Proposals</div>
                                <div className="text-xs text-slate-400">Jan 23 - Feb 10 is ideal for pitching new ideas.</div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs group-hover:scale-110 transition-transform">
                                Mar
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">Network & Partner</div>
                                <div className="text-xs text-slate-400">Feb 10 - Mar 15 favors forming new alliances.</div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-center">
                 <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors">
                    Generate 6-Month Career Report <ChevronRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        )}

        {activeTab === 'relationships' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div>
                    <h3 className="text-xl font-serif text-white mb-1">Relationship Dynamics</h3>
                    <p className="text-sm text-slate-400">Timing for love, family, and social connections</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Heart className="w-20 h-20 text-pink-400 -rotate-12" />
                        </div>
                        <div className="text-pink-300 font-bold mb-1 flex items-center gap-2"><Heart className="w-4 h-4" /> Romantic</div>
                        <div className="text-2xl text-white font-serif mb-2">Deepening</div>
                        <p className="text-xs text-pink-100/70 leading-relaxed">Strong emotional connection due to Moon Dasha. Patience required in communication.</p>
                        <div className="mt-4 pt-4 border-t border-pink-500/20">
                             <div className="text-[10px] uppercase text-pink-300/60 font-bold">Best Days</div>
                             <div className="text-sm text-white">Jan 24, 26, 27</div>
                        </div>
                    </div>

                     <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Home className="w-20 h-20 text-indigo-400 -rotate-12" />
                        </div>
                        <div className="text-indigo-300 font-bold mb-1 flex items-center gap-2"><Home className="w-4 h-4" /> Family</div>
                        <div className="text-2xl text-white font-serif mb-2">Peaceful</div>
                        <p className="text-xs text-indigo-100/70 leading-relaxed">High harmony level. Home environment is supportive and grounding.</p>
                         <div className="mt-4 pt-4 border-t border-indigo-500/20">
                             <div className="text-[10px] uppercase text-indigo-300/60 font-bold">Watch Out</div>
                             <div className="text-sm text-white">Jan 28-29 (Minor tensions)</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-xl p-5 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-20 h-20 text-purple-400 -rotate-12" />
                        </div>
                        <div className="text-purple-300 font-bold mb-1 flex items-center gap-2"><Users className="w-4 h-4" /> Social</div>
                        <div className="text-2xl text-white font-serif mb-2">Moderate</div>
                        <p className="text-xs text-purple-100/70 leading-relaxed">Networking power is average. New connections likely after Feb 10.</p>
                         <div className="mt-4 pt-4 border-t border-purple-500/20">
                             <div className="text-[10px] uppercase text-purple-300/60 font-bold">Opportunity</div>
                             <div className="text-sm text-white">Favorable Weekends</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Compatibility Insights (Moon in Taurus)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-black/20 rounded-lg text-center">
                            <div className="text-xs text-slate-500 mb-1">Style</div>
                            <div className="text-sm text-white font-medium">Loyal & Steady</div>
                        </div>
                        <div className="p-3 bg-black/20 rounded-lg text-center">
                            <div className="text-xs text-slate-500 mb-1">Needs</div>
                            <div className="text-sm text-white font-medium">Security</div>
                        </div>
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                            <div className="text-xs text-emerald-400/70 mb-1">Best Match</div>
                            <div className="text-sm text-emerald-300 font-medium">Earth Signs</div>
                        </div>
                         <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-center">
                            <div className="text-xs text-rose-400/70 mb-1">Red Flag</div>
                            <div className="text-sm text-rose-300 font-medium">Unpredictability</div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'health' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                 <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-serif text-white mb-1">Health & Wellness</h3>
                        <p className="text-sm text-slate-400">Vitality assessment and preventive care</p>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4" /> 79% Vitality Score
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2">Planetary Indicators</h4>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg">🌙</div>
                                <div>
                                    <div className="font-bold text-indigo-200">Moon (Mind & Emotions)</div>
                                    <div className="text-sm text-slate-300 mt-1">Strong in Taurus. Supports mental stability and sleep. Watch out for emotional eating.</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-lg">☀️</div>
                                <div>
                                    <div className="font-bold text-amber-200">Sun (Vitality)</div>
                                    <div className="text-sm text-slate-300 mt-1">Neutral strength. General energy is good, but avoid overworking (Capricorn influence).</div>
                                </div>
                            </div>

                             <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-lg">🪐</div>
                                <div>
                                    <div className="font-bold text-slate-300">Saturn (Chronic)</div>
                                    <div className="text-sm text-slate-400 mt-1">Requires attention to bones, joints, and teeth. Increase calcium intake.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                         <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2">Wellness Plan</h4>
                         
                         <div className="bg-black/20 rounded-xl p-5 border border-white/5 space-y-4">
                            <div>
                                <div className="text-xs text-slate-500 uppercase mb-1">Best Exercise Times</div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="px-3 py-1 rounded bg-white/5 text-sm text-slate-200">🌅 6:00 - 7:30 AM (Yoga)</span>
                                    <span className="px-3 py-1 rounded bg-white/5 text-sm text-slate-200">🏃 4:00 - 6:00 PM (Cardio)</span>
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-xs text-slate-500 uppercase mb-1">Dietary Focus</div>
                                <div className="text-sm text-slate-300">Favor whole grains and root vegetables. Hydration is extra important during Saturn periods.</div>
                            </div>
                            
                             <div>
                                <div className="text-xs text-slate-500 uppercase mb-1">Stress Management</div>
                                <div className="text-sm text-slate-300">Meditation and journaling are highly effective for Moon-dominant periods.</div>
                            </div>
                         </div>

                         <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                             <div className="flex items-center gap-2 text-rose-300 font-bold text-sm mb-2">
                                <AlertCircle className="w-4 h-4" /> Health Forecast
                             </div>
                             <ul className="space-y-1 text-sm text-rose-100/80">
                                <li>• Late Feb: Watch digestive system (Mars transit)</li>
                                <li>• March: Mental stress possible, prioritize rest</li>
                             </ul>
                         </div>
                    </div>
                </div>
             </div>
        )}

        {activeTab === 'spiritual' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-serif text-white mb-1">Spiritual Path</h3>
                        <p className="text-sm text-slate-400">Inner development and karmic journey</p>
                    </div>
                     <div className="flex gap-4 text-sm">
                        <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                            Intuition: <span className="font-bold">Very Strong</span>
                        </div>
                         <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                            Meditation: <span className="font-bold">Excellent</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl p-6 border border-white/10 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                             
                             <h4 className="text-lg font-serif text-white mb-4 relative z-10">Current Phase: Active Seeker</h4>
                             <p className="text-slate-300 text-sm leading-relaxed relative z-10 mb-6">
                                You are in a phase of integrating wisdom into daily life. With Jupiter's influence on the 9th house, grace and guidance are readily available. It's an optimal time for study and finding a teacher.
                             </p>

                             <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                    <span className="text-sm text-purple-200">Moon Transiting 9th House: Spiritual hunger</span>
                                </div>
                                 <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                    <span className="text-sm text-purple-200">Ketu in 12th: Natural detachment</span>
                                </div>
                             </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                         <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2">Recommended Practices</h4>
                         
                         <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="text-2xl mb-2">🧘</div>
                                <div className="font-bold text-white text-sm">Mantra Meditation</div>
                                <div className="text-xs text-slate-400 mt-1">Focus on Chandra mantras for peace.</div>
                             </div>
                             <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="text-2xl mb-2">🌅</div>
                                <div className="font-bold text-white text-sm">Brahma Muhurta</div>
                                <div className="text-xs text-slate-400 mt-1">5:30 - 7:00 AM is your power time.</div>
                             </div>
                             <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="text-2xl mb-2">📓</div>
                                <div className="font-bold text-white text-sm">Gratitude Journal</div>
                                <div className="text-xs text-slate-400 mt-1">Practice at 9-10 PM.</div>
                             </div>
                             <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="text-2xl mb-2">💧</div>
                                <div className="font-bold text-white text-sm">Water Rituals</div>
                                <div className="text-xs text-slate-400 mt-1">Connect with the water element.</div>
                             </div>
                         </div>
                     </div>
                </div>
                
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-indigo-300 uppercase mb-1">Upcoming Milestone</div>
                        <div className="text-white text-sm">Feb 10 - Mar 15: Potential for breakthrough spiritual insights.</div>
                    </div>
                    <button className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-300 transition-colors">
                        <Calendar className="w-5 h-5" />
                    </button>
                </div>

                {/* Personalized Remedial Measures (from Homepage.md) */}
                <div className="border-t border-white/10 pt-8 mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-serif text-white">💫 Personalized Remedial Measures</h3>
                        <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">PRIORITY: MOON</span>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Sparkles className="w-32 h-32 text-white" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-white font-medium text-lg flex items-center gap-2">
                                        Moon (Emotional Balance)
                                        <span className="text-xs font-normal text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">40 Days</span>
                                    </h4>
                                    <p className="text-slate-400 text-sm mt-1">Strengthen Moon to reduce anxiety and enhance peace.</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Impact</div>
                                    <div className="text-emerald-400 font-bold">High</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                                    <div className="text-xs text-slate-500 uppercase mb-2">Fasting</div>
                                    <div className="text-white font-medium">Monday Fasting</div>
                                    <div className="text-xs text-slate-400 mt-1">Skip dinner or fruits only.</div>
                                </div>
                                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                                    <div className="text-xs text-slate-500 uppercase mb-2">Mantra</div>
                                    <div className="text-white font-medium">Om Chandraya Namaha</div>
                                    <div className="text-xs text-slate-400 mt-1">108 times, Mon mornings.</div>
                                </div>
                                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                                    <div className="text-xs text-slate-500 uppercase mb-2">Therapy</div>
                                    <div className="text-white font-medium">White Color</div>
                                    <div className="text-xs text-slate-400 mt-1">Wear white on Mondays.</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">Current Progress</span>
                                    <span className="text-indigo-300 font-bold">15 / 40 Days</span>
                                </div>
                                <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 w-[37%] shadow-[0_0_10px_rgba(99,102,241,0.5)] relative">
                                        <div className="absolute inset-0 bg-noise opacity-20"></div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Mark Today's Practice
                                    </button>
                                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Set Reminder
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};

// Helper component for icons
const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default LifeDomains;
