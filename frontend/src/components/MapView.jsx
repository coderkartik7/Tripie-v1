import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTripStore } from '../store/tripStore';
import { Map as MapIcon } from 'lucide-react';
import {
  DEFAULT_ITINERARY,
  buildDayPolylines,
  extractMapActivities,
  formatMapCost,
  getDayColor,
  getMapCenter,
  getUniqueDays,
  isActivityDimmed,
  isDayDimmed,
} from '../utils/mapActivities';

const MAPBOX_TOKEN = import.meta.env.MAPBOX_ACCESS_TOKEN || '';
const MARKER_DROP_DELAY_MS = 220;

const MapboxMapView = lazy(() => import('./MapboxMapView'));

function buildMarkerHtml({ markerNumber, color, dimmed, animate }) {
  const opacity = dimmed ? 0.22 : 1;
  const scale = dimmed ? 0.82 : 1;
  const animClass = animate ? 'map-marker-drop-in' : '';

  return `<div class="${animClass}" style="width:30px;height:30px;border-radius:50%;background:${color};color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);opacity:${opacity};transform:scale(${scale});transition:opacity 0.25s ease,transform 0.25s ease;">${markerNumber}</div>`;
}

function createLeafletIcon(activity, dimmed, animate) {
  return L.divIcon({
    html: buildMarkerHtml({
      markerNumber: activity.markerNumber,
      color: activity.color,
      dimmed,
      animate,
    }),
    className: 'leaflet-numbered-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32],
  });
}

function MapCenterController({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], 13, { animate: true });
  }, [map, center.lat, center.lng]);

  return null;
}

function ActivityPopupContent({ activity }) {
  return (
    <div className="text-sm leading-snug min-w-[140px]">
      <p className="font-bold text-gray-900">{activity.name}</p>
      {activity.time && <p className="text-gray-500 mt-0.5">{activity.time}</p>}
      <p className="text-emerald-600 font-semibold mt-1">{formatMapCost(activity.estimated_cost)}</p>
    </div>
  );
}

function LeafletMapView({ activities, polylines, center, selectedDay, visibleCount }) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full z-0"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenterController center={center} />

      {polylines.map((route) => {
        const dimmed = isDayDimmed(route.day, selectedDay);
        return (
          <Polyline
            key={`route-${route.day}`}
            positions={route.positions}
            pathOptions={{
              color: route.color,
              weight: dimmed ? 2 : 4,
              opacity: dimmed ? 0.15 : 0.85,
              dashArray: dimmed ? '6 8' : undefined,
            }}
          />
        );
      })}

      {activities.map((activity) => {
        if (activity.globalIndex >= visibleCount) return null;

        const dimmed = isActivityDimmed(activity, selectedDay);
        const justRevealed = activity.globalIndex === visibleCount - 1;

        return (
          <Marker
            key={activity.id}
            position={[activity.lat, activity.lng]}
            icon={createLeafletIcon(activity, dimmed, justRevealed)}
            zIndexOffset={dimmed ? 0 : 1000 + activity.globalIndex}
          >
            <Popup>
              <ActivityPopupContent activity={activity} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default function MapView() {
  const { itinerary } = useTripStore();
  const [selectedDay, setSelectedDay] = useState(null);
  const [visibleCount, setVisibleCount] = useState(0);

  const activeItinerary = itinerary || DEFAULT_ITINERARY;

  const activities = useMemo(
    () => extractMapActivities(activeItinerary),
    [activeItinerary]
  );

  const polylines = useMemo(() => buildDayPolylines(activities), [activities]);
  const center = useMemo(() => getMapCenter(activities), [activities]);
  const days = useMemo(() => getUniqueDays(activities), [activities]);

  const useMapbox = Boolean(MAPBOX_TOKEN);

  useEffect(() => {
    setVisibleCount(0);
    if (activities.length === 0) return undefined;

    const timers = activities.map((activity) =>
      setTimeout(() => {
        setVisibleCount((prev) => Math.max(prev, activity.globalIndex + 1));
      }, activity.globalIndex * MARKER_DROP_DELAY_MS)
    );

    return () => timers.forEach(clearTimeout);
  }, [activities]);

  return (
    <div className="rounded-2xl border border-gray-150 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-gray-900">Trip Map</h3>
            <p className="text-xs text-gray-500">
              {activities.length} stops · {useMapbox ? 'Mapbox' : 'OpenStreetMap'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedDay === null
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            All days
          </button>
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                selectedDay === day
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={
                selectedDay === day
                  ? { backgroundColor: getDayColor(day) }
                  : undefined
              }
            >
              Day {day}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[400px] w-full">
        {activities.length > 0 ? (
          useMapbox ? (
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  Loading map…
                </div>
              }
            >
              <MapboxMapView
                token={MAPBOX_TOKEN}
                activities={activities}
                polylines={polylines}
                center={center}
                selectedDay={selectedDay}
                visibleCount={visibleCount}
              />
            </Suspense>
          ) : (
            <LeafletMapView
              activities={activities}
              polylines={polylines}
              center={center}
              selectedDay={selectedDay}
              visibleCount={visibleCount}
            />
          )
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            No activity coordinates available for this trip.
          </div>
        )}

        {days.length > 0 && (
          <div className="absolute bottom-3 left-3 z-[1000] rounded-xl border border-gray-200/80 bg-white/95 backdrop-blur px-3 py-2 shadow-md">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
              Days
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {days.map((day) => (
                <div key={day} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getDayColor(day) }}
                  />
                  <span className="text-xs font-medium text-gray-700">Day {day}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
