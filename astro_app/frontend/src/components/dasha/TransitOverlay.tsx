import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Globe, AlertCircle, ArrowRight, Activity, Zap } from 'lucide-react';
import api from '../../services/api';

interface TransitOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    birthDetails: Record<string, unknown>;
    targetDate: string; // DD/MM/YYYY or YYYY-MM-DD
    dashaPeriod: {
        md: string;
        ad: string;
        pd: string;
    };
    ayanamsa?: string;
}

const PLANET_COLORS: Record<string, string> = {
    Sun: 'text-amber-500 bg-amber-50 border-amber-200',
    Moon: 'text-slate-600 bg-slate-100 border-slate-200',
    Mars: 'text-red-500 bg-red-50 border-red-200',
    Mercury: 'text-emerald-500 bg-emerald-50 border-emerald-200',
    Jupiter: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    Venus: 'text-pink-500 bg-pink-50 border-pink-200',
    Saturn: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    Rahu: 'text-slate-700 bg-slate-200 border-slate-300',
    Ketu: 'text-gray-500 bg-gray-100 border-gray-300'
};

interface TransitPlanet {
    name: string;
    degrees: number;
    zodiac_sign: string;
    nakshatra: string;
    is_retrograde?: boolean;
}

interface Aspect {
    transit_planet: string;
    natal_planet: string;
    aspect_type: string;
    orb: number;
}

interface TransitAnalysisData {
    transit_info?: TransitPlanet[];
    aspects?: Aspect[];
    predictions?: Record<string, unknown>;
}

const TransitOverlay: React.FC<TransitOverlayProps> = ({ 
    isOpen, 
    onClose, 
    birthDetails, 
    targetDate,
    dashaPeriod,
    ayanamsa = "LAHIRI"
}) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TransitAnalysisData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'positions' | 'aspects' | 'predictions'>('positions');

    const fetchTransitAnalysis = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Ensure date is DD/MM/YYYY
            let formattedDate = targetDate;
            if (targetDate.includes('-')) {
                const parts = targetDate.split('-');
                if (parts[0].length === 4) {
                    // YYYY-MM-DD -> DD/MM/YYYY
                    formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            const payload = {
                birth_details: birthDetails,
                analysis_date: formattedDate,
                ayanamsa: ayanamsa
            };

            const response = await api.post('/chart/comprehensive-analysis', payload);
            setData(response.data as TransitAnalysisData);
        } catch (err) {
            console.error(err);
            setError("Failed to load transit analysis.");
        } finally {
            setLoading(false);
        }
    }, [ayanamsa, birthDetails, targetDate]);

    useEffect(() => {
        if (isOpen && birthDetails && targetDate) {
            fetchTransitAnalysis();
        }
    }, [isOpen, birthDetails, targetDate, fetchTransitAnalysis]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Transit Analysis</h2>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" />
                                <span>{targetDate}</span>
                                <span className="text-slate-300">|</span>
                                <span className="font-medium text-indigo-600">
                                    {dashaPeriod.md} - {dashaPeriod.ad} - {dashaPeriod.pd}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0 bg-slate-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                            <p className="text-slate-500 text-sm animate-pulse">Calculating planetary positions...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 text-red-500 space-y-2">
                            <AlertCircle className="w-8 h-8" />
                            <p>{error}</p>
                            <button 
                                onClick={fetchTransitAnalysis}
                                className="text-xs bg-red-50 px-3 py-1 rounded-full hover:bg-red-100"
                            >
                                Retry
                            </button>
                        </div>
                    ) : data ? (
                        <div className="flex flex-col h-full">
                            {/* Tabs */}
                            <div className="flex border-b border-slate-200 bg-white px-4">
                                <button
                                    onClick={() => setActiveTab('positions')}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'positions' 
                                            ? 'border-indigo-600 text-indigo-600' 
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Planetary Positions
                                </button>
                                <button
                                    onClick={() => setActiveTab('aspects')}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'aspects' 
                                            ? 'border-indigo-600 text-indigo-600' 
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Aspects & Influences
                                </button>
                                <button
                                    onClick={() => setActiveTab('predictions')}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'predictions' 
                                            ? 'border-indigo-600 text-indigo-600' 
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    AI Insights
                                </button>
                            </div>

                            <div className="p-6">
                                {activeTab === 'positions' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {data.transit_info?.map((planet, idx) => {
                                            const colorClass = PLANET_COLORS[planet.name] || 'bg-slate-50 border-slate-200 text-slate-700';
                                            const isDashaLord = [dashaPeriod.md, dashaPeriod.ad].includes(planet.name);
                                            
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className={`relative p-4 rounded-xl border ${
                                                        isDashaLord 
                                                            ? 'ring-2 ring-indigo-500 ring-offset-2' 
                                                            : ''
                                                    } bg-white shadow-sm hover:shadow-md transition-shadow`}
                                                >
                                                    {isDashaLord && (
                                                        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm font-bold uppercase">
                                                            Dasha Lord
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${colorClass.split(' ')[2]} ${colorClass.split(' ')[1]} ${colorClass.split(' ')[0]}`}>
                                                                {planet.name.substring(0, 2)}
                                                            </div>
                                                            <span className="font-bold text-slate-700">{planet.name}</span>
                                                        </div>
                                                        <div className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                            {Math.floor(planet.degrees)}° {Math.round((planet.degrees % 1) * 60)}'
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between text-xs text-slate-600 mt-3">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-slate-400">Sign:</span>
                                                            <span className="font-medium">{planet.zodiac_sign}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-slate-400">Nak:</span>
                                                            <span className="font-medium">{planet.nakshatra}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {planet.is_retrograde && (
                                                        <div className="mt-2 text-[10px] text-red-500 font-bold flex items-center gap-1">
                                                            <Activity className="w-3 h-3" /> Retrograde
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeTab === 'aspects' && (
                                    <div className="space-y-4">
                                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-800 text-sm mb-4">
                                            This section shows how current transit planets are influencing your natal planets (Aspects).
                                        </div>
                                        
                                                    {data.aspects && data.aspects.length > 0 ? (
                                            <div className="grid gap-3">
                                                {data.aspects.map((aspect, idx: number) => (
                                                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="font-bold text-slate-700">{aspect.transit_planet}</div>
                                                            <ArrowRight className="w-4 h-4 text-slate-400" />
                                                            <div className="font-bold text-slate-700">{aspect.natal_planet}</div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                                                                {aspect.aspect_type}
                                                            </div>
                                                            <div className="text-xs font-mono text-slate-400">
                                                                Orb: {aspect.orb.toFixed(2)}°
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-slate-400">
                                                No major aspects detected for this date.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'predictions' && (
                                    <div className="space-y-6">
                                        {data.predictions ? (
                                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                                                    <Zap className="w-5 h-5 text-yellow-500" />
                                                    AI Forecast
                                                </h3>
                                                <div className="prose prose-sm max-w-none text-slate-600">
                                                    {Object.entries(data.predictions as Record<string, unknown>).map(([key, value]) => (
                                                        <div key={key} className="mb-4 last:mb-0">
                                                            <h4 className="font-bold text-slate-700 capitalize mb-1">{key.replace(/_/g, ' ')}</h4>
                                                            <p className="whitespace-pre-line leading-relaxed">{String(value)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-slate-400">
                                                Prediction generation unavailable.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default TransitOverlay;
