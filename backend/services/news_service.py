import os
import httpx
import logging
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)


class NewsService:
    def __init__(self):
        pass

    def _get_api_key(self) -> str | None:
        return os.getenv("NEWSAPI_API_KEY") or os.getenv("NEWS_API_KEY")

    def _compute_safety_score(self, article_count: int) -> tuple[int, str]:
        if article_count == 0:
            return 9, "Safe to Travel"
        if article_count <= 2:
            return 7, "Exercise Caution"
        return 5, "Check Advisories"

    async def get_safety_news(self, destination: str):
        api_key = self._get_api_key()

        if not api_key or "your_news" in api_key.lower():
            logger.info("NewsAPI key not set or placeholder. Falling back to mock safety news.")
            return self._get_mock_safety_news(destination)

        from_date = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")
        query = f"{destination} travel safety warning advisory"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://newsapi.org/v2/everything",
                    params={
                        "q": query,
                        "sortBy": "publishedAt",
                        "from": from_date,
                        "language": "en",
                        "pageSize": 5,
                    },
                    headers={"X-Api-Key": api_key},
                    timeout=15.0,
                )

                if response.status_code != 200:
                    logger.warning(
                        f"NewsAPI returned status {response.status_code}: "
                        f"{response.text[:200]}. Falling back to mock safety news."
                    )
                    return self._get_mock_safety_news(destination)

                data = response.json()
                articles_raw = data.get("articles", [])
        except Exception as ex:
            logger.error(f"Error calling NewsAPI: {ex}. Falling back to mock safety news.")
            return self._get_mock_safety_news(destination)

        articles = []
        for item in articles_raw[:5]:
            source = item.get("source") or {}
            articles.append({
                "title": item.get("title"),
                "description": item.get("description"),
                "url": item.get("url"),
                "source_name": source.get("name"),
                "published_at": item.get("publishedAt"),
                "url_to_image": item.get("urlToImage"),
            })

        safety_score, safety_label = self._compute_safety_score(len(articles))

        return {
            "destination": destination,
            "safety_score": safety_score,
            "safety_label": safety_label,
            "articles": articles,
        }

    def _get_mock_safety_news(self, destination: str):
        articles = [
            {
                "title": f"Travel advisory update for {destination} region",
                "description": f"Official sources report stable conditions for visitors to {destination}. Standard precautions apply.",
                "url": "https://www.gov.uk/foreign-travel-advice",
                "source_name": "Travel Advisory Monitor",
                "published_at": datetime.now(timezone.utc).isoformat(),
                "url_to_image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80",
            }
        ]
        safety_score, safety_label = self._compute_safety_score(len(articles))

        return {
            "destination": destination,
            "safety_score": safety_score,
            "safety_label": safety_label,
            "articles": articles,
        }


news_service = NewsService()
