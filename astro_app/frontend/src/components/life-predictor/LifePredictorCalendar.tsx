import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LifePredictorCalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    smartSummary: Record<string, 'good' | 'bad' | 'mixed' | 'neutral'>;
    isLoading?: boolean;
}

export const LifePredictorCalendar: React.FC<LifePredictorCalendarProps> = ({
    selectedDate,
    onSelectDate,
    smartSummary,
    isLoading = false
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        onSelectDate(today);
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white tracking-wide">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-full hover:bg-purple-500/20 transition-colors"
                    >
                        Today
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 mb-4">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, dayIdx) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const status = smartSummary[dateKey];
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isDayToday = isToday(day);

                    return (
                        <motion.button
                            key={day.toString()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelectDate(day)}
                            className={`
                relative h-14 md:h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200
                ${!isCurrentMonth ? 'opacity-30 blur-[0.5px]' : 'opacity-100'}
                ${isSelected
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900 z-10'
                                    : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                                }
                ${isDayToday && !isSelected ? 'ring-1 ring-purple-500/50 bg-purple-500/10' : ''}
              `}
                        >
                            <span className={`text-sm font-mark ${isSelected ? 'font-bold' : 'font-medium'}`}>
                                {format(day, 'd')}
                            </span>

                            {/* Status Indicator */}
                            {isCurrentMonth && status && (
                                <div className="flex gap-0.5">
                                    {status === 'good' && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                    )}
                                    {status === 'bad' && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]" />
                                    )}
                                    {status === 'mixed' && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                                    )}
                                    {status === 'neutral' && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                    )}
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-800/50 pt-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                    <span>Favorable</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
                    <span>Mixed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.4)]" />
                    <span>Challenging</span>
                </div>
            </div>
        </div>
    );
};
