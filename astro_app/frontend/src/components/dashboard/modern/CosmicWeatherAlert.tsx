import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, CloudSun, Wind } from 'lucide-react';

const CosmicWeatherAlert = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden group">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -ml-16 -mb-16"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            {/* Main Alert Status */}
            <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <CloudSun className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-xl font-serif text-white flex items-center gap-2">
                        Cosmic Weather Alert
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans font-bold uppercase tracking-wider">Moderate</span>
                    </h2>
                    <p className="text-slate-300 mt-1 font-medium">Mostly Favorable with Evening Caution</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <Wind className="w-3 h-3" />
                        <span>Vibration: 4.2/5 (Supportive)</span>
                    </div>
                </div>
            </div>

            {/* Actionable Advice Grid */}
            <div className="flex-1 w-full md:w-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                        <CheckCircle2 className="w-3 h-3" /> Excellent For
                    </div>
                    <p className="text-emerald-100 text-sm">Learning, mentoring, spiritual practices</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                        <AlertTriangle className="w-3 h-3" /> Be Mindful
                    </div>
                    <p className="text-amber-100 text-sm">Emotional reactions, family discussions</p>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
                        <XCircle className="w-3 h-3" /> Postpone
                    </div>
                    <p className="text-rose-100 text-sm">Major purchases, confrontations</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CosmicWeatherAlert;
