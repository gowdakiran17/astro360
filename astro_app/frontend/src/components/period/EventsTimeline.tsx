import React, { useState } from 'react';
import { Calendar, ChevronDown, AlertCircle, Star, Moon, Sun } from 'lucide-react';

interface Event {
    date: string;
    type: string;
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral' | 'challenging' | 'favorable';
}

interface EventsTimelineProps {
    events: Event[];
}

const EventsTimeline: React.FC<EventsTimelineProps> = ({ events }) => {
    const [expanded, setExpanded] = useState<number[]>([]);

    const toggleExpand = (index: number) => {
        if (expanded.includes(index)) {
            setExpanded(expanded.filter(i => i !== index));
        } else {
            setExpanded([...expanded, index]);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'full_moon': return <Moon className="w-4 h-4 text-indigo-500" />;
            case 'new_moon': return <Moon className="w-4 h-4 text-slate-800" />;
            case 'retrograde': return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case 'eclipse': return <Sun className="w-4 h-4 text-red-500" />;
            default: return <Star className="w-4 h-4 text-slate-500" />;
        }
    };

    if (events.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-slate-500">
                No significant events for this period.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                    Events Timeline
                </h3>
                <span className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-500 font-medium">
                    {events.length} Events
                </span>
            </div>

            <div className="p-6 relative">
                {/* Vertical Connector Line */}
                <div className="absolute left-[2.35rem] top-6 bottom-6 w-0.5 bg-slate-100"></div>

                <div className="space-y-6 relative">
                    {events.map((event, index) => (
                        <div key={index} className="relative pl-10 group">
                            {/* Timeline Dot */}
                            <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-white transition-colors
                                ${event.impact === 'favorable' ? 'border-green-500 text-green-500' : 
                                  event.impact === 'challenging' ? 'border-orange-500 text-orange-500' :
                                  event.impact === 'negative' ? 'border-red-500 text-red-500' :
                                  'border-slate-300 text-slate-400'
                                }`}>
                                <div className={`w-2 h-2 rounded-full 
                                    ${event.impact === 'favorable' ? 'bg-green-500' : 
                                      event.impact === 'challenging' ? 'bg-orange-500' :
                                      event.impact === 'negative' ? 'bg-red-500' :
                                      'bg-slate-300'
                                    }`}></div>
                            </div>

                            <div 
                                className={`rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md
                                    ${expanded.includes(index) ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:border-indigo-200'}
                                `}
                                onClick={() => toggleExpand(index)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start">
                                        <div className={`mr-3 mt-0.5 p-1.5 rounded-lg ${
                                            event.impact === 'favorable' ? 'bg-green-100 text-green-600' :
                                            event.impact === 'challenging' ? 'bg-orange-100 text-orange-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {getIcon(event.type)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{event.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wide">{event.date}</p>
                                        </div>
                                    </div>
                                    <button className={`text-slate-400 transition-transform duration-200 ${expanded.includes(index) ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className={`grid transition-all duration-300 ease-in-out ${expanded.includes(index) ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <div className="text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 pt-3">
                                            {event.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventsTimeline;
