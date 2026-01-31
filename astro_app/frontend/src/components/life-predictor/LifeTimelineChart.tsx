import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TimelineDataPoint {
    date: string;
    score: number;
    phase: 'good' | 'mixed' | 'challenging';
    description: string;
}

interface LifeTimelineChartProps {
    data: TimelineDataPoint[];
    loading?: boolean;
}

const LifeTimelineChart: React.FC<LifeTimelineChartProps> = ({ data, loading = false }) => {
    // Get phase color
    const getPhaseColor = (score: number): string => {
        if (score >= 70) return '#10b981'; // Green
        if (score >= 40) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    // Get gradient ID based on score
    const getGradientId = (score: number): string => {
        if (score >= 70) return 'colorGood';
        if (score >= 40) return 'colorMixed';
        return 'colorChallenging';
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const phaseEmoji = data.score >= 70 ? '🟢' : data.score >= 40 ? '🟠' : '🔴';
            const phaseText = data.score >= 70 ? 'Supportive' : data.score >= 40 ? 'Mixed' : 'Challenging';

            return (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{phaseEmoji}</span>
                        <span className="text-white font-semibold">{phaseText} Phase</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-1">{data.date}</p>
                    <p className="text-white text-sm mb-2">Life Score: {data.score}/100</p>
                    <p className="text-slate-300 text-xs">{data.description}</p>
                </div>
            );
        }
        return null;
    };

    // Get current phase summary
    const getCurrentPhase = () => {
        if (data.length === 0) return null;

        // Find current date or closest
        const now = new Date();
        const currentPoint = data.find(d => new Date(d.date) >= now) || data[data.length - 1];

        return {
            score: currentPoint.score,
            phase: currentPoint.phase,
            emoji: currentPoint.score >= 70 ? '🟢' : currentPoint.score >= 40 ? '🟠' : '🔴',
            text: currentPoint.score >= 70 ? 'Supportive' : currentPoint.score >= 40 ? 'Mixed' : 'Challenging',
            trend: currentPoint.score >= 60 ? 'up' : currentPoint.score >= 40 ? 'stable' : 'down'
        };
    };

    const currentPhase = getCurrentPhase();

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-600 dark:text-slate-400">Loading your life timeline...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Life Trend Over Time
                    </h2>
                    {currentPhase && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <span className="text-2xl">{currentPhase.emoji}</span>
                            <div>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Current Phase</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {currentPhase.text}
                                </p>
                            </div>
                            {currentPhase.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                            {currentPhase.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                            {currentPhase.trend === 'stable' && <Minus className="w-5 h-5 text-amber-500" />}
                        </div>
                    )}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Powered by VedAstro Life Predictor
                </p>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorGood" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorMixed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorChallenging" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.getFullYear().toString();
                        }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        domain={[0, 100]}
                        label={{ value: 'Life Score', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'High', fill: '#10b981', fontSize: 10 }} />
                    <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Mixed', fill: '#f59e0b', fontSize: 10 }} />

                    {/* Dynamic area based on score */}
                    {data.map((point, index) => {
                        if (index === data.length - 1) return null;
                        const nextPoint = data[index + 1];
                        const segmentData = [point, nextPoint];
                        const avgScore = (point.score + nextPoint.score) / 2;

                        return (
                            <Area
                                key={index}
                                data={segmentData}
                                type="monotone"
                                dataKey="score"
                                stroke={getPhaseColor(avgScore)}
                                strokeWidth={3}
                                fill={`url(#${getGradientId(avgScore)})`}
                            />
                        );
                    })}
                </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700 dark:text-slate-300">Supportive (70+)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                    <span className="text-slate-700 dark:text-slate-300">Mixed (40-70)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-slate-700 dark:text-slate-300">Challenging (&lt;40)</span>
                </div>
            </div>
        </div>
    );
};

export default LifeTimelineChart;
