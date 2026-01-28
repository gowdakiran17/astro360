import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import UniversalChart from '../components/charts/UniversalChart';
import {
    Moon, Sun, Layout, MapPin,
    Mic, MicOff, Sparkles, Command, Search, Activity, Globe, Loader2
} from 'lucide-react';
import AIReportButton from '../components/ai/AIReportButton';
import { useChartSettings } from '../context/ChartContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import PredictiveInsights from '../components/insights/PredictiveInsights';
import type { ChartData } from '../components/NorthIndianChart';

const Transits = () => {
    const { currentProfile } = useChartSettings();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [birthData, setBirthData] = useState<ChartData | null>(null);
    const [transitData, setTransitData] = useState<ChartData | null>(null);
    const [dashaData, setDashaData] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState<'visual' | 'data' | 'insights'>('visual');
    const [insightCategory, setInsightCategory] = useState<string>('all');
    const [language, setLanguage] = useState<'en' | 'hi' | 'es'>('en');
    const [nextUpdate, setNextUpdate] = useState(30);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Voice & Command features
    const { isListening, transcript, startListening, stopListening, supported: voiceSupported } = useVoiceInput();
    const [commandInput, setCommandInput] = useState('');
    
    // Default location
    const [location] = useState({
        name: "Bengaluru, Karnataka, IN",
        latitude: 12.97,
        longitude: 77.59,
        timezone: "+05:30"
    });

    // Sync voice transcript to input
    useEffect(() => {
        if (transcript) {
            setCommandInput(transcript);
            // Auto-submit if silence for 2s (simulated by checking if final)
            // For now just setting input
        }
    }, [transcript]);

    // Live clock & Countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            setNextUpdate(prev => (prev > 0 ? prev - 1 : 30));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchTransitsOnly = useCallback(async () => {
        // Reset countdown on fetch
        setNextUpdate(30);
        
        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const transitPayload = {
            date: dateStr,
            time: timeStr,
            timezone: location.timezone,
            latitude: location.latitude,
            longitude: location.longitude,
            location_name: location.name
        };
        const transitResponse = await api.post('/chart/transits', transitPayload);
        setTransitData(transitResponse.data);
    }, [location]);

    const fetchAllData = useCallback(async () => {
        if (!currentProfile) return;
        setLoading(true);
        setError('');
        try {
            const birthPayload = {
                date: currentProfile.date,
                time: currentProfile.time,
                timezone: currentProfile.timezone,
                latitude: currentProfile.latitude,
                longitude: currentProfile.longitude
            };
            const birthResponse = await api.post('/chart/birth', birthPayload);
            setBirthData(birthResponse.data);

            // Fetch Dasha Data for Predictive Insights
            try {
                const dashaPayload = {
                    birth_details: birthPayload,
                    ayanamsa: "LAHIRI"
                };
                const dashaResponse = await api.post('/chart/dasha', dashaPayload);
                setDashaData(dashaResponse.data);
            } catch (dashaErr) {
                console.error("Failed to fetch dasha data:", dashaErr);
                // Don't block the UI if dasha fails
            }

            await fetchTransitsOnly();
        } catch (err) {
            console.error(err);
            setError('Failed to calculate transits comparison.');
        } finally {
            setLoading(false);
        }
    }, [currentProfile, fetchTransitsOnly]);

    // Auto-refresh transits (faster 30s cycle)
    useEffect(() => {
        if (nextUpdate === 0) {
            fetchTransitsOnly();
        }
    }, [nextUpdate, fetchTransitsOnly]);

    useEffect(() => {
        if (currentProfile) {
            fetchAllData();
        } else {
            fetchTransitsOnly();
        }
    }, [currentProfile, fetchAllData, fetchTransitsOnly]);

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour12: false });
    // const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const handleVoiceToggle = () => {
        if (isListening) stopListening();
        else startListening();
    };
    
    const handleSuggestion = (text: string) => {
        setCommandInput(text);
        setIsProcessing(true);
        
        // Simulate processing and actions
        setTimeout(() => {
            setIsProcessing(false);
            const lowerText = text.toLowerCase();
            
            if (lowerText.includes('retrograde')) {
                setActiveTab('data');
                setShowDetails(true);
            } else if (lowerText.includes('career')) {
                setActiveTab('insights');
                setInsightCategory('career');
            } else if (lowerText.includes('relationship')) {
                setActiveTab('insights');
                setInsightCategory('relationships');
            } else if (lowerText.includes('health')) {
                setActiveTab('insights');
                setInsightCategory('health');
            } else if (lowerText.includes('insight')) {
                setActiveTab('insights');
                setInsightCategory('all');
            } else {
                setActiveTab('visual');
            }
        }, 1500);
    };

    const t = (key: string) => {
        const dict: Record<string, Record<string, string>> = {
            'System Online': { 'en': 'System Online', 'hi': 'सिस्टम ऑनलाइन', 'es': 'Sistema en línea' },
            'Transit Command': { 'en': 'Transit Command', 'hi': 'गोचर आदेश', 'es': 'Comando de Tránsito' },
            'Visual Radar': { 'en': 'Visual Radar', 'hi': 'दृश्य रडार', 'es': 'Radar Visual' },
            'Predictive Insights': { 'en': 'Predictive Insights', 'hi': 'भविष्यवाणी अंतर्दृष्टि', 'es': 'Perspectivas Predictivas' },
            'Data Stream': { 'en': 'Data Stream', 'hi': 'डेटा स्ट्रीम', 'es': 'Flujo de Datos' },
            'Listening...': { 'en': 'Listening...', 'hi': 'सुन रहा हूँ...', 'es': 'Escuchando...' },
            'Ask Astro360': { 'en': 'Ask Astro360', 'hi': 'Astro360 से पूछें', 'es': 'Pregunta a Astro360' }
        };
        return dict[key]?.[language] || key;
    };

    const PadaIndicator = ({ pada }: { pada: number }) => (
        <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase tracking-tighter">Pada {pada}</span>
            {[1, 2, 3, 4].map(idx => (
                <div key={idx} className={`h-1.5 w-3 rounded-full transition-all ${idx === pada ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
        </div>
    );

    return (
        <MainLayout title="Planetary Transits" breadcrumbs={['Home', 'Transits']}>
            
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                {/* Robotic/Command Center Header */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-1 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-900/20 dark:to-purple-900/20"></div>
                     <div className="relative p-6 md:p-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">{t('System Online')}</span>
                                    <span className="text-[10px] text-slate-400 font-mono ml-2">UPDATES IN {nextUpdate}s</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                                    {t('Transit Command')}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Real-time planetary tracking & predictive analytics
                                </p>
                            </div>

                            {/* Clock & Location */}
                            <div className="flex flex-col items-end text-right">
                                <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums font-mono">
                                    {formatTime(currentTime)}
                                </div>
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    {location.name.split(',')[0]}
                                </div>
                                
                                {/* Language Toggle */}
                                <div className="mt-4 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                    <Globe className="w-4 h-4 text-slate-400 ml-2" />
                                    {['en', 'hi', 'es'].map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => setLanguage(lang as any)}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all uppercase ${
                                                language === lang 
                                                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Command Interface */}
                        <div className="mt-10 max-w-2xl">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-white dark:bg-slate-800 rounded-xl flex items-center p-2 shadow-lg ring-1 ring-slate-900/5">
                                    <div className="pl-4 text-slate-400">
                                        <Command className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text"
                                        value={commandInput}
                                        onChange={(e) => setCommandInput(e.target.value)}
                                        placeholder={isListening ? "Listening..." : "Ask Astro360 (e.g., 'How does Saturn affect my career?')"}
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3"
                                    />
                                    <div className="flex items-center gap-2 pr-2">
                                        {isProcessing ? (
                                            <div className="flex items-center gap-2 px-3 text-indigo-600 font-medium text-sm animate-pulse">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing
                                            </div>
                                        ) : (
                                            <>
                                                {voiceSupported && (
                                                    <button 
                                                        onClick={handleVoiceToggle}
                                                        className={`p-3 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                                                        title="Voice Command"
                                                    >
                                                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleSuggestion(commandInput)}
                                                    className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                                                >
                                                    <Search className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Smart Suggestions */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {['Current Retrogrades', 'Saturn Transit Impact', 'Career Outlook', 'Relationship Energy'].map((tag) => (
                                    <button 
                                        key={tag}
                                        onClick={() => handleSuggestion(tag)}
                                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold rounded-full transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                     </div>
                </div>

                {/* Content Tabs */}
                <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
                    <button 
                        onClick={() => setActiveTab('visual')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'visual' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <Layout className="w-4 h-4" /> {t('Visual Radar')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('insights')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'insights' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <Sparkles className="w-4 h-4" /> {t('Predictive Insights')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('data')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'data' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <Activity className="w-4 h-4" /> {t('Data Stream')}
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
                        <p className="mt-4 text-slate-500 font-medium animate-pulse">Scanning planetary frequencies...</p>
                    </div>
                ) : (
                    <>
                        {/* Visual Tab */}
                        {activeTab === 'visual' && transitData && birthData && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                                <Moon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">Natal Chart</h3>
                                                <p className="text-xs text-slate-500">Static Blueprint</p>
                                            </div>
                                        </div>
                                    </div>
                                    <UniversalChart data={birthData} />
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-1">
                                        <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                                                <Sun className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">Transit Chart</h3>
                                                <p className="text-xs text-slate-500">Current Sky</p>
                                            </div>
                                        </div>
                                    </div>
                                    <UniversalChart data={transitData} />
                                </div>
                            </div>
                        )}

                        {/* Insights Tab */}
                        {activeTab === 'insights' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <PredictiveInsights 
                                    transitData={transitData} 
                                    birthData={birthData} 
                                    dashaData={dashaData?.summary} 
                                    activeCategory={insightCategory}
                                    onCategoryChange={setInsightCategory}
                                />
                                
                                {transitData && birthData && (
                                    <div className="mt-8 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white text-center relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h3 className="text-2xl font-bold mb-4">Need deeper analysis?</h3>
                                            <p className="text-indigo-200 mb-6 max-w-xl mx-auto">
                                                Our AI Astrologer can analyze the specific impact of these transits on your personal chart, covering career, health, and relationships.
                                            </p>
                                            <AIReportButton
                                                buttonText="Generate Full Transit Report"
                                                context={`Comprehensive Transit Analysis for ${currentProfile?.name}. Current Transits vs Natal Chart.`}
                                                data={{ birth: birthData, transits: transitData }}
                                                className="bg-white text-indigo-900 hover:bg-indigo-50 border-none px-8 py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                                            />
                                        </div>
                                        {/* Background decoration */}
                                        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                                            <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px]" />
                                            <div className="absolute bottom-[-50%] right-[-20%] w-[500px] h-[500px] bg-purple-500 rounded-full blur-[100px]" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Data Tab */}
                        {activeTab === 'data' && transitData && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Planetary Ephemeris</h3>
                                    <button 
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        {showDetails ? 'Hide Details' : 'Show Advanced Details'}
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Planet</th>
                                                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Sign</th>
                                                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Degrees</th>
                                                {showDetails && (
                                                    <>
                                                        <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Nakshatra</th>
                                                        <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Pada</th>
                                                    </>
                                                )}
                                                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {transitData.planets.map((p: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                            ['Sun', 'Mars', 'Jupiter'].includes(p.name) ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            ['Moon', 'Venus'].includes(p.name) ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                        }`}>
                                                            {p.name.substring(0, 2)}
                                                        </div>
                                                        {p.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{p.zodiac_sign}</td>
                                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-mono">{(p.longitude % 30).toFixed(2)}°</td>
                                                    {showDetails && (
                                                        <>
                                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{p.nakshatra}</td>
                                                            <td className="px-6 py-4"><PadaIndicator pada={p.pada} /></td>
                                                        </>
                                                    )}
                                                    <td className="px-6 py-4 text-right">
                                                        {p.is_retrograde ? (
                                                            <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded-md">Retrograde</span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-md">Direct</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default Transits;
