import React from 'react';
import { Heart, Briefcase, Coins, Brain, Home } from 'lucide-react';

interface LifeScoresProps {
  scores: {
    love: number;
    career: number;
    money: number;
    health: number;
    home: number;
  };
}

const LifeScores: React.FC<LifeScoresProps> = ({ scores }) => {
  const items = [
    { label: 'Love', score: scores.love, icon: Heart, color: 'text-pink-500', barColor: 'bg-pink-500' },
    { label: 'Career', score: scores.career, icon: Briefcase, color: 'text-indigo-500', barColor: 'bg-indigo-500' },
    { label: 'Money', score: scores.money, icon: Coins, color: 'text-amber-500', barColor: 'bg-amber-500' },
    { label: 'Health', score: scores.health, icon: Brain, color: 'text-emerald-500', barColor: 'bg-emerald-500' },
    { label: 'Home/Vastu', score: scores.home, icon: Home, color: 'text-orange-500', barColor: 'bg-orange-500' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-full">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Daily Life Scores</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-lg ${item.color.replace('text-', 'bg-').replace('500', '50')} ${item.color} flex items-center justify-center`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-sm font-bold text-slate-900">{item.score}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.barColor} transition-all duration-1000`} 
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LifeScores;
