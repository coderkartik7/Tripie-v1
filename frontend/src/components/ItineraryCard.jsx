import React from 'react';
import { useTripStore } from '../store/tripStore';
import WeatherCard from './WeatherCard';
import { Calendar, MapPin, Clock, IndianRupee } from 'lucide-react';

export default function ItineraryCard() {
  const { itinerary, weather } = useTripStore();

  // Premium Fallback Mock Itinerary for presentation when empty
  const defaultItinerary = {
    trip_summary: "A curated 3-day exploration of history, vibrant street food, and peaceful lakes in Hanoi.",
    total_estimated_cost: 15000,
    days: [
      {
        day: 1,
        title: "Old Quarter & Lake Rest",
        day_total_cost: 4500,
        activities: [
          {
            time: "09:00 AM",
            name: "Walking Tour of Hanoi Old Quarter",
            description: "Explore narrow streets filled with traditional architecture and local vendors.",
            location: "Hoan Kiem, Hanoi",
            lat: 21.0333,
            lng: 105.8500,
            estimated_cost: 1000,
            type: "sightseeing"
          },
          {
            time: "01:00 PM",
            name: "Lunch at Bun Cha Huong Lien",
            description: "Taste traditional grilled pork noodles, famously visited by Obama.",
            location: "Hai Ba Trung, Hanoi",
            lat: 21.0183,
            lng: 105.8566,
            estimated_cost: 1500,
            type: "food"
          },
          {
            time: "04:30 PM",
            name: "Sunset Walk at Hoan Kiem Lake",
            description: "Stroll around the scenic lake and cross the red bridge to Ngoc Son Temple.",
            location: "Hoan Kiem, Hanoi",
            lat: 21.0285,
            lng: 105.8523,
            estimated_cost: 2000,
            type: "sightseeing"
          }
        ]
      },
      {
        day: 2,
        title: "Temple of Literature & Train Street",
        day_total_cost: 5000,
        activities: [
          {
            time: "09:30 AM",
            name: "Hanoi Temple of Literature",
            description: "Visit the country's first national university built in 1070.",
            location: "Dong Da, Hanoi",
            lat: 21.0293,
            lng: 105.8361,
            estimated_cost: 2000,
            type: "sightseeing"
          },
          {
            time: "03:00 PM",
            name: "Coffee at Train Street",
            description: "Enjoy egg coffee right beside active train tracks passing close to cafes.",
            location: "Ba Dinh, Hanoi",
            lat: 21.0287,
            lng: 105.8433,
            estimated_cost: 1000,
            type: "food"
          }
        ]
      }
    ]
  };

  const activeItinerary = itinerary || defaultItinerary;

  // Use either active weather store data or mock a 5-day cycle if store is empty
  const defaultWeather = [
    { date: "Day 1", temp_min: 24.0, temp_max: 32.0, condition: "Clear", icon_url: "https://openweathermap.org/img/wn/01d@2d.png", rain_chance: 5 },
    { date: "Day 2", temp_min: 22.0, temp_max: 29.0, condition: "Clouds", icon_url: "https://openweathermap.org/img/wn/03d@2d.png", rain_chance: 35 },
    { date: "Day 3", temp_min: 18.0, temp_max: 24.0, condition: "Rain", icon_url: "https://openweathermap.org/img/wn/10d@2d.png", rain_chance: 85 }
  ];

  const activeWeather = (weather && weather.length > 0) ? weather : defaultWeather;

  const getActivityTypeStyles = (type) => {
    switch (type?.toLowerCase()) {
      case 'food':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'adventure':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'transport':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'accommodation':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <div className="p-6 rounded-2xl bg-white border border-gray-150 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Trip Overview
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {activeItinerary.trip_summary}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          <span>Total Estimated Cost: </span>
          <span className="font-bold text-gray-800">₹{activeItinerary.total_estimated_cost?.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Day-Wise Loop */}
      <div className="space-y-8">
        {activeItinerary.days.map((dayItem, index) => {
          const dayWeather = activeWeather[index % activeWeather.length];

          return (
            <div 
              key={dayItem.day} 
              className="p-6 rounded-2xl bg-white border border-gray-150 shadow-sm space-y-6 hover:shadow-md transition duration-300"
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-semibold">
                      D{dayItem.day}
                    </span>
                    {dayItem.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                    Day Budget: ₹{dayItem.day_total_cost?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Day Weather Component */}
              {dayWeather && (
                <div className="my-2">
                  <WeatherCard weather={dayWeather} />
                </div>
              )}

              {/* Day Activities */}
              <div className="relative border-l border-gray-100 ml-4 pl-6 space-y-6">
                {dayItem.activities && dayItem.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="relative group">
                    {/* Time dot indicator */}
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-blue-600 border border-white group-hover:scale-125 transition duration-150"></div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {activity.time}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 border rounded-full ${getActivityTypeStyles(activity.type)}`}>
                          {activity.type || 'sightseeing'}
                        </span>
                        {activity.estimated_cost > 0 && (
                          <span className="text-xs text-gray-500 font-medium">
                            • Est: ₹{activity.estimated_cost}
                          </span>
                        )}
                      </div>

                      <h5 className="text-base font-bold text-gray-950 hover:text-blue-600 transition cursor-pointer">
                        {activity.name}
                      </h5>

                      <p className="text-gray-600 text-sm leading-relaxed">
                        {activity.description}
                      </p>

                      {activity.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{activity.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
