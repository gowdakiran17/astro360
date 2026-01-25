import React from 'react';
import { Flame } from 'lucide-react';

interface RemedyCardProps {
  remedies: string[];
}

const RemedyCard: React.FC<RemedyCardProps> = ({ remedies }) => {
  return (
    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 shadow-sm h-full">
      <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-600" />
          Today's Remedy
      </h2>
      
      <div className="space-y-3">
        {remedies.map((remedy, i) => (
            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-amber-100/50 shadow-sm">
                <span className="text-xl">{remedy.split(' ')[0]}</span> {/* Emoji assumption */}
                <span className="text-sm font-medium text-amber-800">{remedy.substring(remedy.indexOf(' ') + 1)}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default RemedyCard;
