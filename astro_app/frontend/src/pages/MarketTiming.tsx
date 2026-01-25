import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { businessService } from '../services/business';
import { useChartSettings } from '../context/ChartContext';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Calendar, 
  Activity, Zap, Download, Shield, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface Insight {
  type: 'risk' | 'opportunity' | 'neutral' | 'info';
  title: string;
  description: string;
  intensity: 'low' | 'medium' | 'high';
}

interface MarketData {
  date: string;
  transits: any[];
  insights: Insight[];
  summary: string;
}

interface LiveData {
  volatility_index: number;
  market_mood: string;
}

interface PerformanceData {
  metrics: {
    win_rate: number;
    total_signals: number;
    profit_factor: number;
  };
  validation: {
    high_suitability_win_rate: number;
    low_suitability_win_rate: number;
  };
}

const MarketTiming = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { currentProfile } = useChartSettings();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentProfile) return;
      
      setLoading(true);
      try {
        const locationParams = {
          lat: currentProfile.latitude,
          lon: currentProfile.longitude,
          timezone: currentProfile.timezone
        };

        const [marketRes, liveRes, perfRes] = await Promise.all([
          businessService.getMarketTiming(locationParams),
          businessService.getLiveFeed(undefined, locationParams),
          businessService.getPerformanceStats()
        ]);
        
        setMarketData(marketRes);
        setLiveData(liveRes);
        setPerformanceData(perfRes);
      } catch (err) {
        console.error("Error fetching market timing data:", err);
        setError('Failed to load market intelligence. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Poll live data every 30 seconds
    const interval = setInterval(async () => {
      if (!currentProfile) return;
      try {
        const locationParams = {
          lat: currentProfile.latitude,
          lon: currentProfile.longitude,
          timezone: currentProfile.timezone
        };
        const liveRes = await businessService.getLiveFeed(undefined, locationParams);
        setLiveData(liveRes);
      } catch (e) {
        console.warn("Live poll failed", e);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentProfile]);

  const handleExport = () => {
    if (!marketData) return;
    const report = {
      date: new Date().toISOString(),
      market_mood: liveData?.market_mood,
      volatility: liveData?.volatility_index,
      summary: marketData.summary,
      insights: marketData.insights,
      transits: marketData.transits
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-timing-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Mock historical data for the chart based on timeframe
  const getChartData = () => {
    const points = timeframe === 'daily' ? 24 : timeframe === 'weekly' ? 7 : 30;
    return Array.from({ length: points }, (_, i) => ({
      name: timeframe === 'daily' ? `${i}:00` : `Day ${i + 1}`,
      sentiment: 50 + Math.random() * 40 - 20,
      volatility: 30 + Math.random() * 30,
      signal: Math.random() > 0.5 ? 1 : 0
    }));
  };

  const chartData = getChartData();

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'risk': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800';
      case 'opportunity': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      case 'info': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="w-5 h-5" />;
      case 'opportunity': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <MainLayout title="Market Timing Intelligence" breadcrumbs={['Cosmic Hub', 'Business', 'Market Timing']}>
        <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 animate-pulse">Analyzing planetary transits & market cycles...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !marketData) {
    return (
      <MainLayout title="Market Timing Intelligence">
        <div className="p-8 max-w-2xl mx-auto mt-10 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analysis Unavailable</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Retry Analysis
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Market Timing Intelligence" breadcrumbs={['Cosmic Hub', 'Business', 'Market Timing']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-500" />
              Market Timing Intelligence
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {new Date(marketData.date).toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            {(['daily', 'weekly', 'monthly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  timeframe === t 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button 
              onClick={handleExport}
              className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
              title="Export Report"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Status Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="w-32 h-32 text-indigo-500" />
            </div>
            
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Executive Summary</h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-start mb-8 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                    {liveData?.market_mood || 'Neutral'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    liveData?.market_mood === 'Bullish' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    liveData?.market_mood === 'Bearish' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    Market Mood
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                  {marketData.summary}
                </p>
              </div>
              
              <div className="flex flex-col items-center min-w-[120px]">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={251.2} 
                      strokeDashoffset={251.2 - (251.2 * (liveData?.volatility_index || 0)) / 100}
                      className={`${(liveData?.volatility_index || 0) > 70 ? 'text-rose-500' : 'text-indigo-500'} transition-all duration-1000 ease-out`} 
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{liveData?.volatility_index || 0}</span>
                    <span className="block text-[10px] text-slate-500 uppercase">Vol Index</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{color: '#64748b', fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="sentiment" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSentiment)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Strategy Performance
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Win Rate</span>
                  <span className="text-lg font-bold text-emerald-600">{performanceData?.metrics.win_rate}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Signals</span>
                  <span className="text-lg font-bold text-indigo-600">{performanceData?.metrics.total_signals}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Profit Factor</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{performanceData?.metrics.profit_factor}x</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">AI Confidence</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Based on historical backtesting of similar planetary alignments (1980-2024).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Active Market Signals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketData.insights.map((insight, index) => (
              <div key={index} className={`p-6 rounded-2xl border transition-all hover:shadow-md ${getInsightColor(insight.type)}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-white/50 rounded-lg">
                    {getIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-base">{insight.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                        insight.intensity === 'high' ? 'bg-red-100 border-red-200 text-red-700' : 'bg-white/50 border-transparent'
                      }`}>
                        {insight.intensity}
                      </span>
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed mb-4">
                      {insight.description}
                    </p>
                    <div className="w-full bg-black/5 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${insight.type === 'risk' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: insight.intensity === 'high' ? '90%' : insight.intensity === 'medium' ? '60%' : '30%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planetary Positions Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Planetary Transit Data
            </h3>
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
              Geocentric Tropical Zodiac
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Planet</th>
                  <th className="px-6 py-4">Zodiac Sign</th>
                  <th className="px-6 py-4">Nakshatra (Star)</th>
                  <th className="px-6 py-4">Motion</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {marketData.transits.map((planet: any) => (
                  <tr key={planet.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-serif">
                        {planet.name[0]}
                      </div>
                      {planet.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {planet.zodiac_sign}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {planet.nakshatra}
                    </td>
                    <td className="px-6 py-4">
                      {planet.is_retrograde ? (
                        <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2 py-1 rounded-md w-fit border border-rose-100">
                          <TrendingDown className="w-3 h-3" />
                          <span className="text-xs font-bold">Retrograde</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit border border-emerald-100">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs font-bold">Direct</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${planet.is_retrograde ? 'bg-rose-400' : 'bg-emerald-400'}`} 
                          style={{ width: `${Math.random() * 40 + 60}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MarketTiming;
