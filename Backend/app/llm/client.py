import httpx
from app.core.config import get_groq_key

GROQ_API_KEY = get_groq_key()
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-safeguard-20b"

async def call_llm(prompt: str):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(GROQ_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
