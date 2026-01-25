import React, { useEffect, useState } from 'react';
import { Compass, Home, Sparkles } from 'lucide-react';
import api from '../../services/api';

interface AstroVastuProfileProps {
    ascendant: string;
    mahadashaLord: string;
}

interface VastuGuidance {
    current_mahadasha: string;
    recommended_focus_direction: string;
    home_stability_direction: string;
    guidance: string;
    reasoning: string;
}

const AstroVastuProfile: React.FC<AstroVastuProfileProps> = ({ ascendant, mahadashaLord }) => {
    const [guidance, setGuidance] = useState<VastuGuidance | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchGuidance = async () => {
            if (!ascendant || !mahadashaLord) return;
            
            setLoading(true);
            try {
                const response = await api.post('/vastu/guidance', {
                    ascendant_sign: ascendant,
                    current_mahadasha_lord: mahadashaLord
                });
                setGuidance(response.data);
            } catch (error) {
                console.error("Failed to fetch Astro-Vastu guidance:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGuidance();
    }, [ascendant, mahadashaLord]);

    if (loading) {
        return <div className="animate-pulse h-24 bg-slate-100 rounded-xl"></div>;
    }

    if (!guidance) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 mb-6">
            <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Personalized Astro-Vastu
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Active Karma Direction</div>
                    <div className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                        <Compass className="w-4 h-4" />
                        {guidance.recommended_focus_direction}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Based on {guidance.current_mahadasha} Mahadasha</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Home Stability Direction</div>
                    <div className="text-lg font-bold text-purple-700 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        {guidance.home_stability_direction}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Based on {ascendant} Ascendant</p>
                </div>
            </div>

            <div className="bg-white/60 p-4 rounded-xl text-sm text-slate-700 leading-relaxed border border-indigo-50">
                <p className="mb-2 font-medium">{guidance.guidance}</p>
                <p className="text-xs text-slate-500 italic">{guidance.reasoning}</p>
            </div>
        </div>
    );
};

export default AstroVastuProfile;