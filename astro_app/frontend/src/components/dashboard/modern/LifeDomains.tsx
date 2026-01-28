import React, { useState, useMemo } from 'react';
import { 
  Briefcase, Heart, Activity, Sparkles, 
  CheckCircle, TrendingUp, AlertTriangle, Info, Star
} from 'lucide-react';
import { DailyAnalysis, DashaInfo } from '../../../types/periodAnalysis';

interface LifeDomainsProps {
  dailyData?: DailyAnalysis;
  dashaData?: DashaInfo;
  ashtakvargaData?: any; // Natal SAV points
  chartData?: any; // Contains Ascendant info
}

const LifeDomains: React.FC<LifeDomainsProps> = ({ dailyData, dashaData, ashtakvargaData, chartData }) => {
  const [activeTab, setActiveTab] = useState<'career' | 'relationships' | 'health' | 'spiritual'>('career');

  const tabs = [
    { id: 'career', label: 'Career & Finance', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'relationships', label: 'Relationships', icon: <Heart className="w-4 h-4" /> },
    { id: 'health', label: 'Health & Wellness', icon: <Activity className="w-4 h-4" /> },
    { id: 'spiritual', label: 'Spiritual Growth', icon: <Sparkles className="w-4 h-4" /> },
  ];

  // Helper to get house strength (SAV points)
  // NOW CORRECTLY CALCULATES HOUSE BASED ON ASCENDANT
  const getHouseStrength = (houseNumber: number) => {
    // 1. Get Natal Points if available
    if (ashtakvargaData?.sav) {
      let ascIndex = -1;

      // Prefer explicit index from backend if available
      if (typeof ashtakvargaData.ascendant_sign_idx === 'number') {
        ascIndex = ashtakvargaData.ascendant_sign_idx;
      } 
      // Fallback to text matching from chartData
      else if (chartData?.ascendant?.sign) {
         const signs = [
          "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
          "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ];
        const normalize = (s: string) => s.toLowerCase().trim();
        ascIndex = signs.findIndex(s => normalize(s) === normalize(chartData.ascendant.sign));
      }
      
      if (ascIndex !== -1) {
        // Calculate Sign Index for the given House Number (1-based)
        // House 1 = Ascendant Sign
        const targetSignIndex = (ascIndex + (houseNumber - 1)) % 12;
        return ashtakvargaData.sav[targetSignIndex] || 28;
      }
    }
    
    // Fallback to dailyData (Transit SAV) or average
    return 28; 
  };

  // Helper to calculate score percentage from SAV (approx range 18-40)
  const calculateScore = (points: number) => {
    const min = 18;
    const max = 38;
    const normalized = Math.max(0, Math.min(100, ((points - min) / (max - min)) * 100));
    return Math.round(normalized);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (score >= 60) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (score >= 40) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    return { label: 'Challenging', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  };

  // Helper: Get Transit House Number (1-12) based on Ascendant
  const getTransitHouse = (planetSign: string): number => {
    if (!chartData?.ascendant?.sign || !planetSign) return 0;
    
    const signs = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];

    // Normalize input signs
    const normalize = (s: string) => s.toLowerCase().trim();
    const pSignIndex = signs.findIndex(s => normalize(s) === normalize(planetSign));
    const ascSignIndex = signs.findIndex(s => normalize(s) === normalize(chartData.ascendant.sign));

    if (pSignIndex === -1 || ascSignIndex === -1) return 0;

    let house = (pSignIndex - ascSignIndex) + 1;
    if (house <= 0) house += 12;
    return house;
  };

  const domainData = useMemo(() => {
    // 1. Career: 10th (Career), 2nd (Wealth), 11th (Gains), 6th (Service)
    const careerPoints = getHouseStrength(10); // 10th
    const financePoints = getHouseStrength(2); // 2nd
    const gainsPoints = getHouseStrength(11); // 11th
    
    // 2. Relationships: 7th (Partnership), 5th (Romance), 4th (Domestic)
    const partnerPoints = getHouseStrength(7); // 7th
    const romancePoints = getHouseStrength(5); // 5th
    const homePoints = getHouseStrength(4); // 4th

    // 3. Health: 1st (Vitality), 6th (Disease), 8th (Longevity), 12th (Recovery)
    const vitalityPoints = getHouseStrength(1); // 1st
    const diseasePoints = getHouseStrength(6); // 6th 
    const recoveryPoints = getHouseStrength(12); // 12th
    
    // 4. Spiritual: 9th (Dharma), 12th (Moksha), 8th (Transformation)
    const dharmaPoints = getHouseStrength(9); // 9th
    const mokshaPoints = getHouseStrength(12); // 12th
    const occultPoints = getHouseStrength(8); // 8th
    
    const scores = {
      career: {
        momentum: calculateScore(careerPoints),
        financial: calculateScore(financePoints),
        gains: calculateScore(gainsPoints),
      },
      relationships: {
        romantic: calculateScore(romancePoints),
        partnership: calculateScore(partnerPoints),
        family: calculateScore(homePoints),
      },
      health: {
        vitality: calculateScore(vitalityPoints),
        resistance: calculateScore(diseasePoints), // Note: High SAV in 6th is good for fighting disease
        recovery: calculateScore(recoveryPoints),
      },
      spiritual: {
        dharma: calculateScore(dharmaPoints),
        moksha: calculateScore(mokshaPoints),
        transformation: calculateScore(occultPoints),
      }
    };

    // Helper to generate rich insights
    const getRichInsight = (
      label: string, 
      points: number, 
      highText: string, 
      midText: string, 
      lowText: string
    ) => {
      // SAV Thresholds: 30+ Strong, 25-29 Average, <25 Weak
      if (points >= 30) {
        return {
          title: `Strong ${label}`,
          score: points,
          type: 'positive',
          description: `High strength (${points} pts) indicates excellent support. ${highText}`
        };
      } else if (points >= 25) {
        return {
          title: `Stable ${label}`,
          score: points,
          type: 'neutral',
          description: `Moderate strength (${points} pts) offers steady results. ${midText}`
        };
      } else {
        return {
          title: `Weak ${label}`,
          score: points,
          type: 'negative',
          description: `Low strength (${points} pts) suggests challenges. ${lowText}`
        };
      }
    };

    // Filter relevant transits per domain
    const getDomainTransits = (targetHouses: number[], karakas: string[]) => {
      if (!dailyData?.transits) return [];
      return dailyData.transits.filter(t => {
        const house = getTransitHouse(t.zodiac_sign);
        return targetHouses.includes(house) || karakas.includes(t.name);
      }).map(t => ({
        ...t,
        house: getTransitHouse(t.zodiac_sign),
        isKaraka: karakas.includes(t.name)
      }));
    };

    return {
      career: {
        scores: scores.career,
        verdict: scores.career.momentum > 60 ? "Growth Phase" : scores.career.momentum > 40 ? "Steady Phase" : "Consolidation Phase",
        insights: [
          getRichInsight(
            "Career House (10th)", 
            careerPoints,
            "Expect recognition from authority and success in undertakings. Great day for ambitious moves.",
            "Work life proceeds smoothly. Stick to your routine and maintain steady performance.",
            "You may face resistance or lack of recognition. Avoid confrontations with superiors today."
          ),
          getRichInsight(
            "Wealth House (2nd)", 
            financePoints,
            "Financial inflows look promising. Good time for planning investments or discussing salary.",
            "Finances are stable. Focus on saving and avoid unnecessary expenditures.",
            "Watch your spending. Unexpected expenses or cash flow delays are possible."
          ),
          scores.career.gains > 60 
            ? { title: "High Gains (11th)", score: gainsPoints, type: 'positive', description: "Your network and social circles are supportive. Profits and wish fulfillment are highlighted." }
            : { title: "Modest Gains (11th)", score: gainsPoints, type: 'neutral', description: "Gains may be slow. Focus on long-term value rather than quick rewards." }
        ],
        transits: getDomainTransits([10, 2, 11, 6], ['Saturn', 'Sun', 'Jupiter', 'Mercury'])
      },
      relationships: {
        scores: scores.relationships,
        verdict: scores.relationships.partnership > 60 ? "Harmonious" : "Requires Patience",
        insights: [
          getRichInsight(
            "Partnership (7th)", 
            partnerPoints,
            "Relationships bloom with harmony. Excellent for dates, proposals, or resolving old conflicts.",
            "Relationships are functional but may lack spark. Good for practical discussions.",
            "Misunderstandings likely with partners. Practice patience and avoid heated arguments."
          ),
          getRichInsight(
            "Romance (5th)", 
            romancePoints,
            "Creativity and romance are high. Express your feelings or engage in creative hobbies.",
            "Romantic life is average. Focus on shared activities rather than emotional depth today.",
            "Emotional distance possible. Don't force connections; give space if needed."
          ),
          scores.relationships.family > 50 
            ? { title: "Domestic Bliss (4th)", score: homePoints, type: 'positive', description: "Home environment is peaceful and rejuvenating. Spend time with family." }
            : { title: "Domestic Needs (4th)", score: homePoints, type: 'neutral', description: "Home life demands attention. Address household matters calmly." }
        ],
        transits: getDomainTransits([7, 5, 4], ['Venus', 'Jupiter', 'Mars'])
      },
      health: {
        scores: scores.health,
        verdict: scores.health.vitality > 60 ? "High Vitality" : "Rest Required",
        insights: [
          getRichInsight(
            "Vitality (1st)", 
            vitalityPoints,
            "Energy levels are high. You feel confident and physically capable. Great for exercise.",
            "Physical energy is moderate. Pace yourself and avoid overexertion.",
            "You may feel lethargic or sensitive. Prioritize rest and self-care today."
          ),
          scores.health.resistance > 50 
            ? { title: "Strong Immunity (6th)", score: diseasePoints, type: 'positive', description: "Your body fights off stress well. Good day to tackle difficult tasks." }
            : { title: "Lower Immunity (6th)", score: diseasePoints, type: 'neutral', description: "Susceptibility to stress is higher. Avoid conflicts and unhealthy food." },
          scores.health.recovery > 40 
            ? { title: "Fast Recovery (12th)", score: recoveryPoints, type: 'positive', description: "Sleep and relaxation will be very effective today." }
            : { title: "Needs Rest (12th)", score: recoveryPoints, type: 'neutral', description: "Recovery might be slow. Ensure you get 8 hours of sleep." }
        ],
        transits: getDomainTransits([1, 6, 8, 12], ['Sun', 'Moon', 'Mars'])
      },
      spiritual: {
        scores: scores.spiritual,
        verdict: scores.spiritual.dharma > 60 ? "Deeply Connected" : "Introspective",
        insights: [
          getRichInsight(
            "Dharma (9th)", 
            dharmaPoints,
            "Divine grace supports you. Excellent for meditation, learning, or visiting sacred places.",
            "Faith is steady. Good for routine spiritual practices or reading.",
            "You may feel disconnected. Try to find meaning in small, daily actions."
          ),
          getRichInsight(
            "Moksha (12th)", 
            mokshaPoints,
            "Intuition is strong. Dreams may be vivid and insightful. Practice solitude.",
            "Inner world is quiet. A good time for reflection but maybe not breakthroughs.",
            "Mind may be restless. Avoid overthinking; ground yourself in the present."
          ),
          scores.spiritual.transformation > 50 
            ? { title: "Transformation (8th)", score: occultPoints, type: 'positive', description: "Deep psychological insights are possible. Embrace change." }
            : { title: "Stability (8th)", score: occultPoints, type: 'neutral', description: "No major upheavals. Focus on emotional stability." }
        ],
        transits: getDomainTransits([9, 12, 8, 4], ['Jupiter', 'Ketu', 'Saturn'])
      }
    };
  }, [dailyData, chartData]);

  if (!dailyData) return null;

  const currentDomain = domainData[activeTab];

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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-serif text-white">{
                    activeTab === 'career' ? 'Professional Trajectory' :
                    activeTab === 'relationships' ? 'Relationship Dynamics' :
                    activeTab === 'health' ? 'Health & Wellness' : 'Spiritual Path'
                  }</h3>
                  <div className="group relative">
                    <Info className="w-5 h-5 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 text-xs text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                        Scores based on your Natal Ashtakvarga (Inherent Strength) combined with Daily Planetary Influences.
                    </div>
                  </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                currentDomain.verdict.includes('High') || currentDomain.verdict.includes('Good') || currentDomain.verdict.includes('Growth') || currentDomain.verdict.includes('Harmonious') || currentDomain.verdict.includes('Connected')
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
              }`}>
                <TrendingUp className="w-4 h-4" />
                Current Phase: {currentDomain.verdict}
              </div>
            </div>

            {/* Score Cards */}
            <div className="flex flex-wrap gap-4">
               {Object.entries(currentDomain.scores).map(([key, score]) => {
                 const style = getScoreLabel(score);
                 return (
                   <div key={key} className="text-right bg-black/20 px-4 py-2 rounded-lg border border-white/5">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{key}</div>
                      <div className={`font-bold text-lg ${style.color}`}>
                        {score}% <span className="text-xs opacity-70 font-normal">({style.label})</span>
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Insights */}
            <div className="space-y-6">
               <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                 <Star className="w-4 h-4 text-amber-400" /> Key Insights
               </h4>
               <ul className="space-y-4">
                 {currentDomain.insights.map((insight: any, i: number) => (
                   <li key={i} className={`flex flex-col gap-2 p-4 rounded-xl border transition-colors ${
                     insight.type === 'positive' ? 'bg-emerald-500/10 border-emerald-500/20' :
                     insight.type === 'neutral' ? 'bg-blue-500/10 border-blue-500/20' :
                     'bg-rose-500/10 border-rose-500/20'
                   }`}>
                      <div className="flex items-center gap-2">
                        {insight.type === 'positive' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> :
                         insight.type === 'neutral' ? <Info className="w-5 h-5 text-blue-400" /> :
                         <AlertTriangle className="w-5 h-5 text-rose-400" />}
                        <span className={`font-bold text-sm ${
                          insight.type === 'positive' ? 'text-emerald-200' :
                          insight.type === 'neutral' ? 'text-blue-200' :
                          'text-rose-200'
                        }`}>{insight.title} <span className="opacity-70 text-xs">({insight.score} pts)</span></span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed pl-7">
                        {insight.description}
                      </p>
                   </li>
                 ))}
               </ul>

               {/* Dasha Context (if applicable) */}
               {dashaData?.current?.current_mahadasha && (
                 <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                   <div className="flex items-center gap-2 mb-2 text-indigo-300 font-medium text-sm">
                     <Info className="w-4 h-4" /> Dasha Influence
                   </div>
                   <p className="text-xs text-indigo-200/80 leading-relaxed">
                     You are currently in the <strong>{dashaData.current.current_mahadasha.planet}</strong> period. 
                     Check if {dashaData.current.current_mahadasha.planet} is favorable for {activeTab}.
                   </p>
                 </div>
               )}
            </div>

            {/* Right Column: Planetary Influences */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Planetary Influences
              </h4>
              
              <div className="space-y-3">
                {currentDomain.transits.length > 0 ? (
                  currentDomain.transits.map((t, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all p-4">
                       <div className="flex items-start justify-between">
                         <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                             ${t.isKaraka ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'}
                           `}>
                             {t.name.slice(0, 2)}
                           </div>
                           <div>
                             <div className="font-medium text-white flex items-center gap-2">
                               {t.name}
                               {t.is_retrograde && <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">R</span>}
                             </div>
                             <div className="text-xs text-slate-400">
                               in {t.zodiac_sign} • {t.nakshatra}
                             </div>
                           </div>
                         </div>
                         {t.house > 0 && (
                           <div className="text-right">
                             <div className="text-xs font-bold text-slate-300 bg-white/10 px-2 py-1 rounded">
                               {t.house}th House
                             </div>
                           </div>
                         )}
                       </div>
                       
                       {/* Contextual Tag */}
                       <div className="mt-3 flex flex-wrap gap-2">
                         {t.house > 0 && [1, 4, 7, 10].includes(t.house) && (
                           <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Kendra (Strong)</span>
                         )}
                         {t.house > 0 && [1, 5, 9].includes(t.house) && (
                           <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">Trikona (Lucky)</span>
                         )}
                         {t.house > 0 && [6, 8, 12].includes(t.house) && (
                           <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">Dusthana (Challenge)</span>
                         )}
                         {t.isKaraka && (
                           <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">Domain Karaka</span>
                         )}
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm bg-white/5 rounded-xl border border-white/5 border-dashed">
                    No major planetary movements directly impacting this domain's primary houses right now.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeDomains;
