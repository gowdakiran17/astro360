import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

interface Muhurta {
    name: string;
    type: string;
    quality: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
}

interface MuhurtaTimelineProps {
    muhuratas: Muhurta[];
}

const MuhurtaTimeline = ({ muhuratas = [] }: MuhurtaTimelineProps) => {
    // Filter and sort muhuratas
    const timelineItems = [...muhuratas]
        .sort((a, b) => {
            // Simple string compare for HH:MM format works for same day
            return a.start_time.localeCompare(b.start_time);
        });

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'Excellent': return 'bg-emerald-500 text-emerald-100';
            case 'Good': return 'bg-blue-500 text-blue-100';
            case 'Average': return 'bg-yellow-500 text-yellow-100';
            case 'Poor': return 'bg-amber-500 text-amber-100';
            case 'Bad':
            case 'Avoid': return 'bg-rose-500 text-rose-100';
            default: return 'bg-slate-700 text-slate-300';
        }
    };

    const getBarColor = (quality: string) => {
        switch (quality) {
            case 'Excellent': return 'bg-emerald-500';
            case 'Good': return 'bg-blue-500';
            case 'Average': return 'bg-yellow-500';
            case 'Poor': return 'bg-amber-500';
            case 'Bad':
            case 'Avoid': return 'bg-rose-500';
            default: return 'bg-slate-700';
        }
    };

    return (
        <div className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white font-display">Muhurta Timeline</h3>
                        <p className="text-xs text-slate-400"> auspicious timings breakdown</p>
                    </div>
                </div>
            </div>

            <div className="relative pl-4 border-l border-slate-700/50 space-y-6">
                {timelineItems.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 italic">
                        No specific muhuratas calculated for this day.
                    </div>
                ) : (
                    timelineItems.map((item, index) => (
                        <div key={index} className="relative group">
                            {/* Dot on timeline */}
                            <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-900 ${getBarColor(item.quality)}`}></div>

                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 hover:bg-slate-800/60 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate-200">{item.name}</span>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getQualityColor(item.quality)} bg-opacity-20`}>
                                        {item.quality}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="font-mono bg-slate-900/50 px-1.5 py-0.5 rounded">{item.start_time}</span>
                                    <ArrowRight className="w-3 h-3 text-slate-600" />
                                    <span className="font-mono bg-slate-900/50 px-1.5 py-0.5 rounded">{item.end_time}</span>
                                    <span className="text-slate-600 ml-2">• {item.type}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MuhurtaTimeline;
