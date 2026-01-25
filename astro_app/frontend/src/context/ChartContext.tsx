import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

export const ChartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [chartStyle, setChartStyleState] = useState<ChartStyle>('NORTH_INDIAN');
  
  // Profile State
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null); // Start null to allow init
  const [availableProfiles, setAvailableProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // Initialize Chart Style
  useEffect(() => {
    const savedStyle = localStorage.getItem('chartStyle') as ChartStyle;
    if (savedStyle) {
      setChartStyleState(savedStyle);
    }
  }, []);

  // Initialize Profile
  useEffect(() => {
    const savedChart = localStorage.getItem('lastViewedChart');
    if (savedChart) {
      try {
        const parsed = JSON.parse(savedChart);
        setCurrentProfile(normalizeProfile(parsed));
      } catch (e) {
        console.error("Failed to parse saved chart", e);
        setCurrentProfile(DEFAULT_PROFILE);
      }
    } else {
      setCurrentProfile(DEFAULT_PROFILE);
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

  const normalizeProfile = (chart: any): UserProfile => {
    return {
      name: chart.first_name ? `${chart.first_name} ${chart.last_name}` : (chart.name || 'My Chart'),
      date: chart.date_str || chart.date,
      time: chart.time_str || chart.time,
      location: chart.location_name || chart.location || 'Saved Location',
      latitude: chart.latitude,
      longitude: chart.longitude,
      timezone: chart.timezone_str || chart.timezone,
      raw: chart
    };
  };

  const setChartStyle = (style: ChartStyle) => {
    setChartStyleState(style);
    localStorage.setItem('chartStyle', style);
  };

  const toggleChartStyle = () => {
    const newStyle = chartStyle === 'NORTH_INDIAN' ? 'SOUTH_INDIAN' : 'NORTH_INDIAN';
    setChartStyle(newStyle);
  };

  const switchProfile = (chart: any) => {
    const newProfile = normalizeProfile(chart);
    setCurrentProfile(newProfile);
    localStorage.setItem('lastViewedChart', JSON.stringify(chart));
  };

  const refreshProfiles = useCallback(async () => {
    setIsLoadingProfiles(true);
    try {
      const res = await api.get('/charts/');
      setAvailableProfiles(res.data);
    } catch (e) {
      console.error("Failed to fetch saved charts", e);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, []);

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

export const useChartSettings = () => {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error('useChartSettings must be used within a ChartProvider');
  }
  return context;
};
