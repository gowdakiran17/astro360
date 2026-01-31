import { useState } from 'react';
import { DashboardOverviewResponse } from '../../types/periodAnalysis';
import { DailyCalendarData } from './InteractiveCalendar';

// Import Tabs
import OverviewTab from './tabs/OverviewTab';
import ActivePeriodsTab from './tabs/ActivePeriodsTab';
import TimelineTab from './tabs/TimelineTab';
import ComparisonsTab from './tabs/ComparisonsTab';
import ReportsTab from './tabs/ReportsTab';
import LifePathTab from './tabs/LifePathTab';
import LifeTimelineTab from './tabs/LifeTimelineTab';
import PredictionsTab from './tabs/PredictionsTab';

import {
    LayoutDashboard,
    Calendar,
    GitBranch,
    BarChart2,
    FileText,
    Map,
    TrendingUp,
    Sparkles
} from 'lucide-react';

interface PeriodDashboardProps {
    data: DashboardOverviewResponse | null;
    loading: boolean;
    error: string | null;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    dailyData?: Record<string, DailyCalendarData>;
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, component: OverviewTab },
    { id: 'active', label: 'Active Periods', icon: Calendar, component: ActivePeriodsTab },
    { id: 'timeline', label: 'Timeline', icon: GitBranch, component: TimelineTab },
    { id: 'life-timeline', label: '5-Year Timeline', icon: TrendingUp, component: LifeTimelineTab },
    { id: 'predictions', label: 'Life Predictions', icon: Sparkles, component: PredictionsTab },
    { id: 'compare', label: 'Comparisons', icon: BarChart2, component: ComparisonsTab },
    { id: 'reports', label: 'Reports', icon: FileText, component: ReportsTab },
    { id: 'life-map', label: 'Life Map', icon: Map, component: LifePathTab },
];

const PeriodDashboardLayout = ({
    data,
    loading,
    error,
    selectedDate,
    onDateChange,
    dailyData
}: PeriodDashboardProps) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-400">
                <p className="text-xl font-bold mb-2">Analysis Failed</p>
                <p>{error || "Unable to load data"}</p>
            </div>
        );
    }

    if (!data) return null;

    const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || OverviewTab;

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                                ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent hover:border-slate-700'
                                }
                            `}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ActiveComponent
                    data={data}
                    selectedDate={selectedDate}
                    onDateChange={onDateChange}
                    dailyData={dailyData}
                />
            </div>
        </div>
    );
};

export default PeriodDashboardLayout;
