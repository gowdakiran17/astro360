import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useChart } from '../../context/ChartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CheckCircle2, XCircle, HelpCircle, Briefcase, Heart, Plane, Home, DollarSign, GraduationCap, Trophy } from 'lucide-react';

const KPEventPotential: React.FC = () => {
    const { currentProfile } = useChart();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!currentProfile) return;

        setIsLoading(true);
        setError(null);

        const formatDate = (dateStr: string) => {
            if (dateStr.includes('-')) {
                const [y, m, d] = dateStr.split('-');
                return `${d}/${m}/${y}`;
            }
            return dateStr;
        };

        const payload = {
            date: formatDate(currentProfile.date),
            time: currentProfile.time,
            latitude: currentProfile.latitude,
            longitude: currentProfile.longitude,
            timezone: currentProfile.timezone
        };

        try {
            const response = await api.post('kp/event-potential', { birth_details: payload });
            setData(response.data);
        } catch (err: any) {
            console.error("Error fetching event potential:", err);
            setError("Failed to load event potential data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [currentProfile]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;
    if (error) return <div className="p-8 text-center text-red-400 bg-red-900/20 rounded-xl border border-red-900/50 m-6">{error}</div>;
    if (!data) return null;

    const events = [
        { id: 'job_promotion', label: 'Job Promotion', icon: Briefcase, color: 'text-blue-400' },
        { id: 'marriage', label: 'Marriage Potential', icon: Heart, color: 'text-rose-400' },
        { id: 'foreign_travel', label: 'Foreign Travel', icon: Plane, color: 'text-emerald-400' },
        { id: 'property_purchase', label: 'Property / Home', icon: Home, color: 'text-amber-400' },
        { id: 'financial_windfall', label: 'Financial Gain', icon: DollarSign, color: 'text-indigo-400' },
        { id: 'higher_education', label: 'Higher Education', icon: GraduationCap, color: 'text-violet-400' },
        { id: 'public_fame', label: 'Public Fame', icon: Trophy, color: 'text-amber-500' },
    ];

    const getStatusIcon = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'yes' || s === 'excellent' || s === 'very good') return <CheckCircle2 className="w-8 h-8 text-emerald-500" />;
        if (s === 'no' || s === 'weak') return <XCircle className="w-8 h-8 text-rose-500" />;
        return <HelpCircle className="w-8 h-8 text-amber-500" />;
    };

    const getStatusText = (status: string) => {
        if (!status) return 'Analyzing...';
        return status;
    };

    const getStatusBg = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'yes' || s === 'excellent' || s === 'very good') return 'bg-emerald-500/10 border-emerald-500/20';
        if (s === 'no' || s === 'weak') return 'bg-rose-500/10 border-rose-500/20';
        return 'bg-amber-500/10 border-amber-500/20';
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-white/10 shadow-2xl">
                <h1 className="text-3xl font-bold text-white mb-2">Event Potential Analyzer</h1>
                <p className="text-slate-400 max-w-2xl">
                    Instantly check the promise of major life events in your birth chart using KP rules and house significations.
                </p>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => {
                    const status = data.potentials[event.id] || (data.event_analysis && data.event_analysis[event.id]) || 'Mixed';
                    const Icon = event.icon;

                    return (
                        <div key={event.id} className={`p-6 rounded-2xl border transition-all hover:shadow-xl duration-300 flex flex-col justify-between ${getStatusBg(status)}`}>
                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${event.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                {getStatusIcon(status)}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">{event.label}</h3>
                                <p className={`text-2xl font-black uppercase tracking-tight ${status.toLowerCase() === 'yes' ? 'text-emerald-400' :
                                        status.toLowerCase() === 'no' ? 'text-rose-400' : 'text-amber-400'
                                    }`}>
                                    {getStatusText(status)}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5">
                                <button className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                                    View House Combination
                                    <HelpCircle className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Note */}
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <p className="text-sm text-slate-400 leading-relaxed">
                    <strong className="text-emerald-400">KP Methodology:</strong> For an event to take place, the Sub Lord of the relevant house (e.g., 7th for marriage, 10th for career) must signify the primary and supporting houses for that event. "YES" indicates a strong promise in the natal chart.
                </p>
            </div>
        </div>
    );
};

export default KPEventPotential;
