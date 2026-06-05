# Tripie

AI-powered travel planner that builds a day-by-day itinerary and surfaces flights, hotels, weather, safety info, maps, and budget tools in one results dashboard.

## Features

Only what is implemented today:

- **Trip planning form** — Origin, destination, dates, budget (INR), travelers, and trip type (leisure, adventure, culture, business).
- **AI itinerary** — Google Gemini generates a structured plan: trip summary, daily activities (time, description, location, coordinates, estimated cost, type), packing list, and local tips.
- **Weather** — Per-day forecast on the itinerary (OpenWeatherMap).
- **Hotels** — Recommended stays with ratings, photos, and booking links (Booking.com via RapidAPI).
- **Flights** — Available flights with airline, route, times, duration, and status (Aviationstack). Prices are not provided by the API — cards link to Google Flights.
- **Safety advisory** — Destination safety score and recent travel-related news (NewsAPI).
- **Interactive map** — Activity markers by day (color-coded), polylines per day, popups, drop-in animation, and day filter. Uses **Leaflet + OpenStreetMap** by default, or **Mapbox** when `MAPBOX_ACCESS_TOKEN` is set.
- **Budget tracker** — Donut chart (category split), per-day bar chart, editable activity costs with live totals (Zustand + localStorage).
- **Packing list** — Grouped checklist from the itinerary, custom items, pack/unpack, copy unchecked items, localStorage persistence.
- **Share trip** — Encodes the itinerary into a `?trip=` URL; opening the link loads the plan on the Result page without replanning.
- **Export PDF** — Downloads a formatted itinerary PDF (`Tripie_{destination}_{date}.pdf`).

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, Zustand, Recharts, Leaflet / react-leaflet, Mapbox (optional), jsPDF, html2canvas, Axios |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic, httpx, google-generativeai |

## Project structure

```
Tripie-v1/
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── requirements.txt
│   ├── routers/             # API routes
│   ├── services/            # Gemini, flights, hotels, weather, news
│   └── models/              # Pydantic schemas
└── frontend/
    ├── src/
    │   ├── pages/           # Home, PlanTrip, Result
    │   ├── components/      # Map, itinerary, flights, hotels, budget, packing
    │   ├── store/           # Zustand trip state
    │   ├── services/        # API client
    │   └── utils/           # Share link, PDF export, map helpers
    └── package.json
```

## Getting started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- API keys

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_key

# Optional — live data; omit to use mocks
AVIATIONSTACK_API_KEY=
BOOKING_API_KEY=
OPENWEATHERMAP_API_KEY=
NEWSAPI_API_KEY=

# Optional — Aviationstack paid plan only
# AVIATIONSTACK_USE_PAID_FILTERS=true
```

Run the API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` (optional):

```env
VITE_API_BASE_URL=http://localhost:8000

# Optional — Mapbox instead of Leaflet
MAPBOX_ACCESS_TOKEN=
```

Run the app:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) → **Start Planning** → fill the form → view results.

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/itinerary` | Generate itinerary (JSON body: trip details) |
| `GET` | `/api/weather` | Weather forecast (`city`, `days`, `travel_date`) |
| `GET` | `/api/hotels` | Hotel search (`city`, `checkin`, `checkout`, `adults`) |
| `GET` | `/api/flights` | Flights (`origin`, `destination`, `date`, `adults`) |
| `GET` | `/api/safety` | Safety advisory (`destination`) |

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `GEMINI_API_KEY` | backend | AI itinerary generation |
| `AVIATIONSTACK_API_KEY` | backend | Live flight data |
| `BOOKING_API_KEY` | backend | RapidAPI key for Booking.com hotels |
| `OPENWEATHERMAP_API_KEY` | backend | Weather forecasts |
| `NEWSAPI_API_KEY` or `NEWS_API_KEY` | backend | Safety / travel news |
| `VITE_API_BASE_URL` | frontend | Backend URL (default `http://localhost:8000`) |
| `MAPBOX_ACCESS_TOKEN` | frontend | Mapbox map (optional) |

## Scripts

**Backend**

```bash
uvicorn main:app --reload
```

**Frontend**

```bash
npm run dev      # development
npm run build    # production build
npm run preview  # preview production build
```

## Notes

- External APIs use **mock fallbacks** when keys are absent or requests fail (common on Aviationstack’s free plan).
- **Share links** encode itinerary data in the URL; very large trips may hit browser URL length limits.
- Flight **pricing** is not shown — use **View Deal** to open Google Flights.

## License

Private / educational use unless otherwise specified by the repository owner.
