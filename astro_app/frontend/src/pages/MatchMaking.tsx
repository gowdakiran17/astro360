import React, { useState } from 'react';
import api from '../services/api';
import { Heart } from 'lucide-react';
import CitySearch from '../components/CitySearch';
import MainLayout from '../components/layout/MainLayout';

const MatchMaking = () => {
  const [boyData, setBoyData] = useState({
    date: '', time: '', timezone: '+00:00', latitude: 0, longitude: 0
  });
  const [girlData, setGirlData] = useState({
    date: '', time: '', timezone: '+00:00', latitude: 0, longitude: 0
  });
  
  const [matchResult, setMatchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBoyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoyData({ ...boyData, [e.target.name]: e.target.value });
  };

  const handleGirlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGirlData({ ...girlData, [e.target.name]: e.target.value });
  };

  const handleBoyLocation = (data: { latitude: number; longitude: number; timezone: string }) => {
    setBoyData(prev => ({
      ...prev,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone
    }));
  };

  const handleGirlLocation = (data: { latitude: number; longitude: number; timezone: string }) => {
    setGirlData(prev => ({
      ...prev,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone
    }));
  };

  const formatPayload = (data: any) => {
    const dateObj = new Date(data.date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return {
      date: `${day}/${month}/${year}`,
      time: data.time,
      timezone: data.timezone,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        boy: formatPayload(boyData),
        girl: formatPayload(girlData)
      };

      const response = await api.post('/match/ashtakoot', payload);
      setMatchResult(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to calculate match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout breadcrumbs={['Home', 'Tools', 'Chart Compatibility']}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-bold mb-6 text-slate-900">Enter Birth Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Boy Details */}
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">Boy's Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                      <input type="date" name="date" required onChange={handleBoyChange} className="w-full px-3 py-2 bg-white border border-blue-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Time of Birth</label>
                      <input type="time" name="time" required onChange={handleBoyChange} className="w-full px-3 py-2 bg-white border border-blue-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <CitySearch label="Birth Place" onSelect={handleBoyLocation} />
                      {boyData.latitude !== 0 && (
                        <div className="text-xs text-slate-500 mt-1">
                           {boyData.latitude.toFixed(2)}, {boyData.longitude.toFixed(2)} ({boyData.timezone})
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Girl Details */}
                <div className="bg-pink-50/50 p-6 rounded-xl border border-pink-100">
                  <h3 className="text-sm font-bold text-pink-700 uppercase tracking-wider mb-4">Girl's Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                      <input type="date" name="date" required onChange={handleGirlChange} className="w-full px-3 py-2 bg-white border border-pink-200 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Time of Birth</label>
                      <input type="time" name="time" required onChange={handleGirlChange} className="w-full px-3 py-2 bg-white border border-pink-200 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                    </div>
                    <div>
                      <CitySearch label="Birth Place" onSelect={handleGirlLocation} />
                      {girlData.latitude !== 0 && (
                        <div className="text-xs text-slate-500 mt-1">
                           {girlData.latitude.toFixed(2)}, {girlData.longitude.toFixed(2)} ({girlData.timezone})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-indigo-500/20 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 transition-all transform hover:scale-[1.01]"
                >
                  {loading ? 'Calculating Match...' : 'Check Compatibility'}
                </button>
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
              </div>
            </form>
          </div>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-1">
          {matchResult ? (
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden sticky top-24">
              <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Match Report</h3>
                <div className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full px-4 py-1 font-bold text-sm">
                  {matchResult.total_score} / 36
                </div>
              </div>
              <div className="p-6">
                <div className="mb-8 text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${matchResult.total_score > 18 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Heart className={`h-10 w-10 ${matchResult.total_score > 18 ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-1">{matchResult.conclusion}</h4>
                  <p className="text-sm text-slate-500">Based on Ashtakoot Guna Milan</p>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Koota Analysis</h5>
                  {Object.entries(matchResult.details).map(([koota, data]: [string, any]) => (
                    <div key={koota} className="flex justify-between items-center text-sm group">
                      <span className="capitalize text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{koota}</span>
                      <div className="flex items-center">
                        <span className="font-bold text-slate-900 mr-1">
                          {data.score}
                        </span>
                        <span className="text-slate-400 text-xs">/ {data.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-10 text-center text-slate-400 h-full flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Match?</h3>
              <p>Enter birth details for both partners to generate a detailed compatibility report.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MatchMaking;
