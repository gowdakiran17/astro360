import { useState } from 'react';
import VastuFloorPlan from '../components/vastu/VastuFloorPlan';
import AstroVastuCoreScreen, { type EliteAnalysisResult } from '../components/vastu/AstroVastuCoreScreen';
import { Compass, ArrowRight, Loader2, Calendar, Clock, Globe } from 'lucide-react';
import api from '../services/api';

const VastuCompass = () => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loadingText, setLoadingText] = useState("Initializing Engine...");
    
    // Form State
    const [birthDetails, setBirthDetails] = useState({
        date: '',
        time: '',
        timezone: '+05:30',
        latitude: '',
        longitude: ''
    });
    
    const [vastuObjects, setVastuObjects] = useState<{ zone: string; type: string }[]>([]);
    const [userIntent, setUserIntent] = useState("Money");
    const [analysisResult, setAnalysisResult] = useState<EliteAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setError(null);
        setStep(2);
        
        // UX Simulation of "Thinking"
        const steps = [
            "Calculating Planetary Positions...",
            "Mapping House Lordships...",
            "Scanning Floor Plan for Defects...",
            "Correlating Dasha with Space...",
            "Generating Consultant Diagnosis..."
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            setLoadingText(steps[i]);
            i++;
            if (i >= steps.length) clearInterval(interval);
        }, 800);

        try {
            // Validate Inputs
            if (!birthDetails.date || !birthDetails.time || !birthDetails.latitude || !birthDetails.longitude) {
                throw new Error("Please fill in all birth details.");
            }
            if (vastuObjects.length === 0) {
                throw new Error("Please tag at least one object on the floor plan.");
            }

            // Convert Date format YYYY-MM-DD to DD/MM/YYYY for backend
            const [y, m, d] = birthDetails.date.split('-');
            const formattedDate = `${d}/${m}/${y}`;

            const payload = {
                birth_details: {
                    date: formattedDate,
                    time: birthDetails.time,
                    timezone: birthDetails.timezone,
                    latitude: parseFloat(birthDetails.latitude),
                    longitude: parseFloat(birthDetails.longitude)
                },
                vastu_objects: vastuObjects,
                user_intent: userIntent
            };

            const response = await api.post('vastu/elite/analysis', payload);
            const data: EliteAnalysisResult = response.data;
            
            // Wait a bit for the animation to finish
            setTimeout(() => {
                setAnalysisResult(data);
                setStep(3);
                clearInterval(interval);
            }, 4000);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to run analysis.';
            setError(message);
            setStep(1);
            clearInterval(interval);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Compass className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-black text-slate-800 text-lg tracking-tight">
                            AstroVastu <span className="text-indigo-600">360°</span>
                        </h1>
                    </div>
                    <div className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase tracking-wide">
                        Elite Consultant Mode
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2 animate-in slide-in-from-top-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Left Column: Inputs */}
                        <div className="lg:col-span-4 space-y-6">
                            
                            {/* 1. Birth Details */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    Person (Birth Details)
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date of Birth</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="date" 
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                value={birthDetails.date}
                                                onChange={e => setBirthDetails({...birthDetails, date: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="time" 
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                    value={birthDetails.time}
                                                    onChange={e => setBirthDetails({...birthDetails, time: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Timezone</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="text" 
                                                    placeholder="+05:30"
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                    value={birthDetails.timezone}
                                                    onChange={e => setBirthDetails({...birthDetails, timezone: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Latitude</label>
                                            <input 
                                                type="number" 
                                                placeholder="12.97"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                value={birthDetails.latitude}
                                                onChange={e => setBirthDetails({...birthDetails, latitude: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Longitude</label>
                                            <input 
                                                type="number" 
                                                placeholder="77.59"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                                value={birthDetails.longitude}
                                                onChange={e => setBirthDetails({...birthDetails, longitude: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. User Intent */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                    Your Goal (Intent)
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {["Money", "Career", "Relationship", "Health", "Business", "Peace"].map(intent => (
                                        <button
                                            key={intent}
                                            onClick={() => setUserIntent(intent)}
                                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                                userIntent === intent 
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {intent}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleAnalyze}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-xl flex items-center justify-center gap-2"
                            >
                                Run Analysis <ArrowRight className="w-5 h-5" />
                            </button>

                        </div>

                        {/* Right Column: Floor Plan */}
                        <div className="lg:col-span-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                    Space (Floor Plan)
                                </h3>
                                <div className="mb-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <strong>Instructions:</strong> Upload your floor plan, align the North arrow, and then tap zones to tag objects (e.g., Toilet in North, Kitchen in SE).
                                </div>
                                <VastuFloorPlan onZonesChange={setVastuObjects} />
                            </div>
                        </div>

                    </div>
                )}

                {step === 2 && (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Analyzing Energy Matrix</h2>
                        <p className="text-indigo-600 font-medium font-mono">{loadingText}</p>
                        
                        <div className="mt-8 w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full animate-progress"></div>
                        </div>
                    </div>
                )}

                {step === 3 && analysisResult && (
                    <div>
                         <button 
                            onClick={() => setStep(1)}
                            className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            ← Start New Analysis
                        </button>
                        <AstroVastuCoreScreen data={analysisResult} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default VastuCompass;
