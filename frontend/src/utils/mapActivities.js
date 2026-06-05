export const DAY_COLORS = [
  '#3b82f6', // Day 1 — blue
  '#10b981', // Day 2 — green
  '#f97316', // Day 3 — orange
  '#8b5cf6', // Day 4 — purple
  '#ec4899', // Day 5 — pink
  '#14b8a6', // Day 6 — teal
];

export const DEFAULT_ITINERARY = {
  days: [
    {
      day: 1,
      title: 'Old Quarter & Lake Rest',
      activities: [
        {
          time: '09:00 AM',
          name: 'Walking Tour of Hanoi Old Quarter',
          lat: 21.0333,
          lng: 105.85,
          estimated_cost: 1000,
        },
        {
          time: '01:00 PM',
          name: 'Lunch at Bun Cha Huong Lien',
          lat: 21.0183,
          lng: 105.8566,
          estimated_cost: 1500,
        },
        {
          time: '04:30 PM',
          name: 'Sunset Walk at Hoan Kiem Lake',
          lat: 21.0285,
          lng: 105.8523,
          estimated_cost: 2000,
        },
      ],
    },
    {
      day: 2,
      title: 'Temple of Literature & Train Street',
      activities: [
        {
          time: '09:30 AM',
          name: 'Hanoi Temple of Literature',
          lat: 21.0293,
          lng: 105.8361,
          estimated_cost: 2000,
        },
        {
          time: '03:00 PM',
          name: 'Coffee at Train Street',
          lat: 21.0287,
          lng: 105.8433,
          estimated_cost: 1000,
        },
      ],
    },
  ],
};

const FALLBACK_CENTER = { lat: 21.0285, lng: 105.8542 };

export function getDayColor(day) {
  return DAY_COLORS[(day - 1) % DAY_COLORS.length];
}

export function formatMapCost(value) {
  const amount = Number(value) || 0;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function extractMapActivities(itinerary) {
  const activities = [];
  let globalIndex = 0;

  for (const day of itinerary?.days || []) {
    for (const [orderInDay, activity] of (day.activities || []).entries()) {
      const lat = Number(activity.lat);
      const lng = Number(activity.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

      activities.push({
        id: `day-${day.day}-act-${orderInDay}`,
        day: day.day,
        orderInDay,
        markerNumber: orderInDay + 1,
        globalIndex: globalIndex++,
        name: activity.name || 'Unnamed activity',
        time: activity.time || '',
        estimated_cost: Number(activity.estimated_cost) || 0,
        lat,
        lng,
        color: getDayColor(day.day),
      });
    }
  }

  return activities;
}

export function getMapCenter(activities) {
  if (activities.length > 0) {
    return { lat: activities[0].lat, lng: activities[0].lng };
  }
  return FALLBACK_CENTER;
}

export function buildDayPolylines(activities) {
  const byDay = {};

  activities.forEach((activity) => {
    if (!byDay[activity.day]) {
      byDay[activity.day] = {
        day: activity.day,
        color: activity.color,
        positions: [],
      };
    }
    byDay[activity.day].positions.push([activity.lat, activity.lng]);
  });

  return Object.values(byDay)
    .sort((a, b) => a.day - b.day)
    .map((entry) => ({
      day: entry.day,
      color: entry.color,
      positions: entry.positions,
      coordinates: entry.positions.map(([lat, lng]) => [lng, lat]),
    }));
}

export function getUniqueDays(activities) {
  return [...new Set(activities.map((a) => a.day))].sort((a, b) => a - b);
}

export function isActivityDimmed(activity, selectedDay) {
  return selectedDay !== null && activity.day !== selectedDay;
}

export function isDayDimmed(day, selectedDay) {
  return selectedDay !== null && day !== selectedDay;
}
