import os
import httpx
import logging
from datetime import datetime
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

CITY_TO_SKYID = {
    "delhi": "DEL",
    "new delhi": "DEL",
    "mumbai": "BOM",
    "bombay": "BOM",
    "bengaluru": "BLR",
    "bangalore": "BLR",
    "hanoi": "HAN",
    "london": "LHR",
    "new york": "JFK",
    "nyc": "JFK",
    "paris": "CDG",
    "singapore": "SIN",
    "tokyo": "NRT",
    "dubai": "DXB",
    "bangkok": "BKK",
    "sydney": "SYD",
    "melbourne": "MEL",
    "goa": "GOI",
    "kolkata": "CCU",
    "chennai": "MAA",
    "hyderabad": "HYD",
    "pune": "PNQ",
    "ahmedabad": "AMD",
    "kochi": "COK",
    "jaipur": "JAI",
}

class FlightService:
    def __init__(self):
        pass

    async def _resolve_skyid(self, city: str, headers: dict, client: httpx.AsyncClient) -> tuple:
        city_clean = city.strip().lower()
        # Predefined dictionary mapping common cities to (skyId, entityId)
        common_cities = {
            "delhi": ("DEL", "95410972"),
            "new delhi": ("DEL", "95410972"),
            "mumbai": ("BOM", "95411037"),
            "bombay": ("BOM", "95411037"),
            "bengaluru": ("BLR", "95411211"),
            "bangalore": ("BLR", "95411211"),
            "hanoi": ("HAN", "95414316"),
            "london": ("LOND", "27544008"),
            "new york": ("NYCA", "27537542"),
            "nyc": ("NYCA", "27537542"),
            "paris": ("PARI", "27539733"),
            "singapore": ("SIN", "95413349"),
            "tokyo": ("TYOA", "27541223"),
            "dubai": ("DXB", "95410423"),
            "bangkok": ("BKK", "95410486"),
            "sydney": ("SYD", "95412191"),
        }
        if city_clean in common_cities:
            return common_cities[city_clean]
        
        # Call searchAirport endpoint
        url = "https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport"
        try:
            res = await client.get(url, headers=headers, params={"query": city}, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                items = data.get("data")
                if items and isinstance(items, list):
                    first_item = items[0]
                    sky_id = first_item.get("skyId")
                    entity_id = first_item.get("entityId")
                    if sky_id and entity_id:
                        return sky_id, entity_id
        except Exception as e:
            logger.warning(f"Failed to lookup airport code at {url}: {e}")
            
        # Fallback heuristic: first 3 characters and dummy entityId
        return city.strip()[:3].upper(), "0"

    async def search_flights(self, origin_city: str, destination_city: str, date: str, adults: int = 1) -> List[Dict[str, Any]]:
        api_key = os.getenv("AIR_SCRAPER_API_KEY")

        # If API key is missing or default placeholder, fallback to mock data
        if not api_key or "your_air_scraper" in api_key or len(api_key) < 10:
            logger.info("AirScraper API key not set or placeholder. Falling back to mock flights.")
            return self._get_mock_flights(origin_city, destination_city, date, adults)

        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com"
        }

        try:
            async with httpx.AsyncClient() as client:
                # 1. Resolve SkyIds and EntityIds for origin and destination
                origin_sky_id, origin_entity_id = await self._resolve_skyid(origin_city, headers, client)
                dest_sky_id, dest_entity_id = await self._resolve_skyid(destination_city, headers, client)

                logger.info(f"Resolved: {origin_city} -> ({origin_sky_id}, {origin_entity_id}), {destination_city} -> ({dest_sky_id}, {dest_entity_id})")

                # 2. Query Sky Scrapper Flights search
                url_v2 = "https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlights"
                params = {
                    "originSkyId": origin_sky_id,
                    "destinationSkyId": dest_sky_id,
                    "originEntityId": origin_entity_id,
                    "destinationEntityId": dest_entity_id,
                    "date": date,
                    "adults": int(adults),
                    "currency": "INR",
                    "market": "en-IN",
                    "countryCode": "IN",
                    "sortBy": "best"
                }

                logger.info(f"Querying Sky Scrapper Flights: {url_v2} with params {params}")
                res = await client.get(url_v2, headers=headers, params=params, timeout=15.0)
                
                # Fallback to v1 if v2 fails
                if res.status_code != 200:
                    url_v1 = "https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights"
                    logger.info(f"V2 search failed ({res.status_code}). Trying V1 endpoint: {url_v1}")
                    res = await client.get(url_v1, headers=headers, params=params, timeout=15.0)

                if res.status_code != 200:
                    logger.warning(f"Sky Scrapper flights search returned status {res.status_code}. Falling back to mock.")
                    return self._get_mock_flights(origin_city, destination_city, date, adults)

                response_data = res.json()
                print(f"RAW SKY-SCRAPPER RESPONSE TYPE: {type(response_data)}")
                if isinstance(response_data, dict):
                    print(f"RAW RESPONSE KEYS: {list(response_data.keys())}")
                    data_field = response_data.get("data")
                    if isinstance(data_field, dict):
                        print(f"RAW DATA KEYS: {list(data_field.keys())}")
                        itineraries = data_field.get("itineraries")
                        if isinstance(itineraries, list) and len(itineraries) > 0:
                            print(f"FIRST ITINERARY SAMPLE: {str(itineraries[0])[:1000]}")
                        else:
                            print(f"ITINERARIES IS NOT A LIST OR EMPTY: {type(itineraries)}")
                    else:
                        print(f"DATA IS NOT A DICT: {type(data_field)}")
                
                parsed_flights = self._parse_flights(response_data, origin_city, destination_city)
                
                if not parsed_flights:
                    logger.warning("No flights parsed from response. Falling back to mock flights.")
                    return self._get_mock_flights(origin_city, destination_city, date, adults)

                return parsed_flights[:5]

        except Exception as ex:
            logger.error(f"Error calling Sky Scrapper RapidAPI: {str(ex)}. Falling back to mock flights.")
            return self._get_mock_flights(origin_city, destination_city, date, adults)

    def _parse_flights(self, response_data: Any, origin: str, destination: str) -> List[Dict[str, Any]]:
        parsed = []
        
        if isinstance(response_data, list):
            items = response_data
        elif isinstance(response_data, dict):
            data_field = response_data.get("data", {})
            if isinstance(data_field, list):
                items = data_field
            elif isinstance(data_field, dict):
                items = data_field.get("itineraries", [])
            else:
                items = response_data.get("itineraries", [])
        else:
            items = []

        for item in items:
            try:
                # 1. Price extraction
                price_val = None
                if "price" in item:
                    p = item["price"]
                    if isinstance(p, dict):
                        price_val = p.get("raw") or p.get("value")
                    else:
                        price_val = p
                elif "price_in_inr" in item:
                    price_val = item["price_in_inr"]
                
                if price_val is None:
                    continue
                    
                try:
                    price_val = float(price_val)
                except Exception:
                    price_val = 0.0

                # 2. Details extraction
                airline = "Unknown Airline"
                flight_num = "N/A"
                dep_time = "N/A"
                arr_time = "N/A"
                duration_str = "N/A"
                logo_url = None
                
                # Check for legs structure
                if "legs" in item and isinstance(item["legs"], list) and len(item["legs"]) > 0:
                    leg = item["legs"][0]
                    dep_time = leg.get("departure", dep_time)
                    arr_time = leg.get("arrival", arr_time)
                    
                    if "durationInMinutes" in leg:
                        mins = int(leg["durationInMinutes"])
                        duration_str = f"{mins // 60}h {mins % 60}m"
                    elif "duration" in leg:
                        duration_str = str(leg["duration"])
                        
                    carriers = leg.get("carriers", {})
                    marketing_carriers = carriers.get("marketing", [])
                    if marketing_carriers and len(marketing_carriers) > 0:
                        carrier = marketing_carriers[0]
                        airline = carrier.get("name", airline)
                        logo_url = carrier.get("logoUrl")
                        
                    segments = leg.get("segments", [])
                    if segments and len(segments) > 0:
                        seg = segments[0]
                        fn = seg.get("flightNumber")
                        carrier_code = seg.get("marketingCarrier", {}).get("alternateId", "")
                        if fn and carrier_code:
                            flight_num = f"{carrier_code} {fn}"
                        elif fn:
                            flight_num = str(fn)
                else:
                    # Flat structure fallback
                    airline = item.get("airline_name") or item.get("airline") or airline
                    flight_num = item.get("flight_number") or flight_num
                    dep_time = item.get("departure_time") or item.get("departure") or dep_time
                    arr_time = item.get("arrival_time") or item.get("arrival") or arr_time
                    duration_str = item.get("duration") or duration_str
                    logo_url = item.get("logo_url")
                    
                booking_url = item.get("booking_url") or item.get("deeplink") or item.get("url")
                if not booking_url:
                    booking_url = f"https://www.google.com/travel/flights?q=Flights+from+{origin}+to+{destination}"

                # Format timestamps to e.g. "08:00 AM"
                def format_time(t_str: str) -> str:
                    try:
                        # ISO formats
                        if "T" in t_str:
                            dt = datetime.fromisoformat(t_str.replace("Z", "+00:00"))
                            return dt.strftime("%I:%M %p")
                    except Exception:
                        pass
                    return t_str

                dep_time_clean = format_time(dep_time)
                arr_time_clean = format_time(arr_time)

                parsed.append({
                    "airline_name": airline,
                    "flight_number": flight_num,
                    "departure_time": dep_time_clean,
                    "arrival_time": arr_time_clean,
                    "duration": duration_str,
                    "price": price_val,
                    "booking_url": booking_url,
                    "logo_url": logo_url
                })
            except Exception as e:
                logger.warning(f"Error parsing flight item: {e}")
                continue
                
        # Sort by price ascending
        parsed = sorted(parsed, key=lambda x: x["price"])
        return parsed

    def _get_mock_flights(self, origin: str, destination: str, date: str, adults: int) -> List[Dict[str, Any]]:
        base_price_factor = max(1, adults)
        # Create premium realistic flight details
        return [
            {
                "airline_name": "IndiGo",
                "flight_number": "6E 2104",
                "departure_time": "06:15 AM",
                "arrival_time": "09:30 AM",
                "duration": "3h 15m",
                "price": int(4800 * base_price_factor),
                "booking_url": f"https://www.goindigo.in",
                "logo_url": "https://img.logo.dev/indigo.co.in?token=pk_mXWqUj5gS96kY7D1c8x7w"
            },
            {
                "airline_name": "Air India",
                "flight_number": "AI 803",
                "departure_time": "10:30 AM",
                "arrival_time": "01:45 PM",
                "duration": "3h 15m",
                "price": int(5200 * base_price_factor),
                "booking_url": f"https://www.airindia.com",
                "logo_url": "https://img.logo.dev/airindia.in?token=pk_mXWqUj5gS96kY7D1c8x7w"
            },
            {
                "airline_name": "Akasa Air",
                "flight_number": "QP 1102",
                "departure_time": "02:15 PM",
                "arrival_time": "05:30 PM",
                "duration": "3h 15m",
                "price": int(5500 * base_price_factor),
                "booking_url": "https://www.akasaair.com",
                "logo_url": "https://img.logo.dev/akasaair.com?token=pk_mXWqUj5gS96kY7D1c8x7w"
            },
            {
                "airline_name": "Vistara",
                "flight_number": "UK 985",
                "departure_time": "05:50 PM",
                "arrival_time": "09:05 PM",
                "duration": "3h 15m",
                "price": int(6300 * base_price_factor),
                "booking_url": "https://www.airvistara.com",
                "logo_url": "https://img.logo.dev/airvistara.com?token=pk_mXWqUj5gS96kY7D1c8x7w"
            },
            {
                "airline_name": "SpiceJet",
                "flight_number": "SG 192",
                "departure_time": "09:00 PM",
                "arrival_time": "12:15 AM",
                "duration": "3h 15m",
                "price": int(6800 * base_price_factor),
                "booking_url": "https://www.spicejet.com",
                "logo_url": "https://img.logo.dev/spicejet.com?token=pk_mXWqUj5gS96kY7D1c8x7w"
            }
        ]

flight_service = FlightService()
