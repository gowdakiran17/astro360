import { useState } from 'react';
import { DashboardOverviewResponse } from '../../../types/periodAnalysis';
import { Calendar, ChevronRight, ChevronDown, Clock, Star } from 'lucide-react';

interface ActivePeriodsTabProps {
    data: DashboardOverviewResponse;
}

const ActivePeriodsTab = ({ data }: ActivePeriodsTabProps) => {
    const { current, full_timeline } = data.dasha_info;
    const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpandedLevels(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Find Current Mahadasha Object
    // const currentMDLord = typeof current.current_mahadasha === 'string' ? current.current_mahadasha : current.current_mahadasha?.lord;
    // const currentMD = full_timeline.find(md => md.lord === currentMDLord) || full_timeline[0];

    const getDashaColor = (lord: string) => {
        // Map planets to colors (simplified)
        const colors: Record<string, string> = {
            Sun: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
            Moon: 'text-blue-300 bg-blue-300/10 border-blue-300/20',
            Mars: 'text-red-400 bg-red-400/10 border-red-400/20',
            Mercury: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
            Jupiter: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
            Venus: 'text-pink-300 bg-pink-300/10 border-pink-300/20',
            Saturn: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
            Rahu: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
            Ketu: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
        };
        return colors[lord] || 'text-slate-400 bg-slate-800 border-slate-700';
    };

    const renderDashaItem = (item: any, level: number, parentId: string = '') => {
        const id = parentId ? `${parentId}-${item.lord}-${item.start_date}` : `${item.lord}-${item.start_date}`;
        const isExpanded = expandedLevels[id];
        const isCurrent = item.is_current;

        // Determine if we have children to show
        const children = item.antardashas || item.pratyantardashas || item.sub_periods || [];
        const hasChildren = children.length > 0;

        return (
            <div key={id} className={`mb-2 ${level > 0 ? 'ml-6 border-l border-slate-700 pl-4' : ''}`}>
                <div
                    onClick={() => hasChildren && toggleExpand(id)}
                    className={`
            flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
            ${isCurrent ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'}
          `}
                >
                    <div className="flex items-center gap-3">
                        {hasChildren && (
                            isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}

                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${getDashaColor(item.lord)}`}>
                            {item.lord.slice(0, 2)}
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`font-medium ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                                    {item.lord}
                                </span>
                                {isCurrent && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        Active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {item.start_date} - {item.end_date}
                                </span>
                                {/* Duration could go here */}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        {/* Score or Status placeholder */}
                        {isCurrent && <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />}
                    </div>
                </div>

                {/* Nested Children */}
                {isExpanded && hasChildren && (
                    <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                        {children.map((child: any) => renderDashaItem(child, level + 1, id))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Summary Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mahadasha Card */}
                <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                        {/* Huge Planet Icon Placeholder */}
                        <Star className="w-32 h-32" />
                    </div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Mahadasha (Major)</h3>
                    <div className="text-3xl font-bold text-white mb-1">
                        {typeof current.current_mahadasha === 'string' ? current.current_mahadasha : current.current_mahadasha?.lord}
                    </div>
                    <div className="text-slate-400 text-sm mb-4">Focus Area: Career & Growth</div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-indigo-500 h-full transition-all duration-500"
                            style={{ width: `${current.current_mahadasha?.progress_percent || 0}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>Started {current.current_mahadasha?.start_date}</span>
                        <span>Ends {current.current_mahadasha?.end_date}</span>
                    </div>
                </div>

                {/* Antardasha Card */}
                <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Antardasha (Sub)</h3>
                    <div className="text-3xl font-bold text-white mb-1">
                        {typeof current.current_antardasha === 'string' ? current.current_antardasha : current.current_antardasha?.lord}
                    </div>
                    <div className="text-slate-400 text-sm mb-4">Sub-influence: Health</div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full transition-all duration-500"
                            style={{ width: `${current.current_antardasha?.progress_percent || 0}%` }}
                        ></div>
                    </div>
                </div>

                {/* Pratyantardasha Card */}
                <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Pratyantar (Micro)</h3>
                    <div className="text-3xl font-bold text-white mb-1">
                        {typeof current.current_pratyantardasha === 'string' ? current.current_pratyantardasha : current.current_pratyantardasha?.lord}
                    </div>
                    <div className="text-slate-400 text-sm mb-4">Daily Energy: High</div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-amber-500 h-full transition-all duration-500"
                            style={{ width: `${current.current_pratyantardasha?.progress_percent || 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Detailed Hierarchy */}
            <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    Detailed Timeline
                </h3>

                {/* Render only current MD and surroundings initially or all */}
                {full_timeline.map((md: any) => renderDashaItem(md, 0))}
            </div>
        </div>
    );
};

export default ActivePeriodsTab;
