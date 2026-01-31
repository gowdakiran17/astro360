import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import api from '../../../services/api';

interface LifeTimelineTabProps {
    data: any;
}

interface TimelinePoint {
    date: string;
    score: number;
    dasha_lord: string;
    transit_summary: string;
}

interface MajorEvent {
    date: string;
    type: string;
    description: string;
}

interface Narrative {
    headline: string;
    body: string;
    element: string;
}

const LifeTimelineTab: React.FC<LifeTimelineTabProps> = ({ data }) => {
    const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
    const [events, setEvents] = useState<MajorEvent[]>([]);
    const [narrative, setNarrative] = useState<Narrative | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLifeTimeline();
    }, []);

    const fetchLifeTimeline = async () => {
        try {
            setLoading(true);
            setError(null);

            const currentYear = new Date().getFullYear();
            const response = await api.post('chart/period/life-timeline', {
                birth_details: {
                    date: data?.birth_details?.date || '01/01/1990',
                    time: data?.birth_details?.time || '12:00',
                    timezone: data?.birth_details?.timezone || '+05:30',
                    latitude: data?.birth_details?.latitude || 12.9716,
                    longitude: data?.birth_details?.longitude || 77.5946,
                    name: data?.birth_details?.name || 'User'
                },
                start_year: currentYear,
                end_year: currentYear + 5
            });

            if (response.data) {
                setTimeline(response.data.life_timeline || []);
                setEvents(response.data.major_events || []);
                setNarrative(response.data.narrative || null);
            }
        } catch (err: any) {
            console.error('Error fetching life timeline:', err);
            setError(err.response?.data?.detail || 'Failed to load timeline');
        } finally {
            setLoading(false);
        }
    };

    const getElementColor = (element: string) => {
        const colors: Record<string, string> = {
            Fire: 'from-red-500 to-orange-500',
            Water: 'from-blue-500 to-cyan-500',
            Earth: 'from-green-500 to-emerald-500',
            Air: 'from-purple-500 to-pink-500'
        };
        return colors[element] || 'from-slate-500 to-slate-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400">Loading your cosmic timeline...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <div>
                        <h3 className="text-red-400 font-semibold">Error Loading Timeline</h3>
                        <p className="text-slate-400 text-sm mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Transform timeline data for chart
    const chartData = timeline.map((point) => ({
        name: point.date.substring(0, 7), // YYYY-MM
        score: point.score,
        dasha: point.dasha_lord
    }));

    return (
        <div className="space-y-6">
            {/* AI Narrative Section */}
            {narrative && (
                <div className={`bg-gradient-to-br ${getElementColor(narrative.element)} p-6 rounded-xl shadow-lg`}>
                    <div className="flex items-start gap-4">
                        <Sparkles className="w-8 h-8 text-white flex-shrink-0 mt-1" />
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{narrative.headline}</h2>
                            <p className="text-white/90 leading-relaxed">{narrative.body}</p>
                            <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                <span className="text-white font-semibold">Element: {narrative.element}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5-Year Timeline Chart */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-indigo-400" />
                        <h3 className="text-xl font-bold text-white">5-Year Life Intensity Timeline</h3>
                    </div>
                    <div className="text-sm text-slate-400">
                        {timeline.length} monthly data points
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8' }}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8' }}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#f1f5f9'
                            }}
                            labelStyle={{ color: '#cbd5e1' }}
                        />
                        <ReferenceLine y={50} stroke="#6366f1" strokeDasharray="3 3" label="Neutral" />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#6366f1"
                            strokeWidth={3}
                            dot={{ fill: '#6366f1', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>

                <div className="mt-4 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-slate-300">High Intensity (65+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-slate-300">Moderate (45-65)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-slate-300">Challenging (&lt;45)</span>
                    </div>
                </div>
            </div>

            {/* Major Events */}
            {events.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-6 h-6 text-indigo-400" />
                        <h3 className="text-xl font-bold text-white">Major Planetary Events</h3>
                    </div>

                    <div className="space-y-3">
                        {events.map((event, index) => (
                            <div
                                key={index}
                                className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-white font-semibold">{event.type}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{event.description}</p>
                                    </div>
                                    <span className="text-indigo-400 text-sm font-medium">{event.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Period Dasha Info */}
            {timeline.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Current Period Ruler</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">{timeline[0].dasha_lord[0]}</span>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-lg">{timeline[0].dasha_lord} Dasha</h4>
                            <p className="text-slate-400 text-sm mt-1">{timeline[0].transit_summary}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LifeTimelineTab;
