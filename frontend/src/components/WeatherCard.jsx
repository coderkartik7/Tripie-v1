import React from 'react';

export default function WeatherCard({ weather }) {
  if (!weather) {
    return (
      <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  const { temp_min, temp_max, condition, icon_url, rain_chance } = weather;

  // Determine helper colors based on rain probability
  const getRainBarColor = (chance) => {
    if (chance > 70) return 'bg-blue-600';
    if (chance > 30) return 'bg-sky-400';
    return 'bg-amber-400';
  };

  return (
    <div className="p-4 border border-gray-150 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm flex items-center justify-between gap-4">
      {/* Icon and Core info */}
      <div className="flex items-center gap-3">
        {icon_url ? (
          <img 
            src={icon_url} 
            alt={condition} 
            className="w-12 h-12 object-contain filter drop-shadow-sm"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://openweathermap.org/img/wn/01d@2d.png';
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl">☀️</div>
        )}
        <div>
          <div className="text-sm font-semibold text-gray-800 capitalize">
            {condition || 'Clear'}
          </div>
          <div className="text-xs text-gray-400">Condition</div>
        </div>
      </div>

      {/* Temperature Range */}
      <div className="text-right">
        <div className="text-base font-bold text-gray-900">
          {temp_min !== undefined ? Math.round(temp_min) : '--'}°c
          <span className="text-xs text-gray-400 font-normal mx-1">to</span>
          {temp_max !== undefined ? Math.round(temp_max) : '--'}°c
        </div>
        <div className="text-xs text-gray-400">Temp Range</div>
      </div>

      {/* Rain Probability progress bar */}
      <div className="flex-1 max-w-[140px]">
        <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-1">
          <span>Rain</span>
          <span>{rain_chance || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getRainBarColor(rain_chance)}`} 
            style={{ width: `${Math.min(Math.max(rain_chance || 0, 0), 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
