import api from './api';

interface VastuBirthDetails {
  date: string;
  time: string;
  timezone: string;
  latitude: number;
  longitude: number;
  name: string;
}

export const vastuService = {
  getPersonalProfile: async (birthDetails: VastuBirthDetails) => {
    const response = await api.post('vastu/elite/personal-profile', birthDetails);
    return response.data;
  },
  
  getEliteAnalysis: async (data: unknown) => {
    const response = await api.post('vastu/elite/analysis', data);
    return response.data;
  }
};
