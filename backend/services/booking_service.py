import os
import httpx
import logging

logger = logging.getLogger(__name__)

RAPIDAPI_HOST = "booking-com15.p.rapidapi.com"
RAPIDAPI_BASE = f"https://{RAPIDAPI_HOST}"

class BookingService:
    def __init__(self):
        pass

    async def get_hotels(self, city: str, checkin: str, checkout: str, adults: int):
        booking_api_key = os.getenv("BOOKING_API_KEY")

        # If API key is missing or default placeholder, fallback to mock data
        if not booking_api_key or "your_booking_api" in booking_api_key:
            logger.info("Booking.com API key not set or placeholder. Falling back to mock hotels.")
            return self._get_mock_hotels(city)

        headers = {
            "X-RapidAPI-Key": booking_api_key,
            "X-RapidAPI-Host": RAPIDAPI_HOST
        }

        try:
            async with httpx.AsyncClient() as client:
                # 1. Resolve city name to dest_id via searchDestination
                dest_url = f"{RAPIDAPI_BASE}/api/v1/hotels/searchDestination"
                dest_res = await client.get(dest_url, headers=headers, params={"query": city})

                if dest_res.status_code != 200:
                    logger.warning(
                        f"Booking.com destination search failed ({dest_res.status_code}): "
                        f"{dest_res.text[:200]}. Using mock hotels."
                    )
                    return self._get_mock_hotels(city)

                dest_data = dest_res.json().get("data", [])
                if not dest_data:
                    logger.warning("No destination matched in Booking.com search. Using mock hotels.")
                    return self._get_mock_hotels(city)

                city_match = next(
                    (item for item in dest_data if item.get("search_type") == "city"),
                    dest_data[0],
                )
                dest_id = city_match.get("dest_id")
                search_type = city_match.get("search_type")
                if not dest_id or not search_type:
                    logger.warning("No dest_id/search_type found in destination search. Using mock hotels.")
                    return self._get_mock_hotels(city)

                # 2. Search hotels for the resolved destination
                search_url = f"{RAPIDAPI_BASE}/api/v1/hotels/searchHotels"
                search_params = {
                    "dest_id": dest_id,
                    "search_type": search_type,
                    "arrival_date": checkin,
                    "departure_date": checkout,
                    "adults": adults,
                    "room_qty": 1,
                    "currency_code": "INR",
                    "languagecode": "en-us",
                }

                search_res = await client.get(search_url, headers=headers, params=search_params)
                if search_res.status_code != 200:
                    logger.warning(
                        f"Booking.com hotel search failed ({search_res.status_code}): "
                        f"{search_res.text[:200]}. Using mock hotels."
                    )
                    return self._get_mock_hotels(city)

                search_data = search_res.json()
                hotels_list = search_data.get("data", {}).get("hotels", [])

                parsed_hotels = []
                for hotel in hotels_list:
                    prop = hotel.get("property", {})
                    price_info = prop.get("priceBreakdown", {}).get("grossPrice", {})
                    min_price = price_info.get("value", 0)
                    photo_urls = prop.get("photoUrls", [])
                    hotel_id = hotel.get("hotel_id") or prop.get("id")
                    country_code = prop.get("countryCode", "in")

                    parsed_hotels.append({
                        "hotel_id": hotel_id,
                        "name": prop.get("name"),
                        "review_score": prop.get("reviewScore", 0.0),
                        "review_score_word": prop.get("reviewScoreWord", "Good"),
                        "min_total_price": round(min_price) if min_price else 0,
                        "url": (
                            f"https://www.booking.com/searchresults.en-gb.html"
                            f"?ss={city}&checkin={checkin}&checkout={checkout}"
                            f"&dest_id={dest_id}&highlighted_hotels={hotel_id}"
                        ),
                        "main_photo_url": photo_urls[0] if photo_urls else None,
                        "address": city_match.get("label") or prop.get("wishlistName"),
                        "distance_to_center": self._extract_distance(hotel.get("accessibilityLabel")),
                    })

                # Sort by review_score descending and return top 5
                sorted_hotels = sorted(parsed_hotels, key=lambda x: x["review_score"] or 0.0, reverse=True)
                return sorted_hotels[:5] if sorted_hotels else self._get_mock_hotels(city)

        except Exception as ex:
            logger.error(f"Error calling Booking.com RapidAPI: {str(ex)}. Falling back to mock hotels.")
            return self._get_mock_hotels(city)

    def _extract_distance(self, accessibility_label: str | None) -> str | None:
        if not accessibility_label:
            return None
        for part in accessibility_label.split("•"):
            part = part.strip()
            if "from downtown" in part or "from centre" in part or "from center" in part:
                return part
        return None

    async def search_flights(self, origin: str, destination: str, date: str):
        return {"flights": [f"Scaffolded flight from {origin} to {destination} on {date}"]}

    def _get_mock_hotels(self, city: str):
        # Premium quality mock hotels with beautiful images
        return [
            {
                "hotel_id": 101,
                "name": f"The Grand Palace Hotel {city}",
                "review_score": 9.4,
                "review_score_word": "Wonderful",
                "min_total_price": 7500,
                "url": "https://www.booking.com",
                "main_photo_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
                "address": f"101 Luxury Avenue, Center of {city}",
                "distance_to_center": "0.3 km"
            },
            {
                "hotel_id": 102,
                "name": "Serene Boutique Resort",
                "review_score": 8.9,
                "review_score_word": "Excellent",
                "min_total_price": 5200,
                "url": "https://www.booking.com",
                "main_photo_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
                "address": f"45 Tranquility Road, {city}",
                "distance_to_center": "1.2 km"
            },
            {
                "hotel_id": 103,
                "name": "Urban Vista Suites",
                "review_score": 8.7,
                "review_score_word": "Very Good",
                "min_total_price": 4300,
                "url": "https://www.booking.com",
                "main_photo_url": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80",
                "address": f"78 Highrise Boulevard, {city}",
                "distance_to_center": "0.8 km"
            },
            {
                "hotel_id": 104,
                "name": "Riverfront Heritage Lodge",
                "review_score": 8.5,
                "review_score_word": "Very Good",
                "min_total_price": 3800,
                "url": "https://www.booking.com",
                "main_photo_url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
                "address": f"12 Waterway Walk, {city}",
                "distance_to_center": "1.5 km"
            },
            {
                "hotel_id": 105,
                "name": "EcoGreen Eco-Resort",
                "review_score": 8.2,
                "review_score_word": "Good",
                "min_total_price": 3100,
                "url": "https://www.booking.com",
                "main_photo_url": "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80",
                "address": f"9 Nature Park Way, {city}",
                "distance_to_center": "2.4 km"
            }
        ]

booking_service = BookingService()
