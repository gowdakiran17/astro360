import React from 'react';
import { Briefcase, Heart, Coins, Activity, Home, BookOpen, Users, Sparkles } from 'lucide-react';

interface ImpactArea {
    id: string;
    label: string;
    icon: any;
    level: 'Low' | 'Medium' | 'High' | 'Very High';
    intensity: 'green' | 'yellow' | 'orange' | 'red';
    effects: string;
    advice: string;
}

interface SadeSatiImpactMatrixProps {
    impacts: ImpactArea[];
}

const SadeSatiImpactMatrix: React.FC<SadeSatiImpactMatrixProps> = ({ impacts }) => {
    const getIntensityColor = (intensity: string) => {
        switch (intensity) {
            case 'red': return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'orange': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
            case 'yellow': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'green': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    };

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {impacts.map((area) => {
                const Icon = area.icon;
                const intensityClass = getIntensityColor(area.intensity);
                
                return (
                    <div key={area.id} className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                                <Icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-400" />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md border ${intensityClass}`}>
                                {area.level} Impact
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-2">{area.label}</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Effects</p>
                                <p className="text-sm text-slate-300 leading-relaxed">{area.effects}</p>
                            </div>
                            
                            <div className="pt-3 border-t border-white/5">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Recommendation</p>
                                <p className="text-sm text-indigo-200/80 italic">"{area.advice}"</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const MOCK_IMPACTS: ImpactArea[] = [
    {
        id: 'career',
        label: 'Career & Profession',
        icon: Briefcase,
        level: 'High',
        intensity: 'orange',
        effects: 'Workplace delays, recognition blocks, increased workload, authority conflicts.',
        advice: 'Document achievements, avoid job changes, work diligently.'
    },
    {
        id: 'finance',
        label: 'Finances & Wealth',
        icon: Coins,
        level: 'Very High',
        intensity: 'red',
        effects: 'Unexpected expenses, blocked investments, savings depletion.',
        advice: 'Create emergency fund, no speculation, maintain liquidity.'
    },
    {
        id: 'health',
        label: 'Physical Health',
        icon: Activity,
        level: 'Medium',
        intensity: 'yellow',
        effects: 'Bone/joint issues, dental problems, chronic fatigue.',
        advice: 'Regular checkups, preventive care, adequate rest.'
    },
    {
        id: 'relationships',
        label: 'Relationships',
        icon: Heart,
        level: 'High',
        intensity: 'orange',
        effects: 'Communication gaps, partner stress, emotional distance.',
        advice: 'Patient communication, avoid major decisions, counseling.'
    },
    {
        id: 'family',
        label: 'Family & Home',
        icon: Home,
        level: 'Medium',
        intensity: 'yellow',
        effects: 'Parental health concerns, domestic responsibilities.',
        advice: 'Extra care for elders, patience with relatives.'
    },
    {
        id: 'education',
        label: 'Education',
        icon: BookOpen,
        level: 'Medium',
        intensity: 'yellow',
        effects: 'Concentration issues, delayed results, hard work needed.',
        advice: 'Structured study, extra effort, realistic goals.'
    },
    {
        id: 'social',
        label: 'Social Life',
        icon: Users,
        level: 'Low',
        intensity: 'green',
        effects: 'Social withdrawal, reduced networking, isolation.',
        advice: 'Quality over quantity in friendships, avoid gossip.'
    },
    {
        id: 'spiritual',
        label: 'Spiritual Growth',
        icon: Sparkles,
        level: 'Very High',
        intensity: 'green',
        effects: 'Deep questioning, seeking meaning, detachment lessons.',
        advice: 'Deepen spiritual practice, meditation, charitable acts.'
    }
];

export default SadeSatiImpactMatrix;
