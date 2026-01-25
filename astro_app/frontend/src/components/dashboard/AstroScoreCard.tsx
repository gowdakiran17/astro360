interface AstroScoreCardProps {
  score: number;
  status: string;
  onViewReport?: () => void;
}

const AstroScoreCard = ({ score, status, onViewReport }: AstroScoreCardProps) => {
  // Calculate circle dash for progress
  const radius = 60; // Increased radius for better spacing
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-blue-500';
    if (s >= 40) return 'text-orange-500';
    return 'text-red-500';
  };
  const colorClass = getColor(score);
  const strokeColor = score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-between h-full">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center text-sm font-bold text-slate-800 uppercase tracking-wide">
          <span className={`w-2 h-2 rounded-full mr-2 ${score >= 60 ? 'bg-green-500' : 'bg-orange-500'}`}></span>
          Overall Strength
        </div>
        <button 
          onClick={onViewReport}
          className="text-xs text-indigo-600 font-semibold hover:underline hover:text-indigo-800 transition-colors"
        >
          View Report
        </button>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-5xl font-black ${colorClass}`}>{score}</span>
          <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${colorClass}`}>{status}</span>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-px bg-slate-100 rounded-lg overflow-hidden mt-4">
        <div className="bg-white p-3 text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold">Strongest</div>
          <div className="text-sm font-bold text-green-600 mt-1">Jupiter (12.4)</div>
        </div>
        <div className="bg-white p-3 text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold">Weakest</div>
          <div className="text-sm font-bold text-red-600 mt-1">Mars (5.2)</div>
        </div>
      </div>
    </div>
  );
};


export default AstroScoreCard;
