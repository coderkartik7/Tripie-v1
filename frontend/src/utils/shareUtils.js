/**
 * Unicode-safe base64 encode for JSON trip payloads.
 */
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(base64) {
  return decodeURIComponent(escape(atob(base64)));
}

/**
 * Encode trip data: JSON.stringify → base64.
 * @param {object} itineraryData - Itinerary object or { itinerary, tripRequest }
 * @returns {string} Base64-encoded payload
 */
export function encodeTrip(itineraryData) {
  return toBase64(JSON.stringify(itineraryData));
}

/**
 * Decode ?trip= URL param: base64 → JSON.parse.
 * @param {string} urlParam - Raw or URI-encoded base64 string from URL
 * @returns {object} Parsed itinerary or { itinerary, tripRequest }
 */
export function decodeTrip(urlParam) {
  if (!urlParam) return null;

  let decoded = urlParam;
  try {
    decoded = decodeURIComponent(urlParam);
  } catch {
    decoded = urlParam;
  }

  return JSON.parse(fromBase64(decoded));
}

/**
 * Build a full shareable /result URL with ?trip= param.
 */
export function buildShareUrl(itineraryData) {
  const encoded = encodeURIComponent(encodeTrip(itineraryData));
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/result?trip=${encoded}`;
}

/**
 * Normalize decoded payload into store-ready shape.
 */
export function parseSharedTripPayload(decoded) {
  if (!decoded) return null;

  if (decoded.itinerary && typeof decoded.itinerary === 'object') {
    return {
      itinerary: decoded.itinerary,
      tripRequest: decoded.tripRequest || null,
    };
  }

  if (Array.isArray(decoded.days)) {
    return { itinerary: decoded, tripRequest: null };
  }

  return null;
}
