import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useChartSettings } from '../../../context/ChartContext';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../LoadingSpinner';

// Modern Components
import HomeHeader from './HomeHeader';
import SummaryCards from './SummaryCards';
import EnergyDashboard from './EnergyDashboard';
import PowerHours from './PowerHours';
import DailyBriefing from './DailyBriefing';
import LifeDomains from './LifeDomains';
import TransitDashboard from './TransitDashboard';
import NakshatraCenter from './NakshatraCenter';
import ModernPlanetaryTable from './ModernPlanetaryTable';

import { Calendar } from 'lucide-react';

const HomeDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProfile, switchProfile } = useChartSettings();
  const { user, isLoading: authLoading } = useAuth();

  const [chartData, setChartData] = useState<any>(null);
  const [panchangData, setPanchangData] = useState<any>(null); // Daily Panchang
  const [birthPanchangData, setBirthPanchangData] = useState<any>(null); // Birth Panchang
  const [dashaData, setDashaData] = useState<any>(null);
  const [ashtakvargaData, setAshtakvargaData] = useState<any>(null);
  const [periodOverview, setPeriodOverview] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async (currentProfile: any, targetDate: Date) => {
    setIsLoading(true);
    setChartData(null);
    setDashaData(null);
    setPanchangData(null);
    setBirthPanchangData(null);
    setAshtakvargaData(null);
    setPeriodOverview(null);

    if (!currentProfile) return;

    const formatDate = (dateStr: string) => {
      if (dateStr.includes('-')) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
      }
      return dateStr;
    };

    const birthDetails = {
      date: formatDate(currentProfile.date),
      time: currentProfile.time,
      latitude: currentProfile.latitude,
      longitude: currentProfile.longitude,
      timezone: currentProfile.timezone
    };

    console.log("Fetching data for:", birthDetails, "Date:", targetDate);
    try {
      // 1. Fetch Panchang
      const todayStr = targetDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
      const timeStr = targetDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      const panchangPayload = {
        ...birthDetails,
        date: todayStr,
        time: timeStr
      };

      const panchangPromise = api.post('chart/panchang', panchangPayload)
        .then((res: any) => setPanchangData(res.data))
        .catch((e: any) => console.error("Panchang Error:", e));

      // 1b. Fetch Birth Panchang
      const birthPanchangPromise = api.post('chart/panchang', birthDetails)
        .then((res: any) => setBirthPanchangData(res.data))
        .catch((e: any) => console.error("Birth Panchang Error:", e));

      // 2. Fetch Chart & Dasha
      const chartPromise = api.post('chart/birth', birthDetails)
        .then(async (chartRes: any) => {
          if (chartRes.data?.planets) {
            setChartData(chartRes.data);
            const moon = chartRes.data.planets.find((p: any) => p.name === 'Moon');
            if (moon) {
              try {
                const dashaRes = await api.post('chart/dasha', {
                  birth_details: birthDetails,
                  moon_longitude: moon.longitude
                });
                if (dashaRes.data?.dashas) {
                  setDashaData(dashaRes.data);
                }
              } catch (dashaErr: any) {
                console.error("Dasha Fetch Error:", dashaErr);
              }
            }
          }
        })
        .catch((e: any) => {
          console.error("Chart Error:", e);
        });

      // 4. Fetch Ashtakvarga (Natal Strength)
      const ashtakvargaPromise = api.post('chart/ashtakvarga', { birth_details: birthDetails })
        .then((res: any) => setAshtakvargaData(res.data))
        .catch((e: any) => console.error("Ashtakvarga Error:", e));

      // 5. Fetch Period Overview (includes daily analysis, house strengths, muhuratas, etc.)
      const analysisDate = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const overviewPromise = api.post('chart/period/overview', {
        birth_details: birthDetails,
        analysis_date: analysisDate
      })
        .then((res: any) => {
          console.log("Period Overview Response:", res.data);
          setPeriodOverview(res.data);
        })
        .catch((e: any) => console.error("Period Overview Error:", e));

      await Promise.all([panchangPromise, birthPanchangPromise, chartPromise, ashtakvargaPromise, overviewPromise]);
    } catch (e: any) {
      console.error("Fetch Data Global Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.state?.chartData) {
      switchProfile(location.state.chartData);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, switchProfile, navigate, location.pathname]);

  useEffect(() => {
    if (!currentProfile || !user) {
      return;
    }
    fetchData(currentProfile, selectedDate);
  }, [user, currentProfile, selectedDate, fetchData]);

  if (authLoading) return <LoadingSpinner />;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
          <p className="text-slate-200 text-sm font-medium">Please log in to view your astrological overview.</p>
          <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">Go to Login</button>
        </div>
      </div>
    );
  }

  if (!currentProfile || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black text-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <HomeHeader
            userName={currentProfile?.name || (user as any)?.name || "User"}
            location={currentProfile?.location || "Location"}
          />

          {/* Date Picker */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-indigo-300 group-hover:text-indigo-200 transition-colors" />
            </div>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
              className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Quick Reference Data (Moved to top) */}
        {chartData && (
          <div>
            <h3 className="text-lg font-serif text-slate-400 mb-6 px-2">Quick Reference Data</h3>
            <SummaryCards
              chartData={chartData}
              panchangData={panchangData}
              birthPanchangData={birthPanchangData}
            />
            <ModernPlanetaryTable
              planets={chartData.planets}
              ascendant={chartData.ascendant}
              specialPoints={chartData.special_points}
            />
          </div>
        )}
      </div>

      {/* 1. Daily Briefing */}
      <DailyBriefing dailyData={periodOverview?.daily_analysis} dashaData={dashaData} />

      {/* 2. Hero Grid: Energy + Power Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <EnergyDashboard dailyData={periodOverview?.daily_analysis} />
        </div>
        <div>
          <PowerHours dailyData={periodOverview?.daily_analysis} />
        </div>
      </div>

      {/* 3. Interactive Transit Dashboard */}
      <TransitDashboard transits={periodOverview?.daily_analysis?.transits} ascendantSign={chartData?.ascendant?.sign} />

      {/* 4. Comprehensive Dasha Timeline (Removed/Replaced by Quick Reference) */}
      {/* <DashaDashboard dashaData={dashaData} shadbalaData={shadbalaData} /> */}

      {/* 5. Life Domains */}
      <LifeDomains
        dailyData={periodOverview?.daily_analysis}
        dashaData={dashaData}
        ashtakvargaData={ashtakvargaData}
        chartData={chartData}
      />

      {/* 6. Nakshatra Intelligence */}
      <NakshatraCenter chartData={chartData} />

    </div>

  );
};

export default HomeDashboard;
