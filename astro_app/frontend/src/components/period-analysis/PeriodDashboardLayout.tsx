import { useState } from 'react';
import { DashboardOverviewResponse } from '../../types/periodAnalysis';
import { DailyCalendarData } from './InteractiveCalendar';
import {
    LayoutDashboard,
    Clock,
    History,
    TrendingUp,
    GitCompare,
    Sparkles,
    FileText,
    Activity
} from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import ActivePeriodsTab from './tabs/ActivePeriodsTab';
import TimelineTab from './tabs/TimelineTab';
import ComparisonsTab from './tabs/ComparisonsTab';
import ReportsTab from './tabs/ReportsTab';
import LifePathTab from './tabs/LifePathTab';

// Tabs will be lazy loaded or imported directly

interface PeriodDashboardProps {
    data: DashboardOverviewResponse | null;
    loading: boolean;
    error: string | null;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    dailyData?: Record<string, DailyCalendarData>;
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'active', label: 'Active Periods', icon: Clock },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'history', label: 'Historical', icon: History },
    { id: 'forecast', label: 'Future', icon: TrendingUp },
    { id: 'compare', label: 'Comparisons', icon: GitCompare },
    { id: 'remedies', label: 'Remedies', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'lifemap', label: 'Life Map', icon: Sparkles },
];

const PeriodDashboardLayout = ({ data, loading, error }: PeriodDashboardProps) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 animate-pulse">
                <Clock className="w-12 h-12 mb-4 animate-spin text-indigo-500" />
                <p>Loading your detailed period analysis...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-400">
                <p className="text-xl font-bold mb-2">Analysis Failed</p>
                <p>{error}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="flex flex-col gap-6">
            {/* Tab Navigation */}
            <div className="border-b border-slate-700 overflow-x-auto">
                <nav className="flex space-x-4 min-w-max pb-1" aria-label="Tabs">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  group flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200
                  ${isActive
                                        ? 'border-indigo-500 text-indigo-400'
                                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'}
                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[50vh]">
                {activeTab === 'overview' && (
                    <OverviewTab
                        data={data}
                    />
                )}

                {activeTab === 'active' && (
                    <ActivePeriodsTab data={data} />
                )}

                {/* Other tabs placeholders... */}
                {activeTab === 'timeline' && (
                    <TimelineTab data={data} />
                )}
                {activeTab === 'comparisons' && (
                    <ComparisonsTab />
                )}
                {activeTab === 'reports' && (
                    <ReportsTab />
                )}
                {activeTab === 'lifemap' && (
                    <LifePathTab />
                )}

                {/* Other tabs placeholders... */}
                {activeTab !== 'overview' && activeTab !== 'active' && activeTab !== 'timeline' && activeTab !== 'comparisons' && activeTab !== 'reports' && activeTab !== 'lifemap' && (
                    <div className="text-slate-500 p-12 text-center border border-dashed border-slate-700 rounded-xl">
                        Section "{TABS.find(t => t.id === activeTab)?.label}" is under construction.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PeriodDashboardLayout;
