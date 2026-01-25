import api from './api';

interface LocationParams {
  lat: number;
  lon: number;
  timezone: string;
}

interface FinancialProfileRequest {
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface AssetAnalysisRequest {
  user_profile: unknown;
  asset_name: string;
  latitude?: number;
  longitude?: number;
}

interface BirthDetailsPayload {
  date: string;
  time: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}

interface GannAIRequest {
  question: string;
  asset: string;
  gann_data: unknown;
  birth_details?: BirthDetailsPayload;
}

export const businessService = {
  getMarketTiming: async (location?: LocationParams) => {
    const config = location ? { params: location } : {};
    const response = await api.get('/business/market-timing', config);
    return response.data;
  },
  getCryptoSignals: async () => {
    const response = await api.get('/business/crypto-signals');
    return response.data;
  },
  getFinancialProfile: async (profileData: FinancialProfileRequest) => {
    const response = await api.post('/business/financial-profile', profileData);
    return response.data;
  },
  getLiveFeed: async (symbols?: string[], location?: LocationParams) => {
    // Pass symbols as query parameters. 
    // Axios usually serializes arrays as symbols[]=v1&symbols[]=v2
    const params: Record<string, unknown> = {};
    if (symbols && symbols.length > 0) {
      params.symbols = symbols;
    }
    if (location) {
      Object.assign(params, location);
    }
    
    const response = await api.get('/business/live-feed', { params });
    return response.data;
  },
  getMarketOverlay: async (profileData: FinancialProfileRequest) => {
    const response = await api.post('/business/market-overlay', profileData);
    return response.data;
  },
  getPerformanceStats: async () => {
    const response = await api.get('/business/performance-stats');
    return response.data;
  },
  getAssetList: async () => {
    const response = await api.get('/business/assets/list');
    return response.data;
  },
  analyzeAsset: async (data: AssetAnalysisRequest) => {
    const response = await api.post('/business/asset-analysis', data);
    return response.data;
  },
  getGannIntelligence: async (
    location?: LocationParams, 
    price?: number, 
    asset?: string, 
    marketType: string = 'Crypto',
    birthDetails?: { date: string, time: string, timezone?: string, lat?: number, lon?: number },
    asOfDate?: string
  ) => {
    const params: Record<string, unknown> = {};
    if (location) {
      Object.assign(params, location);
    }
    if (price) {
      params.price = price;
    }
    if (asset) {
      params.asset = asset;
    }
    params.market_type = marketType;
    if (asOfDate) {
      params.as_of_date = asOfDate;
    }

    if (birthDetails) {
        params.birth_date = birthDetails.date;
        params.birth_time = birthDetails.time;
        if (birthDetails.timezone) params.birth_timezone = birthDetails.timezone;
        if (birthDetails.lat) params.birth_lat = birthDetails.lat;
        if (birthDetails.lon) params.birth_lon = birthDetails.lon;
    }
    
    const response = await api.get('/business/gann-intelligence', { params });
    return response.data;
  },
  askGannAI: async (data: GannAIRequest) => {
    const response = await api.post('/business/gann-ai-chat', data);
    return response.data;
  }
};
