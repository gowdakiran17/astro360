import React from 'react';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface LifeWindow {
    type: 'high' | 'care';
    dateRange: {
        start: string;
        end: string;
    };
    description: string;
}

interface UpcomingWindowsProps {
    windows: LifeWindow[];
}

const UpcomingWindows: React.FC<UpcomingWindowsProps> = ({ windows }) => {
    const getWindowDisplay = (type: string) => {
        if (type === 'high') {
            return {
                emoji: '🟢',
                label: 'High Phase',
                icon: TrendingUp,
                color: 'text-green-500',
                bg: 'bg-green-500/10',
                border: 'border-green-500/30'
            };
        }
        return {
            emoji: '🔴',
            label: 'Care Phase',
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/30'
        };
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Upcoming Life Windows
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Plan ahead with these future phases
                    </p>
                </div>
            </div>

            {/* Windows List */}
            <div className="space-y-4">
                {windows.map((window, index) => {
                    const display = getWindowDisplay(window.type);
                    const Icon = display.icon;

                    return (
                        <div
                            key={index}
                            className={`${display.bg} ${display.border} border rounded-xl p-4 hover:shadow-md transition-all`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${display.bg}`}>
                                    <Icon className={`w-5 h-5 ${display.color}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{display.emoji}</span>
                                        <h4 className={`font-bold ${display.color}`}>
                                            {display.label}
                                        </h4>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                        {window.dateRange.start} – {window.dateRange.end}
                                    </p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        {window.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {windows.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">
                        No significant windows detected in the near future
                    </p>
                </div>
            )}
        </div>
    );
};

export default UpcomingWindows;
