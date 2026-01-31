import React from 'react';
import { Clock, Sparkles } from 'lucide-react';

interface UpcomingEvent {
    name: string;
    description: string;
    start_date: string;
    strength: number;
}

interface UpcomingEventsProps {
    events: UpcomingEvent[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
    const getStrengthColor = (strength: number) => {
        if (strength >= 70) return 'text-green-600 dark:text-green-400';
        if (strength >= 40) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Upcoming Events
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Significant predictions ahead
                    </p>
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-3">
                {events.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No significant events detected in the near future
                    </div>
                ) : (
                    events.map((event, index) => (
                        <div
                            key={index}
                            className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                                        {event.name}
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {event.description}
                                    </p>
                                </div>
                                <div className={`text-sm font-bold ${getStrengthColor(event.strength)}`}>
                                    {event.strength}%
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(event.start_date)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UpcomingEvents;
