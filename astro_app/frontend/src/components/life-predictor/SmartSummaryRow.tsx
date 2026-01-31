import React from 'react';

interface SmartSummaryRowProps {
    smartSummary: Record<string, string>; // date -> status
    dateRange: { start: string; end: string };
}

const SmartSummaryRow: React.FC<SmartSummaryRowProps> = ({ smartSummary, dateRange }) => {
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
            case 'neutral':
                return 'bg-slate-300 dark:bg-slate-600';
            default:
                return 'bg-white dark:bg-slate-800';
        }
    };

    return (
        <div className="sticky bottom-0 z-20 bg-white dark:bg-slate-800 border-t-2 border-indigo-500 shadow-lg">
            <div className="flex items-center">
                {/* Label (Sticky Left) */}
                <div className="sticky left-0 z-10 bg-indigo-600 text-white px-3 py-3 w-64 flex-shrink-0 font-bold text-sm">
                    📊 Smart Summary
                </div>

                {/* Daily Blocks */}
                <div className="flex">
                    {dates.map((date) => {
                        const status = smartSummary[date];
                        return (
                            <div
                                key={date}
                                className={`w-2 h-12 flex-shrink-0 ${getStatusColor(status)} border-r border-white dark:border-slate-900`}
                                title={`${date}: ${status || 'neutral'}`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SmartSummaryRow;
