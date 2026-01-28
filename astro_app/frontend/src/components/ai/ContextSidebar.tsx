import React from 'react';
import { User, Activity, CheckCircle } from 'lucide-react';

interface ContextSidebarProps {
    profileName?: string;
    chartDetails?: any;
    insightsData?: any;
    error?: string | null;
}

const ContextSidebar: React.FC<ContextSidebarProps> = ({ profileName, chartDetails, insightsData, error }) => {

    // Extract basic details from chartDetails if available

    // Extract basic details from chartDetails if available
    const sunSign = chartDetails?.planets?.find((p: any) => p.name === 'Sun')?.zodiac_sign || "Loading...";
    const moonSign = chartDetails?.planets?.find((p: any) => p.name === 'Moon')?.zodiac_sign || "Loading...";
    const ascSign = chartDetails?.ascendant?.zodiac_sign || "Loading...";

    return (
        <div className="w-[300px] bg-white/5 dark:bg-[#131722] border-l border-white/10 flex flex-col h-full overflow-y-auto hidden lg:flex">
            <div className="p-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Context & Insights</h3>

                {/* Profile Card */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <div className="font-medium text-slate-200">{profileName || 'Your Profile'}</div>
                            <div className="text-xs text-slate-500">Birth Chart Analyzed</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-slate-400">Sun Sign</div>
                        <div className="text-right text-slate-200 font-medium">{sunSign}</div>
                        <div className="text-slate-400">Moon Sign</div>
                        <div className="text-right text-slate-200 font-medium">{moonSign}</div>
                        <div className="text-slate-400">Ascendant</div>
                        <div className="text-right text-slate-200 font-medium">{ascSign}</div>
                    </div>
                </div>

                {/* Transits Section */}
                <div className="mb-6">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Current Transits</h4>

                    {insightsData?.daily_analysis?.influences && insightsData.daily_analysis.influences.length > 0 ? (
                        <div className="space-y-3">
                            {insightsData.daily_analysis.influences.map((inf: string, idx: number) => (
                                <div key={idx} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-medium text-amber-200">Transit Influence</span>
                                    </div>
                                    <p className="text-xs text-slate-400">{inf}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-medium text-amber-200">Jupiter Transit</span>
                            </div>
                            <p className="text-xs text-red-400">
                                {error ? `Error: ${error}` : (insightsData ? "No major influences today." : "Loading forecast...")}
                            </p>
                        </div>
                    )}
                </div>

                {/* Dasha Section */}
                <div className="mb-6">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Active Dasha Period</h4>
                    {insightsData?.dasha_info?.current ? (
                        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-purple-200">{insightsData.dasha_info.current.mahadasha} Mahadasha</span>
                                    <span className="text-xs text-purple-400">Until {insightsData.dasha_info.current.end_date}</span>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500 mb-3 mt-2">
                                Current: {insightsData.dasha_info.current.antardasha} Antardasha
                            </div>
                            {/* Progress Bar (Simulated or Real if API sends percentage) */}
                            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[65%] rounded-full"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl border border-white/5 text-xs text-slate-500">
                            {error ? <span className="text-red-400">Error: {error}</span> : "Loading period..."}
                        </div>
                    )}
                </div>

                {/* Actions Section */}
                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recommended Actions</h4>

                    {insightsData?.daily_analysis?.recommendation ? (
                        <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl mb-3">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="text-sm font-medium text-emerald-200">Daily Insight</div>
                                <div className="text-xs text-slate-400 mt-0.5">{insightsData.daily_analysis.recommendation}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl mb-3">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="text-sm font-medium text-emerald-200">Daily Focus</div>
                                <div className="text-xs text-slate-400 mt-0.5">Good day for studying scriptures or meditation.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};

export default ContextSidebar;
