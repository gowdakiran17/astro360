import React from 'react';

interface HeroSectionProps {
  name: string;
  dayRating: number; // 1-5
  scores: {
    career: 'Favorable' | 'Neutral' | 'Sensitive';
    money: 'Favorable' | 'Neutral' | 'Sensitive';
    relationships: 'Favorable' | 'Neutral' | 'Sensitive';
  };
}

const HeroSection: React.FC<HeroSectionProps> = ({ name, dayRating, scores }) => {
  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Favorable': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Neutral': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Sensitive': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
      switch (status) {
          case 'Favorable': return '🟢';
          case 'Neutral': return '🟡';
          case 'Sensitive': return '🔴';
          default: return '⚪';
      }
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <div className="relative z-10">
        <h1 className="text-3xl font-display font-bold text-slate-900">Good Morning, {name} 👋</h1>
        <p className="text-slate-600 mt-2 text-lg">
          Today is generally a <span className="font-bold text-slate-900">{dayRating >= 4 ? 'STRONG' : dayRating >= 3 ? 'MODERATE' : 'CHALLENGING'}</span> day for you {getRatingStars(dayRating)}
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${getStatusColor(scores.career)}`}>
             <span>{getStatusIcon(scores.career)}</span> Career: {scores.career}
          </div>
          <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${getStatusColor(scores.money)}`}>
              <span>{getStatusIcon(scores.money)}</span> Money: {scores.money}
          </div>
          <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${getStatusColor(scores.relationships)}`}>
              <span>{getStatusIcon(scores.relationships)}</span> Relationships: {scores.relationships}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
