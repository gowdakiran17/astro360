import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import MainLayout from '../components/layout/MainLayout';
import {
    Info, Moon, ChevronRight, Calendar, Download, Settings, Layers, ArrowRight
} from 'lucide-react';
import { useChartSettings } from '../context/ChartContext';
import DashaChat from '../components/dasha/DashaChat';
import VisualTimeline from '../components/dasha/VisualTimeline';
import TransitOverlay from '../components/dasha/TransitOverlay';
import RemediesCard from '../components/dasha/RemediesCard';
import { jsPDF } from 'jspdf';

interface DashaLevel {
    lord: string;
    start_date: string;
    end_date: string;
    duration_years: number;
    is_current?: boolean;
    antardashas?: DashaLevel[];
    pratyantardashas?: DashaLevel[];
    sookshma_dashas?: DashaLevel[];
    prana_dashas?: DashaLevel[];
}

interface DashaSummary {
    current_mahadasha: string;
    current_antardasha: string;
    current_pratyantardasha: string;
    current_sookshma?: string;
}

interface VimshottariDashaData {
    dashas: DashaLevel[];
    summary: DashaSummary;
    balance_years: number;
    balance_lord: string;
}

const VimshottariDasha = () => {
    const { currentProfile } = useChartSettings();
    const [loading, setLoading] = useState(false);
    const [dashaData, setDashaData] = useState<VimshottariDashaData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ayanamsa, setAyanamsa] = useState('LAHIRI');

    // Transit Overlay State
    const [showTransitOverlay, setShowTransitOverlay] = useState(false);

    // Selection State
    const [selectedMD, setSelectedMD] = useState<DashaLevel | null>(null);
    const [selectedAD, setSelectedAD] = useState<DashaLevel | null>(null);
    const [selectedPD, setSelectedPD] = useState<DashaLevel | null>(null);
    const [selectedSD, setSelectedSD] = useState<DashaLevel | null>(null);

    const fetchDashaData = useCallback(async () => {
        if (!currentProfile) return;
        const profile = currentProfile;
        
        setLoading(true);
        setError(null);
        try {
            const formattedDate = formatDate(profile.date);
            
            // 1. Get Birth Chart for Moon Longitude (or let backend handle it)
            // We'll let backend handle it for robustness with Ayanamsa

            const payloadDasha = {
                birth_details: {
                    date: formattedDate,
                    time: profile.time,
                    latitude: profile.latitude,
                    longitude: profile.longitude,
                    timezone: profile.timezone
                },
                ayanamsa: ayanamsa
            };

            const response = await api.post<VimshottariDashaData>('/chart/dasha', payloadDasha);
            const data = response.data;
            setDashaData(data);

            // Set initial selection to Current Period
            if (data.summary?.current_mahadasha) {
                const md = data.dashas.find((d) => d.lord === data.summary.current_mahadasha) || null;
                setSelectedMD(md);
                if (md) {
                    const ad = md.antardashas?.find((d) => d.lord === data.summary.current_antardasha) || null;
                    setSelectedAD(ad);
                    if (ad) {
                        const pd = ad.pratyantardashas?.find((d) => d.lord === data.summary.current_pratyantardasha) || null;
                        setSelectedPD(pd);
                        if (pd) {
                            const sd = pd.sookshma_dashas?.find((d) => d.lord === data.summary.current_sookshma) || null;
                            setSelectedSD(sd);
                        }
                    }
                }
            } else {
                // Default to first
                setSelectedMD(data.dashas[0] || null);
            }

        } catch (err) {
            console.error(err);
            setError('Failed to calculate Vimshottari Dasha.');
        } finally {
            setLoading(false);
        }
    }, [ayanamsa, currentProfile]);

    useEffect(() => {
        if (currentProfile) {
            fetchDashaData();
        }
    }, [currentProfile, fetchDashaData]);

    const formatDate = (dateStr: string) => {
        // Ensure DD/MM/YYYY format
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    };

    const downloadReport = () => {
        if (!currentProfile || !dashaData) return;
        const profile = currentProfile;

        const doc = new jsPDF();
        let y = 20;

        // Header
        doc.setFontSize(20);
        doc.text("Vimshottari Dasha Report", 105, y, { align: "center" });
        y += 15;

        // User Details
        doc.setFontSize(12);
        doc.text(`Name: ${profile.name}`, 20, y);
        y += 7;
        doc.text(`Date of Birth: ${profile.date} ${profile.time}`, 20, y);
        y += 7;
        doc.text(`Ayanamsa: ${ayanamsa}`, 20, y);
        y += 15;

        // Current Period
        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229); // Indigo
        doc.text("Current Period", 20, y);
        doc.setTextColor(0, 0, 0); // Black
        y += 10;
        doc.setFontSize(12);
        doc.text(`Mahadasha: ${dashaData?.summary?.current_mahadasha}`, 20, y);
        y += 7;
        doc.text(`Antardasha: ${dashaData?.summary?.current_antardasha}`, 20, y);
        y += 7;
        doc.text(`Pratyantardasha: ${dashaData?.summary?.current_pratyantardasha}`, 20, y);
        y += 15;

        // Full Mahadasha Table
        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229);
        doc.text("Mahadasha Timeline (120 Years)", 20, y);
        doc.setTextColor(0, 0, 0);
        y += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Planet", 20, y);
        doc.text("Start Date", 60, y);
        doc.text("End Date", 100, y);
        doc.text("Duration", 140, y);
        doc.setFont("helvetica", "normal");
        y += 5;
        doc.line(20, y, 190, y); // Header Line
        y += 5;

        dashaData.dashas.forEach((d) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(d.lord, 20, y);
            doc.text(d.start_date, 60, y);
            doc.text(d.end_date, 100, y);
            doc.text(`${d.duration_years.toFixed(1)} Yrs`, 140, y);
            y += 7;
        });
        
        doc.save("dasha-report.pdf");
    };

    // Helper to render a column
    const renderColumn = (
        title: string,
        items: DashaLevel[] | undefined,
        selectedItem: DashaLevel | null,
        onSelect: (item: DashaLevel) => void
    ) => {
        if (!items || items.length === 0) return (
            <div className="flex-1 min-w-[200px] bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-center text-slate-400 text-xs text-center">
                Select previous level to view {title}
            </div>
        );

        return (
            <div className="flex-1 min-w-[220px] bg-white rounded-xl border border-slate-200 flex flex-col h-[500px] shadow-sm">
                <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-t-xl font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3 h-3 text-indigo-500" />
                    {title}
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => onSelect(item)}
                            className={`p-3 rounded-lg cursor-pointer transition-all border ${
                                selectedItem?.lord === item.lord && selectedItem?.start_date === item.start_date
                                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                    : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className={`font-bold text-sm ${selectedItem?.lord === item.lord ? 'text-indigo-700' : 'text-slate-700'}`}>
                                    {item.lord}
                                </span>
                                {item.is_current && (
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                )}
                            </div>
                            <div className="text-[10px] text-slate-500 flex justify-between">
                                <span>{item.start_date}</span>
                                <ArrowRight className="w-3 h-3 text-slate-300" />
                                <span>{item.end_date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <MainLayout title="Vimshottari Dasha" breadcrumbs={['Calculations', 'Dasha']}>
            <div className="w-full space-y-6 pb-20 px-4 md:px-6">
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                        {error}
                    </div>
                )}

                {/* Header Controls */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <Moon className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">Vimshottari Dasha System</h1>
                            <p className="text-xs text-slate-500">120-Year Planetary Cycles</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                            <Settings className="w-4 h-4 text-slate-400" />
                            <select 
                                value={ayanamsa} 
                                onChange={(e) => setAyanamsa(e.target.value)}
                                className="bg-transparent border-none text-xs font-medium text-slate-700 focus:ring-0 cursor-pointer"
                            >
                                <option value="LAHIRI">Lahiri (Chitrapaksha)</option>
                                <option value="RAMAN">BV Raman</option>
                                <option value="KP">KP System</option>
                                <option value="FAGAN_BRADLEY">Fagan Bradley</option>
                            </select>
                        </div>
                        <button 
                            onClick={downloadReport}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
                        >
                            <Download className="w-3 h-3" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="text-slate-500 animate-pulse text-sm">Calculating planetary periods...</p>
                    </div>
                ) : dashaData ? (
                    <div className="space-y-6">
                        
                        {/* Visual Timeline */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                120-Year Timeline
                            </h3>
                            <VisualTimeline 
                                dashas={dashaData.dashas} 
                                startYear={new Date(dashaData.dashas[0].start_date).getFullYear()} 
                            />
                        </div>

                        {/* Current Period Summary */}
                        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-xl text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Current Period</h2>
                                    <div className="text-2xl font-black flex items-center gap-3">
                                        {dashaData.summary?.current_mahadasha} 
                                        <ChevronRight className="w-5 h-5 text-indigo-500" />
                                        {dashaData.summary?.current_antardasha}
                                        <ChevronRight className="w-5 h-5 text-indigo-500" />
                                        <span className="text-indigo-300">{dashaData.summary?.current_pratyantardasha}</span>
                                    </div>
                                    <p className="text-slate-400 text-xs mt-2 max-w-lg">
                                        You are currently running the Pratyantardasha of {dashaData.summary?.current_pratyantardasha}, 
                                        under the Mahadasha of {dashaData.summary?.current_mahadasha}. 
                                        This period emphasizes results related to {dashaData.summary?.current_mahadasha}'s house placement.
                                    </p>
                                </div>
                                <div className="hidden lg:block text-right">
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Balance of Dasha</div>
                                    <div className="text-xl font-bold">{dashaData.balance_years} Years</div>
                                    <div className="text-xs text-slate-500">at birth ({dashaData.balance_lord})</div>
                                </div>
                            </div>
                        </div>

                        {/* Drill Down Columns */}
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {renderColumn("Mahadasha", dashaData.dashas, selectedMD, (item) => {
                                setSelectedMD(item);
                                setSelectedAD(null);
                                setSelectedPD(null);
                                setSelectedSD(null);
                            })}
                            
                            {renderColumn("Antardasha", selectedMD?.antardashas, selectedAD, (item) => {
                                setSelectedAD(item);
                                setSelectedPD(null);
                                setSelectedSD(null);
                            })}

                            {renderColumn("Pratyantardasha", selectedAD?.pratyantardashas, selectedPD, (item) => {
                                setSelectedPD(item);
                                setSelectedSD(null);
                            })}

                            {renderColumn("Sookshma", selectedPD?.sookshma_dashas, selectedSD, (item) => {
                                setSelectedSD(item);
                            })}
                            
                            {renderColumn("Prana", selectedSD?.prana_dashas, null, () => {})}
                        </div>

                        {/* AI Chat & Info Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <DashaChat currentContext={dashaData} />
                            </div>
                            <div className="space-y-6">
                                <RemediesCard 
                                    mahadasha={selectedMD?.lord || dashaData.summary.current_mahadasha}
                                    antardasha={selectedAD?.lord || dashaData.summary.current_antardasha}
                                />
                                
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-indigo-500" />
                                        Interpretation Guide
                                    </h3>
                                    <div className="space-y-4 text-sm text-slate-600">
                                        <p>
                                            <strong className="text-indigo-700">Mahadasha:</strong> Sets the overall background tone and major life events for {selectedMD?.duration_years} years.
                                        </p>
                                        <p>
                                            <strong className="text-indigo-700">Antardasha:</strong> The specific sub-period that directs the energy of the Mahadasha.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        Please select a profile to view Dasha details.
                    </div>
                )}
            </div>
            {/* Transit Overlay */}
            {currentProfile && (
                <TransitOverlay 
                    isOpen={showTransitOverlay}
                    onClose={() => setShowTransitOverlay(false)}
                    birthDetails={{
                        date: formatDate(currentProfile.date),
                        time: currentProfile.time,
                        latitude: currentProfile.latitude,
                        longitude: currentProfile.longitude,
                        timezone: currentProfile.timezone
                    }}
                    targetDate={new Date().toISOString().split('T')[0]}
                    dashaPeriod={{ md: '', ad: '', pd: '' }}
                    ayanamsa={ayanamsa}
                />
            )}
        </MainLayout>
    );
};

export default VimshottariDasha;
