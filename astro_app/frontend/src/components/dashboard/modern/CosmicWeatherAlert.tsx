import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, CloudSun, Wind } from 'lucide-react';
import { DailyAnalysis } from '../../../types/periodAnalysis';

interface CosmicWeatherAlertProps {
    data?: DailyAnalysis;
}

const CosmicWeatherAlert: React.FC<CosmicWeatherAlertProps> = ({ data }) => {
  if (!data) return null;

  const { score, type, recommendation, best, caution, influences } = data;
  
  // Normalize score to 0-5 scale if it's 0-100
  const normalizedScore = score > 10 ? (score / 20) : score;
  const scoreLabel = normalizedScore >= 4 ? 'Excellent' : normalizedScore >= 3 ? 'Good' : normalizedScore >= 2 ? 'Moderate' : 'Challenging';
  const colorClass = normalizedScore >= 4 ? 'emerald' : normalizedScore >= 3 ? 'indigo' : normalizedScore >= 2 ? 'amber' : 'rose';

  return (
    <div className={`bg-gradient-to-r from-${colorClass}-900/40 to-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden group`}>
        {/* Animated Background Elements */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-${colorClass}-500/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse`}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl -ml-16 -mb-16"></div>

        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 relative z-10">
            {/* Main Alert Status */}
            <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 bg-${colorClass}-500/20 rounded-xl text-${colorClass}-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0`}>
                    <CloudSun className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-xl font-serif text-white flex items-center gap-2 flex-wrap">
                        Cosmic Weather Alert
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${colorClass}-500/20 text-${colorClass}-300 border border-${colorClass}-500/30 font-sans font-bold uppercase tracking-wider`}>
                            {type || scoreLabel}
                        </span>
                    </h2>
                    <p className="text-slate-300 mt-2 font-medium leading-relaxed max-w-2xl">{recommendation || "Navigate your day with awareness."}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                        <Wind className="w-3 h-3" />
                        <span>Vibration: {normalizedScore.toFixed(1)}/5 ({scoreLabel})</span>
                    </div>
                </div>
            </div>

            {/* Actionable Advice Grid */}
            <div className="w-full lg:w-72 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 shrink-0">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                        <CheckCircle2 className="w-3 h-3" /> Excellent For
                    </div>
                    <p className="text-emerald-100 text-sm leading-relaxed">{best || "Routine activities, planning"}</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                        <AlertTriangle className="w-3 h-3" /> Be Mindful
                    </div>
                    <p className="text-amber-100 text-sm leading-relaxed">{caution || "Impulsive decisions, arguments"}</p>
                </div>

                {influences && influences.length > 0 && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
                        <XCircle className="w-3 h-3" /> Influences
                    </div>
                    <div className="flex flex-col gap-1">
                        {influences.map((inf, i) => (
                            <span key={i} className="text-indigo-100 text-xs font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/10 w-fit">
                                {inf}
                            </span>
                        ))}
                    </div>
                </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CosmicWeatherAlert;
