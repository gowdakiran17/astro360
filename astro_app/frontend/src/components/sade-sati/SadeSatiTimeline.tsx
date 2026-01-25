import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

const SadeSatiTimeline: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    Key Milestones
                </h3>
                
                <div className="relative border-l-2 border-slate-700 ml-3 space-y-8 py-2">
                    {/* Event 1 */}
                    <div className="relative pl-8">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                        <div className="mb-1 text-sm text-emerald-400 font-bold">Jan 17, 2023</div>
                        <h4 className="text-white font-bold text-lg">Sade Sati Begins (Rising Phase)</h4>
                        <p className="text-slate-400 text-sm mt-1">Saturn entered Aquarius (12th House from Moon).</p>
                    </div>

                    {/* Event 2 (Current) */}
                    <div className="relative pl-8">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-indigo-500 border-2 border-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        <div className="mb-1 text-sm text-indigo-400 font-bold">Mar 29, 2025</div>
                        <h4 className="text-white font-bold text-lg">Peak Phase Begins</h4>
                        <p className="text-slate-400 text-sm mt-1">Saturn enters Pisces (Over Natal Moon). Maximum intensity period begins.</p>
                        <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-200">
                            <div className="flex items-center gap-2 mb-1 font-bold">
                                <AlertCircle className="w-4 h-4" /> Current Focus
                            </div>
                            Emotional resilience and mental health prioritization.
                        </div>
                    </div>

                    {/* Event 3 */}
                    <div className="relative pl-8">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                        <div className="mb-1 text-sm text-slate-500 font-bold">Jun 03, 2027</div>
                        <h4 className="text-slate-300 font-bold text-lg">Setting Phase Begins</h4>
                        <p className="text-slate-500 text-sm mt-1">Saturn enters Aries (2nd House from Moon).</p>
                    </div>

                    {/* Event 4 */}
                    <div className="relative pl-8">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                        <div className="mb-1 text-sm text-slate-500 font-bold">Aug 08, 2029</div>
                        <h4 className="text-slate-300 font-bold text-lg">Sade Sati Ends</h4>
                        <p className="text-slate-500 text-sm mt-1">Saturn leaves Aries. Complete liberation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SadeSatiTimeline;
