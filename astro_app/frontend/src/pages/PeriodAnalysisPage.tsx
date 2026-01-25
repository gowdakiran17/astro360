import { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import DashboardHeader from '../components/layout/DashboardHeader';
import api from '../services/api';
import { useChartSettings } from '../context/ChartContext';
import { formatDate } from '../utils/dateUtils';
import { DashboardOverviewResponse } from '../types/periodAnalysis';
import PeriodDashboardLayout from '../components/period-analysis/PeriodDashboardLayout';
import { DailyCalendarData } from '../components/period-analysis/InteractiveCalendar';

// Helper to format timezone
const formatTimezone = (offset: string | number) => {
  if (typeof offset === 'string' && (offset.includes(':'))) return offset;
  const num = Number(offset);
  if (isNaN(num)) return String(offset);
  const sign = num >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(num));
  const minutes = Math.round((Math.abs(num) - hours) * 60);
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const PeriodAnalysisPage = () => {
  const { currentProfile } = useChartSettings();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardOverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyData, setDailyData] = useState<Record<string, DailyCalendarData>>({});
  const [currentMonth, setCurrentMonth] = useState<string>(`${new Date().getFullYear()}-${new Date().getMonth() + 1}`);

  const fetchData = useCallback(async () => {
    if (!currentProfile) return;

    setLoading(true);
    setError(null);

    const birthDetails = {
      date: formatDate(currentProfile.date),
      time: currentProfile.time,
      latitude: Number(currentProfile.latitude),
      longitude: Number(currentProfile.longitude),
      timezone: formatTimezone(currentProfile.timezone),
      name: currentProfile.name
    };

    const payload = {
      birth_details: birthDetails,
      analysis_date: formatDate(selectedDate) // Use our utils helper
    };

    try {
      // Fetch Dashboard Overview
      const res = await api.post('/chart/period/overview', payload);
      setDashboardData(res.data);
    } catch (e: any) {
      console.error("Analysis Error:", e);
      setError(e.response?.data?.detail || e.message || "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  }, [currentProfile, selectedDate]);

  // Fetch monthly scores when month changes
  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (!currentProfile) return;

      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const monthKey = `${year}-${month}`;

      // Avoid re-fetching if we already have data for this month or if month hasn't changed effectively
      if (monthKey === currentMonth && Object.keys(dailyData).length > 0) {
        // We might still want to fetch if scores are empty but monthKey matches? 
        // Let's just rely on simple month key check for now.
        // Actually, better to check if we have scores for this month specifically.
        // Simpler: Just fetch every time month changes.
      }

      try {
        const birthDetails = {
          date: formatDate(currentProfile.date),
          time: currentProfile.time,
          latitude: Number(currentProfile.latitude),
          longitude: Number(currentProfile.longitude),
          timezone: formatTimezone(currentProfile.timezone),
          name: currentProfile.name
        };

        const res = await api.post('/chart/period/month', {
          birth_details: birthDetails,
          month: month,
          year: year
        });

        if (res.data && res.data.calendar_scores) {
          const newData: Record<string, DailyCalendarData> = {};
          res.data.calendar_scores.forEach((day: any) => {
            newData[day.date] = {
              score: day.score,
              events: day.events || []
            };
          });
          setDailyData(newData);
          setCurrentMonth(monthKey);
        }
      } catch (e) {
        console.error("Failed to fetch monthly scores", e);
      }
    };

    fetchMonthlyData();
  }, [currentProfile, selectedDate.getMonth(), selectedDate.getFullYear()]); // Only re-run specific fields changes

  useEffect(() => {
    if (currentProfile) {
      fetchData();
    }
  }, [currentProfile]);

  return (
    <MainLayout title="Period Analysis" breadcrumbs={['Home', 'Period Analysis']} showHeader={false}>
      <DashboardHeader activeTab="dashboard" />
      <div className="min-h-screen bg-slate-900 pb-20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <PeriodDashboardLayout
            data={dashboardData}
            loading={loading}
            error={error}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            dailyData={dailyData}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default PeriodAnalysisPage;
