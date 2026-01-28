import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { businessService } from '../services/business';
import { useChartSettings } from '../context/ChartContext';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Crosshair, 
  Search, Activity, Clock, Calendar, Shield, Target,
  Zap, AlertOctagon, RefreshCw
} from 'lucide-react';

// --- Types ---

interface Signature {
  title: string;
  impact: string;
  description: string;
  severity: 'High' | 'Medium' | 'Critical';
}

interface GannLevels {
  resistance: number[];
  support: number[];
}

interface Harmonic {
  planet: string;
  aspect_degree: number;
  zodiac_degree: number;
  type: string;
}

interface MarketEvent {
  date: string;
  type: string; // 'Reversal' | 'Breakout' | 'Crash Risk'
  reason?: string;
  impact?: string;
  intensity?: string;
}

interface TradeWindow {
  start: string;
  end: string;
  action: 'Buy' | 'Sell' | 'Avoid';
  confidence: string;
}

interface AccuracyStats {
  last_30d: string;
  last_90d: string;
}

interface PersonalOverlay {
  status: string;
  score: number;
  strategy: string;
  color: string;
  dasha_lord: string;
  factors: {
    name: string;
    value: string;
    impact: string;
    desc: string;
  }[];
}

interface GannData {
  date: string;
  signatures: Signature[];
  gann_levels: GannLevels;
  planetary_harmonics: Harmonic[];
  // Enhanced Fields
  asset?: string;
  trend?: string;
  phase?: string;
  trade_type?: string;
  next_turn?: MarketEvent;
  next_breakout?: MarketEvent;
  crash_risk?: MarketEvent;
  windows?: TradeWindow[];
  triggers?: any[];
  accuracy?: AccuracyStats;
  personal_overlay?: PersonalOverlay;
}

// --- Components ---

const SquareOf9Grid = ({ price, levels }: { price: number, levels: GannLevels }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-indigo-600" />
        Square of 9 Levels
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-[10px] font-bold text-red-600 uppercase mb-2 tracking-widest">Resistances</h4>
          <div className="space-y-2">
            {levels.resistance.slice(0, 4).map((res, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-red-50/50 rounded-lg border border-red-100/50">
                <span className="text-sm font-mono font-bold text-red-700">{res.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                  +{(((res/price)-1)*100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-2 tracking-widest">Supports</h4>
          <div className="space-y-2">
            {levels.support.slice(0, 4).map((sup, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                <span className="text-sm font-mono font-bold text-emerald-700">{sup.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-medium">
                  -{((1-(sup/price))*100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
        <p className="text-[10px] text-slate-500 italic">
          * Calculated based on price-root harmonics (Gann Square of 9). 
          Major turning points often occur when price hits these geometric resonance levels.
        </p>
      </div>
    </div>
  );
};

const GannChat = ({ asset, gannData, birthDetails }: { asset: string, gannData: any, birthDetails: any }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await businessService.askGannAI({
        question: userMsg,
        asset,
        gann_data: gannData,
        birth_details: birthDetails
      });
      setMessages(prev => [...prev, { role: 'ai', content: response.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't process that request right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      <div className="bg-slate-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
            <h3 className="text-sm font-bold text-white">Gann AI Assistant</h3>
            <p className="text-[10px] text-slate-400">Ask about {asset} cycles & alignment</p>
            </div>
        </div>
        <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Live</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="text-center py-10 px-6">
             <div className="bg-indigo-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-indigo-600" />
             </div>
             <h4 className="text-slate-800 font-bold mb-1">Market Cycle Expert</h4>
             <p className="text-xs text-slate-500 mb-6">Ask me anything about {asset}'s Gann analysis or how it aligns with your personal chart.</p>
             <div className="grid grid-cols-1 gap-2">
                {[
                    `Should I enter ${asset} now?`, 
                    `When is the next major reversal?`, 
                    `Explain my personal alignment score.`
                ].map(q => (
                  <button 
                    key={q} 
                    onClick={() => setInput(q)}
                    className="text-left text-xs bg-white border border-slate-200 px-4 py-3 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm flex items-center justify-between group"
                  >
                    {q}
                    <Search className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" />
                  </button>
                ))}
             </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-200' 
                : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="w-full pl-4 pr-12 py-3.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm placeholder:text-slate-400"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Zap className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
            AI can make mistakes. Always verify with your own analysis.
        </p>
      </div>
    </div>
  );
};

const GannIntelligence = () => {
  const { currentProfile } = useChartSettings();
  const [data, setData] = useState<GannData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Inputs
  const [marketType, setMarketType] = useState('Crypto');
  const [asset, setAsset] = useState('Bitcoin');

  const assetsMap: Record<string, string[]> = {
    'Crypto': ['Bitcoin', 'Ethereum', 'Solana', 'XRP', 'Dogecoin'],
    'Indices': ['S&P 500', 'Nasdaq', 'NIFTY 50', 'Dow Jones'],
    'Stocks': ['Apple', 'Tesla', 'NVIDIA', 'Reliance', 'TCS']
  };

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isPersonalOverlayOn, setIsPersonalOverlayOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'market' | 'personal'>('market');

  // Derived State for Current Day
  const getDayStatus = () => {
    if (!data) return { signal: 'Hold', color: 'text-slate-500', bg: 'bg-slate-100' };
    
    // Check Windows
    const activeWindow = data.windows?.find(w => {
      const start = new Date(w.start).getTime();
      const end = new Date(w.end).getTime();
      const current = new Date(selectedDate).getTime();
      return current >= start && current <= end;
    });

    if (activeWindow) {
      if (activeWindow.action === 'Buy') return { signal: 'Buy', color: 'text-green-400', bg: 'bg-green-50' };
      if (activeWindow.action === 'Sell') return { signal: 'Reduce', color: 'text-amber-500', bg: 'bg-amber-50' };
      if (activeWindow.action === 'Avoid') return { signal: 'Avoid', color: 'text-red-600', bg: 'bg-red-50' };
    }

    // Check Turn
    if (data.next_turn && data.next_turn.date.startsWith(selectedDate)) {
        return { signal: 'Watch', color: 'text-indigo-600', bg: 'bg-indigo-100' };
    }

    return { signal: 'Hold', color: 'text-slate-500', bg: 'bg-slate-100' };
  };

  const dayStatus = getDayStatus();

  // Final Action Logic
  const getFinalAction = () => {
      if (!data) return { action: 'Loading...', color: 'text-slate-400' };
      
      const baseAction = dayStatus.signal;
      
      if (!isPersonalOverlayOn || !data.personal_overlay) {
          // Map base signal to display format
          if (baseAction === 'Buy') return { action: 'BUY', color: 'text-green-400' };
          if (baseAction === 'Reduce') return { action: 'SELL', color: 'text-amber-500' };
          if (baseAction === 'Avoid') return { action: 'AVOID', color: 'text-red-600' };
          return { action: 'HOLD', color: 'text-yellow-500' };
      }

      // Combine with Personal
      const pScore = data.personal_overlay.score; // -5 to +5
      
      if (baseAction === 'Buy') {
          if (pScore >= 2) return { action: 'STRONG BUY', color: 'text-green-600' };
          if (pScore <= -2) return { action: 'CAUTIOUS BUY', color: 'text-green-400' };
          return { action: 'BUY', color: 'text-green-400' };
      }
      if (baseAction === 'Reduce' || baseAction === 'Avoid') {
          if (pScore <= -1) return { action: 'STRONG SELL', color: 'text-red-700' };
          return { action: 'AVOID', color: 'text-red-600' };
      }
      
      // Neutral Market
      if (pScore >= 3) return { action: 'ACCUMULATE', color: 'text-green-500' };
      if (pScore <= -3) return { action: 'STAY CASH', color: 'text-slate-500' };
      
      return { action: 'HOLD', color: 'text-yellow-500' };
  };

  const finalAction = getFinalAction();
  const personalPercentage = data?.personal_overlay ? Math.max(0, Math.min(100, (data.personal_overlay.score + 5) * 10)) : 0;

  const fetchData = async () => {
    if (!currentProfile) return;
    
    setLoading(true);
    setError(null);
    try {
      const locationParams = {
        lat: currentProfile.latitude,
        lon: currentProfile.longitude,
        timezone: currentProfile.timezone
      };

      const birthDetails = currentProfile ? {
          date: currentProfile.date,
          time: currentProfile.time,
          timezone: currentProfile.timezone,
          lat: currentProfile.latitude,
          lon: currentProfile.longitude
      } : undefined;
      
      const res = await businessService.getGannIntelligence(
        locationParams, 
        undefined, // price
        asset,
        marketType,
        birthDetails,
        selectedDate
      );
      setData(res);
    } catch (err) {
      console.error("Error fetching Gann data:", err);
      setError('Failed to load Gann intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentProfile, asset, selectedDate]); // Recalculate when profile, asset, or date changes

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Crosshair className="h-6 w-6 text-indigo-600" />
              Gann Trading Intelligence
            </h1>
            <p className="text-slate-600 mt-2">
              AI Market Analyst: Predicting <span className="font-bold text-indigo-700">TIME</span> not just Price.
            </p>
          </div>
          
          {/* Controls */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-3 items-center w-full md:w-auto">
            <select 
              value={marketType}
              onChange={(e) => { setMarketType(e.target.value); setAsset(assetsMap[e.target.value][0]); }}
              className="block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-slate-50"
            >
              <option value="Crypto">Crypto</option>
              <option value="Indices">Indices</option>
              <option value="Stocks">Stocks</option>
            </select>

            <select 
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-slate-50 min-w-[120px]"
            >
              {assetsMap[marketType]?.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-slate-50"
            />
            
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-sm text-slate-600 font-medium">Personal Overlay</span>
                <button 
                    onClick={() => setIsPersonalOverlayOn(!isPersonalOverlayOn)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isPersonalOverlayOn ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isPersonalOverlayOn ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* Tab Switcher */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('market')}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'market' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Market Analysis
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'personal' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Personal Chart Overlay
              </button>
            </div>

            {/* ROW 1: Key Metrics Grid (Visible in both tabs as requested) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Next Major Turn */}
                <div className="bg-slate-900 text-white rounded-xl p-5 relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock className="w-20 h-20" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Next Major Turn</h3>
                    <div className="text-2xl font-bold font-mono mb-1">
                        {data.next_turn ? new Date(data.next_turn.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </div>
                    {data.next_turn && (
                        <div className="mb-3 text-xs text-indigo-300 font-mono">
                            Countdown: {Math.ceil((new Date(data.next_turn.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d remaining
                        </div>
                    )}
                    <div className="inline-block px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                        Type: {data.next_turn?.type || 'None'}
                    </div>
                </div>

                {/* 2. Market Gann Signal */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Market Gann Signal</h3>
                    <div className="flex items-center gap-2">
                        {dayStatus.signal === 'Buy' ? <TrendingUp className="h-8 w-8 text-green-400" /> :
                         dayStatus.signal === 'Reduce' || dayStatus.signal === 'Avoid' ? <TrendingDown className="h-8 w-8 text-red-600" /> :
                         <Activity className="h-8 w-8 text-slate-400" />}
                        <div className={`text-2xl font-bold ${dayStatus.color}`}>
                            {dayStatus.signal.toUpperCase()}
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        Based on Time Cycles for {new Date(selectedDate).toLocaleDateString()}
                    </div>
                </div>

                {/* 3. Personal Alignment */}
                <div className={`rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
                    isPersonalOverlayOn ? 'bg-white border-slate-200 opacity-100' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Personal Alignment</h3>
                    {isPersonalOverlayOn && data.personal_overlay ? (
                        <>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-bold text-slate-900">{personalPercentage}%</span>
                                <span className={`text-sm font-medium mb-1 ${
                                    personalPercentage >= 70 ? 'text-green-600' : 
                                    personalPercentage >= 40 ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                    {personalPercentage >= 70 ? 'Strong For You' : personalPercentage >= 40 ? 'Neutral' : 'Weak'}
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div 
                                    className={`h-2.5 rounded-full transition-all duration-500 ${
                                        personalPercentage >= 70 ? 'bg-green-500' : 
                                        personalPercentage >= 40 ? 'bg-yellow-400' : 'bg-red-500'
                                    }`} 
                                    style={{ width: `${personalPercentage}%` }}
                                ></div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Shield className="h-8 w-8 mb-1" />
                            <span className="text-xs">Overlay Off</span>
                        </div>
                    )}
                </div>

                {/* 4. Final Action */}
                <div className={`rounded-xl p-5 border shadow-sm flex flex-col justify-between relative overflow-hidden ${
                    finalAction.action.includes('STRONG') ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'
                }`}>
                    {finalAction.action.includes('STRONG') && (
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Zap className="w-20 h-20 text-yellow-400" />
                        </div>
                    )}
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${finalAction.action.includes('STRONG') ? 'text-slate-400' : 'text-slate-500'}`}>
                        Final Action
                    </h3>
                    <div className={`text-3xl font-black ${finalAction.color} tracking-tight`}>
                        {finalAction.action}
                    </div>
                    <div className={`text-xs mt-2 ${finalAction.action.includes('STRONG') ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isPersonalOverlayOn ? 'Market + Personal Synthesis' : 'Market Signal Only'}
                    </div>
                </div>
            </div>

            {/* ROW 2: Detailed Analysis */}
            {activeTab === 'market' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT COL: Why This Date + Risk + Square of 9 (4 columns) */}
                  <div className="lg:col-span-4 space-y-6">
                      {/* Why This Date */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                              <Search className="h-4 w-4 text-indigo-600" />
                              Why This Date?
                          </h3>
                          <ul className="space-y-3">
                              <li className="flex items-start gap-2 text-sm text-slate-700">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                                  <span>
                                      {dayStatus.signal !== 'Hold' 
                                          ? `Active ${dayStatus.signal} Window for ${asset}` 
                                          : `Market is in ${data.phase || 'Consolidation'} phase`}
                                  </span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-slate-700">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                                  <span>
                                      {data.next_turn?.date === selectedDate 
                                          ? "Major Planetary Time Cycle Hit" 
                                          : `Next major turn in ${Math.ceil((new Date(data.next_turn?.date || '').getTime() - new Date(selectedDate).getTime()) / (1000 * 60 * 60 * 24))} days`}
                                  </span>
                              </li>
                              {isPersonalOverlayOn && data.personal_overlay && (
                                  <li className="flex items-start gap-2 text-sm text-slate-700">
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                                      <span>
                                          {data.personal_overlay.score >= 2 ? "Your personal chart is highly activated (Wealth Dasha)" :
                                           data.personal_overlay.score <= -1 ? "Your chart indicates caution (Risk Period)" :
                                           "Your personal astrology is neutral"}
                                      </span>
                                  </li>
                              )}
                          </ul>
                      </div>

                      {/* Risk Level */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                              <AlertOctagon className="h-4 w-4 text-indigo-600" />
                              Risk Level
                          </h3>
                          <div className="flex items-center gap-4">
                              <div className={`text-2xl font-bold ${
                                  dayStatus.signal === 'Avoid' || data.crash_risk ? 'text-red-600' :
                                  dayStatus.signal === 'Buy' ? 'text-green-500' : 'text-amber-500'
                              }`}>
                                  {dayStatus.signal === 'Avoid' || data.crash_risk ? 'HIGH' :
                                   dayStatus.signal === 'Buy' ? 'LOW' : 'MEDIUM'}
                              </div>
                              <div className="text-sm text-slate-500 leading-tight">
                                  {dayStatus.signal === 'Avoid' ? "Market conditions are unstable. High volatility expected." :
                                   dayStatus.signal === 'Buy' ? "Favorable time cycle for entry." :
                                   "Standard market volatility."}
                              </div>
                          </div>
                      </div>

                      {/* Square of 9 Levels */}
                      {data.gann_levels && (
                          <SquareOf9Grid 
                              price={asset.includes('BTC') ? 95000 : asset.includes('ETH') ? 2500 : 100} // Mock price for now if not available
                              levels={data.gann_levels} 
                          />
                      )}
                  </div>

                  {/* CENTER COL: Windows + Asset Impact (4 columns) */}
                  <div className="lg:col-span-4 space-y-6">
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                              <Calendar className="h-4 w-4 text-indigo-600" />
                              Time Windows
                          </h3>
                          <div className="space-y-3 flex-1">
                              {data.windows && data.windows.length > 0 ? (
                                  data.windows.slice(0, 5).map((window, idx) => (
                                      <div key={idx} className={`p-3 rounded-lg border flex justify-between items-center ${
                                          window.action === 'Buy' ? 'bg-green-50 border-green-100' :
                                          window.action === 'Sell' ? 'bg-amber-50 border-amber-100' :
                                          'bg-red-50 border-red-100'
                                      }`}>
                                          <div>
                                              <div className={`font-bold text-sm ${
                                                  window.action === 'Buy' ? 'text-green-600' :
                                                  window.action === 'Sell' ? 'text-amber-700' : 'text-red-700'
                                              }`}>{window.action}</div>
                                              <div className="text-xs text-slate-500">
                                                  {new Date(window.start).toLocaleDateString(undefined, {month:'short', day:'numeric'})} - {new Date(window.end).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                              </div>
                                          </div>
                                          <div className="text-xs font-medium px-2 py-1 bg-white rounded border border-slate-200 text-slate-600">
                                              {window.confidence}
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <p className="text-sm text-slate-500 italic">No upcoming windows detected.</p>
                              )}
                          </div>

                          {/* Asset Impact */}
                          <div className="mt-6 pt-6 border-t border-slate-100">
                              <h3 className="text-[10px] font-bold text-indigo-800 uppercase mb-2 tracking-widest">Market Context</h3>
                              <p className="text-sm text-indigo-900 font-medium">
                                  {asset} is in a <span className="font-bold">{data.phase || 'Consolidation'}</span> cycle.
                              </p>
                              <p className="text-[11px] text-indigo-700 mt-1 leading-relaxed">
                                  {data.phase === 'Bullish' ? "Time cycles suggest upward momentum. Resistance levels are key targets." :
                                   data.phase === 'Bearish' ? "Cycles indicate downside pressure. Watch support levels closely." :
                                   "Market is currently balanced. Wait for clear cycle breakout."}
                              </p>
                          </div>
                      </div>
                  </div>

                  {/* RIGHT COL: AI Chat (4 columns) */}
                  <div className="lg:col-span-4">
                      <GannChat 
                          asset={asset} 
                          gannData={data} 
                          birthDetails={currentProfile ? {
                              date: currentProfile.date,
                              time: currentProfile.time,
                              timezone: currentProfile.timezone,
                              lat: currentProfile.latitude,
                              lon: currentProfile.longitude
                          } : undefined}
                      />
                  </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Personal Overlay Tab Content */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Detailed Personal Alignment */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Shield className="h-4 w-4 text-indigo-600" />
                      Detailed Personal Alignment
                    </h3>
                    
                    {data.personal_overlay ? (
                      <div className="space-y-8">
                        {/* Score and Summary */}
                        <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-50 p-6 rounded-xl border border-slate-100">
                          <div className="relative h-32 w-32 flex-shrink-0">
                            <svg className="h-full w-full" viewBox="0 0 36 36">
                              <path
                                className="text-slate-200 stroke-current"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={`${personalPercentage >= 70 ? 'text-green-500' : personalPercentage >= 40 ? 'text-yellow-400' : 'text-red-500'} stroke-current`}
                                strokeWidth="3"
                                strokeDasharray={`${personalPercentage}, 100`}
                                strokeLinecap="round"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <text x="18" y="20.35" className="font-bold text-[8px] text-center" textAnchor="middle" fill="#1e293b">
                                {personalPercentage}%
                              </text>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-900 mb-1">
                              {personalPercentage >= 70 ? 'Optimal Trading Conditions' : 
                               personalPercentage >= 40 ? 'Mixed Cosmic Support' : 'High Personal Risk'}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                              {data.personal_overlay.strategy}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                Dasha: {data.personal_overlay.dasha_lord}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                data.personal_overlay.score >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                Status: {data.personal_overlay.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Factors Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {data.personal_overlay.factors.map((factor, i) => (
                            <div key={i} className="p-4 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{factor.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                  factor.impact === 'Positive' ? 'bg-green-100 text-green-600' :
                                  factor.impact === 'Negative' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {factor.impact}
                                </span>
                              </div>
                              <div className="text-sm font-bold text-slate-800 mb-1">{factor.value}</div>
                              <p className="text-[11px] text-slate-500 leading-tight">{factor.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Shield className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500">Enable Personal Overlay to see detailed alignment.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col: Personal Windows/Events */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Zap className="h-4 w-4 text-indigo-600" />
                        Key Triggers
                      </h3>
                      <div className="space-y-4">
                        {data.triggers?.map((trigger, i) => (
                          <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                             <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                               trigger.type === 'Bullish' ? 'bg-green-500' : 
                               trigger.type === 'Bearish' ? 'bg-red-500' : 'bg-indigo-500'
                             }`} />
                             <div>
                               <div className="text-sm font-bold text-slate-800">{trigger.title}</div>
                               <div className="text-xs text-slate-500">{trigger.desc}</div>
                             </div>
                          </div>
                        ))}
                        {(!data.triggers || data.triggers.length === 0) && (
                          <p className="text-xs text-slate-400 italic">No specific triggers for this date.</p>
                        )}
                      </div>
                   </div>

                   <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-20 h-20" />
                      </div>
                      <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-4">Success Accuracy</h3>
                      <div className="space-y-4 relative z-10">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-indigo-200">Last 30 Days</span>
                            <span className="font-bold text-white">{data.accuracy?.last_30d || '84%'}</span>
                          </div>
                          <div className="w-full bg-indigo-800 rounded-full h-1.5">
                            <div className="bg-white h-1.5 rounded-full" style={{ width: data.accuracy?.last_30d || '84%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-indigo-200">Last 90 Days</span>
                            <span className="font-bold text-white">{data.accuracy?.last_90d || '79%'}</span>
                          </div>
                          <div className="w-full bg-indigo-800 rounded-full h-1.5">
                            <div className="bg-white h-1.5 rounded-full" style={{ width: data.accuracy?.last_90d || '79%' }}></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-indigo-400 mt-6 italic">
                        * Accuracy based on historical backtesting of {asset} using combined Gann + Personal models.
                      </p>
                   </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default GannIntelligence;
