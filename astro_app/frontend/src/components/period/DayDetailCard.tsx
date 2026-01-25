import React from 'react';
import { Sun, Moon, Star, ThumbsUp, ThumbsDown, Minus, Info } from 'lucide-react';

interface DayData {
    date: string;
    score: number;
    type: 'favorable' | 'unfavorable' | 'mixed' | 'neutral';
    day_lord: string;
    influences: string[];
}

interface DayDetailCardProps {
    data: DayData;
}

const DayDetailCard: React.FC<DayDetailCardProps> = ({ data }) => {
    const date = new Date(data.date);
    
    // Helper for visual elements based on type
    const getVisuals = (type: string) => {
        switch (type) {
            case 'favorable':
                return {
                    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
                    border: 'border-emerald-100',
                    text: 'text-emerald-800',
                    icon: ThumbsUp,
                    iconColor: 'text-emerald-500',
                    accent: 'bg-emerald-500'
                };
            case 'unfavorable':
                return {
                    bg: 'bg-gradient-to-br from-rose-50 to-red-50',
                    border: 'border-rose-100',
                    text: 'text-rose-800',
                    icon: ThumbsDown,
                    iconColor: 'text-rose-500',
                    accent: 'bg-rose-500'
                };
            case 'mixed':
                return {
                    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
                    border: 'border-amber-100',
                    text: 'text-amber-800',
                    icon: Info,
                    iconColor: 'text-amber-500',
                    accent: 'bg-amber-500'
                };
            default:
                return {
                    bg: 'bg-gradient-to-br from-slate-50 to-gray-50',
                    border: 'border-slate-200',
                    text: 'text-slate-800',
                    icon: Minus,
                    iconColor: 'text-slate-400',
                    accent: 'bg-slate-400'
                };
        }
    };

    const visuals = getVisuals(data.type);
    const StatusIcon = visuals.icon;

    return (
        <div className={`rounded-xl border shadow-sm overflow-hidden transition-all ${visuals.border} ${visuals.bg}`}>
            {/* Header */}
            <div className="p-5 border-b border-white/50 relative">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-sm font-medium opacity-60 uppercase tracking-wider mb-1">
                            {date.toLocaleDateString(undefined, { year: 'numeric' })}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                            {date.toLocaleDateString(undefined, { weekday: 'long' })}
                        </h3>
                        <div className="text-lg text-slate-700">
                            {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                        <div className={`text-3xl font-bold ${visuals.text}`}>
                            {data.score}
                        </div>
                        <div className={`flex items-center text-sm font-medium ${visuals.text} opacity-80 mt-1`}>
                            <StatusIcon className="w-4 h-4 mr-1.5" />
                            <span className="capitalize">{data.type} Day</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* Planetary Influences */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                        <Star className="w-3 h-3 mr-1.5" />
                        Planetary Influences
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/60 rounded-lg p-3 border border-slate-100">
                            <div className="flex items-center mb-1">
                                <Sun className="w-4 h-4 text-orange-400 mr-2" />
                                <span className="text-xs text-slate-500 font-medium">Day Lord</span>
                            </div>
                            <div className="text-sm font-bold text-slate-800 pl-6">
                                {data.day_lord}
                            </div>
                        </div>
                        
                        <div className="bg-white/60 rounded-lg p-3 border border-slate-100">
                            <div className="flex items-center mb-1">
                                <Moon className="w-4 h-4 text-indigo-400 mr-2" />
                                <span className="text-xs text-slate-500 font-medium">Birth Star Lord</span>
                            </div>
                            <div className="text-sm font-bold text-slate-800 pl-6">
                                {data.influences?.[1] || '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insight Text */}
                <div className="bg-white/80 rounded-lg p-4 border border-slate-100 text-sm leading-relaxed text-slate-600">
                    <p>
                        {data.type === 'favorable' && "The planetary energies are aligned in your favor. A good day for important activities and new beginnings."}
                        {data.type === 'unfavorable' && "Cosmic energies suggest caution. It's better to stick to routine tasks and avoid major decisions today."}
                        {data.type === 'mixed' && "A day of mixed results. You may face some obstacles, but they can be overcome with patience."}
                        {data.type === 'neutral' && "A balanced day with no major planetary interference. Good for steady progress."}
                    </p>
                </div>
            </div>
            
            {/* Bottom Bar */}
            <div className={`h-1.5 w-full ${visuals.accent}`}></div>
        </div>
    );
};

export default DayDetailCard;
