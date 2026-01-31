import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { DashboardOverviewResponse } from '../../../types/periodAnalysis';

import { DailyCalendarData } from '../InteractiveCalendar';

interface TimelineTabProps {
    data: DashboardOverviewResponse;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    dailyData?: Record<string, DailyCalendarData>;
}

const TimelineTab = ({ data }: TimelineTabProps) => {
    const { full_timeline } = data.dasha_info;
    const { vimsopaka } = data.strength_analysis;
    const currentMD = data.dasha_info.current.current_mahadasha;

    // Prepare Data for Chart
    const chartData: { year: number; strength: number; lord: string; date: string; periodRange: string }[] = [];

    full_timeline.forEach((period: any) => {
        const lord = period.lord;
        const strength = vimsopaka[lord] || 10; // Default if missing
        const startYear = parseInt(period.start_date.split('-')[2]);
        // const endYear = parseInt(period.end_date.split('-')[2]);

        chartData.push({
            year: startYear,
            strength: strength,
            lord: lord,
            date: period.start_date,
            periodRange: `${period.start_date} - ${period.end_date}`
        });
    });

    // Sort by year
    chartData.sort((a, b) => a.year - b.year);

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="text-white font-bold mb-1">{d.lord} Mahadasha</p>
                    <p className="text-xs text-slate-400 mb-2">{d.periodRange}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                        <span className="text-slate-300 text-sm">Strength: {d.strength.toFixed(1)}/20</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white">Life Strength Timeline</h2>
                        <p className="text-sm text-slate-400">Vimsopaka Bala strength of Dasha Lords over time</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-1 bg-indigo-500/50"></div> High Strength ({'>'}15)
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-1 bg-indigo-500/20"></div> Avg Strength (10-15)
                        </span>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                dataKey="year"
                                stroke="#64748b"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 20]}
                                stroke="#64748b"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickLine={false}
                                label={{ value: 'Strength', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="strength"
                                stroke="#818cf8"
                                fillOpacity={1}
                                fill="url(#colorStrength)"
                                strokeWidth={2}
                            />
                            {/* Highlight current year */}
                            <ReferenceLine x={new Date().getFullYear()} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'top', value: 'Now', fill: '#f43f5e', fontSize: 12 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <h3 className="text-white font-medium mb-2">Interpretation</h3>
                    <p className="text-sm text-slate-400">
                        Peaks in the graph indicate periods of high planetary strength where you may experience greater success, vitality, and support. Valleys suggest times where more effort is required.
                    </p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <h3 className="text-white font-medium mb-2">Current Trend</h3>
                    <p className="text-sm text-slate-400">
                        You are currently in the <strong>{typeof currentMD === 'string' ? currentMD : currentMD?.lord}</strong> Mahadasha.
                        Strength: <strong>{vimsopaka[typeof currentMD === 'string' ? currentMD : currentMD?.lord] || 'N/A'}/20</strong>.
                        {(vimsopaka[typeof currentMD === 'string' ? currentMD : currentMD?.lord] || 0) > 13 ? " This is a powerful period for you." : " Steady effort is key during this phase."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TimelineTab;
