import redis
import json
import hashlib

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True
)

def make_cache_key(prompt: str) -> str:
    digest = hashlib.sha256(prompt.encode()).hexdigest()
    return f"llm:{digest}"

def get_cached_response(prompt: str):
    key = make_cache_key(prompt)
    value = redis_client.get(key)
    if value:
        return json.loads(value)
    return None

def set_cached_response(prompt: str, response: dict, ttl: int = 86400):
    key = make_cache_key(prompt)
    redis_client.setex(key, ttl, json.dumps(response))
