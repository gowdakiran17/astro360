import { useNavigate } from 'react-router-dom';
import { Briefcase, Heart, Activity, ArrowRight, Sparkles } from 'lucide-react';
import { DailyAnalysis, StrengthData } from '../../types/periodAnalysis';

interface DailyInsightsProps {
  dailyData?: DailyAnalysis;
  strengthData?: StrengthData;
}

const DailyInsights = ({ dailyData, strengthData }: DailyInsightsProps) => {
  const navigate = useNavigate();

  // Helper to get insight text based on score
  const getInsight = (score: number, area: string) => {
    if (score >= 30) return `Exceptional energy for ${area} today. Take bold actions.`;
    if (score >= 25) return `Favorable conditions for ${area}. Steady progress indicated.`;
    return `Exercise caution in ${area} matters. Stick to routine.`;
  };

  // Map House Strengths (SAV) to Areas
  // H10 = Career, H7 = Love, H1/H6 = Health
  const sav = dailyData?.house_strengths?.sav || [];
  const careerScore = sav[9] || 25; // 10th House (idx 9)
  const loveScore = sav[6] || 25;   // 7th House (idx 6)
  const healthScore = sav[0] || 25; // 1st House (idx 0) - or 6th

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Daily Insights</h3>
              <p className="text-sm text-slate-500">
                {dailyData ? `Forecast for ${new Date(dailyData.date).toLocaleDateString()}` : "Personalized predictions"}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/period-analysis')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/btn"
          >
            View Full Report
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Career (10th House) */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className="flex items-center justify-between gap-2 text-emerald-600 font-bold uppercase tracking-wider text-xs">
              <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Career & Money</div>
              <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">{careerScore} pts</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
              {getInsight(careerScore, "career")}
            </p>
          </div>

          {/* Love (7th House) */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className="flex items-center justify-between gap-2 text-rose-500 font-bold uppercase tracking-wider text-xs">
              <div className="flex items-center gap-2"><Heart className="w-4 h-4" /> Love & Relations</div>
              <span className="text-[10px] bg-rose-100 px-1.5 py-0.5 rounded">{loveScore} pts</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
              {getInsight(loveScore, "relationship")}
              <span className="block mt-1 text-xs text-rose-400 italic">{dailyData?.lucky_factors?.color ? `Wear ${dailyData.lucky_factors.color} for luck.` : ''}</span>
            </p>
          </div>

          {/* Health (1st House) */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className="flex items-center justify-between gap-2 text-amber-500 font-bold uppercase tracking-wider text-xs">
              <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Vitality & Health</div>
              <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">{healthScore} pts</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
              {getInsight(healthScore, "health")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyInsights;
