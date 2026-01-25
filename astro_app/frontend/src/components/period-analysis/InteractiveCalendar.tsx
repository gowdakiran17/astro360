import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Crown, Sparkles, Moon, Coins } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';

export interface DailyCalendarData {
    score: number;
    events?: any[];
    quality?: string;
}

interface InteractiveCalendarProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
    dailyData?: Record<string, DailyCalendarData>;
}

const InteractiveCalendar = ({ currentDate, onDateSelect, dailyData = {} }: InteractiveCalendarProps) => {
    const [viewDate, setViewDate] = React.useState(currentDate);

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(viewDate),
        end: endOfMonth(viewDate),
    });

    // Calculate stats for the view
    const monthStats = useMemo(() => {
        let bestDay = { date: '', score: 0 };
        Object.entries(dailyData).forEach(([date, data]) => {
            if (data.score > bestDay.score && isSameMonth(new Date(date), viewDate)) {
                bestDay = { date, score: data.score };
            }
        });
        return { bestDay };
    }, [dailyData, viewDate]);

    const startDay = getDay(startOfMonth(viewDate)); // 0 = Sunday
    const emptyDays = Array(startDay).fill(null);

    const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
    const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));



    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/50';
        if (score >= 60) return 'bg-lime-500/20 text-lime-300 ring-1 ring-lime-500/50';
        if (score >= 40) return 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/50';
        return 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/50';
    };

    const getEventIcon = (events: any[] = [], isBestDay: boolean) => {
        if (isBestDay) return <Crown className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />;

        // Check for specific keywords in event names
        const eventNames = events.map(e => (e.name || '').toLowerCase()).join(' ');

        if (eventNames.includes('finance') || eventNames.includes('wealth') || eventNames.includes('money')) {
            return <Coins className="w-3 h-3 text-yellow-400 fill-yellow-400" />;
        }
        if (eventNames.includes('moon') || eventNames.includes('purnima') || eventNames.includes('amavasya')) {
            return <Moon className="w-3 h-3 text-indigo-300 fill-indigo-300" />;
        }
        if (events.length > 0) {
            return <Sparkles className="w-3 h-3 text-purple-400" />;
        }
        return null;
    };

    return (
        <div className="glass-card p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white text-lg font-display">
                    {format(viewDate, 'MMMM yyyy')}
                </h3>
                <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-4 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{d}</span>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-4 gap-x-2 flex-1 place-items-center">
                {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}

                {daysInMonth.map((date) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const dayData = dailyData[dateKey];
                    const score = dayData?.score;
                    const events = dayData?.events || [];

                    const isSelected = isSameDay(date, currentDate);
                    const isToday = isSameDay(date, new Date());
                    const isBestDay = dateKey === monthStats.bestDay.date;
                    const isCurrentMonth = isSameMonth(date, viewDate);

                    return (
                        <div key={dateKey} className="relative group w-full flex justify-center">
                            <button
                                onClick={() => {
                                    onDateSelect(date);
                                    if (!isCurrentMonth) setViewDate(date);
                                }}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center relative transition-all duration-300
                                    ${isSelected
                                        ? 'bg-indigo-600 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 z-10 scale-110 text-white font-bold'
                                        : score !== undefined
                                            ? getScoreBg(score)
                                            : 'hover:bg-slate-700/50 bg-transparent text-slate-400'}
                                    ${!isCurrentMonth ? 'opacity-30 grayscale' : ''}
                                `}
                            >
                                <span className={`text-xs ${isToday && !isSelected ? 'font-bold underline underline-offset-4 decoration-indigo-500' : ''}`}>
                                    {format(date, 'd')}
                                </span>

                                {/* Floating Icon (Crown/Coin etc) */}
                                {(isBestDay || events.length > 0) && !isSelected && (
                                    <div className="absolute -top-1.5 -right-1.5 bg-slate-900 rounded-full p-0.5 shadow-sm border border-slate-700">
                                        {getEventIcon(events, isBestDay)}
                                    </div>
                                )}
                            </button>

                            {/* Rich Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] p-3 bg-slate-900/95 backdrop-blur-md text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 shadow-2xl border border-slate-700/50 translate-y-2 group-hover:translate-y-0">
                                {score !== undefined ? (
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between border-b border-slate-700/50 pb-1.5 mb-0.5">
                                            <span className="font-bold text-slate-200">{format(date, 'MMM d, yyyy')}</span>
                                            <span className={`font-bold text-xs ${score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-rose-400'}`}>
                                                Score: {score}
                                            </span>
                                        </div>

                                        {isBestDay && (
                                            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 p-1 rounded-lg border border-amber-500/20">
                                                <Crown className="w-3 h-3" />
                                                <span className="font-bold">Crown Day (Best)</span>
                                            </div>
                                        )}

                                        {events.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {events.slice(0, 3).map((e: any, i: number) => (
                                                    <div key={i} className="flex items-start gap-1.5 text-slate-300">
                                                        <div className="min-w-[4px] h-[4px] rounded-full bg-indigo-400 mt-1.5"></div>
                                                        <span>{e.name}</span>
                                                    </div>
                                                ))}
                                                {events.length > 3 && <span className="text-slate-500 pl-2">+{events.length - 3} more</span>}
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 italic">No major events</span>
                                        )}
                                    </div>
                                ) : 'Click to Analyze'}
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95"></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Enhanced Legend */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-6 text-[10px] text-slate-400 border-t border-slate-800/50 pt-4">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/50"></div>
                    <span>Excellent (&gt;80)</span>
                </div>
                <div className="flex items-center gap-2">
                    <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Crown Day</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-lime-500/20 ring-1 ring-lime-500/50"></div>
                    <span>Good (60-80)</span>
                </div>
                <div className="flex items-center gap-2">
                    <Coins className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>Prosperity</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 ring-1 ring-yellow-500/50"></div>
                    <span>Average (40-60)</span>
                </div>
                <div className="flex items-center gap-2">
                    <Moon className="w-3 h-3 text-indigo-300 fill-indigo-300" />
                    <span>Moon Phase</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 ring-1 ring-rose-500/50"></div>
                    <span>Caution (&lt;40)</span>
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Special Event</span>
                </div>
            </div>
        </div>
    );
};

export default InteractiveCalendar;
