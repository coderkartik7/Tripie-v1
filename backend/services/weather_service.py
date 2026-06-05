import os
import httpx
from datetime import datetime, timedelta
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        pass

    async def get_weather(self, city: str, travel_date: str = None):
        api_key = os.getenv("OPENWEATHERMAP_API_KEY") or os.getenv("WEATHER_API_KEY")
        
        # If API key is missing or is the default placeholder, fallback to mock data
        if not api_key or "your_weather_api" in api_key:
            logger.info("OpenWeatherMap API key not set or placeholder. Falling back to mock weather.")
            return self._get_mock_weather(city, travel_date)

        try:
            async with httpx.AsyncClient() as client:
                url = "https://api.openweathermap.org/data/2.5/forecast"
                params = {
                    "q": city,
                    "appid": api_key,
                    "units": "metric"
                }
                response = await client.get(url, params=params)
                
                # If API call returns error (e.g. 401 unauthorized, 404 city not found)
                if response.status_code != 200:
                    logger.warning(f"OpenWeatherMap API returned status {response.status_code}. Falling back to mock weather.")
                    return self._get_mock_weather(city, travel_date)
                
                data = response.json()
        except Exception as ex:
            logger.error(f"Error calling OpenWeatherMap API: {str(ex)}. Falling back to mock weather.")
            return self._get_mock_weather(city, travel_date)

        # Group 3-hour forecasts by date (YYYY-MM-DD)
        daily_forecasts = defaultdict(list)
        for item in data.get("list", []):
            dt_txt = item.get("dt_txt")
            if dt_txt:
                date_str = dt_txt.split(" ")[0]
                daily_forecasts[date_str].append(item)

        result = []
        for date_str, items in sorted(daily_forecasts.items()):
            # Extract temperatures
            temp_mins = [x["main"]["temp_min"] for x in items if "main" in x and "temp_min" in x["main"]]
            temp_maxs = [x["main"]["temp_max"] for x in items if "main" in x and "temp_max" in x["main"]]
            
            t_min = min(temp_mins) if temp_mins else 20.0
            t_max = max(temp_maxs) if temp_maxs else 30.0

            # Select a representative weather item (preferably around 12:00:00 noon local/GMT time)
            rep_item = items[0]
            for x in items:
                if "12:00:00" in x.get("dt_txt", ""):
                    rep_item = x
                    break

            weather_list = rep_item.get("weather", [{}])
            weather_info = weather_list[0] if weather_list else {}
            condition = weather_info.get("main", "Clear")
            icon_code = weather_info.get("icon", "01d")
            icon_url = f"https://openweathermap.org/img/wn/{icon_code}@2d.png"

            # Max probability of precipitation for the day
            pops = [x.get("pop", 0.0) for x in items]
            rain_chance = int(max(pops) * 100) if pops else 0

            result.append({
                "date": date_str,
                "temp_min": round(t_min, 1),
                "temp_max": round(t_max, 1),
                "condition": condition,
                "icon_url": icon_url,
                "rain_chance": rain_chance
            })

        # If we have a specific travel date filter, try to align or start list from there
        if travel_date:
            try:
                # Find index of travel date
                matched_forecasts = [res for res in result if res["date"] >= travel_date]
                if matched_forecasts:
                    return matched_forecasts
            except Exception:
                pass

        return result

    def _get_mock_weather(self, city: str, travel_date: str = None):
        start_date = datetime.today()
        if travel_date:
            try:
                start_date = datetime.strptime(travel_date.strip(), "%Y-%m-%d")
            except Exception:
                pass

        conditions = ["Clear", "Clouds", "Rain", "Clouds", "Clear", "Clear", "Clouds"]
        icons = ["01d", "03d", "10d", "04d", "02d", "01d", "03d"]
        temp_ranges = [(24.0, 32.0), (22.0, 29.0), (18.0, 24.0), (21.0, 28.0), (23.0, 31.0), (25.0, 33.0), (22.0, 30.0)]
        rain_chances = [5, 30, 85, 50, 10, 5, 20]

        result = []
        for i in range(7):
            cur_date = start_date + timedelta(days=i)
            date_str = cur_date.strftime("%Y-%m-%d")
            result.append({
                "date": date_str,
                "temp_min": temp_ranges[i][0],
                "temp_max": temp_ranges[i][1],
                "condition": conditions[i],
                "icon_url": f"https://openweathermap.org/img/wn/{icons[i]}@2d.png",
                "rain_chance": rain_chances[i]
            })
        return result

weather_service = WeatherService()
