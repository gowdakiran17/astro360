interface DashaItem {
  level: string;
  planet: string;
  start: string;
  end: string;
  progress: number;
  color: string;
}

interface DashaTimelineProps {
  dashas?: DashaItem[];
  currentMahadasha?: {
    planet: string;
    start: string;
    end: string;
  };
}

const DashaTimeline = ({ dashas }: DashaTimelineProps) => {
  if (!dashas || dashas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Data unavailable
      </div>
    );
  }

  return (
    <div>
      {/* Current Dasha Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {dashas.map((dasha, idx) => (
          <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100 relative overflow-hidden group hover:border-slate-200 transition-colors">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">{dasha.level}</div>
            <div className="text-lg font-bold text-slate-900 mb-1 font-display">{dasha.planet}</div>
            
            {/* Minimalist Progress Indicator */}
            <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                    className={`h-full rounded-full ${dasha.color}`} 
                    style={{ width: `${dasha.progress}%` }}
                ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 text-center">
        <p className="text-sm text-slate-600 font-medium">
            You are in <span className="text-indigo-600 font-bold">{dashas[0]?.planet}</span> Mahadasha
        </p>
        <p className="text-xs text-slate-400 mt-1">
            Until {dashas[0]?.end}
        </p>
      </div>
    </div>
  );
};

export default DashaTimeline;
