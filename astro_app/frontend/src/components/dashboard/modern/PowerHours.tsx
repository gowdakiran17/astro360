import React from 'react';
import { Clock, Sun, Sunset, Moon, AlertTriangle } from 'lucide-react';

interface PowerHoursProps {
    dailyData?: any;
}

const PowerHours: React.FC<PowerHoursProps> = ({ dailyData }) => {
    // Get muhurta periods from API data
    const muhuratas = dailyData?.muhuratas || [];

    // Filter for good quality periods (limit to top 3)
    const goodPeriods = muhuratas
        .filter((m: any) => m.quality === 'Good' || m.quality === 'Excellent')
        .slice(0, 3);

    // Filter for bad quality periods (limit to 1 for caution)
    const badPeriods = muhuratas
        .filter((m: any) => m.quality === 'Bad' || m.quality === 'Inauspicious')
        .slice(0, 1);

    const getIcon = (index: number) => {
        if (index === 0) return <Sun className="w-3 h-3" />;
        if (index === 1) return <Sunset className="w-3 h-3" />;
        return <Moon className="w-3 h-3" />;
    };

    const getColor = (index: number) => {
        if (index === 0) return { border: 'border-amber-500/30', dot: 'border-amber-500', text: 'text-amber-300', bg: 'bg-amber-500/10' };
        if (index === 1) return { border: 'border-orange-500/30', dot: 'border-orange-500', text: 'text-orange-300', bg: 'bg-orange-500/10' };
        return { border: 'border-indigo-500/30', dot: 'border-indigo-500', text: 'text-indigo-300', bg: 'bg-indigo-500/10' };
    };

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-lg text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    Power Hours
                </h3>
            </div>

            <div className="space-y-4 flex-1">
                {goodPeriods.length > 0 ? (
                    goodPeriods.map((period: any, idx: number) => {
                        const colors = getColor(idx);
                        return (
                            <div key={idx} className={`relative pl-4 border-l-2 ${colors.border} pb-4 last:pb-0`}>
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 ${colors.dot} flex items-center justify-center`}>
                                    {idx === 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>}
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold ${colors.text} flex items-center gap-1.5`}>
                                            {getIcon(idx)}
                                            {period.start} – {period.end}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.dot}/20`}>
                                            {period.quality}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-200 font-medium">{period.name}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {period.quality === 'Excellent' ? 'Ideal for important decisions and new beginnings.' :
                                            period.quality === 'Good' ? 'Favorable for routine activities and planning.' :
                                                'Suitable for steady progress.'}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-slate-400 py-8">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Loading power hours...</p>
                    </div>
                )}
            </div>

            {badPeriods.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-start gap-2 text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                            <span className="font-bold block">Avoid Major Decisions</span>
                            {badPeriods[0].start} - {badPeriods[0].end} ({badPeriods[0].name})
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PowerHours;
