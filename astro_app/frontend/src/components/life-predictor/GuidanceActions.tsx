import React from 'react';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

interface GuidanceActionsProps {
    helps: string[];
    avoid: string[];
}

const GuidanceActions: React.FC<GuidanceActionsProps> = ({ helps, avoid }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Practical Guidance
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Non-remedial, actionable advice for this phase
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* What Helps */}
                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-5 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-bold text-green-900 dark:text-green-300">
                            What Helps Now
                        </h4>
                    </div>
                    <ul className="space-y-2">
                        {helps.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* What to Avoid */}
                <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-5 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-4">
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h4 className="font-bold text-red-900 dark:text-red-300">
                            Avoid for Now
                        </h4>
                    </div>
                    <ul className="space-y-2">
                        {avoid.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Note */}
            <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-white">Practical Guidance:</strong> These suggestions are based on your current life phase pattern. They're meant to help you work with the flow, not rigid rules.
                </p>
            </div>
        </div>
    );
};

export default GuidanceActions;
