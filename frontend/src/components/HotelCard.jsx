import React from 'react';
import { Star, MapPin, ExternalLink } from 'lucide-react';

export default function HotelCard({ hotel }) {
  if (!hotel) return null;

  const {
    name,
    review_score,
    review_score_word,
    min_total_price,
    url,
    main_photo_url,
    address,
    distance_to_center
  } = hotel;

  // Render stars based on rating out of 10
  const renderStars = (score) => {
    const starsCount = Math.round((score || 8.0) / 2);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < starsCount ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
        }`}
      />
    ));
  };

  return (
    <div className="flex-none w-[280px] sm:w-[320px] rounded-2xl bg-white border border-gray-150 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition duration-300">
      {/* Photo Container */}
      <div className="h-44 w-full relative overflow-hidden bg-gray-100">
        <img
          src={main_photo_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {/* Review Badge */}
        {review_score && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
            <span>⭐</span>
            <span>{review_score}</span>
            <span className="text-gray-400 font-normal">/10</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Rating Stars */}
          <div className="flex items-center gap-1">
            <div className="flex">{renderStars(review_score)}</div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase ml-1">
              {review_score_word || 'Good'}
            </span>
          </div>

          {/* Hotel Name */}
          <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">
            {name}
          </h4>

          {/* Distance / Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="line-clamp-1">{distance_to_center ? `${distance_to_center} from center` : address}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase">Total Price</div>
            <div className="text-base font-extrabold text-emerald-600">
              ₹{min_total_price ? min_total_price.toLocaleString('en-IN') : 'N/A'}
            </div>
          </div>

          <a
            href={url || 'https://www.booking.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow transition"
          >
            Book Now
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
