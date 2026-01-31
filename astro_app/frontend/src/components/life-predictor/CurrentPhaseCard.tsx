import React from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CurrentPhaseData {
    quality: 'supportive' | 'mixed' | 'challenging';
    energyLevel: number; // 0-100
    signal: string;
    dateRange: {
        start: string;
        end: string;
    };
    trend: 'improving' | 'stable' | 'declining';
}

interface CurrentPhaseCardProps {
    data: CurrentPhaseData;
}

const CurrentPhaseCard: React.FC<CurrentPhaseCardProps> = ({ data }) => {
    // Get quality display
    const getQualityDisplay = () => {
        switch (data.quality) {
            case 'supportive':
                return { emoji: '🟢', text: 'Supportive', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' };
            case 'mixed':
                return { emoji: '🟠', text: 'Mixed', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
            case 'challenging':
                return { emoji: '🔴', text: 'Challenging', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
        }
    };

    // Get trend display
    const getTrendDisplay = () => {
        switch (data.trend) {
            case 'improving':
                return { icon: TrendingUp, text: '→ Improving', color: 'text-green-500' };
            case 'stable':
                return { icon: Minus, text: '→ Stable', color: 'text-amber-500' };
            case 'declining':
                return { icon: TrendingDown, text: '→ Declining', color: 'text-red-500' };
        }
    };

    const quality = getQualityDisplay();
    const trend = getTrendDisplay();
    const TrendIcon = trend.icon;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Current Life Phase
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{data.dateRange.start} – {data.dateRange.end}</span>
                </div>
            </div>

            {/* Phase Quality */}
            <div className={`${quality.bg} ${quality.border} border rounded-xl p-4 mb-4`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{quality.emoji}</span>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Phase Quality</p>
                            <p className={`text-lg font-bold ${quality.color}`}>
                                {quality.text}
                            </p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 ${trend.color} text-sm font-medium`}>
                        <TrendIcon className="w-4 h-4" />
                        <span>{trend.text}</span>
                    </div>
                </div>
            </div>

            {/* Energy Level */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Energy Level
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {data.energyLevel}%
                    </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${data.energyLevel >= 70
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : data.energyLevel >= 40
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                                    : 'bg-gradient-to-r from-red-500 to-orange-500'
                            }`}
                        style={{ width: `${data.energyLevel}%` }}
                    ></div>
                </div>
            </div>

            {/* VedAstro Signal */}
            <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    VedAstro Signal
                </p>
                <p className="text-sm text-slate-900 dark:text-white leading-relaxed">
                    "{data.signal}"
                </p>
            </div>
        </div>
    );
};

export default CurrentPhaseCard;
