import React from 'react';
import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-slate-800/30 rounded-2xl border border-white/5 backdrop-blur-sm">
      <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-2xl font-serif text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md">
        This section is currently under development. Check back soon for detailed {title.toLowerCase()} analysis.
      </p>
    </div>
  );
};

export default ComingSoon;
