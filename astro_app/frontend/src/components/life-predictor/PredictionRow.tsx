import React from 'react';

interface PredictionRowProps {
    name: string;
    description: string;
    category: string;
    dailyStatus: Record<string, string>; // date -> status
    dateRange: { start: string; end: string };
    onHover?: (date: string, prediction: string) => void;
}

const PredictionRow: React.FC<PredictionRowProps> = ({
    name,
    description,
    category,
    dailyStatus,
    dateRange,
    onHover
}) => {
    // Generate array of dates
    const generateDates = () => {
        const dates: string[] = [];
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);

        let current = new Date(start);
        while (current <= end) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }

        return dates;
    };

    const dates = generateDates();

    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'good':
                return 'bg-green-500';
            case 'bad':
                return 'bg-red-500';
            case 'mixed':
                return 'bg-orange-500';
            default:
                return 'bg-white dark:bg-slate-800';
        }
    };

    const getCategoryColor = (cat: string) => {
        const colors: Record<string, string> = {
            'Business': 'text-blue-600',
            'Health': 'text-red-600',
            'Travel': 'text-purple-600',
            'Agriculture': 'text-green-600',
            'Building': 'text-orange-600',
            'Remedies': 'text-indigo-600',
            'Yoga': 'text-pink-600',
            'Dasha': 'text-yellow-600',
            'General': 'text-slate-600',
            'Other': 'text-gray-600'
        };
        return colors[cat] || 'text-slate-600';
    };

    return (
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50">
            {/* Prediction Name (Sticky Left) */}
            <div className="sticky left-0 z-10 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 px-3 py-2 w-64 flex-shrink-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate" title={name}>
                    {name}
                </div>
                <div className={`text-xs ${getCategoryColor(category)}`}>
                    {category}
                </div>
            </div>

            {/* Daily Blocks */}
            <div className="flex">
                {dates.map((date) => {
                    const status = dailyStatus[date];
                    return (
                        <div
                            key={date}
                            className={`w-2 h-8 flex-shrink-0 ${getStatusColor(status)} border-r border-slate-100 dark:border-slate-900 cursor-pointer hover:opacity-80 transition-opacity`}
                            title={`${date}: ${status || 'neutral'}`}
                            onMouseEnter={() => onHover?.(date, name)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default PredictionRow;
