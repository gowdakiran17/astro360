import React from 'react';
import { TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ScoreFactor {
    name: string;
    value: string;
    impact: 'positive' | 'negative' | 'neutral';
}

interface PeriodScoreData {
    score: number;
    trend: { date: string; score: number }[];
    factors: ScoreFactor[];
}

interface PeriodScoreCardProps {
    data: PeriodScoreData;
}

const PeriodScoreCard: React.FC<PeriodScoreCardProps> = ({ data }) => {
    // Determine score color
    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-600';
        if (score >= 50) return 'text-indigo-600';
        if (score >= 30) return 'text-amber-600';
        return 'text-red-600';
    };

    const scoreColor = getScoreColor(data.score);

    // Calculate Trend Direction (simple logic)
    const trendDirection = data.trend.length >= 2 
        ? data.trend[data.trend.length - 1].score - data.trend[0].score 
        : 0;

    // Simple trend line graph using SVG
    const renderTrendGraph = () => {
        if (!data.trend || data.trend.length === 0) return null;

        const width = 120;
        const height = 40;
        const maxScore = 100;
        const minScore = 0;

        // Calculate points
        const points = data.trend.map((point, index) => {
            const x = (index / (data.trend.length - 1)) * width;
            const y = height - ((point.score - minScore) / (maxScore - minScore)) * height;
            return `${x},${y}`;
        }).join(' ');

        // Create fill area
        const fillPoints = `${points} ${width},${height} 0,${height}`;

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={`M ${fillPoints}`}
                    fill="url(#trendGradient)"
                    className="text-indigo-500"
                />
                <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                    className="text-indigo-500"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {data.trend.map((point, index) => {
                    const x = (index / (data.trend.length - 1)) * width;
                    const y = height - ((point.score - minScore) / (maxScore - minScore)) * height;
                    // Only show first and last point dots
                    if (index === 0 || index === data.trend.length - 1) {
                        return (
                            <circle key={index} cx={x} cy={y} r="2.5" className="fill-white stroke-indigo-500" strokeWidth="1.5" />
                        );
                    }
                    return null;
                })}
            </svg>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Period Score</h3>
                        <p className="text-xs text-slate-500 mt-1">Overall astrological strength</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                        <Activity className="w-5 h-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    {/* Circular Score (Simulated with CSS) */}
                    <div className="relative">
                        <div className={`text-5xl font-black ${scoreColor} tracking-tighter`}>
                            {data.score}
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Out of 100</div>
                    </div>

                    {/* Trend Mini Widget */}
                    <div className="text-right">
                        <div className={`flex items-center justify-end text-sm font-bold ${trendDirection >= 0 ? 'text-green-600' : 'text-red-600'} mb-1`}>
                            {trendDirection >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                            {Math.abs(trendDirection)}%
                        </div>
                        <div className="text-xs text-slate-400">vs last period</div>
                    </div>
                </div>

                {/* Factors List */}
                <div className="space-y-3 mb-6">
                    {data.factors.map((factor, i) => (
                        <div key={i} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-slate-600 font-medium">{factor.name}</span>
                            <div className="flex items-center">
                                <span className="font-bold text-slate-800 mr-2.5">{factor.value}</span>
                                <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${
                                    factor.impact === 'positive' ? 'bg-green-500' :
                                    factor.impact === 'negative' ? 'bg-red-500' :
                                    'bg-slate-300'
                                }`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Trend Graph Area */}
            <div className="bg-slate-50 border-t border-slate-100 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1.5" />
                        7-Day Trend
                    </h4>
                </div>
                <div className="h-12 w-full">
                    {renderTrendGraph()}
                </div>
            </div>
        </div>
    );
};

export default PeriodScoreCard;
