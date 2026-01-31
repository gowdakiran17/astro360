import React from 'react';
import { Briefcase, DollarSign, Heart, Activity, BookOpen, Sparkles } from 'lucide-react';

interface LifeArea {
    name: string;
    status: 'supportive' | 'stable' | 'caution';
    description: string;
}

interface LifeAreaInfluenceProps {
    areas: {
        career: LifeArea;
        money: LifeArea;
        relations: LifeArea;
        health: LifeArea;
        learning: LifeArea;
        peace: LifeArea;
    };
}

const LifeAreaInfluence: React.FC<LifeAreaInfluenceProps> = ({ areas }) => {
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'supportive':
                return { emoji: '🟢', text: 'Support', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' };
            case 'stable':
                return { emoji: '🟠', text: 'Stable', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
            case 'caution':
                return { emoji: '🔴', text: 'Care', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
            default:
                return { emoji: '🟠', text: 'Mixed', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
        }
    };

    const areaConfig = [
        { key: 'career', icon: Briefcase, label: 'Career', data: areas.career },
        { key: 'money', icon: DollarSign, label: 'Money', data: areas.money },
        { key: 'relations', icon: Heart, label: 'Relations', data: areas.relations },
        { key: 'health', icon: Activity, label: 'Health', data: areas.health },
        { key: 'learning', icon: BookOpen, label: 'Learning', data: areas.learning },
        { key: 'peace', icon: Sparkles, label: 'Peace', data: areas.peace },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Life Area Influence
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    AI interpretation of how current phase affects different life areas
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {areaConfig.map((area) => {
                    const Icon = area.icon;
                    const status = getStatusDisplay(area.data.status);

                    return (
                        <div
                            key={area.key}
                            className={`${status.bg} ${status.border} border rounded-xl p-4 hover:shadow-md transition-all`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${status.bg}`}>
                                    <Icon className={`w-5 h-5 ${status.color}`} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                        {area.label}
                                    </h4>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-lg">{status.emoji}</span>
                                        <span className={`text-xs font-medium ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {area.data.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* AI Disclaimer */}
            <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-white">AI Interpretation:</strong> These insights are derived from your life trend pattern using AI analysis. They represent probable influences, not certainties.
                </p>
            </div>
        </div>
    );
};

export default LifeAreaInfluence;
