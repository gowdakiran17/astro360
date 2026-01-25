import React, { useState } from 'react';
import { Heart, Briefcase, DollarSign, Leaf, Sparkles } from 'lucide-react';

interface Prediction {
    rating: number;
    title: string;
    summary: string;
    details: string;
    remedies: string[];
}

interface PredictionsData {
    health: Prediction;
    career: Prediction;
    relationships: Prediction;
    finance: Prediction;
    spiritual: Prediction;
}

interface PredictionsSectionProps {
    data: PredictionsData;
}

const PredictionsSection: React.FC<PredictionsSectionProps> = ({ data }) => {
    const [activeTab, setActiveTab] = useState<keyof PredictionsData>('health');

    const categories = [
        { id: 'health', label: 'Health', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 'career', label: 'Career', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'relationships', label: 'Relationships', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
        { id: 'finance', label: 'Finance', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
        { id: 'spiritual', label: 'Spiritual', icon: Leaf, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const currentPrediction = data[activeTab];

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center space-x-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <div
                        key={star}
                        className={`w-2 h-6 rounded-sm ${star <= Math.round(rating) ? 'bg-indigo-500' : 'bg-slate-200'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                    Predictions
                </h3>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-hide">
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeTab === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id as keyof PredictionsData)}
                            className={`flex flex-col items-center justify-center min-w-[4.5rem] py-3 px-2 border-b-2 transition-all ${isActive
                                ? `border-indigo-500 ${cat.bg} text-slate-800`
                                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Icon className={`w-5 h-5 mb-1.5 ${isActive ? cat.color : ''}`} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">{cat.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">{currentPrediction.title}</h4>
                        <p className="text-sm text-slate-500">{currentPrediction.summary}</p>
                    </div>
                    <div>
                        {renderStars(currentPrediction.rating)}
                    </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-100 text-sm leading-relaxed text-slate-700">
                    {currentPrediction.details}
                </div>

                <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Suggested Remedies</h5>
                    <ul className="space-y-2">
                        {currentPrediction.remedies.map((remedy, i) => (
                            <li key={i} className="flex items-center text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2.5"></div>
                                {remedy}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PredictionsSection;
