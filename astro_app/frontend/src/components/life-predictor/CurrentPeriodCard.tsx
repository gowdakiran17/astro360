import React from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';

interface CurrentPeriodProps {
    data: {
        date: string;
        score: number;
        phase: string;
        description: string;
        guidance: {
            do: string[];
            avoid: string[];
        };
    };
}

const CurrentPeriodCard: React.FC<CurrentPeriodProps> = ({ data }) => {
    const getPhaseDisplay = () => {
        if (data.phase === 'good') {
            return {
                emoji: '🟢',
                label: 'Favorable Period',
                color: 'text-green-600 dark:text-green-400',
                bg: 'bg-green-50 dark:bg-green-950/30',
                border: 'border-green-200 dark:border-green-800'
            };
        } else if (data.phase === 'challenging') {
            return {
                emoji: '🔴',
                label: 'Challenging Period',
                color: 'text-red-600 dark:text-red-400',
                bg: 'bg-red-50 dark:bg-red-950/30',
                border: 'border-red-200 dark:border-red-800'
            };
        } else {
            return {
                emoji: '🟡',
                label: 'Mixed Period',
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-50 dark:bg-amber-950/30',
                border: 'border-amber-200 dark:border-amber-800'
            };
        }
    };

    const getTrendIcon = () => {
        if (data.score >= 70) return TrendingUp;
        if (data.score < 40) return TrendingDown;
        return Minus;
    };

    const display = getPhaseDisplay();
    const TrendIcon = getTrendIcon();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Current Period
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {data.date}
                    </p>
                </div>
            </div>

            {/* Phase Status */}
            <div className={`${display.bg} ${display.border} border rounded-xl p-4 mb-4`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{display.emoji}</span>
                        <div>
                            <p className={`text-lg font-bold ${display.color}`}>
                                {display.label}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Life Score: {data.score}/100
                            </p>
                        </div>
                    </div>
                    <TrendIcon className={`w-6 h-6 ${display.color}`} />
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
                    <div
                        className={`h-3 rounded-full transition-all ${data.phase === 'good'
                                ? 'bg-green-500'
                                : data.phase === 'challenging'
                                    ? 'bg-red-500'
                                    : 'bg-amber-500'
                            }`}
                        style={{ width: `${data.score}%` }}
                    ></div>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                    {data.description}
                </p>
            </div>

            {/* Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* What to Do */}
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-bold text-green-900 dark:text-green-300">
                            What Helps Now
                        </h4>
                    </div>
                    <ul className="space-y-1.5">
                        {data.guidance.do.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                                <span className="text-slate-700 dark:text-slate-300">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* What to Avoid */}
                <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h4 className="font-bold text-red-900 dark:text-red-300">
                            Avoid for Now
                        </h4>
                    </div>
                    <ul className="space-y-1.5">
                        {data.guidance.avoid.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                                <span className="text-slate-700 dark:text-slate-300">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CurrentPeriodCard;
