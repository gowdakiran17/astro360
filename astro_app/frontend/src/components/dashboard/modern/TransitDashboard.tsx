import React, { useState } from 'react';
import { ArrowRight, Calendar, Grid, List, Clock, ChevronRight, AlertCircle } from 'lucide-react';

const TransitDashboard = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');

  const transits = [
    {
      planet: 'Sun',
      sign: 'Capricorn',
      house: '7th House',
      houseType: 'Partnerships',
      impact: 'Neutral',
      duration: 'Until Jan 29',
      description: 'Focus on professional relationships and formal agreements.',
      color: 'from-amber-500/20 to-orange-500/5',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-200'
    },
    {
      planet: 'Moon',
      sign: 'Taurus',
      house: '9th House',
      houseType: 'Higher Learning',
      impact: 'Favorable',
      duration: 'Next 2.5 days',
      description: 'Excellent for study, travel, and connecting with mentors.',
      color: 'from-indigo-500/20 to-purple-500/5',
      borderColor: 'border-indigo-500/30',
      textColor: 'text-indigo-200'
    },
    {
      planet: 'Jupiter',
      sign: 'Pisces (R)',
      house: '9th House',
      houseType: 'Wisdom',
      impact: 'Transformational',
      duration: 'Until Feb 10',
      description: 'Deep internal growth and revisiting old spiritual lessons.',
      color: 'from-yellow-500/20 to-amber-500/5',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-200'
    },
     {
      planet: 'Saturn',
      sign: 'Aquarius',
      house: '8th House',
      houseType: 'Transformation',
      impact: 'Challenging',
      duration: 'Long Term',
      description: 'Patience required in joint finances and inheritance matters.',
      color: 'from-slate-700/40 to-slate-800/40',
      borderColor: 'border-slate-600/30',
      textColor: 'text-slate-300'
    }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h2 className="text-xl font-serif text-white">Interactive Transit Dashboard</h2>
            <p className="text-sm text-slate-400">Planetary movements affecting you now</p>
        </div>
        
        <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
            <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                title="Grid View"
            >
                <Grid className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                title="List View"
            >
                <List className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                title="Timeline View"
            >
                <Clock className="w-4 h-4" />
            </button>
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transits.map((transit, idx) => (
                <div key={idx} className={`rounded-xl border p-5 bg-gradient-to-br ${transit.color} ${transit.borderColor} group hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden`}>
                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <div>
                            <div className={`font-bold text-lg ${transit.textColor}`}>{transit.planet} in {transit.sign}</div>
                            <div className="text-xs text-white/60 font-medium uppercase tracking-wider">{transit.house} • {transit.houseType}</div>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full border border-white/10 bg-black/20 text-white`}>
                            {transit.impact}
                        </span>
                    </div>
                    
                    <p className="text-sm text-slate-200 mb-4 leading-relaxed relative z-10">
                        {transit.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-3 relative z-10">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {transit.duration}
                        </span>
                        <button className="flex items-center gap-1 text-white hover:underline">
                            Details <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Decorative Planet Icon */}
                    <div className="absolute -bottom-4 -right-4 text-9xl opacity-5 pointer-events-none select-none font-serif">
                        {transit.planet[0]}
                    </div>
                </div>
            ))}
        </div>
      )}

      {viewMode === 'list' && (
          <div className="space-y-3">
              {transits.map((transit, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg bg-gradient-to-br ${transit.color} border ${transit.borderColor} text-white`}>
                              {transit.planet[0]}
                          </div>
                          <div>
                              <div className="font-medium text-white">{transit.planet} in {transit.sign}</div>
                              <div className="text-xs text-slate-400">{transit.house} ({transit.houseType})</div>
                          </div>
                      </div>
                      <div className="text-right hidden sm:block">
                          <div className={`text-sm font-medium ${transit.textColor}`}>{transit.impact}</div>
                          <div className="text-xs text-slate-500">{transit.duration}</div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {viewMode === 'timeline' && (
          <div className="relative py-4">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10"></div>
              
              <div className="space-y-8 relative">
                  <div className="relative pl-10">
                        <div className="absolute left-[11px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        <div className="text-sm font-bold text-indigo-300 mb-1">Today, Jan 23</div>
                        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <div className="text-sm text-white">Moon enters Taurus</div>
                            <div className="text-xs text-slate-400">Emotional stability increases</div>
                        </div>
                  </div>

                  <div className="relative pl-10">
                        <div className="absolute left-[13px] top-1.5 w-2 h-2 rounded-full bg-slate-600"></div>
                        <div className="text-sm font-bold text-slate-400 mb-1">Jan 29</div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-sm text-slate-200">Sun enters Aquarius</div>
                            <div className="text-xs text-slate-400">Focus shifts to 8th House (Transformation)</div>
                        </div>
                  </div>

                  <div className="relative pl-10">
                        <div className="absolute left-[13px] top-1.5 w-2 h-2 rounded-full bg-amber-600"></div>
                        <div className="text-sm font-bold text-slate-400 mb-1">Feb 10</div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-sm text-slate-200">Jupiter goes Direct</div>
                            <div className="text-xs text-slate-400">Projects accelerate, wisdom clarity</div>
                        </div>
                  </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-amber-300/80 bg-amber-900/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>Major Shift: Venus enters Aries on Feb 18 (Career Charm activated)</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default TransitDashboard;
