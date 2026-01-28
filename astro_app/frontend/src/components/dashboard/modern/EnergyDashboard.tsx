import React, { useState } from 'react';
import { Zap, Brain, Briefcase, Heart, Wallet, Activity, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface EnergyLevel {
  label: string;
  value: number; // 0-100
  icon: React.ReactNode;
  color: string;
  key: string; // internal key for insights
}

interface EnergyDashboardProps {
  dailyData?: any;
}

const EnergyDashboard: React.FC<EnergyDashboardProps> = ({ dailyData }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Calculate energy levels from house strengths (SAV)
  const sav = dailyData?.house_strengths?.sav || [];

  // Helper to normalize SAV points (0-40 scale) to percentage (0-100)
  // Average SAV is 28. Max usually ~40.
  // We'll map 28 -> 60%, 20 -> 30%, 35 -> 90% roughly.
  // Formula: (value / 35) * 100, capped at 100.
  const normalizeSav = (val: number) => {
    if (!val) return 50; // Default
    return Math.min(100, Math.round((val / 35) * 100));
  };

  const getInsight = (category: string, score: number) => {
    const level = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';
    
    const insights: Record<string, Record<string, { verdict: string, text: string }>> = {
      'Mental Clarity': {
        'High': { verdict: 'Peak Intellect', text: 'Your mind is sharp and creative today. Excellent for learning new subjects, solving complex problems, or strategic planning.' },
        'Medium': { verdict: 'Balanced Focus', text: 'Good mental stability for routine tasks. You can handle details well, but take breaks to avoid fatigue during intense work.' },
        'Low': { verdict: 'Mental Fog', text: 'You might feel scattered or mentally tired. Avoid major decisions today; stick to simple tasks and rest your mind.' }
      },
      'Career Momentum': {
        'High': { verdict: 'Unstoppable', text: 'Professional energy is peaking. A great day to lead meetings, pitch ideas, or ask for what you deserve. Authority figures are favorable.' },
        'Medium': { verdict: 'Steady Progress', text: 'Work flows smoothly if you stick to the plan. Focus on execution rather than starting entirely new ambitious projects.' },
        'Low': { verdict: 'Resistance', text: 'You may face delays or lack of recognition. Keep a low profile, avoid office politics, and focus on clearing your backlog.' }
      },
      'Relationship Flow': {
        'High': { verdict: 'Harmonious', text: 'Social interactions are warm and supportive. Perfect for dates, networking, or resolving past conflicts with loved ones.' },
        'Medium': { verdict: 'Neutral', text: 'Relationships are stable but require effort. Communicate clearly to avoid misunderstandings. Good for casual socialising.' },
        'Low': { verdict: 'Friction', text: 'Misunderstandings are likely. Be patient with partners and avoid reactive emotional responses. Spend some time alone if needed.' }
      },
      'Financial Energy': {
        'High': { verdict: 'Abundance', text: 'Financial intuition is strong. Good opportunities for gain may arise. Ideal for investment planning or business negotiations.' },
        'Medium': { verdict: 'Stable', text: 'Cash flow is normal. A good day to review your budget or pay bills, but nothing extraordinary is expected.' },
        'Low': { verdict: 'Tight', text: 'Watch your expenses. Unexpected costs could pop up, or judgment regarding value might be off. Avoid impulse purchases.' }
      },
      'Physical Vitality': {
        'High': { verdict: 'Peak Performance', text: 'Your body feels robust and energetic. Push yourself in workouts or tackle physically demanding tasks.' },
        'Medium': { verdict: 'Moderate', text: 'Energy is sufficient for daily activities. Maintain a steady pace and don\'t skip meals or sleep.' },
        'Low': { verdict: 'Depleted', text: 'Vitality is low. You may be prone to fatigue. Prioritize rest, hydration, and gentle activities over intense exertion.' }
      }
    };

    return insights[category]?.[level] || { verdict: 'Unknown', text: 'No data available.' };
  };

  // Map houses to life areas:
  // H10 (idx 9) = Career, H2 (idx 1) = Finance, H7 (idx 6) = Relationships
  // H1 (idx 0) = Physical Vitality, H5 (idx 4) = Mental Clarity
  const energyLevels: EnergyLevel[] = [
    {
      label: 'Mental Clarity',
      key: 'Mental Clarity',
      value: normalizeSav(sav[4]), // 5th House
      icon: <Brain className="w-4 h-4" />,
      color: 'from-blue-400 to-cyan-300'
    },
    {
      label: 'Career Momentum',
      key: 'Career Momentum',
      value: normalizeSav(sav[9]), // 10th House
      icon: <Briefcase className="w-4 h-4" />,
      color: 'from-amber-400 to-orange-300'
    },
    {
      label: 'Relationship Flow',
      key: 'Relationship Flow',
      value: normalizeSav(sav[6]), // 7th House
      icon: <Heart className="w-4 h-4" />,
      color: 'from-pink-400 to-rose-300'
    },
    {
      label: 'Financial Energy',
      key: 'Financial Energy',
      value: normalizeSav(sav[1]), // 2nd House
      icon: <Wallet className="w-4 h-4" />,
      color: 'from-emerald-400 to-green-300'
    },
    {
      label: 'Physical Vitality',
      key: 'Physical Vitality',
      value: normalizeSav(sav[0]), // 1st House
      icon: <Activity className="w-4 h-4" />,
      color: 'from-red-400 to-orange-300'
    },
  ];

  // Calculate overall vibration score (average of all SAV values)
  const avgSav = sav.length > 0
    ? (sav.reduce((a: number, b: number) => a + b, 0) / sav.length)
    : 28;
  
  // Normalize avg SAV to 0-5 scale for display
  // 28 avg -> 3.5/5
  const vibrationScore = Math.min(5, (avgSav / 28) * 3.5).toFixed(1);

  const vibrationQuality = avgSav >= 30
    ? 'Supportive & Reflective'
    : avgSav >= 25
      ? 'Moderate & Balanced'
      : 'Cautious & Introspective';

  const toggleExpand = (label: string) => {
    setExpandedItem(expandedItem === label ? null : label);
  };

  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600 dark:text-yellow-400 dark:fill-yellow-400/20" />
            Daily Cosmic Alignment
          </h3>
          <p className="text-xs text-slate-600 dark:text-indigo-200 mt-1">
            Today's Vibration: <span className="text-indigo-700 dark:text-white font-medium">{vibrationQuality}</span> ({vibrationScore}/5)
          </p>
        </div>
        <div className="group relative">
            <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-help" />
            <div className="absolute right-0 w-60 p-3 bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 mt-2 shadow-xl">
                Scores based on your personal transit strength (Ashtakvarga). High scores indicate ease and support; low scores suggest effort is needed.
            </div>
        </div>
      </div>

      <div className="space-y-4">
        {energyLevels.map((level, idx) => {
          const insight = getInsight(level.key, level.value);
          const isExpanded = expandedItem === level.key;
          
          return (
          <div key={idx} 
               className={`group relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/5 transition-all duration-300 ${
                 isExpanded 
                   ? 'bg-slate-50 dark:bg-white/10 shadow-lg shadow-black/5 dark:shadow-black/20' 
                   : 'bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.07]'
               }`}
               onClick={() => toggleExpand(level.key)}
          >
            {/* Background Gradient Effect for high energy items */}
            {level.value >= 80 && (
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${level.color} opacity-10 dark:opacity-[0.03] blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none`} />
            )}

            <div className="p-4">
                <div className="flex justify-between items-center mb-3 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white dark:bg-black/20 ring-1 ring-slate-200 dark:ring-white/10 ${level.color.split(' ')[1].replace('to-', 'text-')}`}>
                        {level.icon}
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {level.label}
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm ${
                        level.value >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 dark:shadow-emerald-900/20' :
                        level.value >= 60 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 dark:shadow-indigo-900/20' :
                        'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 dark:shadow-rose-900/20'
                    }`}>
                        {insight.verdict}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{Math.round(level.value)}%</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
                </div>
                
                <div className="h-2 w-full bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden border border-slate-100 dark:border-white/5 mb-3 relative">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${level.color} shadow-[0_0_12px_rgba(255,255,255,0.3)] relative z-10 transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, Math.max(0, level.value))}%` }}
                >
                    {/* Shimmer effect on the bar */}
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -skew-x-12 translate-x-[-100%]" style={{ animationName: 'shimmer' }}></div>
                </div>
                </div>

                {/* Description Text - Smooth Expand/Collapse */}
                <div 
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                >
                    <div className="overflow-hidden">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-3 border-t border-slate-200 dark:border-white/5 mt-3">
                            {insight.text}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default EnergyDashboard;
