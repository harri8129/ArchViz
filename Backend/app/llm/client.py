import httpx
import json
from app.core.config import get_groq_key
import re
from app.core.cache import (
    get_cached_response,
    set_cached_response,
)
from app.core.cost_monitor import cost_monitor

GROQ_API_KEY = get_groq_key()
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-safeguard-20b"

SYSTEM_PROMPT = """
You are a senior system architect.
Return ONLY valid JSON.
Do not include markdown or explanations.
"""

def extract_json(text: str) -> dict:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in LLM response")
    return json.loads(match.group())


async def call_llm(system_name: str) -> dict:
    prompt = f"""
Decompose the system "{system_name}" into a high-level architecture.

Rules:
- 6–10 components
- Architecture-level only
- Use the agreed JSON schema
"""

    # Check cache FIRST
    cached = get_cached_response(prompt)
    if cached:
        print("⚡ LLM CACHE HIT")
        return cached

    print("🔥 LLM CACHE MISS")
    
    # Check budget before making expensive call
    if not cost_monitor.check_budget_limit():
        raise RuntimeError("Budget limit exceeded. Please contact administrator.")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0
    }

    # Call Groq
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(GROQ_URL, json=payload, headers=headers)
        response.raise_for_status()

    content = response.json()["choices"][0]["message"]["content"]
    parsed = extract_json(content)
    
    # Record cost
    cost_monitor.record_call(system_name)
    
    # Cache valid response
    set_cached_response(prompt, parsed)
    
    return parsed
