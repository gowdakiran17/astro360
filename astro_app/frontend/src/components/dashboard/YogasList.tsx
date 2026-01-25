import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';

const MOCK_YOGAS = [
  { name: 'Lagna-Putra Raja Yoga', description: 'Powerful combination for fame and authority.' },
  { name: 'Maha-Ratha Raja Yoga', description: 'Indicates wealth through vehicles and property.' },
  { name: 'Bandu-Karma Raja Yoga', description: 'Success through family connections or real estate.' },
  { name: 'Gajakesari Yoga', description: 'Wisdom, wealth, and lasting fame.' },
  { name: 'Budhaditya Yoga', description: 'Intelligence, communication skills, and success in business.' }
];

const YogasList = () => {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center">
        <Zap className="w-4 h-4 text-purple-500 mr-2" />
        <h3 className="font-bold text-slate-800">Yogas in Your Chart</h3>
      </div>
      
      <div className="divide-y divide-slate-100">
        {MOCK_YOGAS.map((yoga, index) => (
          <div key={index} className="bg-white">
            <button 
              onClick={() => setExpanded(expanded === index ? null : index)}
              className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-medium text-slate-700 text-sm">{yoga.name}</span>
              {expanded === index ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            
            {expanded === index && (
              <div className="px-6 pb-4 pt-0 text-xs text-slate-500">
                {yoga.description}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button className="w-full py-3 text-center text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-t border-slate-100 transition-colors">
        View all Celestial Yogas →
      </button>
    </div>
  );
};

export default YogasList;
