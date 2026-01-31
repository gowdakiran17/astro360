import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Briefcase, Plane, Home, Activity, Zap } from 'lucide-react';

import { Prediction } from '../../types/prediction';


interface DailyPredictionListProps {
    selectedDate: Date;
    predictions: Prediction[];
    isLoading?: boolean;
}

export const DailyPredictionList: React.FC<DailyPredictionListProps> = ({
    selectedDate,
    predictions,
    isLoading = false
}) => {
    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'business': return <Briefcase size={16} className="text-blue-400" />;
            case 'health': return <Activity size={16} className="text-red-400" />;
            case 'travel': return <Plane size={16} className="text-sky-400" />;
            case 'building': return <Home size={16} className="text-amber-400" />;
            case 'yoga': return <Zap size={16} className="text-purple-400" />;
            case 'remedies': return <Sparkles size={16} className="text-emerald-400" />;
            default: return <Sparkles size={16} className="text-slate-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'good' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-red-500/10 border-red-500/20 text-red-200';
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-slate-800/50 rounded-xl" />
                ))}
            </div>
        );
    }

    if (predictions.length === 0) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center backdrop-blur-sm">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-slate-600" size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">No Specific Events</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                    There are no specific planetary events predicted for this day. This usually indicates a stable, neutral period properly suited for routine activities.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {predictions.map((pred, idx) => (
                <motion.div
                    key={`${pred.name}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-purple-500/30 transition-colors group relative overflow-hidden"
                >
                    {/* Status Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${pred.daily_status[selectedDate.toISOString().split('T')[0]] === 'good' ? 'bg-emerald-500' : 'bg-red-500'}`} />

                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getStatusColor(pred.daily_status[selectedDate.toISOString().split('T')[0]] || 'neutral')}`}>
                            {getCategoryIcon(pred.category)}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                    {pred.name}
                                </h4>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                                        {pred.planet}
                                    </span>
                                    {pred.house > 0 && (
                                        <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                                            House {pred.house}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-slate-400 leading-relaxed mb-3">
                                {pred.description}
                            </p>

                            <div className="flex items-center gap-2 text-xs font-medium">
                                <span className={`px-2 py-0.5 rounded-full ${pred.daily_status[selectedDate.toISOString().split('T')[0]] === 'good' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {pred.daily_status[selectedDate.toISOString().split('T')[0]] === 'good' ? 'Favorable' : 'Challenging'} Effect
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-500 capitalize">{pred.category} Category</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
