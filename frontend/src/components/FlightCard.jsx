import React from 'react';
import { ExternalLink, Plane } from 'lucide-react';

function buildAirlineLogoUrl(airlineName) {
  const name = encodeURIComponent(airlineName || 'Airline');
  return `https://ui-avatars.com/api/?name=${name}&background=0ea5e9&color=fff`;
}

export default function FlightCard({ flight }) {
  if (!flight) return null;

  const {
    airline_name,
    flight_number,
    departure_time,
    arrival_time,
    departure_iata,
    arrival_iata,
    duration,
    flight_status,
    price_label,
    booking_url,
  } = flight;

  const isCancelled = flight_status === 'cancelled';

  return (
    <div
      className={`flex-none w-[300px] sm:w-[340px] rounded-2xl border shadow-sm overflow-hidden flex flex-col transition duration-300 snap-start ${
        isCancelled
          ? 'bg-gray-50 border-gray-200 opacity-60 grayscale'
          : 'bg-white border-gray-150 hover:shadow-md group'
      }`}
    >
      <div className="p-4 flex flex-col gap-4 h-full">
        {/* Airline row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={buildAirlineLogoUrl(airline_name)}
              alt={airline_name}
              className="w-10 h-10 rounded-full shrink-0 border border-sky-100"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{airline_name}</p>
              <span className="inline-flex mt-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-semibold text-gray-600">
                {flight_number}
              </span>
            </div>
          </div>
          {isCancelled && (
            <span className="shrink-0 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-[11px] font-bold uppercase">
              Cancelled
            </span>
          )}
        </div>

        {/* Route */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-center">
            <p className="text-lg font-extrabold text-gray-900">{departure_time}</p>
            <p className="text-sm font-bold text-blue-600 mt-0.5">{departure_iata}</p>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1 px-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-semibold border border-sky-100">
              {duration}
            </span>
            <div className="w-full flex items-center gap-1">
              <span className="h-px flex-1 bg-gray-200" />
              <Plane className="w-4 h-4 text-gray-400 rotate-90 shrink-0" />
              <span className="h-px flex-1 bg-gray-200" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-extrabold text-gray-900">{arrival_time}</p>
            <p className="text-sm font-bold text-emerald-600 mt-0.5">{arrival_iata}</p>
          </div>
        </div>

        {/* Price + action */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Price</p>
            <p className="text-xs font-medium text-gray-600">{price_label || 'Check airline website'}</p>
          </div>
          <a
            href={booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              isCancelled
                ? 'bg-gray-200 text-gray-500 pointer-events-none'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-disabled={isCancelled}
            tabIndex={isCancelled ? -1 : 0}
          >
            View Deal
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
