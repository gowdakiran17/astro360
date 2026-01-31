import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Settings, ArrowRight, Star, Activity, Fingerprint } from 'lucide-react';
// Duplicate import removed
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ChartRectification = () => {
    const navigate = useNavigate();
    const [activeChart, setActiveChart] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveChart();
    }, []);

    const fetchActiveChart = async () => {
        try {
            // 1. Try to get from localStorage (last viewed)
            const lastChartStr = localStorage.getItem('lastViewedChart');
            if (lastChartStr) {
                setActiveChart(JSON.parse(lastChartStr));
                setLoading(false);
                return;
            }

            // 2. If not, fetch list and get default
            const response = await api.get('charts/');
            const charts = response.data;
            if (charts.length > 0) {
                const defaultChart = charts.find((c: any) => c.is_default) || charts[0];
                setActiveChart(defaultChart);
            }
        } catch (error) {
            console.error("Failed to load chart", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper component for Preparation Buttons
    const PrepButton = ({ icon: Icon, title, onClick }: any) => (
        <button
            onClick={onClick}
            className="flex-1 bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-center space-x-3 hover:border-slate-300 hover:shadow-sm transition-all group"
        >
            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                <Icon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="font-semibold text-slate-700">{title}</span>
        </button>
    );

    // Helper component for Method Cards
    const MethodCard = ({ title, description, isRecommended, onClick }: any) => (
        <div
            onClick={onClick}
            className="bg-white border border-slate-200 rounded-xl p-6 cursor-pointer hover:border-indigo-200 hover:ring-1 hover:ring-indigo-200 hover:shadow-md transition-all relative group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    {isRecommended && (
                        <span className="bg-slate-900 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide">
                            Best
                        </span>
                    )}
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>

            <p className="text-slate-500 text-sm leading-relaxed">
                {description}
            </p>
        </div>
    );

    return (
        <MainLayout title="Chart Rectification" breadcrumbs={['Tools', 'Chart Rectification']}>
            <div className="max-w-4xl space-y-8">

                {/* Header Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                        <Settings className="w-6 h-6 text-slate-400" />
                        <h1 className="text-2xl font-bold text-slate-800">Chart Rectification</h1>
                        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200">
                            Birth Time Correction
                        </span>
                    </div>
                    <p className="text-slate-500 leading-relaxed max-w-2xl text-lg">
                        Birth time rectification helps you find the most accurate birth time for better astrological predictions.
                        Before using rectification tools, you may want to calibrate your chart using life events and personal data.
                    </p>
                </div>

                {/* Current Birth Time */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                        <h2 className="font-bold text-slate-700">Current Birth Time</h2>
                    </div>
                    <div className="p-6 flex items-center text-slate-800 font-mono text-lg bg-white">
                        {loading ? (
                            <span className="animate-pulse text-slate-400">Loading...</span>
                        ) : (
                            // Example: April 17, 1990 at 05:06 AM
                            <span>
                                {activeChart ? (
                                    // Simple manual formatting to verify match with screenshot, or just use raw strings
                                    `${new Date(activeChart.date_str.split('/').reverse().join('-')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${activeChart.time_str} ${parseInt(activeChart.time_str.split(':')[0]) >= 12 ? 'PM' : 'AM'}`
                                    // Note: Backend might provide time_str in 24h, we can format properly later.
                                    // Reverting to simpler display for now based on available data
                                    // formattedDateTime
                                ) : 'No Chart Selected'}
                            </span>
                        )}
                        {/* Show formatted simple if logic fails for now, or just use date_str */}
                        {!loading && activeChart && (
                            <div className="ml-2 font-bold tracking-wide">
                                {/* We will rely on simple string concat for robustness first */}
                                {new Date(activeChart.created_at).toLocaleDateString()}
                            </div>
                        )}
                        {/* Resetting content to clean simpler version */}
                        {!loading && activeChart ? (
                            <span className="font-bold tracking-wide">
                                {/* Convert 17/04/1990 to April 17, 1990 */}
                                {new Date(activeChart.date_str.split('/').reverse().join('-')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                <span className="mx-2">at</span>
                                {/* Convert 05:06 to 05:06 AM/PM */}
                                {new Date(`2000-01-01T${activeChart.time_str}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        ) : (!loading && <span className="text-slate-400 italic">Please select a chart in My Charts</span>)}
                    </div>
                </div>

                {/* Recommended Preparation */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h2 className="font-bold text-slate-700 mb-2">Recommended Preparation</h2>
                    <p className="text-slate-500 text-sm mb-6">For better results, first calibrate your chart using these tools:</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Row 1 */}
                        <PrepButton icon={Activity} title="Events Calibration" onClick={() => navigate('/tools/calibration')} />
                        <PrepButton icon={Star} title="Zodiac Calibration" onClick={() => navigate('/tools/zodiac')} />

                        {/* Row 2 - Full Width */}
                        <div className="md:col-span-2">
                            <PrepButton icon={Fingerprint} title="Biodata Calibration" onClick={() => navigate('/tools/biodata')} />
                        </div>
                    </div>
                </div>

                {/* Choose Method */}
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <Settings className="w-5 h-5 text-slate-600" />
                        <h2 className="font-bold text-slate-800 text-lg">Choose Rectification Method</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MethodCard
                            title="Automated Rectification"
                            isRecommended={true}
                            description="AI-powered rectification using life events and astrological patterns to find your optimal birth time."
                            onClick={async () => {
                                if (!activeChart) return;
                                try {
                                    setLoading(true);
                                    // Fetch life events (assuming simple fetch or stored)
                                    const events = JSON.parse(localStorage.getItem('calibration_events') || '[]');
                                    const payload = {
                                        birth_details: {
                                            date: activeChart.date_str,
                                            time: activeChart.time_str,
                                            timezone: activeChart.timezone_str,
                                            latitude: activeChart.latitude,
                                            longitude: activeChart.longitude
                                        },
                                        gender: activeChart.gender || 'male', // Default if missing
                                        events: events
                                    };

                                    const res = await api.post('tools/rectify/automated', payload);
                                    console.log("Rectification Result:", res.data);
                                    alert(`Rectification Complete.\nFound time: ${res.data.rectified_time}\nConfidence: ${res.data.confidence_score}%\n\n${res.data.notes}`);
                                } catch (err) {
                                    console.error(err);
                                    alert("Rectification failed. Please try again.");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        />
                        <MethodCard
                            title="Manual Rectification"
                            isRecommended={false}
                            description="Compare charts with different time adjustments to manually find the best birth time."
                            onClick={() => { }}
                        />
                    </div>
                </div>

            </div>
        </MainLayout>
    );
};

export default ChartRectification;
