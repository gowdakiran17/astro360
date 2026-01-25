import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import LiveTicker from '../components/dashboard/LiveTicker';
import { useChartSettings } from '../context/ChartContext';
import { businessService } from '../services/business';
import { 
  Activity, Target, Zap, AlertTriangle, 
  HelpCircle, Brain, Briefcase, TrendingUp, TrendingDown,
  Sparkles, Clock
} from 'lucide-react';

const CryptoStocksDashboard = () => {
  const { currentProfile } = useChartSettings();
  const [profile, setProfile] = useState<any>(null);
  const [overlay, setOverlay] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  
  // Asset Selector State
  const [assetList, setAssetList] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [assetAnalysis, setAssetAnalysis] = useState<any>(null);
  const [analyzingAsset, setAnalyzingAsset] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentProfile) return;

      try {
        setLoading(true);
        // Map currentProfile to backend expected format
        const requestData = {
          date: currentProfile.date, // DD/MM/YYYY
          time: currentProfile.time, // HH:MM
          location: currentProfile.location,
          latitude: currentProfile.latitude,
          longitude: currentProfile.longitude,
          timezone: currentProfile.timezone
        };

        // 1. Fetch Critical Financial Profile
        const profileData = await businessService.getFinancialProfile(requestData);
        setProfile(profileData);

        // 2. Fetch Secondary Data in Parallel (Failures won't block profile)
        try {
            const [overlayData, performanceData, assetsData] = await Promise.all([
                businessService.getMarketOverlay(requestData),
                businessService.getPerformanceStats(),
                businessService.getAssetList()
            ]);
            setOverlay(overlayData);
            setPerformance(performanceData);
            setAssetList(assetsData.assets);
        } catch (secondaryErr) {
            console.warn("Secondary data fetch failed (Overlay/Stats/Assets)", secondaryErr);
            // Attempt to recover Assets at least, as they are needed for selector
            try {
                const assetsData = await businessService.getAssetList();
                setAssetList(assetsData.assets);
            } catch (e) {
                console.error("Failed to recover asset list", e);
            }
        }

      } catch (err) {
        console.error("Failed to fetch financial profile", err);
        setError("Failed to generate your financial profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentProfile]);

  const handleAssetSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const asset = e.target.value;
      setSelectedAsset(asset);
      setAnalysisError(null);
      if (!asset) {
          setAssetAnalysis(null);
          return;
      }

      setAnalyzingAsset(true);
      try {
          const result = await businessService.analyzeAsset({
              user_profile: profile,
              asset_name: asset,
              latitude: currentProfile?.latitude,
              longitude: currentProfile?.longitude
          });
          setAssetAnalysis(result);
      } catch (err: any) {
          console.error("Analysis failed", err);
          if (err.response && err.response.status === 403) {
              setAnalysisError("Access Denied: This feature is available for Premium users only.");
          } else {
              setAnalysisError("Failed to analyze asset. Please try again later.");
          }
      } finally {
          setAnalyzingAsset(false);
      }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "Strong Buy": return "bg-emerald-500 text-white";
      case "Buy": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "Hold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Reduce": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default: return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    }
  };

  if (loading) {
    return (
      <MainLayout title="Financial DNA" breadcrumbs={['Cosmic Hub', 'Business', 'Crypto vs Stocks']}>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout title="Financial DNA" breadcrumbs={['Cosmic Hub', 'Business', 'Crypto vs Stocks']}>
        <div className="p-8 text-center text-red-600">
          {error || "Profile not found."}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Crypto vs Stock Dashboard" breadcrumbs={['Cosmic Hub', 'Business', 'Financial Profile']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 1. PERSONAL WEALTH DNA (Top Banner) */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Brain className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-200 mb-2">Your Financial Personality</h2>
            <h1 className="text-4xl font-bold mb-4">{profile.persona.type}</h1>
            <p className="text-lg text-indigo-100 max-w-2xl leading-relaxed">
              {profile.persona.description}
            </p>
          </div>
        </div>

        {/* LIVE TICKER */}
        <LiveTicker />

        {/* LIVE MARKET OVERLAY (Moved Up) */}
        {overlay && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20">
                <Activity className="w-32 h-32 text-indigo-500" />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <Zap className="w-6 h-6" />
                   </div>
                   <div>
                      <h2 className="text-xl font-bold">Live Market Overlay</h2>
                      <p className="text-slate-400 text-sm">Personal Suitability × Market Conditions × Planetary Cycles</p>
                   </div>
                   <div className="ml-auto flex items-center gap-2">
                      <span className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="text-xs font-mono text-emerald-400">LIVE FEED</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {/* 1. GMRI Gauge */}
                   <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center flex flex-col items-center justify-center">
                      <h3 className="text-sm font-semibold text-slate-400 mb-4">Global Market Risk Index (GMRI)</h3>
                      <div className="relative w-32 h-32 flex items-center justify-center">
                         <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
                            <circle 
                                cx="50" cy="50" r="45" fill="none" 
                                stroke={overlay.gmri.score > 60 ? '#ef4444' : overlay.gmri.score > 30 ? '#f59e0b' : '#10b981'} 
                                strokeWidth="10" 
                                strokeDasharray={`${overlay.gmri.score * 2.83} 283`}
                                className="transition-all duration-1000 ease-out"
                            />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{overlay.gmri.score}</span>
                            <span className={`text-xs font-bold uppercase ${overlay.gmri.score > 60 ? 'text-red-400' : overlay.gmri.score > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {overlay.gmri.level}
                            </span>
                         </div>
                      </div>
                      <div className="mt-4 text-xs text-slate-500">
                          Vol: {overlay.gmri.components.moon_volatility} | Merc: {overlay.gmri.components.mercury_risk}
                      </div>
                   </div>

                   {/* 2. Personal Alignment Signals */}
                   <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Crypto */}
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-lg">Crypto Alignment</h4>
                                <div className="text-xs text-slate-400 mt-1">
                                   Suitability: {profile.scores.crypto}% | Strength: {Math.round(overlay.market_strength.crypto_strength)}%
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded text-xs font-bold ${getSignalColor(overlay.alignment.crypto.signal)}`}>
                                {overlay.alignment.crypto.signal}
                            </span>
                         </div>
                         <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                            <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${overlay.alignment.crypto.score}%` }}></div>
                         </div>
                         <div className="text-right text-2xl font-bold text-purple-400">{overlay.alignment.crypto.score}/100</div>
                      </div>

                      {/* Stocks */}
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-lg">Stocks Alignment</h4>
                                <div className="text-xs text-slate-400 mt-1">
                                   Suitability: {profile.scores.stocks}% | Strength: {Math.round(overlay.market_strength.stock_strength)}%
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded text-xs font-bold ${getSignalColor(overlay.alignment.stocks.signal)}`}>
                                {overlay.alignment.stocks.signal}
                            </span>
                         </div>
                         <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${overlay.alignment.stocks.score}%` }}></div>
                         </div>
                         <div className="text-right text-2xl font-bold text-emerald-400">{overlay.alignment.stocks.score}/100</div>
                      </div>
                      
                      <div className="sm:col-span-2 mt-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-center gap-3">
                          <Brain className="w-5 h-5 text-indigo-400" />
                          <p className="text-sm text-indigo-200">
                              <span className="font-bold">Recommendation:</span> {overlay.message}
                          </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* ASSET SELECTOR INTELLIGENCE */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                    <Target className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Asset Intelligence Engine</h2>
                    <p className="text-slate-500 text-sm">Select an asset to see if it fits YOUR chart today.</p>
                </div>
            </div>

            <div className="mb-6">
                <select 
                    className="w-full md:w-1/3 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={selectedAsset}
                    onChange={handleAssetSelect}
                >
                    <option value="">-- Select Asset to Analyze --</option>
                    {assetList.map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>
            </div>

            {analysisError && (
                <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-medium">{analysisError}</span>
                </div>
            )}

            {analyzingAsset && (
                <div className="p-8 text-center text-slate-500 animate-pulse">
                    Running Personal Suitability + Market Overlay + Asset DNA...
                </div>
            )}

            {assetAnalysis && !analyzingAsset && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                    {/* 1. Asset Status & Live Price */}
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                        <div className={`p-4 text-center font-bold text-white text-lg tracking-wide uppercase ${
                            assetAnalysis.recommendation.color === 'green' ? 'bg-emerald-600' : 
                            assetAnalysis.recommendation.color === 'red' ? 'bg-red-600' :
                            assetAnalysis.recommendation.color === 'orange' ? 'bg-orange-500' :
                            'bg-slate-500'
                        }`}>
                            {assetAnalysis.recommendation.status}
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-center items-center">
                            {assetAnalysis.market_data.live_price && (
                                <>
                                    <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                                        ${assetAnalysis.market_data.live_price.toLocaleString()}
                                    </div>
                                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-bold ${assetAnalysis.market_data.live_change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {assetAnalysis.market_data.live_change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                        {assetAnalysis.market_data.live_change}%
                                    </div>
                                </>
                            )}
                            <div className="mt-4 pt-4 w-full border-t border-slate-100 dark:border-slate-800 text-center">
                                <span className="text-xs text-slate-400 uppercase font-semibold">Planetary Rulers</span>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                                    {assetAnalysis.rulers.join(' + ')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Market Trend */}
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-slate-500 uppercase">Market Trend</span>
                            <Activity className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                            {assetAnalysis.market_data.trend}
                        </div>
                        {assetAnalysis.market_data.astrology_trend && assetAnalysis.market_data.astrology_trend !== assetAnalysis.market_data.trend && (
                            <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 mb-4 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded w-fit">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Astro Signal: {assetAnalysis.market_data.astrology_trend}
                            </div>
                        )}
                        <div className="mt-auto">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Momentum Strength</span>
                                <span>{assetAnalysis.market_data.strength}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${
                                    assetAnalysis.market_data.strength > 70 ? 'bg-emerald-500' :
                                    assetAnalysis.market_data.strength > 40 ? 'bg-blue-500' : 'bg-orange-500'
                                }`} style={{width: `${assetAnalysis.market_data.strength}%`}}></div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Personal Fit */}
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-slate-500 uppercase">Your Alignment</span>
                            <Target className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center relative my-2">
                             <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-800" />
                                    <circle 
                                        cx="50" cy="50" r="45" fill="none" 
                                        stroke={assetAnalysis.personal_data.suitability_score > 75 ? '#10b981' : assetAnalysis.personal_data.suitability_score > 50 ? '#3b82f6' : '#f97316'} 
                                        strokeWidth="8" 
                                        strokeDasharray={`${assetAnalysis.personal_data.suitability_score * 2.83} 283`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold text-slate-800 dark:text-white">{assetAnalysis.personal_data.suitability_score}%</span>
                                </div>
                            </div>
                            <div className="text-lg font-bold mt-2 text-slate-700 dark:text-slate-200">{assetAnalysis.personal_data.fit_label}</div>
                        </div>
                        <div className="text-xs text-center text-slate-400 mt-2">
                            Matches {assetAnalysis.personal_data.risk_profile} Profile
                        </div>
                    </div>

                    {/* 4. Advice & Timing */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-100 dark:border-indigo-800 p-6 flex flex-col">
                         <div className="flex items-center gap-2 mb-4 text-indigo-800 dark:text-indigo-300">
                             <Clock className="w-5 h-5" />
                             <span className="text-sm font-bold uppercase tracking-wide">Strategic Window</span>
                         </div>
                         
                         <div className="mb-4">
                             <div className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Best Time to Act</div>
                             <div className="text-lg font-bold text-slate-900 dark:text-white">
                                 {assetAnalysis.recommendation.timing_window}
                             </div>
                         </div>

                         <div className="flex-1 bg-white/50 dark:bg-slate-900/50 rounded-lg p-3 text-sm italic text-slate-600 dark:text-slate-300 border-l-2 border-indigo-400">
                             "{assetAnalysis.recommendation.summary}"
                         </div>

                         {assetAnalysis.market_data.warnings.length > 0 && (
                            <div className="mt-4 space-y-1">
                                {assetAnalysis.market_data.warnings.map((w: string, i: number) => (
                                    <div key={i} className="flex items-center text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                                        <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" /> {w}
                                    </div>
                                ))}
                            </div>
                         )}
                    </div>
                </div>
            )}
        </div>

        {/* LIVE MARKET OVERLAY REMOVED (Moved Up) */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. ASSET SUITABILITY SCORECARD */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Asset Suitability</h3>
            </div>
            
            <div className="space-y-6">
              {[
                { label: 'Crypto Suitability', score: profile.scores.crypto, color: 'bg-purple-500' },
                { label: 'Stocks Suitability', score: profile.scores.stocks, color: 'bg-emerald-500' },
                { label: 'Trading Suitability', score: profile.scores.trading, color: 'bg-orange-500' },
                { label: 'Long-Term Wealth', score: profile.scores.long_term, color: 'bg-blue-500' }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.score} <span className="text-xs font-normal text-slate-500">
                        ({item.score > 80 ? 'Strong' : item.score > 60 ? 'Good' : item.score > 40 ? 'Moderate' : 'Low'})
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} transition-all duration-1000`} 
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Core Traits</h4>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Risk (R)', val: profile.traits?.risk_appetite },
                        { label: 'Patience (P)', val: profile.traits?.patience },
                        { label: 'Intelligence (T)', val: profile.traits?.intelligence },
                        { label: 'Stability (E)', val: profile.traits?.emotional_stability }
                    ].map((t, i) => (
                        <div key={i} className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{t.val}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">{t.label}</div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* 3. RISK vs PATIENCE MAP */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Risk vs Patience</h3>
            </div>
            
            <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
              {/* Coordinate System Background */}
              <div className="absolute inset-0 border-l border-b border-slate-200 dark:border-slate-600 m-8"></div>
              
              {/* Quadrant Labels */}
              <span className="absolute top-4 right-4 text-xs font-bold text-slate-400">High Risk / High Patience</span>
              <span className="absolute bottom-4 right-4 text-xs font-bold text-slate-400">High Risk / Low Patience</span>
              <span className="absolute bottom-4 left-12 text-xs font-bold text-slate-400">Low Risk</span>
              
              {/* User Dot */}
              <div 
                className="absolute w-6 h-6 bg-indigo-600 rounded-full border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center z-10 transition-all duration-1000"
                style={{ 
                  left: `${profile.traits?.risk_appetite}%`, 
                  bottom: `${profile.traits?.patience}%` 
                }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              
              {/* Zones */}
              <div className="absolute inset-0 m-8 opacity-10 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-indigo-200 dark:from-slate-800 dark:to-indigo-900 rounded-lg"></div>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
              Your position based on Risk Appetite (X) vs Patience (Y).
            </p>
          </div>

          {/* 5. TODAY'S BEST ASSET */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Today's Strategy</h3>
            </div>
            
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
              <div>
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Best Asset Today</span>
                <div className="text-3xl font-bold text-emerald-600 mt-1">{profile.recommendation.best_asset_today}</div>
              </div>
              
              <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
              
              <div>
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Approach With Caution</span>
                <div className="text-xl font-bold text-slate-500 mt-1">{profile.recommendation.avoid_asset_today}</div>
              </div>

              {profile.recommendation.guidance && (
                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm text-indigo-700 dark:text-indigo-300 italic">
                  "{profile.recommendation.guidance}"
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 6 & 7. TRENDS & OPPORTUNITIES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 6. PERSONAL MARKET TREND */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Personal Market Trend</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                <div>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-300">Financial Luck Cycle</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-400">Cautious wealth phase until Feb 10</p>
                </div>
                <span className="text-2xl">😐</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                <div>
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-300">Risk Appetite</h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">High stability today</p>
                </div>
                <span className="text-2xl">🛡️</span>
              </div>
            </div>
          </div>

          {/* 7. NEXT OPPORTUNITY WINDOWS */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Next Opportunity Windows</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Stock Investment Window</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Strong</span>
                </div>
                <p className="text-sm text-slate-500">Jan 20 – Feb 5</p>
              </div>
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Crypto Entry Window</span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">Moderate</span>
                </div>
                <p className="text-sm text-slate-500">Feb 15 – Feb 22</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. WHY THIS IS YOUR PROFILE (AI Insights) */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Why This Is Your Profile</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.insights.map((insight: string, i: number) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm text-sm text-slate-600 dark:text-slate-300 border-l-4 border-indigo-500">
                {insight}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 9. LONG-TERM WEALTH PATH */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Long-Term Wealth Engines</h3>
            </div>

            <div className="space-y-4">
              {profile.wealth_engine.details.map((engine: any, i: number) => (
                <div key={i} className={`p-4 rounded-lg border ${i === 0 ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-900/30 dark:border-slate-700'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold ${i === 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                      {engine.name}
                    </span>
                    {i === 0 && <span className="text-xs font-bold px-2 py-1 bg-indigo-200 text-indigo-800 rounded">Primary Engine</span>}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${engine.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8. WARNING / RISK ASSESSMENT */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Risk Assessment</h3>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
              <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Critical Warning</h4>
              <p className="text-sm text-red-600 dark:text-red-300 leading-relaxed">
                Based on your chart, high-risk trading during periods of emotional instability increases loss probability significantly. 
                Your "Capital Preserver" traits suggest that chasing losses can lead to deeper financial setbacks. Stick to your strategy.
              </p>
            </div>
            
            <div className="mt-6">
               <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">AI Money Coach Suggestions</h4>
               <div className="space-y-2">
                 {['Should I buy Bitcoin now?', 'Is this a good time for long-term stocks?', 'Why am I losing money lately?'].map((q, i) => (
                   <button key={i} className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-2">
                     <HelpCircle className="w-4 h-4 text-indigo-500" />
                     {q}
                   </button>
                 ))}
               </div>
            </div>
          </div>

        </div>

        {/* ACCURACY & PERFORMANCE ENGINE */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Accuracy & Performance Engine</h2>
                    <p className="text-slate-500">Audited results of our astro-trading signals vs control group.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Core Metrics */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                     <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-300">Signal Accuracy (30d)</h3>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Win Rate</span>
                            <span className="text-2xl font-bold text-emerald-500">{performance?.metrics.win_rate}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{width: `${performance?.metrics.win_rate}%`}}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-slate-500">Crypto</div>
                                <div className="font-semibold text-purple-500">{performance?.metrics.crypto_win_rate}%</div>
                            </div>
                            <div>
                                <div className="text-slate-500">Stocks</div>
                                <div className="font-semibold text-blue-500">{performance?.metrics.stocks_win_rate}%</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                            <span className="text-sm text-slate-500">Avoid Accuracy</span>
                            <span className="text-sm font-bold text-orange-500">{performance?.metrics.avoid_accuracy}%</span>
                        </div>
                     </div>
                </div>

                {/* Control Group */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                     <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-300">Control Group (Random)</h3>
                     <div className="flex items-end gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-400">{performance?.metrics.control_group_win_rate}%</div>
                            <div className="text-xs text-slate-500">Random Signal</div>
                        </div>
                        <div className="text-center pb-1">
                            <span className="text-sm font-bold text-emerald-500">+{performance?.metrics.alpha_vs_control}%</span>
                            <div className="text-xs text-slate-500">Our Alpha</div>
                        </div>
                     </div>
                     <p className="text-sm text-slate-500 mb-4">
                        Our Astro Engine consistently beats random market noise, proving the signal is not luck.
                     </p>
                     
                     <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs">
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-500">High Suitability Win Rate</span>
                            <span className="font-bold text-emerald-600">{performance?.validation.high_suitability_win_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Low Suitability Win Rate</span>
                            <span className="font-bold text-red-500">{performance?.validation.low_suitability_win_rate}%</span>
                        </div>
                     </div>
                </div>

                {/* AI Trust Layer */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-sm border border-indigo-700 flex flex-col justify-between">
                     <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-bold text-indigo-100">AI Trust Layer</h3>
                        </div>
                        <p className="italic text-indigo-200 text-sm leading-relaxed mb-4">
                            "{performance?.ai_explanation}"
                        </p>
                     </div>
                     
                     {/* Anti-Blame Shield */}
                     <div className="mt-4 pt-4 border-t border-indigo-800/50">
                        <div className="flex items-start gap-2 text-xs text-indigo-300/80">
                            <AlertTriangle className="w-3 h-3 mt-0.5 text-orange-400" />
                            <span>
                                Reminder: Losses often occur when trading against your suitability profile during high-risk windows.
                            </span>
                        </div>
                     </div>
                </div>
            </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default CryptoStocksDashboard;
