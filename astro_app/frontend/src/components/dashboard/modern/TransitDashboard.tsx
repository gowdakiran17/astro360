import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, List, Clock, ChevronRight } from 'lucide-react';
import { Transit } from '../../../types/periodAnalysis';

interface TransitDashboardProps {
    transits?: Transit[];
    ascendantSign?: string;
}

const TransitDashboard: React.FC<TransitDashboardProps> = ({ transits, ascendantSign }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const processedTransits = useMemo(() => {
    if (!transits) return [];

    const zodiacOrder = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    
    return transits.map(t => {
        let houseNum = 0;
        if (ascendantSign && t.zodiac_sign) {
            // Ensure case-insensitive matching
            const ascIdx = zodiacOrder.findIndex(z => z.toLowerCase() === ascendantSign.toLowerCase());
            const planetIdx = zodiacOrder.findIndex(z => z.toLowerCase() === t.zodiac_sign.toLowerCase());
            
            if (ascIdx !== -1 && planetIdx !== -1) {
                houseNum = ((planetIdx - ascIdx + 12) % 12) + 1;
            }
        }

        // Determine house type/theme roughly
        const houseThemes: Record<number, string> = {
            1: "Self & Identity", 2: "Wealth & Family", 3: "Courage & Siblings", 4: "Home & Happiness",
            5: "Creativity & Progeny", 6: "Health & Enemies", 7: "Partnerships", 8: "Transformation",
            9: "Luck & Wisdom", 10: "Career & Status", 11: "Gains & Network", 12: "Loss & Liberation"
        };

        // Enhanced impact logic
        let impact = "Neutral";
        const dusthana = [6, 8, 12];
        const kendra = [1, 4, 7, 10];
        const trikona = [1, 5, 9]; // 1 is both Kendra and Trikona

        if (houseNum > 0) {
            if (dusthana.includes(houseNum)) {
                impact = "Challenging";
            } else if (kendra.includes(houseNum) || trikona.includes(houseNum)) {
                impact = "Favorable";
            }
        }
        
        if (t.is_retrograde) {
            impact = "Transformational"; // Retrograde often implies re-evaluation
        }
        
        return {
            ...t,
            house: houseNum ? `${houseNum}${getOrdinal(houseNum)} House` : "Transit",
            houseType: houseNum ? houseThemes[houseNum] : "General Influence",
            impact: impact,
            duration: "Current",
            description: `${t.name} is transiting through ${t.zodiac_sign} in your ${houseNum ? houseNum + getOrdinal(houseNum) : ''} house.`,
            color: getPlanetColor(t.name).bg,
            borderColor: getPlanetColor(t.name).border,
            textColor: getPlanetColor(t.name).text
        };
    });
  }, [transits, ascendantSign]);

  if (!transits || transits.length === 0) return null;

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
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processedTransits.map((transit, idx) => (
                <div key={idx} className={`rounded-xl border p-5 bg-gradient-to-br ${transit.color} ${transit.borderColor} group hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden`}>
                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <div>
                            <div className={`font-bold text-lg ${transit.textColor}`}>{transit.name} in {transit.zodiac_sign} {transit.is_retrograde ? '(R)' : ''}</div>
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
                        <button 
                            onClick={() => navigate('/global/transits')}
                            className="flex items-center gap-1 text-white hover:underline"
                        >
                            Details <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Decorative Planet Icon */}
                    <div className="absolute -bottom-4 -right-4 text-9xl opacity-5 pointer-events-none select-none font-serif">
                        {transit.name[0]}
                    </div>
                </div>
            ))}
        </div>
      )}

      {viewMode === 'list' && (
          <div className="space-y-3">
              {processedTransits.map((transit, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg bg-gradient-to-br ${transit.color} border ${transit.borderColor} text-white`}>
                              {transit.name[0]}
                          </div>
                          <div>
                              <div className="font-medium text-white">{transit.name} in {transit.zodiac_sign} {transit.is_retrograde ? '(R)' : ''}</div>
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
    </div>
  );
};

// Helpers
function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

function getPlanetColor(planet: string) {
    const colors: Record<string, { bg: string, border: string, text: string }> = {
        Sun: { bg: 'from-amber-500/20 to-orange-500/5', border: 'border-amber-500/30', text: 'text-amber-200' },
        Moon: { bg: 'from-slate-200/20 to-slate-100/5', border: 'border-slate-300/30', text: 'text-slate-200' },
        Mars: { bg: 'from-red-500/20 to-rose-500/5', border: 'border-red-500/30', text: 'text-red-200' },
        Mercury: { bg: 'from-emerald-500/20 to-teal-500/5', border: 'border-emerald-500/30', text: 'text-emerald-200' },
        Jupiter: { bg: 'from-yellow-500/20 to-amber-500/5', border: 'border-yellow-500/30', text: 'text-yellow-200' },
        Venus: { bg: 'from-pink-500/20 to-rose-500/5', border: 'border-pink-500/30', text: 'text-pink-200' },
        Saturn: { bg: 'from-blue-900/40 to-slate-900/40', border: 'border-blue-800/30', text: 'text-blue-300' },
        Rahu: { bg: 'from-gray-700/40 to-gray-800/40', border: 'border-gray-600/30', text: 'text-gray-300' },
        Ketu: { bg: 'from-gray-700/40 to-gray-800/40', border: 'border-gray-600/30', text: 'text-gray-300' }
    };
    return colors[planet] || colors.Sun;
}

export default TransitDashboard;
