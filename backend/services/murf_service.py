class MurfService:
    def __init__(self):
        # Placeholder for Murf API key
        pass

    async def generate_voice(self, text: str):
        return {"audio_url": "http://scaffolded-audio-url.com/stream.mp3", "text": text}

murf_service = MurfService()
