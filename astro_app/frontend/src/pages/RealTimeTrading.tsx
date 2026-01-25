import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Zap, 
  Terminal, Shield, Clock, Wifi, Lock
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { businessService } from '../services/business';

interface Signal {
  source: string;
  message: string;
  impact: "High" | "Medium" | "Low" | "Critical";
  direction: string;
  timestamp?: string;
}

interface MarketData {
  timestamp: string;
  btc_price: number;
  btc_change: number;
  spx_price: number;
  spx_change: number;
  volatility_index: number;
  market_mood: string;
  active_signals: Signal[];
}

const RealTimeTrading = () => {
  const [data, setData] = useState<MarketData | null>(null);
  const [history, setHistory] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  
  // Mock Subscription Check
  const isPremium = true; 

  const fetchLiveData = async () => {
    try {
      const result = await businessService.getLiveFeed();
      setData(result);
      
      // Update Signal History (keep last 50)
      if (result.active_signals && result.active_signals.length > 0) {
        const newSignals = result.active_signals.map((s: any) => ({
          ...s,
          timestamp: result.timestamp
        }));
        
        setHistory(prev => {
          // Avoid duplicates based on message + timestamp
          const uniqueNew = newSignals.filter((ns: any) => 
            !prev.some(p => p.message === ns.message && p.timestamp === ns.timestamp)
          );
          return [...uniqueNew, ...prev].slice(0, 50);
        });
      }
      
      setLoading(false);
      setIsConnected(true);
    } catch (err) {
      console.error(err);
      setIsConnected(false);
      // Don't set error state to block UI, just show disconnected icon
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000); // 3 seconds poll
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <MainLayout title="Live Trading Intelligence" breadcrumbs={['Cosmic Hub', 'Business', 'Live Terminal']}>
        <div className="flex h-96 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Live Trading Intelligence" breadcrumbs={['Cosmic Hub', 'Business', 'Live Terminal']}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Connection Status Bar */}
        <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs font-mono uppercase tracking-wider">
                    {isConnected ? 'System Online • Receiving Live Astro-Data' : 'Connection Lost • Retrying...'}
                </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {data?.timestamp} EST
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                    <Wifi className="w-3 h-3" /> 12ms
                </span>
            </div>
        </div>

        {/* Ticker Tape */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BTC Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg" alt="BTC" className="w-24 h-24" />
                </div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Bitcoin (BTC/USD)</h3>
                <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white">
                        ${data?.btc_price.toLocaleString()}
                    </span>
                    <span className={`flex items-center text-sm font-bold ${data?.btc_change && data.btc_change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {data?.btc_change && data.btc_change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {data?.btc_change}%
                    </span>
                </div>
            </div>

            {/* SPX Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity className="w-24 h-24 text-slate-900 dark:text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">S&P 500 (SPX)</h3>
                <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white">
                        ${data?.spx_price.toLocaleString()}
                    </span>
                    <span className={`flex items-center text-sm font-bold ${data?.spx_change && data.spx_change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {data?.spx_change && data.spx_change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {data?.spx_change}%
                    </span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Volatility & Mood */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Volatility Meter */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-slate-800 dark:text-white">Cosmic Volatility</h3>
                    </div>
                    
                    <div className="relative pt-4 pb-2">
                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${
                                    (data?.volatility_index || 0) > 70 ? 'bg-red-500' : 
                                    (data?.volatility_index || 0) > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${data?.volatility_index}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-bold text-slate-500">
                            <span>LOW</span>
                            <span>HIGH</span>
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">{data?.volatility_index}</span>
                            <span className="text-sm text-slate-500 ml-1">/ 100</span>
                        </div>
                    </div>
                </div>

                {/* Market Mood */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                     <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-bold text-slate-800 dark:text-white">Astro-Market Mood</h3>
                    </div>
                    <div className={`p-4 rounded-lg text-center border-2 ${
                        data?.market_mood === 'Bullish' ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900' :
                        data?.market_mood === 'Bearish' ? 'border-red-100 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900' :
                        data?.market_mood === 'Volatile' ? 'border-amber-100 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900' :
                        'border-slate-100 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                        <span className="text-2xl font-bold uppercase tracking-widest">{data?.market_mood}</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 text-center">
                        Based on planetary alignments and lunar phases relative to global market charts.
                    </p>
                </div>

            </div>

            {/* Right Column: Live Terminal */}
            <div className="lg:col-span-2">
                <div className="bg-slate-900 text-slate-300 p-6 rounded-xl border border-slate-700 shadow-lg h-[500px] flex flex-col font-mono">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Terminal className="w-5 h-5" />
                            <h3 className="font-bold">LIVE INTELLIGENCE FEED</h3>
                        </div>
                        {!isPremium && (
                            <div className="flex items-center gap-1 text-amber-400 text-xs bg-amber-900/30 px-2 py-1 rounded">
                                <Lock className="w-3 h-3" /> PREMIUM ONLY
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {isPremium ? (
                            history.map((signal, idx) => (
                                <div key={idx} className="flex gap-4 p-3 rounded hover:bg-slate-800/50 transition-colors border-l-2 border-transparent hover:border-indigo-500">
                                    <div className="w-16 text-xs text-slate-500 pt-1">
                                        {signal.timestamp}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                                signal.impact === 'Critical' ? 'bg-red-900 text-red-200' :
                                                signal.impact === 'High' ? 'bg-orange-900 text-orange-200' :
                                                'bg-slate-800 text-slate-400'
                                            }`}>
                                                {signal.impact}
                                            </span>
                                            <span className="text-sm font-bold text-white">{signal.source}</span>
                                        </div>
                                        <p className="text-sm text-slate-300">{signal.message}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold ${
                                            signal.direction.includes('Buy') ? 'text-emerald-400' :
                                            signal.direction.includes('Sell') ? 'text-red-400' :
                                            'text-amber-400'
                                        }`}>
                                            {signal.direction}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                                <Lock className="w-12 h-12 mb-4 text-slate-600" />
                                <h3 className="text-xl font-bold text-white mb-2">Subscription Required</h3>
                                <p className="max-w-md">Upgrade to Astro360 Premium to access real-time planetary trading signals and volatility alerts.</p>
                            </div>
                        )}
                        
                        {history.length === 0 && isPremium && (
                            <div className="text-center text-slate-600 mt-20">
                                Waiting for signals...
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default RealTimeTrading;
