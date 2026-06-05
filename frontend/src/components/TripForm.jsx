import React from 'react';
import { MapPin, Calendar, IndianRupee, Users, Compass } from 'lucide-react';

export default function TripForm({ formData, onChange }) {
  const tripTypes = [
    { value: 'leisure', label: 'Leisure & Relax' },
    { value: 'adventure', label: 'Adventure & Sports' },
    { value: 'culture', label: 'Culture & Sightseeing' },
    { value: 'business', label: 'Business & Travel' }
  ];

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
      {/* Destination */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-500" />
          Where do you want to go?
        </label>
        <div className="relative">
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={onChange}
            required
            placeholder="e.g. Hanoi, Paris, Tokyo"
            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
          />
        </div>
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
          />
        </div>
      </div>

      {/* Budget & Travelers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Budget */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-blue-500" />
            Budget (INR)
          </label>
          <input
            type="number"
            name="budget"
            value={formData.budget || ''}
            onChange={onChange}
            required
            min="1000"
            placeholder="e.g. 25000"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
          />
        </div>

        {/* Travelers */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-500" />
            Number of Travelers
          </label>
          <input
            type="number"
            name="travelers"
            value={formData.travelers}
            onChange={onChange}
            required
            min="1"
            max="20"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
          />
        </div>
      </div>

      {/* Trip Type */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-blue-500" />
          Trip Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {tripTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange({ target: { name: 'trip_type', value: type.value } })}
              className={`py-3 px-4 rounded-xl border text-sm font-medium transition duration-200 ${
                formData.trip_type === type.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
