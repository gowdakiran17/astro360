import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useChartSettings } from '../context/ChartContext';
import { astrologyService, SadeSatiResponse } from '../services/astrology';
import { SADE_SATI_CONTENT } from '../utils/sadeSatiContent';
import { 
    Clock, 
    Shield, 
    Zap, 
    Heart, 
    Briefcase, 
    DollarSign, 
    Sparkles, 
    Activity, 
    Calendar,
    AlertCircle,
    Loader2,
    Globe
} from 'lucide-react';
import SadeSatiHeader from '../components/sade-sati/SadeSatiHeader';
import SadeSatiPhases from '../components/sade-sati/SadeSatiPhases';
import SadeSatiImpactMatrix from '../components/sade-sati/SadeSatiImpactMatrix';
import SadeSatiRemedies from '../components/sade-sati/SadeSatiRemedies';
import SadeSatiTimeline from '../components/sade-sati/SadeSatiTimeline';

const SadeSati: React.FC = () => {
    const { currentProfile } = useChartSettings();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SadeSatiResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentProfile) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Ensure we have valid birth details
                const birthDetails = {
                    date: currentProfile.date, // DD/MM/YYYY
                    time: currentProfile.time, // HH:MM
                    timezone: currentProfile.timezone || "Asia/Kolkata",
                    latitude: currentProfile.latitude,
                    longitude: currentProfile.longitude
                };

                const response = await astrologyService.getSadeSati(birthDetails);
                setData(response);
            } catch (err) {
                console.error("Failed to fetch Sade Sati data:", err);
                setError("Failed to load analysis. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentProfile]);

    if (loading) {
        return (
            <MainLayout breadcrumbs={['Tools', 'Sade Sati']}>
                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                </div>
            </MainLayout>
        );
    }

    if (error || !data) {
        return (
            <MainLayout breadcrumbs={['Tools', 'Sade Sati']}>
                <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
                        <p className="text-slate-400">{error || "No data available"}</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // Transform API data for components
    const currentPhaseId = data.is_in_sade_sati 
        ? (data.phase.toLowerCase().includes('rising') ? 'rising' : 
           data.phase.toLowerCase().includes('peak') ? 'peak' : 'setting')
        : 'setting'; // Default or handle "not active"

    // Map phases to component props
    const phaseMapping = {
        'Rising': 'Rising Phase',
        'Peak': 'Peak Phase',
        'Setting': 'Setting Phase'
    };

    const formattedPhases = data.phases.map(p => {
        const contentKey = phaseMapping[p.phase as keyof typeof phaseMapping] as keyof typeof SADE_SATI_CONTENT.phases;
        const content: any = SADE_SATI_CONTENT.phases[contentKey] || {};
        
        let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
        if (p.is_current) status = 'current';
        // Simple date check for completed if not current? 
        // For now rely on is_current, and assume previous are completed.
        // Actually, we can infer order: Rising -> Peak -> Setting.
        if (!p.is_current) {
            if (p.phase === 'Rising' && (data.phase.includes('Peak') || data.phase.includes('Setting'))) status = 'completed';
            if (p.phase === 'Peak' && data.phase.includes('Setting')) status = 'completed';
        }

        return {
            id: p.phase.toLowerCase() as any,
            name: p.phase,
            dates: `${p.start} - ${p.end}`,
            status,
            intensity: p.phase === 'Peak' ? 5 : 3, // Default intensities
            themes: [content.meaning?.split('.')[0] || 'Transformation', content.purpose || 'Growth'], // Extract themes
            advice: content.advice || content.meaning || ''
        };
    });

    // Calculate days remaining
    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        // Handle DD/MM/YYYY format
        if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return new Date(`${year}-${month}-${day}`);
        }
        return new Date(dateStr);
    };

    const daysRemaining = data.end_date ? Math.max(0, Math.ceil((parseDate(data.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
    
    // Calculate progress (simplified)
    const totalDays = 7.5 * 365;
    const progress = Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100));

    // Map impacts
    const impactData = Object.entries(SADE_SATI_CONTENT.phases[data.phase as keyof typeof SADE_SATI_CONTENT.phases]?.impacts || {}).map(([key, val]: [string, any]) => {
        const icons: any = {
            career: Briefcase,
            money: DollarSign,
            health: Activity,
            relationships: Heart,
            travel: Globe, // Use Globe for travel if available
            authority: Shield
        };

        return {
            id: key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            icon: icons[key] || Sparkles,
            level: val.level,
            intensity: (val.level === 'High' ? 'red' : val.level === 'Medium' ? 'orange' : 'green') as 'red' | 'orange' | 'green' | 'yellow',
            effects: val.text,
            advice: val.advice
        };
    });

    return (
        <MainLayout breadcrumbs={['Tools', 'Sade Sati']}>
            <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 -mx-4 -my-4 md:-mx-8 md:-my-8 p-4 md:p-8">
                <div className="fixed inset-0 bg-noise opacity-5 pointer-events-none" />
                <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 pointer-events-none" />
                
                <div className="relative z-10 max-w-7xl mx-auto space-y-12">
                    {/* A. Header & Status */}
                    <section>
                        <SadeSatiHeader 
                            status={data.is_in_sade_sati ? 'active' : 'completed'}
                            phase={currentPhaseId}
                            startDate={data.start_date}
                            endDate={data.end_date}
                            progress={progress}
                            daysRemaining={daysRemaining}
                        />
                    </section>

                    {/* B. Three Phases */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Clock className="w-6 h-6 text-indigo-400" />
                            Three-Phase Breakdown
                        </h2>
                        <SadeSatiPhases 
                            currentPhaseId={currentPhaseId}
                            phases={formattedPhases}
                        />
                    </section>

                    {/* C. Impact Matrix */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-orange-400" />
                            Life Area Impact Matrix
                        </h2>
                        <SadeSatiImpactMatrix impacts={impactData} />
                    </section>

                    {/* D. Timeline & Remedies (Grid Layout) */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-amber-400" />
                                Critical Timeline
                            </h2>
                            <SadeSatiTimeline />
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <Shield className="w-6 h-6 text-emerald-400" />
                                Remedial Measures
                            </h2>
                            <SadeSatiRemedies />
                        </section>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};


export default SadeSati;
