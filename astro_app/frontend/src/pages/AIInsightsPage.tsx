import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { useChartSettings } from '../context/ChartContext';
import PredictiveInsights from '../components/insights/PredictiveInsights';
import AIReportButton from '../components/ai/AIReportButton';
import type { ChartData } from '../components/NorthIndianChart';
import { BrainCircuit, RefreshCw } from 'lucide-react';

const AIInsightsPage = () => {
  const { currentProfile } = useChartSettings();
  const [birthData, setBirthData] = useState<ChartData | null>(null);
  const [transitData, setTransitData] = useState<ChartData | null>(null);
  const [dashaData, setDashaData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [category, setCategory] = useState<string>('all');

  const fetchAll = useCallback(async () => {
    if (!currentProfile) return;
    setLoading(true);
    setError('');
    try {
      const birthPayload = {
        date: currentProfile.date,
        time: currentProfile.time,
        timezone: currentProfile.timezone,
        latitude: currentProfile.latitude,
        longitude: currentProfile.longitude,
      };
      const birthRes = await api.post('/chart/birth', birthPayload);
      setBirthData(birthRes.data);

      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${now.getFullYear()}`;
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      const transitPayload = {
        date: dateStr,
        time: timeStr,
        timezone: currentProfile.timezone,
        latitude: currentProfile.latitude,
        longitude: currentProfile.longitude,
        location_name: currentProfile.location,
      };
      const transitRes = await api.post('/chart/transits', transitPayload);
      setTransitData(transitRes.data);

      try {
        const dashaPayload = {
          birth_details: birthPayload,
          ayanamsa: 'LAHIRI',
        };
        const dashaRes = await api.post('/chart/dasha', dashaPayload);
        setDashaData(dashaRes.data);
      } catch {
        // Best-effort; do not block page if dasha fails
      }
    } catch (e) {
      setError('Failed to load AI insights data.');
    } finally {
      setLoading(false);
    }
  }, [currentProfile]);

  useEffect(() => {
    if (currentProfile) {
      fetchAll();
    }
  }, [currentProfile, fetchAll]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
              Predictive Engine
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Insights
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Data-driven guidance generated from your chart and current transits
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading || !currentProfile}
          className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
        <PredictiveInsights
          transitData={transitData}
          birthData={birthData}
          dashaData={dashaData}
          activeCategory={category}
          onCategoryChange={setCategory}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ask AI Astrologer</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Generate a natural-language insight based on your current context
            </p>
          </div>
          <AIReportButton
            context={`Report for ${currentProfile?.name || 'Unknown'}`}
            data={{ birth: birthData, transits: transitData, dasha: dashaData }}
            buttonText="Get AI Insight"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
          />
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPage;
