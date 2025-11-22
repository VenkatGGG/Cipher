import os
import httpx
from dotenv import load_dotenv

from pathlib import Path

# Load .env from parent directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

PARALLEL_API_KEY = os.getenv("PARALLEL_API_KEY")
PARALLEL_API_URL = "https://api.parallel.ai/v1beta/search"

async def search_parallel(query: str):
    if not PARALLEL_API_KEY:
        print("Warning: PARALLEL_API_KEY not set")
        return []

    headers = {
        "x-api-key": PARALLEL_API_KEY,
        "parallel-beta": "search-extract-2025-10-10",
        "Content-Type": "application/json"
    }
    payload = {
        "search_queries": [query],
        "max_results": 5
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(PARALLEL_API_URL, json=payload, headers=headers, timeout=10.0)
            print(f"Parallel API Status: {response.status_code}")
            print(f"Parallel API Response: {response.text[:200]}...")
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])
            print(f"Parallel API Results: {len(results)} found")
            return results
        except Exception as e:
            print(f"Error searching Parallel API: {e}")
            return []
