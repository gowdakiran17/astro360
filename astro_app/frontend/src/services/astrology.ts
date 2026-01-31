import api from './api';

// --- Types ---

export interface BirthDetails {
    date: string;
    time: string;
    timezone: string;
    latitude: number;
    longitude: number;
}

export interface SadeSatiPhase {
    phase: string;
    start: string;
    end: string;
    is_current: boolean;
}

export interface SadeSatiResponse {
    is_in_sade_sati: boolean;
    phase: string;
    description: string;
    intensity: 'low' | 'medium' | 'high';
    intensity_score: number;
    start_date: string;
    end_date: string;
    raw_start_jd?: number;
    raw_end_jd?: number;
    phases: SadeSatiPhase[];
    planetary_details: {
        saturn: {
            sign: string;
            nakshatra: string;
            is_retro: boolean;
        };
        moon: {
            sign: string;
        };
    };
}

export interface DashaRequest {
    birth_details: BirthDetails;
    moon_longitude?: number;
    ayanamsa?: string;
}

export interface PeriodAnalysisRequest {
    birth_details: BirthDetails;
    moon_longitude?: number;
    month: number;
    year: number;
}

// --- Service ---

export const astrologyService = {
    /**
     * Get detailed Sade Sati analysis
     */
    getSadeSati: async (details: BirthDetails): Promise<SadeSatiResponse> => {
        const response = await api.post('chart/sade-sati', details);
        return response.data;
    },

    /**
     * Get Vimshottari Dasha details
     */
    getDasha: async (request: DashaRequest) => {
        const response = await api.post('chart/dasha', request);
        return response.data;
    },

    /**
     * Get Period Analysis (Calendar scores, predictions)
     */
    getPeriodAnalysis: async (request: PeriodAnalysisRequest) => {
        const response = await api.post('chart/period-analysis', request);
        return response.data;
    },

    /**
     * Get Planetary Transits
     */
    getTransits: async (request: any) => {
        const response = await api.post('chart/transits', request);
        return response.data;
    },

    /**
     * Get Birth Chart (D1)
     */
    getBirthChart: async (details: BirthDetails) => {
        const response = await api.post('chart/birth', details);
        return response.data;
    },

    /**
     * Search for Auspicious Muhurata
     */
    findMuhurata: async (request: any) => {
        const response = await api.post('chart/muhurata/find', request);
        return response.data;
    },

    /**
     * Check Transit Ingress (Nakshatra Change)
     */
    checkTransitIngress: async (request: any) => {
        const response = await api.post('chart/transits/ingress', request);
        return response.data;
    }
};
