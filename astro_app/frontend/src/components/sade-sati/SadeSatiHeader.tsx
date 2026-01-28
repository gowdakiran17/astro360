import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface SadeSatiHeaderProps {
    status: 'active' | 'approaching' | 'completed';
    phase: 'rising' | 'peak' | 'setting';
    startDate: string;
    endDate: string;
    progress: number; // 0-100
    daysRemaining: number;
}

const SadeSatiHeader: React.FC<SadeSatiHeaderProps> = ({
    status,
    phase,
    startDate,
    endDate,
    progress,
    daysRemaining
}) => {
    const getStatusColor = () => {
        switch (phase) {
            case 'peak': return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'rising': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
            case 'setting': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            default: return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
        }
    };

    const getPhaseLabel = () => {
        switch (phase) {
            case 'rising': return 'Phase 1: Rising (12th House)';
            case 'peak': return 'Phase 2: Peak (Over Moon)';
            case 'setting': return 'Phase 3: Setting (2nd House)';
            default: return 'Unknown Phase';
        }
    };

    const colorClass = getStatusColor();

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${colorClass}`}>
                            {status === 'active' ? 'Currently Active' : status}
                        </span>
                        <span className="text-slate-400 text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {daysRemaining} days remaining
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Sade Sati Analysis
                    </h1>
                    <p className="text-slate-300 text-lg">
                        Navigating Saturn's 7.5 Year Transformative Transit
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[140px]">
                        <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Started
                        </div>
                        <div className="text-white font-mono font-medium">{startDate}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[140px]">
                        <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Ends
                        </div>
                        <div className="text-white font-mono font-medium">{endDate}</div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-white font-medium">{getPhaseLabel()}</span>
                    <span className="text-indigo-300 font-bold">{progress}% Complete</span>
                </div>
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative">
                    {/* Background segments for phases */}
                    <div className="absolute inset-0 flex opacity-30">
                        <div className="w-1/3 h-full bg-orange-500/20 border-r border-slate-900" title="Rising" />
                        <div className="w-1/3 h-full bg-red-500/20 border-r border-slate-900" title="Peak" />
                        <div className="w-1/3 h-full bg-yellow-500/20" title="Setting" />
                    </div>
                    
                    {/* Active Progress */}
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400 rounded-full transition-all duration-1000 relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-full bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 px-1">
                    <span>Rising (2.5y)</span>
                    <span className="text-center">Peak (2.5y)</span>
                    <span className="text-right">Setting (2.5y)</span>
                </div>
            </div>
        </div>
    );
};

export default SadeSatiHeader;
