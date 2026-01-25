import React from 'react';
import { ArrowRight, AlertCircle, MoveRight } from 'lucide-react';

interface TransitItem {
  planet: string;
  sign: string;
  house: number; // relative to moon or lagna
  status: 'Neutral' | 'Favorable' | 'Unfavorable' | 'Mixed';
  description?: string;
}

interface TransitListProps {
  transits?: TransitItem[]; 
  planets?: any[]; // Raw planet data from API
}

const TransitList: React.FC<TransitListProps> = ({ transits, planets }) => {
  // Map planets to transits if provided
  const mappedTransits = planets ? planets.map((p: any) => ({
      planet: p.name,
      sign: p.zodiac_sign,
      house: p.house, 
      status: 'Neutral', // Placeholder logic
      description: `${p.zodiac_sign} Sign`
  })) : transits;

  const displayTransits = mappedTransits || [
    { planet: 'Saturn', sign: 'Aquarius', house: 11, status: 'Neutral', description: '11th House from Lagna' },
    { planet: 'Moon', sign: 'Gemini', house: 3, status: 'Favorable', description: '3rd House from Lagna' },
    { planet: 'Jupiter', sign: 'Aries', house: 1, status: 'Favorable', description: '1st House from Lagna' },
    { planet: 'Rahu', sign: 'Pisces', house: 12, status: 'Unfavorable', description: '12th House from Lagna' },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
        case 'Favorable': return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
        case 'Unfavorable': return 'text-rose-300 bg-rose-500/10 border-rose-500/20';
        case 'Neutral': return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
        default: return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getPlanetIcon = (name: string) => {
    // Simple placeholder for planet icons or first 2 chars
    return name.substring(0, 2);
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">Current Transits</h3>
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 transition-colors group">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
        
        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {displayTransits.map((t, idx) => (
                <div key={idx} className="group relative flex items-center justify-between p-4 rounded-xl border border-white/5 bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 hover:to-white/5 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xs font-bold text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform duration-300">
                            {getPlanetIcon(t.planet)}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                              {t.planet} 
                              <MoveRight className="w-3 h-3 text-slate-500" />
                              <span className="text-indigo-300">{t.sign}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{t.description}</div>
                        </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium border uppercase tracking-wider ${getStatusStyles(t.status)}`}>
                        {t.status}
                    </span>
                </div>
            ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl flex gap-3 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 bg-indigo-500/10 blur-2xl rounded-full -mr-4 -mt-4"></div>
            <AlertCircle className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0 relative z-10" />
            <div className="text-xs text-indigo-200/80 relative z-10">
                <span className="font-bold block mb-1 text-indigo-200">Transit Alert</span>
                Jupiter will move to Taurus on May 1, 2024. Prepare for major career shifts.
            </div>
        </div>
    </div>
  );
};

export default TransitList;
