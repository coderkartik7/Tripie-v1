import os
import httpx
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)

CITY_TO_IATA = {
    "delhi": "DEL",
    "new delhi": "DEL",
    "mumbai": "BOM",
    "bombay": "BOM",
    "goa": "GOI",
    "bangalore": "BLR",
    "bengaluru": "BLR",
    "chennai": "MAA",
    "kolkata": "CCU",
    "hyderabad": "HYD",
    "jaipur": "JAI",
    "pune": "PNQ",
    "ahmedabad": "AMD",
}

AVIATIONSTACK_BASE_URL = "http://api.aviationstack.com/v1/flights"


class FlightService:
    def __init__(self):
        pass

    def _resolve_iata(self, city: str) -> str:
        key = city.strip().lower()
        if key in CITY_TO_IATA:
            return CITY_TO_IATA[key]

        for name, code in CITY_TO_IATA.items():
            if name in key or key in name:
                return code

        return city.strip()[:3].upper()

    def _google_flights_url(self, origin: str, destination: str, date: str) -> str:
        query = f"flights from {origin} to {destination} on {date}"
        return f"https://www.google.com/travel/flights/search?q={quote_plus(query)}"

    def _format_time(self, timestamp: Optional[str]) -> str:
        if not timestamp:
            return "N/A"
        try:
            dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            return dt.strftime("%I:%M %p").lstrip("0")
        except Exception:
            return timestamp

    def _parse_timestamp(self, timestamp: Optional[str]) -> Optional[datetime]:
        if not timestamp:
            return None
        try:
            return datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        except Exception:
            return None

    def _calculate_duration(self, dep_scheduled: Optional[str], arr_scheduled: Optional[str]) -> str:
        dep = self._parse_timestamp(dep_scheduled)
        arr = self._parse_timestamp(arr_scheduled)
        if not dep or not arr:
            return "N/A"

        if arr < dep:
            arr += timedelta(days=1)

        total_minutes = int((arr - dep).total_seconds() // 60)
        hours, minutes = divmod(total_minutes, 60)
        return f"{hours}h {minutes}m"

    def _parse_flight(
        self,
        item: Dict[str, Any],
        origin_city: str,
        destination_city: str,
        date: str,
    ) -> Optional[Dict[str, Any]]:
        airline = item.get("airline") or {}
        flight = item.get("flight") or {}
        departure = item.get("departure") or {}
        arrival = item.get("arrival") or {}

        dep_scheduled = departure.get("scheduled")
        arr_scheduled = arrival.get("scheduled")

        if not dep_scheduled:
            return None

        origin_iata = departure.get("iata") or self._resolve_iata(origin_city)
        dest_iata = arrival.get("iata") or self._resolve_iata(destination_city)

        return {
            "airline_name": airline.get("name") or "Unknown Airline",
            "flight_number": flight.get("iata") or flight.get("number") or "N/A",
            "departure_time": self._format_time(dep_scheduled),
            "arrival_time": self._format_time(arr_scheduled),
            "departure_airport": departure.get("airport") or origin_city,
            "arrival_airport": arrival.get("airport") or destination_city,
            "departure_iata": origin_iata,
            "arrival_iata": dest_iata,
            "flight_status": (item.get("flight_status") or "scheduled").lower(),
            "duration": self._calculate_duration(dep_scheduled, arr_scheduled),
            "price_label": "Check airline website",
            "booking_url": self._google_flights_url(origin_city, destination_city, date),
            "departure_sort": dep_scheduled,
        }

    def _sort_key(self, flight: Dict[str, Any]):
        parsed = self._parse_timestamp(flight.get("departure_sort"))
        return parsed or datetime.max

    async def search_flights(
        self,
        origin_city: str,
        destination_city: str,
        date: str,
        adults: int = 1,
    ) -> List[Dict[str, Any]]:
        api_key = os.getenv("AVIATIONSTACK_API_KEY")

        if not api_key or "your_" in api_key.lower() or len(api_key) < 8:
            logger.info("Aviationstack API key not set. Falling back to mock flights.")
            return self._get_mock_flights(origin_city, destination_city, date, adults)

        dep_iata = self._resolve_iata(origin_city)
        arr_iata = self._resolve_iata(destination_city)

        params = {
            "access_key": api_key,
            "dep_iata": dep_iata,
            "arr_iata": arr_iata,
            "flight_date": date,
        }

        try:
            async with httpx.AsyncClient() as client:
                logger.info(
                    "Querying Aviationstack: %s -> %s on %s (%s -> %s)",
                    origin_city,
                    destination_city,
                    date,
                    dep_iata,
                    arr_iata,
                )
                response = await client.get(
                    AVIATIONSTACK_BASE_URL,
                    params=params,
                    timeout=15.0,
                )

                if response.status_code != 200:
                    logger.warning(
                        "Aviationstack returned status %s. Falling back to mock.",
                        response.status_code,
                    )
                    return self._get_mock_flights(origin_city, destination_city, date, adults)

                payload = response.json()
                if payload.get("error"):
                    logger.warning(
                        "Aviationstack error: %s. Falling back to mock.",
                        payload["error"],
                    )
                    return self._get_mock_flights(origin_city, destination_city, date, adults)

                raw_flights = payload.get("data") or []
                parsed = []

                for item in raw_flights:
                    flight = self._parse_flight(item, origin_city, destination_city, date)
                    if flight:
                        parsed.append(flight)

                if not parsed:
                    logger.warning("No flights parsed from Aviationstack. Falling back to mock.")
                    return self._get_mock_flights(origin_city, destination_city, date, adults)

                parsed.sort(key=self._sort_key)
                top_flights = parsed[:5]

                for flight in top_flights:
                    flight.pop("departure_sort", None)

                return top_flights

        except Exception as ex:
            logger.error("Error calling Aviationstack: %s. Falling back to mock.", ex)
            return self._get_mock_flights(origin_city, destination_city, date, adults)

    def _get_mock_flights(
        self,
        origin: str,
        destination: str,
        date: str,
        adults: int,
    ) -> List[Dict[str, Any]]:
        origin_iata = self._resolve_iata(origin)
        dest_iata = self._resolve_iata(destination)
        booking_url = self._google_flights_url(origin, destination, date)

        return [
            {
                "airline_name": "IndiGo",
                "flight_number": "6E2104",
                "departure_time": "6:15 AM",
                "arrival_time": "9:30 AM",
                "departure_airport": f"{origin} Airport",
                "arrival_airport": f"{destination} Airport",
                "departure_iata": origin_iata,
                "arrival_iata": dest_iata,
                "flight_status": "scheduled",
                "duration": "3h 15m",
                "price_label": "Check airline website",
                "booking_url": booking_url,
            },
            {
                "airline_name": "Air India",
                "flight_number": "AI803",
                "departure_time": "10:30 AM",
                "arrival_time": "1:45 PM",
                "departure_airport": f"{origin} Airport",
                "arrival_airport": f"{destination} Airport",
                "departure_iata": origin_iata,
                "arrival_iata": dest_iata,
                "flight_status": "scheduled",
                "duration": "3h 15m",
                "price_label": "Check airline website",
                "booking_url": booking_url,
            },
            {
                "airline_name": "Akasa Air",
                "flight_number": "QP1102",
                "departure_time": "2:15 PM",
                "arrival_time": "5:30 PM",
                "departure_airport": f"{origin} Airport",
                "arrival_airport": f"{destination} Airport",
                "departure_iata": origin_iata,
                "arrival_iata": dest_iata,
                "flight_status": "scheduled",
                "duration": "3h 15m",
                "price_label": "Check airline website",
                "booking_url": booking_url,
            },
            {
                "airline_name": "Vistara",
                "flight_number": "UK985",
                "departure_time": "5:50 PM",
                "arrival_time": "9:05 PM",
                "departure_airport": f"{origin} Airport",
                "arrival_airport": f"{destination} Airport",
                "departure_iata": origin_iata,
                "arrival_iata": dest_iata,
                "flight_status": "active",
                "duration": "3h 15m",
                "price_label": "Check airline website",
                "booking_url": booking_url,
            },
            {
                "airline_name": "SpiceJet",
                "flight_number": "SG192",
                "departure_time": "9:00 PM",
                "arrival_time": "12:15 AM",
                "departure_airport": f"{origin} Airport",
                "arrival_airport": f"{destination} Airport",
                "departure_iata": origin_iata,
                "arrival_iata": dest_iata,
                "flight_status": "cancelled",
                "duration": "3h 15m",
                "price_label": "Check airline website",
                "booking_url": booking_url,
            },
        ]


flight_service = FlightService()
