import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TripForm from '../components/TripForm';
import { useTripStore } from '../store/tripStore';
import { itineraryService, weatherService, hotelService } from '../services/api';
import { Plane, Compass, Loader2, AlertCircle } from 'lucide-react';

export default function PlanTrip() {
  const navigate = useNavigate();
  
  // Zustand actions & state
  const { setItinerary, setWeather, setHotels, setTripRequest, resetStore } = useTripStore();

  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getInThreeDaysString = () => {
    const target = new Date();
    target.setDate(target.getDate() + 4);
    return target.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    start_date: getTomorrowString(),
    end_date: getInThreeDaysString(),
    budget: 30000,
    trip_type: 'leisure',
    travelers: 2,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'budget' || name === 'travelers' ? Number(value) : value,
    }));
  };

  const calculateDays = (start, end) => {
    try {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diff = Math.abs(d2 - d1);
      return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    } catch {
      return 3;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    resetStore();

    try {
      // 1. Fetch Weather forecast
      setLoadingStep('Fetching weather forecasts for your trip...');
      const daysCount = calculateDays(formData.start_date, formData.end_date);
      const weatherRes = await weatherService.getForecast(
        formData.destination, 
        daysCount, 
        formData.start_date
      );
      setWeather(weatherRes.data);

      // 2. Fetch Hotels
      setLoadingStep('Finding premium hotel accommodations...');
      const hotelsRes = await hotelService.search({
        city: formData.destination,
        checkin: formData.start_date,
        checkout: formData.end_date,
        adults: formData.travelers
      });
      setHotels(hotelsRes.data);

      // 3. Generate Itinerary
      setLoadingStep('Crafting custom day-wise itinerary with AI...');
      const itineraryRes = await itineraryService.generate(formData);
      setItinerary(itineraryRes.data);

      // 4. Save Trip request inputs
      setTripRequest(formData);

      // Navigate to results
      navigate('/result');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'An unexpected error occurred while planning your trip. Please try again.'
      );
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
        <div className="relative flex items-center justify-center mb-6">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <Plane className="w-6 h-6 text-blue-500 absolute animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Designing Your Journey</h3>
        <p className="text-gray-500 text-sm max-w-md animate-pulse">
          {loadingStep}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 mb-2">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Plan Your Next Adventure
        </h2>
        <p className="text-gray-500 text-sm">
          Enter your details below and let AI plan a fully integrated day-by-day travel experience.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 border border-red-200 rounded-xl bg-red-50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-800">Planning Failed</h4>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <TripForm formData={formData} onChange={handleChange} />
        
        <button
          type="submit"
          className="w-full py-4 px-6 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 transform hover:-translate-y-0.5"
        >
          Create My Itinerary
        </button>
      </form>
    </div>
  );
}
