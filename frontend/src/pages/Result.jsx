import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ItineraryCard from '../components/ItineraryCard';
import MapView from '../components/MapView';
import HotelCard from '../components/HotelCard';
import FlightCard from '../components/FlightCard';
import WeatherCard from '../components/WeatherCard';
import SafetyCard from '../components/SafetyCard';
import ResultBottomPanel from '../components/ResultBottomPanel';
import { useTripStore } from '../store/tripStore';
import { Calendar, User, Compass, Landmark } from 'lucide-react';

const mockHotels = [
  {
    hotel_id: 1,
    name: "The Grand Palace Hotel",
    review_score: 9.4,
    review_score_word: "Wonderful",
    min_total_price: 7500,
    url: "https://www.booking.com",
    main_photo_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    address: "101 Luxury Avenue, City Center",
    distance_to_center: "0.3 km"
  },
  {
    hotel_id: 2,
    name: "Serene Boutique Resort",
    review_score: 8.9,
    review_score_word: "Excellent",
    min_total_price: 5200,
    url: "https://www.booking.com",
    main_photo_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
    address: "45 Tranquility Road",
    distance_to_center: "1.2 km"
  },
  {
    hotel_id: 3,
    name: "Urban Vista Suites",
    review_score: 8.7,
    review_score_word: "Very Good",
    min_total_price: 4300,
    url: "https://www.booking.com",
    main_photo_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80",
    address: "78 Highrise Boulevard",
    distance_to_center: "0.8 km"
  }
];

export default function Result() {
  const navigate = useNavigate();
  const { tripRequest, itinerary, hotels, flights, safety } = useTripStore();

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

      {/* Available Flights */}
      <div className="mb-8 bg-white border border-gray-150 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Available Flights</h3>
          <span className="text-xs text-gray-400 font-medium">
            {(flights || []).length} options
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {(flights && flights.length > 0 ? flights : []).map((flight, i) => (
            <FlightCard key={`${flight.flight_number}-${i}`} flight={flight} />
          ))}
          {(!flights || flights.length === 0) && (
            <p className="text-sm text-gray-500 py-6 px-2">
              No flights found. Plan a trip from Indian cities like Delhi or Mumbai to see results.
            </p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <MapView />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Itinerary */}
        <div className="lg:col-span-2 space-y-6">
          <ItineraryCard />
        </div>

        {/* Right Column: Auxiliary Cards and Info */}
        <div className="space-y-6">
          <SafetyCard safety={safety} destination={destination} />

          {/* Hotels Horizontal Scroll Row */}
          <div className="bg-white border border-gray-150 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Recommended Hotels</h3>
              <span className="text-xs text-gray-400 font-medium">{(hotels || []).length} options</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
              {(hotels && hotels.length > 0 ? hotels.slice(0, 3) : mockHotels).map((hotel, i) => (
                <HotelCard key={hotel.hotel_id || i} hotel={hotel} />
              ))}
            </div>
          </div>

        </div>
      </div>

      <ResultBottomPanel />
    </div>
  );
}
