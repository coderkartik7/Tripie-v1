import os
import httpx
import logging

logger = logging.getLogger(__name__)

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
            "X-RapidAPI-Host": "booking-com.p.rapidapi.com"
        }

        try:
            async with httpx.AsyncClient() as client:
                # 1. First call: /static/cities?name={city} to get dest_id
                city_url = "https://booking-com.p.rapidapi.com/v1/static/cities"
                city_res = await client.get(city_url, headers=headers, params={"name": city})
                
                if city_res.status_code != 200:
                    logger.warning(f"Booking.com city search failed ({city_res.status_code}). Using mock hotels.")
                    return self._get_mock_hotels(city)
                
                city_data = city_res.json()
                if not city_data:
                    logger.warning("No city matched in Booking.com static search. Using mock hotels.")
                    return self._get_mock_hotels(city)
                
                # Get the dest_id of the first matched city
                dest_id = city_data[0].get("dest_id")
                if not dest_id:
                    logger.warning("No dest_id found in city search. Using mock hotels.")
                    return self._get_mock_hotels(city)

                # 2. Second call: /hotels/search
                search_url = "https://booking-com.p.rapidapi.com/v1/hotels/search"
                search_params = {
                    "dest_id": dest_id,
                    "checkin_date": checkin,
                    "checkout_date": checkout,
                    "adults_number": adults,
                    "room_number": 1,
                    "order_by": "popularity",
                    "currency": "INR",
                    "locale": "en-gb",
                    "filter_by_currency": "INR"
                }

                search_res = await client.get(search_url, headers=headers, params=search_params)
                if search_res.status_code != 200:
                    logger.warning(f"Booking.com hotel search failed ({search_res.status_code}). Using mock hotels.")
                    return self._get_mock_hotels(city)
                
                search_data = search_res.json()
                hotels_list = search_data.get("result", [])
                
                parsed_hotels = []
                for hotel in hotels_list:
                    # Extract fields
                    price_info = hotel.get("price_breakdown", {})
                    min_price = price_info.get("gross_amount", 0) if price_info else 0
                    if not min_price:
                        # Fallback price check
                        min_price = hotel.get("min_total_price", 0)

                    parsed_hotels.append({
                        "hotel_id": hotel.get("hotel_id"),
                        "name": hotel.get("hotel_name"),
                        "review_score": hotel.get("review_score", 0.0),
                        "review_score_word": hotel.get("review_score_word", "Good"),
                        "min_total_price": min_price,
                        "url": hotel.get("url"),
                        "main_photo_url": hotel.get("max_photo_url") or hotel.get("main_photo_url"),
                        "address": hotel.get("address"),
                        "distance_to_center": hotel.get("distance_to_center")
                    })

                # Sort by review_score descending and return top 5
                sorted_hotels = sorted(parsed_hotels, key=lambda x: x["review_score"] or 0.0, reverse=True)
                return sorted_hotels[:5]

        except Exception as ex:
            logger.error(f"Error calling Booking.com RapidAPI: {str(ex)}. Falling back to mock hotels.")
            return self._get_mock_hotels(city)

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
