import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ItineraryCard from '../components/ItineraryCard';
import MapView from '../components/MapView';
import HotelCard from '../components/HotelCard';
import FlightCard from '../components/FlightCard';
import WeatherCard from '../components/WeatherCard';
import SafetyCard from '../components/SafetyCard';
import BudgetTracker from '../components/BudgetTracker';
import PackingList from '../components/PackingList';
import VoicePlayer from '../components/VoicePlayer';
import { useTripStore } from '../store/tripStore';
import { Calendar, User, Compass, Landmark } from 'lucide-react';

export default function Result() {
  const navigate = useNavigate();
  const { tripRequest, itinerary } = useTripStore();

  // Redirect to plan page if no trip is loaded and there's no state (to keep routing logical)
  useEffect(() => {
    if (!tripRequest?.destination && !itinerary) {
      // We don't block fully so they can see mock fallbacks if they inspect the page directly,
      // but redirecting helps standard user flows.
    }
  }, [tripRequest, itinerary]);

  // Read data or fallback to Hanoi mockup defaults
  const destination = tripRequest?.destination || "Hanoi";
  const budget = tripRequest?.budget || 30000;
  const start_date = tripRequest?.start_date || "2026-06-06";
  const end_date = tripRequest?.end_date || "2026-06-08";
  const travelers = tripRequest?.travelers || 2;
  const trip_type = tripRequest?.trip_type || "leisure";

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const calculateDays = (start, end) => {
    try {
      const d1 = new Date(start);
      const d2 = new Date(end);
      return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    } catch {
      return 3;
    }
  };

  const daysCount = calculateDays(start_date, end_date);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Plan Generated
          </span>
          <h2 className="text-3xl font-extrabold text-gray-950 mt-2 capitalize flex items-center gap-2">
            <Landmark className="w-8 h-8 text-blue-600 shrink-0" />
            Trip to {destination}
          </h2>
          
          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {daysCount} Days ({formatDate(start_date)} - {formatDate(end_date)})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" />
              <span>{travelers} {travelers > 1 ? 'Travelers' : 'Traveler'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-gray-400" />
              <span className="capitalize">{trip_type} trip</span>
            </div>
            <div className="text-emerald-600 font-semibold">
              Budget: ₹{budget?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <Link
          to="/plan"
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-sm transition"
        >
          ← Adjust Configuration
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Itinerary and Map */}
        <div className="lg:col-span-2 space-y-6">
          <MapView />
          <ItineraryCard />
        </div>

        {/* Right Column: Auxiliary Cards and Info */}
        <div className="space-y-6">
          <VoicePlayer />
          <SafetyCard />
          <FlightCard />
          <HotelCard />
          <BudgetTracker />
          <PackingList />
        </div>
      </div>
    </div>
  );
}
