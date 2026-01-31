import React from 'react';
import { motion } from 'framer-motion';

interface Moment {
    time: string;
    score: number;
    label: string;
    bird_state: string;
    bird_label: string;
    hora: string;
}

interface CosmicTimelineProps {
    moments: Moment[];
    isLoading?: boolean;
}

export const CosmicTimeline: React.FC<CosmicTimelineProps> = ({ moments, isLoading }) => {
    if (isLoading) {
        return <div className="h-64 bg-slate-900/50 animate-pulse rounded-xl border border-slate-800" />;
    }

    if (!moments || moments.length === 0) return null;

    const maxScore = Math.max(...moments.map(m => m.score), 1);
    const minScore = Math.min(...moments.map(m => m.score), -1);
    const range = maxScore - minScore || 1;

    const getScoreColor = (label: string) => {
        switch (label) {
            case 'Golden': return 'bg-yellow-400';
            case 'Productive': return 'bg-emerald-400';
            case 'Silence': return 'bg-red-400';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Cosmic Timeline (24h)</h3>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <span className="text-slate-400">Golden</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-slate-400">Productive</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-slate-400">Silence</span>
                    </div>
                </div>
            </div>

            <div className="relative h-48 flex items-end gap-1 px-2">
                {/* Horizontal Baseline (Score 0) */}
                <div
                    className="absolute left-0 right-0 border-t border-slate-700/50 pointer-events-none"
                    style={{ bottom: `${((0 - minScore) / range) * 100}%` }}
                />

                {moments.map((moment, idx) => {
                    const heightPercent = ((moment.score - minScore) / range) * 100;
                    return (
                        <div key={idx} className="flex-1 group relative h-full flex items-end">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(5, heightPercent)}%` }}
                                className={`w-full rounded-t-sm transition-opacity group-hover:opacity-100 opacity-70 ${getScoreColor(moment.label)}`}
                            />

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                                <div className="text-xs font-bold text-white mb-1">{moment.time}</div>
                                <div className={`text-[10px] font-bold uppercase mb-1 ${getScoreColor(moment.label).replace('bg-', 'text-')}`}>
                                    {moment.label}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    Bird: {moment.bird_label}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    Hora: {moment.hora}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between mt-4 text-[10px] text-slate-500 px-1">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>11 PM</span>
            </div>
        </div>
    );
};
