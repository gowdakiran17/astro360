import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

type ChartStyle = 'NORTH_INDIAN' | 'SOUTH_INDIAN';

export interface UserProfile {
  name: string;
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  gender?: string;
  // Store original raw data if needed
  raw?: any;
}

interface ChartContextType {
  chartStyle: ChartStyle;
  setChartStyle: (style: ChartStyle) => void;
  toggleChartStyle: () => void;

  // Profile Management
  currentProfile: UserProfile | null;
  availableProfiles: any[];
  switchProfile: (chart: any) => void;
  refreshProfiles: () => Promise<void>;
  isLoadingProfiles: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Kiran Kumar',
  date: '17/04/1990',
  time: '05:06',
  location: 'Malur, Karnataka',
  latitude: 13.0037,
  longitude: 77.9383,
  timezone: '+05:30'
};

const ChartContext = createContext<ChartContextType | undefined>(undefined);


// Helper to normalize profile data
const normalizeProfile = (chart: any): UserProfile => {
  return {
    name: chart.first_name ? `${chart.first_name} ${chart.last_name}` : (chart.name || 'My Chart'),
    date: chart.date_str || chart.date,
    time: chart.time_str || chart.time,
    location: chart.location_name || chart.location || 'Saved Location',
    latitude: chart.latitude,
    longitude: chart.longitude,
    timezone: chart.timezone_str || chart.timezone,
    gender: chart.gender || 'male',
    raw: chart
  };
};

export const ChartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [chartStyle, setChartStyleState] = useState<ChartStyle>('NORTH_INDIAN');

  // Profile State - Initialize Synchronously
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(() => {
    try {
      const savedChart = localStorage.getItem('lastViewedChart');
      if (savedChart) {
        const parsed = JSON.parse(savedChart);
        return normalizeProfile(parsed);
      }
    } catch (e) {
      console.error("Failed to parse saved chart", e);
    }
    return DEFAULT_PROFILE;
  });

  const [availableProfiles, setAvailableProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // Initialize Chart Style
  useEffect(() => {
    const savedStyle = localStorage.getItem('chartStyle') as ChartStyle;
    if (savedStyle) {
      setChartStyleState(savedStyle);
    }
  }, []);

  // Fetch profiles when user is authenticated
  useEffect(() => {
    if (user) {
      refreshProfiles();
    } else {
      setAvailableProfiles([]);
    }
  }, [user]);

  const setChartStyle = (style: ChartStyle) => {
    setChartStyleState(style);
    localStorage.setItem('chartStyle', style);
  };

  const toggleChartStyle = () => {
    const newStyle = chartStyle === 'NORTH_INDIAN' ? 'SOUTH_INDIAN' : 'NORTH_INDIAN';
    setChartStyle(newStyle);
  };

  const switchProfile = (chart: any) => {
    const profile = normalizeProfile(chart);
    setCurrentProfile(profile);
    localStorage.setItem('lastViewedChart', JSON.stringify(chart));
  };

  const refreshProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      const response = await api.get('charts/');
      setAvailableProfiles(response.data);
    } catch (error) {
      console.error("Failed to fetch profiles", error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  return (
    <ChartContext.Provider value={{
      chartStyle,
      setChartStyle,
      toggleChartStyle,
      currentProfile,
      availableProfiles,
      switchProfile,
      refreshProfiles,
      isLoadingProfiles
    }}>
      {children}
    </ChartContext.Provider>
  );
};

export const useChart = () => {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error('useChart must be used within a ChartProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useChartSettings = useChart;
