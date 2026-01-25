import React from 'react';
import NorthIndianChart from '../NorthIndianChart';
import { Layers, Grid, Activity } from 'lucide-react';

interface Planet {
  name: string;
  longitude: number;
  zodiac_sign: string;
  nakshatra: string;
  house: number;
  is_retrograde: boolean;
  speed?: number;
}

interface ChartData {
  ascendant: {
    zodiac_sign: string;
    nakshatra: string;
    longitude: number;
  };
  planets: Planet[];
}

interface VastuAstroChartsProps {
  data: ChartData | null;
}

const VastuAstroCharts: React.FC<VastuAstroChartsProps> = ({ data }) => {
  if (!data) return <div className="text-center p-8 text-slate-500">Loading charts...</div>;

  // Helper to get Planet Lord (RL) - Simplified Rulership
  const getRashiLord = (sign: string) => {
    const lords: Record<string, string> = {
      "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
      "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
      "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
    };
    return lords[sign] || "-";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Birth Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Grid className="w-5 h-5 text-indigo-600" /> Birth Chart (Lagna)
            </h3>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">D1</span>
          </div>
          <div className="aspect-square w-full max-w-[400px] mx-auto">
             <NorthIndianChart data={data} />
          </div>
        </div>

        {/* Cusp Chart (Simulated same as D1 for now, or use Bhava Chalit if available) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" /> Cusp Chart (Bhava)
            </h3>
            <span className="text-xs font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded">KP</span>
          </div>
          <div className="aspect-square w-full max-w-[400px] mx-auto opacity-80">
             {/* Using same data for visual placeholder, normally this would be bhava data */}
             <NorthIndianChart data={data} />
          </div>
        </div>
      </div>

      {/* 2. Planet Details Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-900 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Planet & House Details</h3>
          <span className="text-indigo-200 text-xs font-mono">KP SYSTEM</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-indigo-200 uppercase bg-indigo-950 font-bold">
              <tr>
                <th className="px-6 py-3">Planet</th>
                <th className="px-6 py-3">Degree</th>
                <th className="px-6 py-3">Rashi</th>
                <th className="px-6 py-3">Nakshatra</th>
                <th className="px-6 py-3">RL (Sign Lord)</th>
                <th className="px-6 py-3">NL (Star Lord)</th>
                <th className="px-6 py-3">SL (Sub Lord)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.planets.map((p) => (
                <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                    {p.name}
                    {p.is_retrograde && <span className="text-[10px] text-rose-600 bg-rose-50 px-1 rounded">(R)</span>}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">{p.longitude.toFixed(2)}°</td>
                  <td className="px-6 py-4 text-slate-700">{p.zodiac_sign}</td>
                  <td className="px-6 py-4 text-slate-700">{p.nakshatra}</td>
                  <td className="px-6 py-4 font-medium text-indigo-600">{getRashiLord(p.zodiac_sign)}</td>
                  <td className="px-6 py-4 text-slate-500">-</td>
                  <td className="px-6 py-4 text-slate-500">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Planet Script (Significators) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-purple-900 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Planet Script</h3>
          <span className="text-purple-200 text-xs font-mono">SIGNIFICATORS</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-purple-200 uppercase bg-purple-950 font-bold">
              <tr>
                <th className="px-6 py-3">Planet</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Ind. House</th>
                <th className="px-6 py-3">NL (Star)</th>
                <th className="px-6 py-3">SL (Sub)</th>
                <th className="px-6 py-3">Mahadasha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.planets.map((p, i) => (
                <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                  <td className="px-6 py-4 text-slate-600">{p.house}</td>
                  <td className="px-6 py-4 text-slate-500">-</td>
                  <td className="px-6 py-4 font-medium text-purple-600">
                     {/* Mock Logic for visual similarity to screenshot */}
                     {['Ke', 'Ve', 'Su', 'Mo', 'Ma', 'Ra', 'Ju', 'Sa', 'Me'][i % 9]}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                     {['Me', 'Ke', 'Su', 'Ma', 'Ve', 'Ra', 'Sa', 'Ju', 'Mo'][i % 9]}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                     2024-20{30 + i}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Aspects (Western/Vedic Mixed) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Aspects on Houses</h3>
          <Activity className="w-5 h-5 text-slate-400" />
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-700">House {i + 1}</span>
                        <div className="flex gap-2">
                             {/* Mock Aspects */}
                             {(i % 3 === 0) && <span className="text-xs font-bold text-green-600">Ju (Trine)</span>}
                             {(i % 4 === 0) && <span className="text-xs font-bold text-rose-600">Ma (4th)</span>}
                             {(i % 7 === 0) && <span className="text-xs font-bold text-slate-600">Sa (7th)</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

    </div>
  );
};

export default VastuAstroCharts;
