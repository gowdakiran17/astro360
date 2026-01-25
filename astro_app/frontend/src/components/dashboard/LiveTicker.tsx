import { useEffect, useState } from 'react';
import { businessService } from '../../services/business';
import { Activity, TrendingUp, TrendingDown, Zap, Plus, X, Settings } from 'lucide-react';

interface AssetData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    trend: string;
}

interface LiveFeedData {
  timestamp: string;
  assets: AssetData[];
  volatility_index: number;
  market_mood: string;
  active_signals: unknown[];
}

const AVAILABLE_ASSETS = [
    { symbol: 'BTC-USD', name: 'Bitcoin', type: 'Crypto' },
    { symbol: 'ETH-USD', name: 'Ethereum', type: 'Crypto' },
    { symbol: 'SOL-USD', name: 'Solana', type: 'Crypto' },
    { symbol: '^GSPC', name: 'S&P 500', type: 'Index' },
    { symbol: '^IXIC', name: 'Nasdaq', type: 'Index' },
    { symbol: 'AAPL', name: 'Apple', type: 'Stock' },
    { symbol: 'TSLA', name: 'Tesla', type: 'Stock' },
    { symbol: 'NVDA', name: 'NVIDIA', type: 'Stock' },
    { symbol: 'MSFT', name: 'Microsoft', type: 'Stock' },
    { symbol: 'GOOGL', name: 'Google', type: 'Stock' },
    { symbol: 'AMZN', name: 'Amazon', type: 'Stock' },
    { symbol: 'META', name: 'Meta', type: 'Stock' },
    { symbol: 'GC=F', name: 'Gold', type: 'Commodity' },
    { symbol: 'SI=F', name: 'Silver', type: 'Commodity' },
];

const LiveTicker = () => {
    const [feed, setFeed] = useState<LiveFeedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('user_assets');
            return saved ? JSON.parse(saved) : ['BTC-USD', '^GSPC'];
        } catch (e) {
            console.error("Failed to parse saved assets", e);
            return ['BTC-USD', '^GSPC'];
        }
    });

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const data = await businessService.getLiveFeed(selectedAssets);
                setFeed(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch live feed", err);
                setLoading(false);
            }
        };

        fetchFeed();
        const interval = setInterval(fetchFeed, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [selectedAssets]);

    const toggleAsset = (symbol: string) => {
        const newSelection = selectedAssets.includes(symbol)
            ? selectedAssets.filter(s => s !== symbol)
            : [...selectedAssets, symbol];
        
        setSelectedAssets(newSelection);
        localStorage.setItem('user_assets', JSON.stringify(newSelection));
    };

    if (loading && !feed) return null;

    const renderAsset = (asset: AssetData) => (
        <div key={asset.symbol} className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700 min-w-[180px]">
            <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-bold truncate max-w-[100px]">{asset.name}</span>
                <span className="font-mono text-white">${asset.price.toLocaleString()}</span>
            </div>
            <div className={`flex items-center text-sm font-bold ${asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {asset.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {asset.change > 0 ? '+' : ''}{asset.change}%
            </div>
        </div>
    );

    return (
        <div className="relative z-30">
            {/* Backdrop for closing modal */}
            {isEditing && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsEditing(false)}
                />
            )}

            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-lg border border-slate-700 mb-6 relative z-30">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-2 min-w-fit">
                        <div className="relative">
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <Activity className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Live Pulse</h3>
                            {feed && <div className="text-xs text-indigo-300">Updated: {new Date(feed.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>}
                        </div>
                    </div>

                    <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide mask-linear-fade">
                        {feed?.assets.map(renderAsset)}
                        
                        <button 
                            type="button"
                            onClick={() => {
                                console.log("Toggling edit mode", !isEditing);
                                setIsEditing(!isEditing);
                            }}
                            className="flex flex-col items-center justify-center px-4 py-2 bg-slate-800/30 rounded-lg border border-slate-700 border-dashed hover:bg-slate-800 transition-colors min-w-[80px]"
                        >
                            <Plus className="w-5 h-5 text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">Add</span>
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-4 pl-4 border-l border-slate-700 min-w-fit">
                        <div className="text-center">
                            <div className="text-xs text-slate-400">Cosmic Volatility</div>
                            <div className="text-lg font-bold text-amber-400 flex items-center justify-center gap-1">
                                <Zap className="w-4 h-4" />
                                {feed?.volatility_index || 50}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-slate-400">Market Mood</div>
                            <div className="text-sm font-bold text-purple-300 px-3 py-1 bg-purple-900/50 rounded-full border border-purple-700">
                                {feed?.market_mood || "Neutral"}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Asset Selection Modal/Dropdown */}
            {isEditing && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Settings className="w-4 h-4 text-indigo-400" />
                            Customize Your Watchlist
                        </h3>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
                        {AVAILABLE_ASSETS.map((asset) => (
                            <button
                                key={asset.symbol}
                                onClick={() => toggleAsset(asset.symbol)}
                                className={`flex items-center justify-between p-2 rounded-lg border text-sm transition-all ${
                                    selectedAssets.includes(asset.symbol)
                                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                            >
                                <span>{asset.name}</span>
                                {selectedAssets.includes(asset.symbol) && (
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 text-center">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="text-xs text-slate-500 hover:text-slate-300 underline"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveTicker;
