import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ItineraryCard from '../components/ItineraryCard';
import MapView from '../components/MapView';
import HotelCard from '../components/HotelCard';
import FlightCard from '../components/FlightCard';
import SafetyCard from '../components/SafetyCard';
import ResultBottomPanel from '../components/ResultBottomPanel';
import { useTripStore } from '../store/tripStore';
import { buildShareUrl, decodeTrip, parseSharedTripPayload } from '../utils/shareUtils';
import { exportTripPDF } from '../utils/pdfUtils';
import { Calendar, User, Compass, Landmark, Link2, FileDown } from 'lucide-react';

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
  const [searchParams] = useSearchParams();
  const {
    tripRequest,
    itinerary,
    hotels,
    flights,
    safety,
    setItinerary,
    setTripRequest,
  } = useTripStore();

  const [toast, setToast] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [loadedFromShare, setLoadedFromShare] = useState(false);
  const shareLoadedRef = useRef(false);

  // Load itinerary from ?trip= share link on mount
  useEffect(() => {
    if (shareLoadedRef.current) return;

    const tripParam = searchParams.get('trip');
    if (!tripParam) return;

    try {
      const decoded = decodeTrip(tripParam);
      const parsed = parseSharedTripPayload(decoded);

      if (parsed?.itinerary) {
        setItinerary(parsed.itinerary);
        if (parsed.tripRequest) {
          setTripRequest(parsed.tripRequest);
        }
        setLoadedFromShare(true);
        shareLoadedRef.current = true;
      }
    } catch (err) {
      console.error('Failed to load shared trip:', err);
      setToast('Invalid share link');
      setTimeout(() => setToast(null), 3000);
    }
  }, [searchParams, setItinerary, setTripRequest]);

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

  const activeItinerary = itinerary;

  const handleShare = async () => {
    if (!activeItinerary) {
      setToast('No itinerary to share');
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const sharePayload = {
      itinerary: activeItinerary,
      tripRequest,
    };
    const url = buildShareUrl(sharePayload);

    try {
      await navigator.clipboard.writeText(url);
      setToast('Link copied!');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setToast('Link copied!');
    }

    setTimeout(() => setToast(null), 2500);
  };

  const handleExportPdf = async () => {
    if (!activeItinerary) {
      setToast('No itinerary to export');
      setTimeout(() => setToast(null), 2500);
      return;
    }

    setExportingPdf(true);
    try {
      await exportTripPDF(activeItinerary, tripRequest);
    } catch (err) {
      console.error('PDF export failed:', err);
      setToast('Export failed');
      setTimeout(() => setToast(null), 2500);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Sticky action bar — top right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 shadow-lg hover:bg-gray-50 hover:shadow-xl transition"
        >
          <Link2 className="w-4 h-4" />
          Share
        </button>
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={exportingPdf}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 border border-blue-600 shadow-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <FileDown className="w-4 h-4" />
          {exportingPdf ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-[60] px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold shadow-lg">
          {toast}
        </div>
      )}

      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-6 pr-0 sm:pr-52">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {loadedFromShare ? 'Shared Trip' : 'Plan Generated'}
          </span>
          <h2 className="text-3xl font-extrabold text-gray-950 mt-2 capitalize flex items-center gap-2">
            <Landmark className="w-8 h-8 text-blue-600 shrink-0" />
            Trip to {destination}
          </h2>
          
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
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-sm transition shrink-0"
        >
          ← Adjust Configuration
        </Link>
      </div>

      {/* Available Flights */}
      {!loadedFromShare && (
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
      )}

      <div className="mb-8">
        <MapView />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ItineraryCard />
        </div>

        <div className="space-y-6">
          {!loadedFromShare && <SafetyCard safety={safety} destination={destination} />}

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
