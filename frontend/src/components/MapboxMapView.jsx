import React, { useEffect, useState } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { formatMapCost, isActivityDimmed, isDayDimmed } from '../utils/mapActivities';

const MAPBOX_STYLE = 'mapbox://styles/mapbox/navigation-night-v1';

function ActivityPopupContent({ activity }) {
  return (
    <div className="text-sm leading-snug min-w-[140px]">
      <p className="font-bold text-gray-900">{activity.name}</p>
      {activity.time && <p className="text-gray-500 mt-0.5">{activity.time}</p>}
      <p className="text-emerald-600 font-semibold mt-1">{formatMapCost(activity.estimated_cost)}</p>
    </div>
  );
}

function MarkerPin({ activity, dimmed, animate }) {
  return (
    <div
      className={animate ? 'map-marker-drop-in' : ''}
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: activity.color,
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2.5px solid #fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
        opacity: dimmed ? 0.22 : 1,
        transform: dimmed ? 'scale(0.82)' : 'scale(1)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        cursor: 'pointer',
      }}
    >
      {activity.markerNumber}
    </div>
  );
}

export default function MapboxMapView({
  token,
  activities,
  polylines,
  center,
  selectedDay,
  visibleCount,
}) {
  const [popupActivity, setPopupActivity] = useState(null);

  useEffect(() => {
    setPopupActivity(null);
  }, [selectedDay, visibleCount]);

  return (
    <Map
      mapboxAccessToken={token}
      initialViewState={{
        longitude: center.lng,
        latitude: center.lat,
        zoom: 13,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAPBOX_STYLE}
      attributionControl
    >
      {polylines.map((route) => {
        const dimmed = isDayDimmed(route.day, selectedDay);
        if (route.coordinates.length < 2) return null;

        return (
          <Source
            key={`route-${route.day}`}
            id={`route-day-${route.day}`}
            type="geojson"
            data={{
              type: 'Feature',
              properties: { day: route.day },
              geometry: {
                type: 'LineString',
                coordinates: route.coordinates,
              },
            }}
          >
            <Layer
              id={`route-day-${route.day}-line`}
              type="line"
              paint={{
                'line-color': route.color,
                'line-width': dimmed ? 2 : 4,
                'line-opacity': dimmed ? 0.15 : 0.9,
              }}
              layout={{
                'line-cap': 'round',
                'line-join': 'round',
              }}
            />
          </Source>
        );
      })}

      {activities.map((activity) => {
        if (activity.globalIndex >= visibleCount) return null;

        const dimmed = isActivityDimmed(activity, selectedDay);
        const justRevealed = activity.globalIndex === visibleCount - 1;

        return (
          <Marker
            key={activity.id}
            longitude={activity.lng}
            latitude={activity.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupActivity(activity);
            }}
          >
            <MarkerPin activity={activity} dimmed={dimmed} animate={justRevealed} />
          </Marker>
        );
      })}

      {popupActivity && (
        <Popup
          longitude={popupActivity.lng}
          latitude={popupActivity.lat}
          anchor="top"
          closeOnClick
          onClose={() => setPopupActivity(null)}
        >
          <ActivityPopupContent activity={popupActivity} />
        </Popup>
      )}
    </Map>
  );
}
