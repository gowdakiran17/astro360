import React from 'react';
import { Zap, Brain, Briefcase, Heart, Wallet, Activity } from 'lucide-react';

interface EnergyLevel {
  label: string;
  value: number; // 0-100
  icon: React.ReactNode;
  color: string;
}

interface EnergyDashboardProps {
  dailyData?: any;
}

const EnergyDashboard: React.FC<EnergyDashboardProps> = ({ dailyData }) => {
  // Calculate energy levels from house strengths (SAV)
  const sav = dailyData?.house_strengths?.sav || [];

  // Map houses to life areas:
  // H10 (idx 9) = Career, H2 (idx 1) = Finance, H7 (idx 6) = Relationships
  // H1 (idx 0) = Physical Vitality, H5 (idx 4) = Mental Clarity
  const energyLevels: EnergyLevel[] = [
    {
      label: 'Mental Clarity',
      value: sav[4] || 50, // 5th House
      icon: <Brain className="w-4 h-4" />,
      color: 'from-blue-400 to-cyan-300'
    },
    {
      label: 'Career Momentum',
      value: sav[9] || 50, // 10th House
      icon: <Briefcase className="w-4 h-4" />,
      color: 'from-amber-400 to-orange-300'
    },
    {
      label: 'Relationship Flow',
      value: sav[6] || 50, // 7th House
      icon: <Heart className="w-4 h-4" />,
      color: 'from-pink-400 to-rose-300'
    },
    {
      label: 'Financial Energy',
      value: sav[1] || 50, // 2nd House
      icon: <Wallet className="w-4 h-4" />,
      color: 'from-emerald-400 to-green-300'
    },
    {
      label: 'Physical Vitality',
      value: sav[0] || 50, // 1st House
      icon: <Activity className="w-4 h-4" />,
      color: 'from-red-400 to-orange-300'
    },
  ];

  // Calculate overall vibration score (average of all SAV values)
  const avgScore = sav.length > 0
    ? (sav.reduce((a: number, b: number) => a + b, 0) / sav.length).toFixed(1)
    : '0.0';

  const vibrationQuality = parseFloat(avgScore) >= 30
    ? 'Supportive & Reflective'
    : parseFloat(avgScore) >= 25
      ? 'Moderate & Balanced'
      : 'Cautious & Introspective';

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-lg text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
            Cosmic Alignment
          </h3>
          <p className="text-xs text-indigo-200 mt-1">
            Today's Vibration: <span className="text-white font-medium">{vibrationQuality}</span> ({avgScore}/5)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {energyLevels.map((level, idx) => (
          <div key={idx} className="group">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-slate-300 flex items-center gap-2 group-hover:text-white transition-colors">
                <span className={`p-1 rounded-md bg-white/5 ${level.color.split(' ')[1].replace('to-', 'text-')}`}>
                  {level.icon}
                </span>
                {level.label}
              </span>
              <span className="text-xs font-bold text-slate-400">{Math.round(level.value)}%</span>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${level.color} shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(100, Math.max(0, level.value))}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnergyDashboard;
