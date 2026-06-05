import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const itineraryService = {
  generate: (data) => api.post('/api/itinerary', data),
};

export const weatherService = {
  getForecast: (city, days = 5, travelDate = null) => 
    api.get('/api/weather', { 
      params: { 
        city, 
        days, 
        travel_date: travelDate 
      } 
    }),
};

export const hotelService = {
  search: (params) => api.get('/api/hotels', { params }),
};

export const flightService = {
  search: (params) => api.get('/api/flights', { params }),
};

export const safetyService = {
  getAdvisory: (destination) => api.get('/api/safety', { params: { destination } }),
};

export const voiceService = {
  generateVoice: (text) => api.post('/voice/', { text }),
};

export default api;
