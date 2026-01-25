export interface Tithi {
  number: number;
  name: string;
  details?: string;
}

export interface Nakshatra {
  number: number;
  name: string;
  ruler?: string;
}

export interface Yoga {
  number: number;
  name: string;
}

export interface Panchang {
  tithi: Tithi;
  karana: { name: string; number: number };
  nakshatra: Nakshatra;
  yoga: Yoga;
  day_lord: string;
  sunrise: string;
  sunset: string;
  day_length: string;
}

export interface Muhurta {
  name: string;
  type: string; // 'Choghadiya', 'Hora', 'Vedic'
  start: string | number; // ISO string or JD? Backend sends JD usually, we might need formatting.
  end: string | number;
  quality: 'Excellent' | 'Good' | 'Poor' | 'Avoid';
  ruler?: string;
}

export interface HouseStrength {
  house_idx: number; // 1-12
  points: number; // SAV points
  sign_idx?: number;
}

export interface PlanetPosition {
  name: string;
  longitude: number;
  speed?: number;
}

export interface Transit {
  name: string;
  longitude: number;
  zodiac_sign: string;
  nakshatra: string;
  is_retrograde: boolean;
}

export interface DailyAnalysis {
  date: string;
  day: string; // Added from backend
  score: number;
  quality?: string; // Backend sends 'type' or 'quality'? Backend sends 'type' in day_score, 'quality' might be missing.
  type?: string;
  recommendation?: string;
  panchang?: Panchang;
  events?: any[];
  house_strengths?: {
    sav: number[];
    strongest_houses: HouseStrength[];
    weakest_houses: HouseStrength[];
  };
  muhuratas?: Muhurta[];
  lucky_factors?: {
    color: string;
    direction: string;
    gem: string;
    mantra: string;
  };
  transits?: Transit[];
  // Backend additional fields
  day_lord?: string;
  influences?: string[];
  theme?: string;
  energy?: number;
  best?: string;
  caution?: string;
  predictions?: any[];
}


export interface AstrologicalEvent {
  date: string;
  type: string;
  title: string;
  description: string;
  impact?: 'favorable' | 'challenging' | 'neutral';
  // Frontend component expectations (Legacy matching)
  name: string;      // Mapped from title
  category: string;  // Mapped from type
  strength: number;  // Mapped/Defaulted
  occurring?: boolean;
}


export interface StrengthData {
  shadbala: {
    planets: any[];
    summary: any;
  };
  vimsopaka: Record<string, number>;
  ishta_kashta: Record<string, { ishta: number; kashta: number; ratio: number }>;
}

export interface DashaInfo {
  current: {
    current_mahadasha: any; // Updated to rich object
    current_antardasha: any;
    current_pratyantardasha: any;
    current_sookshma?: any;
    current_prana?: any;
  };
  full_timeline: any[];
}

export interface DashboardOverviewResponse {
  daily_analysis: DailyAnalysis;
  dasha_info: DashaInfo;
  strength_analysis: StrengthData;
  chart_details: {
    lagna: { sign: string; longitude: number; degree_str: string };
    sun_sign: { sign: string; longitude: number; degree_str: string };
    moon_sign: { sign: string; longitude: number; degree_str: string };
    nakshatra: { id: number; name: string; pada: number };
    sunrise: string;
    sunset: string;
  };
  meta: {
    calculation_date: string;
    user: string;
  };
}

export interface PeriodResponse {
  month: string;
  calendar_scores: DailyAnalysis[];
  events: AstrologicalEvent[];
  predictions: any[];
  overall_score: number;
  monthly_forecast: any;
  weekly_forecast: any;
  current_day: DailyAnalysis;
}
