import React from 'react';
import { useNavigate } from 'react-router-dom';
import AstroScoreCard from '../components/dashboard/AstroScoreCard';
import DashaTimeline from '../components/dashboard/DashaTimeline';
import BasicDetailsTable from '../components/dashboard/BasicDetailsTable';
import UniversalChart from '../components/charts/UniversalChart';
import PlanetaryTable from '../components/dashboard/PlanetaryTable';
import PanchangCard from '../components/dashboard/PanchangCard';
import DailyInsights from '../components/dashboard/DailyInsights';
import TransitStatusBar from '../components/dashboard/TransitStatusBar';
import { Compass, Zap, Grid, Wand2, Clock, Calendar, MapPin, Globe, User, Moon } from 'lucide-react';
import AIReportButton from '../components/ai/AIReportButton';

interface HomeAdvancedProps {
  profile: any;
  chartData: any;
  panchangData: any;
  dashaData: any;
  shadbalaData: any;
}

const HomeAdvanced: React.FC<HomeAdvancedProps> = ({ 
  profile, 
  chartData, 
  panchangData, 
  dashaData, 
  shadbalaData 
}) => {
  const navigate = useNavigate();

  // Parse Dasha
  const findActive = (list: any[]) => list?.find((d: any) => d.is_current);
  const activeMahadasha = dashaData ? findActive(dashaData.dashas) : null;
  const activeAntardasha = activeMahadasha ? findActive(activeMahadasha.antardashas) : null;
  const activePratyantar = activeAntardasha ? findActive(activeAntardasha.pratyantardashas) : null;

  const currentDashas = activeMahadasha ? [
    { level: 'MAHADASHA', planet: activeMahadasha.lord, start: activeMahadasha.start_date, end: activeMahadasha.end_date, progress: 50, color: 'bg-indigo-500' },
    { level: 'ANTARDASHA', planet: activeAntardasha?.lord || 'Unknown', start: activeAntardasha?.start_date, end: activeAntardasha?.end_date, progress: 30, color: 'bg-purple-500' },
    { level: 'PRATYANTAR', planet: activePratyantar?.lord || 'Unknown', start: activePratyantar?.start_date, end: activePratyantar?.end_date, progress: 70, color: 'bg-pink-500' }
  ] : [];

  // Shadbala Score
  const shadbalaScore = shadbalaData?.planets 
    ? Math.min(Math.round(shadbalaData.planets.reduce((acc: number, p: any) => acc + p.percentage, 0) / shadbalaData.planets.length), 100)
    : 0;
  
  const shadbalaStatus = shadbalaScore >= 80 ? 'Excellent' : shadbalaScore >= 60 ? 'Strong' : shadbalaScore >= 40 ? 'Average' : 'Weak';

  return (
    <div className="min-h-screen bg-slate-50/30 pb-12 animate-fade-in font-sans flex flex-col">
      <div className="w-full flex flex-col shadow-sm">
        <TransitStatusBar />
      </div>

      {/* Main Content Layout */}
      <div className="w-full px-6 mt-8 flex-1">
        
        {/* Welcome Hero Section */}
        <div className="mb-8 relative rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Greeting & Name */}
            <div className="text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 text-sm font-medium">
                 <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">Advanced Analysis</span>
                 <span>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight text-slate-900">
                {profile.name}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-500 text-xs font-medium pt-1">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.location}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {profile.time}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {profile.date}
                </span>
              </div>
            </div>

            {/* Right: Action */}
            <div className="shrink-0">
              {chartData && (
                <AIReportButton
                  buttonText="Ask AI Astrologer"
                  context={`Report for ${profile.name}`}
                  data={{ chart: chartData, dasha: dashaData, panchang: panchangData }}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
                />
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="space-y-8">
          
          {/* Top Row: Chart, Strength, Panchang, Moon Phase */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Lagna Chart Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-1 min-h-[420px] flex flex-col relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700"></div>
                
                <div className="relative z-10 p-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-900">Lagna Chart</h3>
                    <p className="text-sm text-slate-500 font-medium">Birth Chart (D1)</p>
                  </div>
                  {chartData?.ascendant && (
                    <button onClick={() => navigate('/zodiac/profile')} className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:scale-105">
                      {chartData.ascendant.zodiac_sign} Ascendant
                    </button>
                  )}
                </div>
                
                <div className="flex-1 flex items-center justify-center p-4">
                  {chartData ? (
                    <div className="transform scale-100 group-hover:scale-105 transition-transform duration-500 ease-out">
                      <UniversalChart data={chartData} />
                    </div>
                  ) : (
                    <div className="animate-pulse w-full h-full bg-slate-50 rounded-xl" />
                  )}
                </div>
            </div>

            {/* Cosmic Strength Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 min-h-[420px] flex flex-col relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300">
              <div className="relative z-10 flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-900">Cosmic Strength</h3>
                    <p className="text-sm text-slate-500 font-medium">Shadbala & Power Analysis</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <AstroScoreCard score={shadbalaScore} status={shadbalaStatus} onViewReport={() => navigate('/calculations/shadbala')} />
                </div>
            </div>

            {/* Daily Panchang */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-2 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col h-full">
              <PanchangCard panchang={panchangData} />
            </div>

            {/* Moon Phase - Dark Theme Feature */}
            <div className="bg-[#0F172A] rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group flex flex-col h-full">
              <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-500/30 rounded-full filter blur-[80px] -mr-10 -mt-10 animate-pulse"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium">
                    <Moon className="w-4 h-4" />
                    <span>Moon Phase</span>
                  </div>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-xs font-bold border border-indigo-500/30">Waxing Gibbous</span>
                </div>
                
                <div className="flex items-center justify-center py-4 flex-1">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-200 to-slate-800 shadow-[0_0_50px_rgba(99,102,241,0.3)] relative group-hover:scale-105 transition-transform duration-700">
                    <div className="absolute inset-2 rounded-full bg-slate-900/80 backdrop-blur-sm"></div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <h3 className="text-2xl font-display font-bold mb-1">75% Illumination</h3>
                  <p className="text-slate-400 text-sm">Excellent for new beginnings</p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-medium">
                    <span>Next: Full Moon</span>
                    <span>In 3 Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Insights */}
          <DailyInsights />

          {/* Basic Details Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" /> Birth Details
              </h3>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">Edit Details</button>
            </div>
            <div className="p-8">
              <BasicDetailsTable profile={profile} />
            </div>
          </div>

          {/* Dasha & Planets Grid */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 h-full group">
              <div className="flex items-center mb-6 gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Vimshottari Dasha</h3>
                  <p className="text-xs text-slate-500 font-medium">Planetary Periods</p>
                </div>
              </div>
              <DashaTimeline dashas={currentDashas} currentMahadasha={activeMahadasha || { planet: 'Unknown', start: '', end: '' }} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 h-full group">
              <div className="flex items-center mb-6 gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Planetary Positions</h3>
                  <p className="text-xs text-slate-500 font-medium">Celestial Longitudes</p>
                </div>
              </div>
              {chartData && <PlanetaryTable planets={chartData.planets} ascendant={chartData.ascendant} />}
            </div>
          </div>
            
          {/* Quick Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Divisional Charts', icon: Grid, desc: 'D9, D10, D60 & more' },
              { title: 'Gemstone Suggestion', icon: Wand2, desc: 'Remedial stones' },
              { title: 'Vastu Analysis', icon: Compass, desc: 'Directional strength' },
              { title: 'Export PDF', icon: Zap, desc: 'Download full report' }
            ].map((tool, i) => (
              <button key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all text-left group">
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
                  <tool.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{tool.title}</h3>
                <p className="text-sm text-slate-500">{tool.desc}</p>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeAdvanced;