import React, { useState, useEffect } from 'react';
import { Heart, Briefcase, DollarSign, Activity, Baby, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import api from '../../../services/api';

interface PredictionsTabProps {
    data: any;
}

interface Prediction {
    status: string;
    probability?: number;
    timing?: {
        start: string;
        end: string;
        peak: string;
    };
    message?: string;
    data?: any;
}

const PredictionsTab: React.FC<PredictionsTabProps> = ({ data }) => {
    const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categories = [
        { id: 'marriage', label: 'Marriage', icon: Heart, color: 'from-pink-500 to-rose-500' },
        { id: 'career', label: 'Career', icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
        { id: 'wealth', label: 'Wealth', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
        { id: 'health', label: 'Health', icon: Activity, color: 'from-red-500 to-orange-500' },
        { id: 'children', label: 'Children', icon: Baby, color: 'from-purple-500 to-pink-500' }
    ];

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('chart/period/predictions', {
                birth_details: {
                    date: data?.birth_details?.date || '01/01/1990',
                    time: data?.birth_details?.time || '12:00',
                    timezone: data?.birth_details?.timezone || '+05:30',
                    latitude: data?.birth_details?.latitude || 12.9716,
                    longitude: data?.birth_details?.longitude || 77.5946,
                    name: data?.birth_details?.name || 'User'
                },
                categories: categories.map(c => c.id)
            });

            if (response.data?.predictions) {
                setPredictions(response.data.predictions);
            }
        } catch (err: any) {
            console.error('Error fetching predictions:', err);
            setError(err.response?.data?.detail || 'Failed to load predictions');
        } finally {
            setLoading(false);
        }
    };

    const getProbabilityColor = (probability: number) => {
        if (probability >= 0.7) return 'text-green-400';
        if (probability >= 0.5) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getProbabilityLabel = (probability: number) => {
        if (probability >= 0.7) return 'High';
        if (probability >= 0.5) return 'Moderate';
        return 'Low';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400">Analyzing your life predictions...</p>
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
                        <h3 className="text-red-400 font-semibold">Error Loading Predictions</h3>
                        <p className="text-slate-400 text-sm mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Life Event Predictions</h2>
                <p className="text-slate-300">
                    Powered by VedAstro's advanced prediction algorithms. These insights are based on your birth chart,
                    current planetary positions, and dasha periods.
                </p>
            </div>

            {/* Prediction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => {
                    const prediction = predictions[category.id];
                    const Icon = category.icon;

                    return (
                        <div
                            key={category.id}
                            className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{category.label}</h3>
                                    {prediction?.status === 'success' && prediction.probability !== undefined && (
                                        <span className={`text-sm font-semibold ${getProbabilityColor(prediction.probability)}`}>
                                            {getProbabilityLabel(prediction.probability)} Probability
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            {prediction?.status === 'success' ? (
                                <div className="space-y-4">
                                    {/* Probability Meter */}
                                    {prediction.probability !== undefined && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-slate-400">Strength</span>
                                                <span className={`text-sm font-semibold ${getProbabilityColor(prediction.probability)}`}>
                                                    {Math.round(prediction.probability * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full bg-gradient-to-r ${category.color}`}
                                                    style={{ width: `${prediction.probability * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timing */}
                                    {prediction.timing && (
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Clock className="w-4 h-4 text-indigo-400" />
                                                <span className="text-sm font-semibold text-white">Timing Window</span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Start:</span>
                                                    <span className="text-white font-medium">{prediction.timing.start}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Peak:</span>
                                                    <span className="text-indigo-400 font-medium">{prediction.timing.peak}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">End:</span>
                                                    <span className="text-white font-medium">{prediction.timing.end}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Success Indicator */}
                                    <div className="flex items-center gap-2 text-green-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-sm">Prediction Available</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                                        <div>
                                            <p className="text-yellow-400 text-sm font-semibold">Data Unavailable</p>
                                            <p className="text-slate-400 text-xs mt-1">
                                                {prediction?.message || 'Unable to fetch prediction from VedAstro'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm">
                    <strong className="text-white">Note:</strong> These predictions are based on Vedic astrology principles
                    and should be used as guidance. Actual outcomes depend on many factors including personal effort,
                    free will, and circumstances.
                </p>
            </div>
        </div>
    );
};

export default PredictionsTab;
