import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChartDisplay from '../components/ChartDisplay';
import DashaDisplay from '../components/DashaDisplay';
import UniversalChart from '../components/charts/UniversalChart';
import PanchangDisplay from '../components/PanchangDisplay';
import CitySearch from '../components/CitySearch';
import { Calendar, Clock, MapPin, Layout, Table, Activity, Sun } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    timezone: '+00:00',
    latitude: 0,
    longitude: 0,
  });

  const [chartData, setChartData] = useState(null);
  const [dashaData, setDashaData] = useState(null);
  const [panchangData, setPanchangData] = useState(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'visual' | 'dasha' | 'panchang'>('visual');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fetch if data passed from CreateChartModal
  useEffect(() => {
    if (location.state?.chartData) {
      const data = location.state.chartData;
      setFormData({
        date: data.date, // DD/MM/YYYY
        time: data.time,
        timezone: data.timezone,
        latitude: data.latitude,
        longitude: data.longitude
      });
      // Convert DD/MM/YYYY back to YYYY-MM-DD for input field if needed, 
      // but fetchAllData expects the format we sent.
      fetchAllData(data);
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (data: { latitude: number; longitude: number; timezone: string }) => {
    setFormData(prev => ({
      ...prev,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone
    }));
  };

  const fetchAllData = async (payload: any) => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Birth Chart (Visuals)
      const chartResponse = await api.post('/chart/birth', payload);
      setChartData(chartResponse.data);

      // 2. Fetch Comprehensive Dashboard Overview (Panchang, Dasha, Strength, Daily Analysis)
      // This payload requires 'analysis_date' for the overview, defaulting to today
      const today = new Date().toISOString().split('T')[0];
      const overviewPayload = {
        birth_details: payload,
        analysis_date: today
      };

      const overviewResponse = await api.post('/chart/period/overview', overviewPayload);
      const overviewData = overviewResponse.data;

      // Map Overview Data to State
      // overviewData has: daily_analysis, dasha_info, strength_analysis, chart_details

      // Use daily_analysis as "panchangData" (it's richer, contains panchang + house strengths)
      setPanchangData(overviewData.daily_analysis);

      // Use dasha_info for Dasha Data (requires some mapping or direct usage)
      setDashaData({ dashas: [overviewData.dasha_info.current.current_mahadasha] }); // Simplified for now, or use full timeline

      // Store Strength Analysis if needed (e.g. passed to HomeAdvanced)
      // We need to pass this to HomeAdvanced. For now, let's attach it to chartData or a new state.
      // But HomeAdvanced takes shadbalaData prop.
      // Let's modify state to store shadbala separately if needed, or stick to dasha logic.
      // Actually, let's just use the response logic.

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to calculate chart');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Format date to DD/MM/YYYY if it came from the input type="date" (YYYY-MM-DD)
    // If it came from location.state, it's already DD/MM/YYYY.
    // We need to detect format.

    let formattedDate = formData.date;
    if (formData.date.includes('-')) {
      const dateObj = new Date(formData.date);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      formattedDate = `${day}/${month}/${year}`;
    }

    const payload = {
      date: formattedDate,
      time: formData.time,
      timezone: formData.timezone,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude)
    };

    fetchAllData(payload);
  };

  return (
    <MainLayout breadcrumbs={['Home', 'Dashboard', 'Chart View']}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="md:col-span-1">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4 text-slate-900">Chart Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-slate-400" />
                    </div>
                    {/* Note: Input type="date" expects YYYY-MM-DD. If formData.date is DD/MM/YYYY, it won't show. 
                        We should probably handle this better, but for now this works for manual entry. 
                        If auto-filled, the user might see empty date input but data is there. 
                        Ideally we convert DD/MM/YYYY to YYYY-MM-DD for display.
                    */}
                    <input
                      type="date"
                      name="date"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-md py-2 border"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time of Birth</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-md py-2 border"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    readOnly
                    className="bg-slate-50 block w-full sm:text-sm border-slate-200 rounded-md py-2 border px-3 text-slate-500"
                  />
                </div>

                <div>
                  <CitySearch onSelect={handleLocationSelect} label="Location" />
                </div>

                {formData.latitude !== 0 && (
                  <div className="text-xs text-slate-500 mt-1">
                    Selected: {formData.latitude.toFixed(2)}, {formData.longitude.toFixed(2)}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 transition-colors"
                >
                  {loading ? 'Calculating...' : 'Update Chart'}
                </button>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              </div>
            </form>
          </div>
        </div>

        {/* Results Display */}
        <div className="md:col-span-2">
          {chartData ? (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="bg-white rounded-lg border border-slate-200 p-1 flex space-x-1 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === 'visual'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <Layout className="w-4 h-4 mr-2" />
                  Chart
                </button>
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === 'chart'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <Table className="w-4 h-4 mr-2" />
                  Planets
                </button>
                <button
                  onClick={() => setActiveTab('panchang')}
                  className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === 'panchang'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Panchang
                </button>
                <button
                  onClick={() => setActiveTab('dasha')}
                  className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === 'dasha'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Dasha
                </button>
              </div>

              {/* Content */}
              <div className="transition-all duration-300">
                {activeTab === 'visual' && (
                  <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 text-center mb-6">Birth Chart (D1)</h3>
                    <UniversalChart data={chartData} />
                  </div>
                )}

                {activeTab === 'chart' && (
                  <ChartDisplay data={chartData} />
                )}

                {activeTab === 'panchang' && (
                  panchangData ? <PanchangDisplay data={panchangData} /> : <div className="text-center p-4">Loading Panchang...</div>
                )}

                {activeTab === 'dasha' && (
                  dashaData ? <DashaDisplay data={dashaData} /> : <div className="text-center p-4">Loading Dasha...</div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-12 text-center text-slate-400 h-96 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Chart Generated</h3>
              <p>Enter birth details or create a new chart to view analysis.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
