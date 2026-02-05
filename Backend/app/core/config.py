from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

def get_groq_key():
    key = os.getenv("GROQ_API_KEY")
    if not key:
        raise RuntimeError("GROQ_API_KEY is not set")
    return key
