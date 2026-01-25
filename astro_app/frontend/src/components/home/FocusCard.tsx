import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FocusCardProps {
  goodActions: string[];
  avoidActions: string[];
}

const FocusCard: React.FC<FocusCardProps> = ({ goodActions, avoidActions }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-full flex flex-col">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Your Focus Today</h2>
      
      <div className="space-y-6 flex-1">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-2 uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4" /> Best actions today
          </div>
          <ul className="space-y-2">
            {goodActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                {action}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-2 uppercase tracking-wide">
            <AlertCircle className="w-4 h-4" /> Avoid
          </div>
          <ul className="space-y-2">
            {avoidActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0"></span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FocusCard;
