import { FileText, Download, Mail, FileSpreadsheet } from 'lucide-react';

import { DailyCalendarData } from '../InteractiveCalendar';
import { DashboardOverviewResponse } from '../../../types/periodAnalysis';

interface ReportsTabProps {
    data: DashboardOverviewResponse;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    dailyData?: Record<string, DailyCalendarData>;
}

const ReportsTab = ({ data: _data }: ReportsTabProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
                <h2 className="text-xl font-bold text-white mb-2">Export Analysis</h2>
                <p className="text-slate-400">Download detailed reports of the current period analysis.</p>
            </div>

            {/* PDF Report */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl hover:border-indigo-500/50 transition-colors group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        <FileText className="w-8 h-8" />
                    </div>
                    <button className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Detailed PDF Report</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Comprehensive 15-page analysis including charts, favorable tables, and detailed predictions.
                </p>
                <span className="text-xs font-mono text-slate-500 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                    PDF • 2.4 MB
                </span>
            </div>

            {/* CSV Export */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl hover:border-emerald-500/50 transition-colors group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <button className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Raw Data Export</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Export all calculated values, planetary positions, and scores to CSV for external analysis.
                </p>
                <span className="text-xs font-mono text-slate-500 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                    CSV • 128 KB
                </span>
            </div>

            {/* Email Report */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl hover:border-blue-500/50 transition-colors group cursor-pointer md:col-span-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">Email Digest</h3>
                        <p className="text-sm text-slate-400">Send a simplified summary of this analysis to your registered email.</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg">
                        Send Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;
