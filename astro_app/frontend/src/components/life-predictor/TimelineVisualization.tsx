import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TimelineData {
    date: string;
    score: number;
    phase: 'good' | 'mixed' | 'challenging';
    predictions: string[];
    description: string;
}

interface TimelineVisualizationProps {
    timeline: TimelineData[];
    smartSummary: Array<{
        year: string;
        score: number;
        phase: string;
    }>;
    currentDate?: string;
}

const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
    timeline,
    smartSummary,
    currentDate
}) => {
    const getPhaseColor = (phase: string, score: number) => {
        if (phase === 'good') {
            const intensity = (score - 70) / 30; // 0-1 range
            return {
                bg: `rgba(16, 185, 129, ${0.6 + intensity * 0.3})`,
                border: 'border-green-500/30',
                text: 'text-green-700 dark:text-green-300'
            };
        } else if (phase === 'challenging') {
            const intensity = (40 - score) / 40; // 0-1 range
            return {
                bg: `rgba(239, 68, 68, ${0.6 + intensity * 0.3})`,
                border: 'border-red-500/30',
                text: 'text-red-700 dark:text-red-300'
            };
        } else {
            return {
                bg: 'rgba(245, 158, 11, 0.7)',
                border: 'border-amber-500/30',
                text: 'text-amber-700 dark:text-amber-300'
            };
        }
    };

    const getTrendIcon = (phase: string) => {
        if (phase === 'good') return TrendingUp;
        if (phase === 'challenging') return TrendingDown;
        return Minus;
    };

    // Group timeline by year
    const groupedByYear = timeline.reduce((acc, period) => {
        const year = period.date.substring(0, 4);
        if (!acc[year]) acc[year] = [];
        acc[year].push(period);
        return acc;
    }, {} as Record<string, TimelineData[]>);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Life Timeline
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Color-coded visualization of your life periods
                </p>
            </div>

            {/* Smart Summary Row */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Smart Summary (Yearly Overview)
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {smartSummary.map((yearData) => {
                        const colors = getPhaseColor(yearData.phase, yearData.score);
                        const Icon = getTrendIcon(yearData.phase);

                        return (
                            <div
                                key={yearData.year}
                                className={`flex-shrink-0 rounded-lg border ${colors.border} p-3 min-w-[100px]`}
                                style={{ backgroundColor: colors.bg }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                                        {yearData.year}
                                    </span>
                                    <Icon className={`w-4 h-4 ${colors.text}`} />
                                </div>
                                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Score: {yearData.score}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Monthly Timeline */}
            <div className="space-y-6">
                {Object.entries(groupedByYear).map(([year, periods]) => (
                    <div key={year} className="space-y-2">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                            {year}
                        </h4>
                        <div className="grid grid-cols-12 gap-1">
                            {periods.map((period) => {
                                const colors = getPhaseColor(period.phase, period.score);
                                const isCurrent = period.date === currentDate;

                                return (
                                    <div
                                        key={period.date}
                                        className={`group relative h-16 rounded border ${colors.border} ${isCurrent ? 'ring-2 ring-indigo-500' : ''
                                            } hover:shadow-lg transition-all cursor-pointer`}
                                        style={{ backgroundColor: colors.bg }}
                                    >
                                        {/* Month Label */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-medium text-slate-900 dark:text-white">
                                                {period.date.substring(5)}
                                            </span>
                                        </div>

                                        {/* Current Indicator */}
                                        {isCurrent && (
                                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                <div className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    Now
                                                </div>
                                            </div>
                                        )}

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                            <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs">
                                                <div className="font-bold mb-1">{period.date}</div>
                                                <div className="mb-2">Score: {period.score}/100</div>
                                                <div className="text-slate-300 mb-2">{period.description}</div>
                                                {period.predictions.length > 0 && (
                                                    <div className="text-slate-400 text-xs">
                                                        {period.predictions.slice(0, 2).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap gap-4 justify-center text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500/70 border border-green-500/30"></div>
                        <span className="text-slate-600 dark:text-slate-400">Good (70+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-amber-500/70 border border-amber-500/30"></div>
                        <span className="text-slate-600 dark:text-slate-400">Mixed (40-69)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500/70 border border-red-500/30"></div>
                        <span className="text-slate-600 dark:text-slate-400">Challenging (&lt;40)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineVisualization;
