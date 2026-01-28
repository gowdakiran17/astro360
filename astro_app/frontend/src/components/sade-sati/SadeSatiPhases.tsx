import React from 'react';
import { ChevronRight, Shield } from 'lucide-react';

interface Phase {
    id: 'rising' | 'peak' | 'setting';
    name: string;
    dates: string;
    status: 'completed' | 'current' | 'upcoming';
    intensity: number; // 1-5
    themes: string[];
    advice: string;
}

interface SadeSatiPhasesProps {
    currentPhaseId: 'rising' | 'peak' | 'setting';
    phases: Phase[];
}

const SadeSatiPhases: React.FC<SadeSatiPhasesProps> = ({ phases }) => {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            {phases.map((phase) => {
                const isCurrent = phase.status === 'current';
                const isCompleted = phase.status === 'completed';
                
                return (
                    <div 
                        key={phase.id}
                        className={`relative rounded-2xl border transition-all duration-300 overflow-hidden group
                            ${isCurrent 
                                ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]' 
                                : isCompleted
                                    ? 'bg-white/5 border-white/10 opacity-70 hover:opacity-100'
                                    : 'bg-white/5 border-white/10 opacity-50 hover:opacity-80'
                            }
                        `}
                    >
                        {/* Status Badge */}
                        <div className="absolute top-0 right-0 p-4">
                            {isCurrent && (
                                <span className="px-2 py-1 bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-md tracking-wider shadow-lg">
                                    Current
                                </span>
                            )}
                            {isCompleted && (
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase rounded-md tracking-wider">
                                    Completed
                                </span>
                            )}
                        </div>

                        <div className="p-6">
                            <h3 className={`text-lg font-bold mb-1 ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                                {phase.name}
                            </h3>
                            <p className="text-xs font-mono text-slate-400 mb-4">{phase.dates}</p>

                            {/* Intensity Stars */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-2 h-2 rounded-full ${
                                            i < phase.intensity 
                                                ? isCurrent ? 'bg-indigo-400' : 'bg-slate-500' 
                                                : 'bg-slate-800'
                                        }`} 
                                    />
                                ))}
                            </div>

                            {/* Themes */}
                            <div className="space-y-3 mb-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Themes</h4>
                                <ul className="space-y-2">
                                    {phase.themes.map((theme, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                            <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCurrent ? 'text-indigo-400' : 'text-slate-600'}`} />
                                            <span>{theme}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Key Advice */}
                            <div className={`p-4 rounded-xl text-sm ${
                                isCurrent 
                                    ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-200' 
                                    : 'bg-slate-800/50 border border-white/5 text-slate-400'
                            }`}>
                                <div className="flex items-center gap-2 mb-1 font-bold">
                                    <Shield className="w-4 h-4" /> Key Advice
                                </div>
                                {phase.advice}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SadeSatiPhases;
