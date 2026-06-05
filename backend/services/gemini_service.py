import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables
load_dotenv()

class GeminiService:
    def __init__(self):
        self._configured = False
        self.model_name = "gemini-2.5-flash"

    def _ensure_configured(self):
        if not self._configured:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key or api_key == "your_gemini_api_key_here":
                # Fallback check or logging could be added here
                pass
            genai.configure(api_key=api_key)
            self._configured = True

    async def generate_itinerary(self, destination: str, days: int, budget: float, trip_type: str, travelers: int):
        self._ensure_configured()

        prompt = (
            f"You are an expert travel planner. Generate a detailed day-wise itinerary for {destination} "
            f"for {days} days with a total budget of ₹{budget} for {travelers} travelers. Trip type: {trip_type}.\n\n"
            f"Return ONLY valid JSON in this exact structure:\n"
            f"{{\n"
            f"  \"trip_summary\": \"2 line overview\",\n"
            f"  \"total_estimated_cost\": 12000,\n"
            f"  \"days\": [\n"
            f"    {{\n"
            f"      \"day\": 1,\n"
            f"      \"title\": \"Arrival & Old Quarter\",\n"
            f"      \"activities\": [\n"
            f"        {{\n"
            f"          \"time\": \"09:00 AM\",\n"
            f"          \"name\": \"Activity name\",\n"
            f"          \"description\": \"Short description\",\n"
            f"          \"location\": \"Place name\",\n"
            f"          \"lat\": 12.345,\n"
            f"          \"lng\": 77.123,\n"
            f"          \"estimated_cost\": 500,\n"
            f"          \"type\": \"sightseeing | food | adventure | transport | accommodation\"\n"
            f"        }}\n"
            f"      ],\n"
            f"      \"day_total_cost\": 3000\n"
            f"    }}\n"
            f"  ],\n"
            f"  \"packing_list\": [\"item1\", \"item2\"],\n"
            f"  \"local_tips\": [\"tip1\", \"tip2\"]\n"
            f"}}"
        )

        model = genai.GenerativeModel(self.model_name)
        
        # Call the Gemini model using JSON response format configuration
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        try:
            return json.loads(response.text)
        except json.JSONDecodeError as e:
            # Fallback if markdown fence is returned
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            try:
                return json.loads(text.strip())
            except Exception:
                raise ValueError(f"Failed to parse Gemini response as JSON: {response.text}") from e

gemini_service = GeminiService()
