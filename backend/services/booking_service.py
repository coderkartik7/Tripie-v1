class BookingService:
    def __init__(self):
        # Placeholder for Amadeus / Booking API config
        pass

    async def search_hotels(self, city: str):
        return {"hotels": [f"Scaffolded hotel in {city}"]}

    async def search_flights(self, origin: str, destination: str, date: str):
        return {"flights": [f"Scaffolded flight from {origin} to {destination} on {date}"]}

booking_service = BookingService()
