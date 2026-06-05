import { create } from 'zustand';

export const useTripStore = create((set) => ({
  // State
  tripRequest: {
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0,
    preferences: [],
  },
  itinerary: null,
  hotels: [],
  flights: [],
  weather: null,
  safety: null,
  voiceUrl: null,
  budgetItems: [],
  packingItems: [],
  loading: false,
  error: null,

  // Actions
  setTripRequest: (request) => set({ tripRequest: request }),
  setItinerary: (itinerary) => set({ itinerary }),
  setHotels: (hotels) => set({ hotels }),
  setFlights: (flights) => set({ flights }),
  setWeather: (weather) => set({ weather }),
  setSafety: (safety) => set({ safety }),
  setVoiceUrl: (voiceUrl) => set({ voiceUrl }),
  
  addBudgetItem: (item) => set((state) => ({ budgetItems: [...state.budgetItems, item] })),
  removeBudgetItem: (id) => set((state) => ({ 
    budgetItems: state.budgetItems.filter(item => item.id !== id) 
  })),

  togglePackingItem: (id) => set((state) => ({
    packingItems: state.packingItems.map(item => 
      item.id === id ? { ...item, packed: !item.packed } : item
    )
  })),
  addPackingItem: (item) => set((state) => ({ packingItems: [...state.packingItems, item] })),

  resetStore: () => set({
    tripRequest: { destination: '', startDate: '', endDate: '', budget: 0, preferences: [] },
    itinerary: null,
    hotels: [],
    flights: [],
    weather: null,
    safety: null,
    voiceUrl: null,
    budgetItems: [],
    packingItems: [],
    loading: false,
    error: null,
  }),
}));
