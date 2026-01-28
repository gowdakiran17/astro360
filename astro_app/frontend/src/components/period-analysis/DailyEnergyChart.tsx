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
import { Clock } from 'lucide-react';
import type { Muhurta } from '../../types/periodAnalysis';

interface DailyEnergyChartProps {
    muhuratas: Muhurta[];
}

const CHOGHADIYA_ADVICE: Record<string, string> = {
    'Amrit': 'Nectar. Best for all auspicious activities and new starts.',
    'Shubh': 'Auspicious. Good for ceremonies, education, and long-term commitments.',
    'Labh': 'Gain. Excellent for business, wealth, and starting ventures.',
    'Chal': 'Fluctuating. Okay for travel, movement, and routine tasks.',
    'Udveg': 'Anxiety. Avoid for major decisions or starting new roles.',
    'Rog': 'Disease. Avoid if possible; focus on health and rest.',
    'Kaal': 'Difficulty. Avoid important work and high-stakes meetings.'
};

interface ChartPoint {
    time: number;
    score: number;
    quality: string;
    name: string;
    startTime: string;
    endTime: string;
    label: string;
}

const DailyEnergyChart = ({ muhuratas }: DailyEnergyChartProps) => {
    const qualityScore: Record<string, number> = {
        'Excellent': 3,
        'Good': 2,
        'Poor': 1,
        'Avoid': 0
    };

    const colorMap: Record<string, string> = {
        'Excellent': '#10b981', // emerald-500
        'Good': '#3b82f6', // blue-500
        'Poor': '#f59e0b', // amber-500
        'Avoid': '#ef4444' // red-500
    };

    const getTimeSortValue = (time: string) => {
        const trimmed = time.trim();
        const parts = trimmed.split(' ');
        const [hourStr, minuteStr] = parts[0]?.split(':') ?? [];
        const hour = Number(hourStr);
        const minute = Number(minuteStr);
        if (Number.isNaN(hour) || Number.isNaN(minute)) {
            return 0;
        }
        const meridiem = parts[1]?.toUpperCase();
        let adjustedHour = hour;
        if (meridiem === 'PM' && adjustedHour < 12) adjustedHour += 12;
        if (meridiem === 'AM' && adjustedHour === 12) adjustedHour = 0;
        return adjustedHour * 60 + minute;
    };

    const sortedPeriods = [...muhuratas]
        .filter(p => p.type === 'Choghadiya')
        .sort((a, b) => getTimeSortValue(a.start_time) - getTimeSortValue(b.start_time));

    const chartData: ChartPoint[] = [];
    let currentHour = 6.0;

    sortedPeriods.forEach((p) => {
        const score = qualityScore[p.quality] || 1;
        const duration = 1.5;

        chartData.push({
            time: currentHour,
            score: score,
            quality: p.quality,
            name: p.name.replace('Day ', '').replace('Night ', ''),
            startTime: p.start_time,
            endTime: p.end_time,
            label: p.start_time
        });

        chartData.push({
            time: currentHour + duration,
            score: score,
            quality: p.quality,
            name: p.name.replace('Day ', '').replace('Night ', ''),
            startTime: p.start_time,
            endTime: p.end_time,
            label: p.end_time
        });

        currentHour += duration;
    });

    function formatDecimalHour(val: number) {
        const h = Math.floor(val) % 24;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hDisp = h === 0 ? 12 : (h > 12 ? h - 12 : h);
        return `${hDisp} ${ampm}`;
    }

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartPoint }> }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            const pureName = d.name;
            return (
                <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl z-50 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold text-lg">{pureName}</span>
                        <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                            style={{ backgroundColor: `${colorMap[d.quality]}22`, color: colorMap[d.quality] }}
                        >
                            {d.quality}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {d.startTime} — {d.endTime}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed italic border-t border-slate-800 pt-2">
                        "{CHOGHADIYA_ADVICE[pureName] || 'Follow standard precautions.'}"
                    </p>
                </div>
            );
        }
        return null;
    };

    // Get highlights (Excellent or Good periods)
    const highlights = sortedPeriods
        .filter(p => p.quality === 'Excellent' || p.quality === 'Good')
        .slice(0, 4); // Show top 4

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">
                            Daily Energy Flow
                        </h3>
                        <p className="text-xs text-slate-500">Choghadiya muhurta analysis for today</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-800/20 p-2 rounded-lg border border-slate-700/50">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Excellent</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Good</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Mixed</span>
                </div>
            </div>

            <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="time"
                            type="number"
                            domain={[6, 30]}
                            tickFormatter={formatDecimalHour}
                            stroke="#64748b"
                            fontSize={10}
                            interval={3}
                        />
                        <YAxis domain={[0, 3.5]} hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1 }} />
                        <Area
                            type="stepAfter"
                            dataKey="score"
                            stroke="#818cf8"
                            fill="url(#energyGradient)"
                            strokeWidth={3}
                            animationDuration={1500}
                        />
                        {/* Shaded blocks for Excellent periods */}
                        {sortedPeriods.map((p, i) => (
                            p.quality === 'Excellent' && (
                                <ReferenceLine
                                    key={i}
                                    segment={[{ x: 6 + (i * 1.5), y: 0 }, { x: 6 + ((i + 1) * 1.5), y: 0 }]}
                                    stroke="transparent"
                                />
                            )
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Highlights List */}
            <div className="mt-8">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-8 h-px bg-slate-700"></span>
                    Power Windows Today
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {highlights.map((p, i) => {
                        const pureName = p.name.replace('Day ', '').replace('Night ', '');
                        const timeParts = p.start_time.split(' ');
                        const timeHour = timeParts[0]?.split(':')[0] || '';
                        const timeMeridiem = timeParts[1] || '';
                        return (
                            <div key={i} className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl hover:bg-slate-800/60 transition-colors group">
                                <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center border ${p.quality === 'Excellent' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                                    <span className={`text-xs font-bold ${p.quality === 'Excellent' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                        {timeHour}
                                    </span>
                                    <span className="text-[8px] text-slate-500 opacity-60 font-medium">
                                        {timeMeridiem}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{pureName}</span>
                                        <span className={`text-[10px] font-bold ${p.quality === 'Excellent' ? 'text-emerald-500' : 'text-blue-500'}`}>
                                            {p.quality}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 line-clamp-1">{CHOGHADIYA_ADVICE[pureName]}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DailyEnergyChart;
