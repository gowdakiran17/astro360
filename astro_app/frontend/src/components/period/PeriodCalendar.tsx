import React from 'react';
import { ChevronLeft, ChevronRight, Crown, Coins, Moon } from 'lucide-react';

interface DayData {
    date: string;
    score: number;
    type: 'favorable' | 'unfavorable' | 'mixed' | 'neutral';
    day_lord: string;
    influences: string[];
    special_icons?: string[]; // 'crown', 'coin', 'moon'
}

interface PeriodCalendarProps {
    data: DayData[];
    currentDate: Date;
    onMonthChange: (direction: 'prev' | 'next') => void;
    onSelectDay: (day: DayData) => void;
    selectedDay?: DayData;
}

const PeriodCalendar: React.FC<PeriodCalendarProps> = ({
    data,
    currentDate,
    onMonthChange,
    onSelectDay,
    selectedDay
}) => {
    // Helper to get days in month
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate); // 0 = Sun, 1 = Mon...

    // Create calendar grid
    const renderCalendarDays = () => {
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 sm:h-28 bg-transparent" />);
        }

        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            // Find data for this day
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayData = data.find(d => d.date === dateStr);
            const isSelected = selectedDay?.date === dateStr;

            // Determine styles based on type
            let bgClass = 'bg-slate-100'; // Default
            
            if (dayData) {
                if (dayData.type === 'favorable') {
                    bgClass = 'bg-[#86efac]'; // Pastel Green
                } else if (dayData.type === 'unfavorable') {
                    bgClass = 'bg-[#fca5a5]'; // Pastel Red
                } else if (dayData.type === 'mixed') {
                    bgClass = 'bg-[#fcd34d]'; // Pastel Yellow
                }
            }

            // Icons Logic
            const hasCrown = dayData?.special_icons?.includes('crown');
            const hasCoin = dayData?.special_icons?.includes('coin');
            const hasMoon = dayData?.special_icons?.includes('moon');

            days.push(
                <div
                    key={i}
                    onClick={() => dayData && onSelectDay(dayData)}
                    className={`h-24 sm:h-28 flex flex-col items-center justify-center relative cursor-pointer group`}
                >
                    {/* Main Circle Container */}
                    <div className={`
                        w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center relative
                        shadow-sm transition-transform hover:scale-105
                        ${bgClass}
                        ${isSelected ? 'ring-4 ring-indigo-200 z-10 scale-110' : ''}
                    `}>
                        <span className={`text-lg font-bold text-slate-900`}>
                            {i}
                        </span>

                        {/* Floating Icons */}
                        {hasCrown && (
                            <div className="absolute -top-3 -left-1 bg-white rounded-full p-0.5 shadow-sm border border-amber-100">
                                <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                            </div>
                        )}
                        
                        {hasCoin && (
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow-sm border border-emerald-100">
                                <Coins className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                            </div>
                        )}

                        {hasMoon && (
                            <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm border border-indigo-100">
                                <Moon className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-bold text-slate-900">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex space-x-1">
                        <button
                            onClick={() => onMonthChange('prev')}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onMonthChange('next')}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                {/* Simple Legend */}
                <div className="hidden sm:flex items-center space-x-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>
                        Excellent
                    </div>
                    <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-amber-400 mr-2"></div>
                        Mixed
                    </div>
                    <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-rose-400 mr-2"></div>
                        Challenging
                    </div>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {renderCalendarDays()}
            </div>
            
             {/* Mobile Legend (visible only on small screens) */}
             <div className="sm:hidden px-4 py-3 flex justify-between text-xs font-medium text-slate-500 border-t border-slate-100">
                 <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></div>
                    Good
                </div>
                <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></div>
                    Mixed
                </div>
                <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-rose-400 mr-1.5"></div>
                    Hard
                </div>
             </div>
        </div>
    );
};

export default PeriodCalendar;
