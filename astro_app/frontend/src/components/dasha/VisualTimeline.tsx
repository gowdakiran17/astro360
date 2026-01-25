import React, { useState } from 'react';

interface DashaSegment {
  lord: string;
  duration_years: number;
  start_date: string;
  end_date: string;
  is_current?: boolean;
}

interface VisualTimelineProps {
  dashas: DashaSegment[];
  startYear: number;
}

const PLANET_COLORS: Record<string, string> = {
  Sun: '#F59E0B',    // Amber
  Moon: '#94A3B8',   // Slate
  Mars: '#EF4444',   // Red
  Mercury: '#10B981', // Emerald
  Jupiter: '#FBBF24', // Yellow
  Venus: '#F472B6',  // Pink
  Saturn: '#6366F1', // Indigo
  Rahu: '#475569',   // Slate Dark
  Ketu: '#9CA3AF'    // Gray
};

const VisualTimeline: React.FC<VisualTimelineProps> = ({ dashas, startYear }) => {
  const [hoveredDasha, setHoveredDasha] = useState<DashaSegment | null>(null);
  
  // Total cycle is 120 years
  const totalYears = 120;
  
  return (
    <div className="w-full">
      <div className="relative h-16 bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200">
        {dashas.map((dasha, idx) => {
          const widthPercent = (dasha.duration_years / totalYears) * 100;
          return (
            <div
              key={idx}
              className="h-full relative group transition-all duration-300 hover:opacity-90"
              style={{ 
                width: `${widthPercent}%`, 
                backgroundColor: PLANET_COLORS[dasha.lord] || '#CBD5E1' 
              }}
              onMouseEnter={() => setHoveredDasha(dasha)}
              onMouseLeave={() => setHoveredDasha(null)}
            >
              {dasha.is_current && (
                <div className="absolute top-0 left-0 w-full h-1 bg-white animate-pulse shadow-[0_0_10px_white]"></div>
              )}
              {/* Label if wide enough */}
              {widthPercent > 5 && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-md">
                  {dasha.lord}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend / Hover Info */}
      <div className="mt-2 h-6 flex justify-between items-center text-xs text-slate-500">
        <span>{startYear}</span>
        {hoveredDasha ? (
          <span className="font-bold text-indigo-600">
            {hoveredDasha.lord} Mahadasha ({hoveredDasha.start_date} - {hoveredDasha.end_date})
          </span>
        ) : (
          <span>Hover for details</span>
        )}
        <span>{startYear + 120}</span>
      </div>
    </div>
  );
};

export default VisualTimeline;
