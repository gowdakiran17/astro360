import React, { useEffect } from 'react';
import { Settings, Sliders, Download, RefreshCw } from 'lucide-react';

interface VastuProToolsProps {
    propertyType: string;
    customWeights: Record<string, number>;
    setCustomWeights: (weights: Record<string, number>) => void;
    onAnalyze: () => void;
    analysisData: any;
    isOpen: boolean;
    onToggle: () => void;
}

const VastuProTools: React.FC<VastuProToolsProps> = ({ 
    propertyType, 
    customWeights, 
    setCustomWeights,
    onAnalyze,
    analysisData,
    isOpen,
    onToggle
}) => {
    // Default score keys based on property type
    const getScoreKeys = () => {
        if (propertyType === 'Residential') {
            return ['Money', 'Health', 'Relationships', 'Peace'];
        } else {
            return ['Profit', 'Growth', 'Stability', 'Reputation'];
        }
    };

    const keys = getScoreKeys();

    // Reset weights when property type changes
    useEffect(() => {
        const defaultWeights: Record<string, number> = {};
        keys.forEach(k => defaultWeights[k] = 5.0);
        
        // Only reset if keys don't match current weights
        const currentKeys = Object.keys(customWeights);
        if (currentKeys.length === 0 || !keys.every(k => currentKeys.includes(k))) {
            setCustomWeights(defaultWeights);
        }
    }, [propertyType]);

    const handleSliderChange = (key: string, value: number) => {
        setCustomWeights({
            ...customWeights,
            [key]: value
        });
    };

    const handleDownloadReport = () => {
        if (!analysisData) return;
        
        const report = {
            title: `AstroVastu Analysis - ${propertyType}`,
            date: new Date().toLocaleDateString(),
            summary: analysisData.summary,
            defects: analysisData.zone_details.filter((z: any) => z.status === 'Defect'),
            remedies: analysisData.zone_details
                .filter((z: any) => z.remedies && z.remedies.length > 0)
                .map((z: any) => ({ zone: z.direction, remedies: z.remedies }))
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vastu-report-${propertyType.toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) {
        return (
            <button 
                onClick={onToggle}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-900 transition-all"
            >
                <Settings className="w-4 h-4" /> Professional Mode
            </button>
        );
    }

    return (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" /> Professional Settings
                </h3>
                <button 
                    onClick={onToggle}
                    className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider"
                >
                    Close
                </button>
            </div>

            <div className="space-y-6 mb-8">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">
                        Custom Weights (Priority)
                    </h4>
                    <div className="space-y-4">
                        {keys.map(key => (
                            <div key={key}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-200">{key}</span>
                                    <span className="font-bold text-indigo-400">{customWeights[key] || 5}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    step="0.5"
                                    value={customWeights[key] || 5}
                                    onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={onAnalyze}
                    className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-sm transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Re-Analyze
                </button>
                <button 
                    onClick={handleDownloadReport}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-sm transition-colors"
                >
                    <Download className="w-4 h-4" /> Export JSON
                </button>
            </div>
        </div>
    );
};

export default VastuProTools;