import React, { useState, useEffect } from 'react';
import { Pill, Briefcase, FileText, Users, Palette, PenTool, Sprout, Plane, Car, Sun, Loader2 } from 'lucide-react';


interface ActivityListProps {
    date?: Date;
    dayQuality?: string; // 'favorable' | 'unfavorable' | 'mixed'
}

// Activity mapping based on astrological quality
// In a real app, this logic would live in the backend or use a dedicated endpoint
const ACTIVITY_SUGGESTIONS = {
    excellent: [
        { icon: Pill, text: "Start new health treatments", color: "text-blue-600", bg: "bg-blue-50" },
        { icon: Briefcase, text: "Important financial decisions", color: "text-teal-600", bg: "bg-teal-50" },
        { icon: FileText, text: "Apply for jobs / promotions", color: "text-orange-600", bg: "bg-orange-50" },
        { icon: Users, text: "Important meetings & networking", color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: Plane, text: "Start long journeys", color: "text-sky-600", bg: "bg-sky-50" },
    ],
    good: [
        { icon: PenTool, text: "Creative writing & planning", color: "text-blue-600", bg: "bg-blue-50" },
        { icon: Palette, text: "Artistic pursuits & hobbies", color: "text-emerald-600", bg: "bg-emerald-50" },
        { icon: Sprout, text: "Gardening & planting", color: "text-green-600", bg: "bg-green-50" },
        { icon: Car, text: "Vehicle maintenance", color: "text-emerald-600", bg: "bg-emerald-50" },
    ],
    poor: [
        { icon: Sun, text: "Meditation and spiritual practices", color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: FileText, text: "Routine administrative work", color: "text-slate-600", bg: "bg-slate-50" },
        { icon: Users, text: "Spending time with family", color: "text-rose-600", bg: "bg-rose-50" }
    ],
    avoid: [
        { icon: Sun, text: "Rest and introspection", color: "text-slate-600", bg: "bg-slate-100" },
        { icon: Users, text: "Avoid conflicts and arguments", color: "text-red-600", bg: "bg-red-50" }
    ]
};

const ActivityList: React.FC<ActivityListProps> = ({ date = new Date(), dayQuality }) => {
    const [quality, setQuality] = useState<'excellent' | 'good' | 'poor' | 'avoid'>('good');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const determineQuality = async () => {
            setLoading(true);
            
            if (dayQuality) {
                // Map external quality to internal state
                if (dayQuality === 'favorable') setQuality('excellent');
                else if (dayQuality === 'unfavorable') setQuality('avoid');
                else setQuality('good'); // mixed or neutral
                setLoading(false);
                return;
            }

            // Fallback logic if no prop provided
            try {
                // Simulation delay
                await new Promise(r => setTimeout(r, 800));
                
                // Simple heuristic based on date parity for demo
                // In real app: const res = await api.post('panchang/daily-score', { date });
                const day = date.getDate();
                if (day % 3 === 0) setQuality('excellent');
                else if (day % 3 === 1) setQuality('good');
                else setQuality('poor');
            } catch (e) {
                console.error(e);
                setQuality('good');
            } finally {
                setLoading(false);
            }
        };

        determineQuality();
    }, [dayQuality, date]);

    const activities = ACTIVITY_SUGGESTIONS[quality];

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-100 rounded-full relative">
                    <Sun className="w-8 h-8 text-yellow-600" />
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-20"></div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                    {quality === 'excellent' ? 'Today is a great day for' : 
                     quality === 'good' ? 'Today is a good day for' :
                     quality === 'poor' ? 'Today is better suited for' : 'Activities to avoid today'}
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities.map((item, index) => (
                    <div key={index} className={`flex items-center p-4 rounded-xl border border-transparent hover:border-slate-200 transition-all ${item.bg}`}>
                        <div className={`p-2 rounded-lg bg-white/80 mr-4 shadow-sm`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className="font-medium text-slate-700">{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityList;
