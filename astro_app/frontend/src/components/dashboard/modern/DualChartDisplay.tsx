import React, { useState } from 'react';
import SouthIndianChart from '../../charts/SouthIndianChart';
import NorthIndianChart from '../../NorthIndianChart';
import { LayoutGrid, Maximize2 } from 'lucide-react';

interface DualChartDisplayProps {
  d1Data: any;
  d9Data: any; // Optional, if null we might show placeholder or same data
}

const DualChartDisplay: React.FC<DualChartDisplayProps> = ({ d1Data, d9Data }) => {
  const [chartStyle, setChartStyle] = useState<'NORTH_INDIAN' | 'SOUTH_INDIAN'>('NORTH_INDIAN');

  if (!d1Data) return null;

  // Helper to render correct chart type
  const renderChart = (data: any, title: string) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative group hover:bg-white/10 transition-all">
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <h3 className="font-serif text-lg text-white">{title}</h3>
        <div className="flex gap-2">
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full font-medium">{chartStyle === 'NORTH_INDIAN' ? 'North Indian' : 'South Indian'}</span>
            <button className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="aspect-square w-full max-w-[400px] mx-auto p-2">
        {chartStyle === 'NORTH_INDIAN' ? (
          <NorthIndianChart data={data} />
        ) : (
          <SouthIndianChart data={data} />
        )}
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-serif text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <LayoutGrid className="w-5 h-5" />
            </span>
            Divisional Charts
         </h2>
         <div className="flex bg-black/30 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
            <button 
                onClick={() => setChartStyle('NORTH_INDIAN')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${chartStyle === 'NORTH_INDIAN' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                North Indian
            </button>
            <button 
                onClick={() => setChartStyle('SOUTH_INDIAN')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${chartStyle === 'SOUTH_INDIAN' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                South Indian
            </button>
         </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderChart(d1Data, "D1 - Rasi Chart (Lagna)")}
        {renderChart(d9Data || d1Data, "D9 - Navamsa Chart")} 
      </div>
    </div>
  );
};

export default DualChartDisplay;
