import { ArrowRightLeft, Calendar } from 'lucide-react';

const ComparisonsTab = () => {
    return (
        <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                    Period Comparison Tool
                </h2>
                <p className="text-slate-400 mb-8 max-w-2xl">
                    Compare planetary influences between two different dates to understand shifts in energy, strength, and favorable activities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                    {/* Date 1 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Primary Date (Current)</label>
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-white">24 Jan 2026</span>
                        </div>
                    </div>

                    {/* Date 2 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Comparison Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                        <ArrowRightLeft className="w-4 h-4" />
                        Compare Periods
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 pointer-events-none select-none grayscale">
                <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl space-y-4">
                    <div className="h-4 w-1/3 bg-slate-700 rounded"></div>
                    <div className="h-32 bg-slate-700/50 rounded"></div>
                </div>
                <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl space-y-4">
                    <div className="h-4 w-1/3 bg-slate-700 rounded"></div>
                    <div className="h-32 bg-slate-700/50 rounded"></div>
                </div>
                <div className="col-span-full text-center py-12">
                    <p className="text-slate-500">Select a second date to generate comparison analysis</p>
                </div>
            </div>
        </div>
    );
};

export default ComparisonsTab;
