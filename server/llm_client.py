import os
import httpx
import json
from dotenv import load_dotenv

from pathlib import Path
from config import LLM_MODEL, LLM_MAX_TOKENS, LLM_INTERNAL_MAX_TOKENS

# Load .env from parent directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

async def stream_chat_response(messages: list):
    if not OPENROUTER_API_KEY:
        yield "Error: OPENROUTER_API_KEY not set."
        return

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", # Required by OpenRouter
        "X-Title": "Project Cipher"
    }
    payload = {
        "model": LLM_MODEL,
        "messages": messages,
        "stream": True,
        "max_tokens": LLM_MAX_TOKENS
    }

    async with httpx.AsyncClient() as client:
        try:
            print(f"Sending request to OpenRouter: {LLM_MODEL}")
            async with client.stream("POST", OPENROUTER_API_URL, json=payload, headers=headers, timeout=30.0) as response:
                print(f"OpenRouter Status: {response.status_code}")
                if response.status_code != 200:
                    error_text = await response.aread()
                    print(f"OpenRouter Error: {error_text}")
                    yield f"Error: OpenRouter returned {response.status_code}: {error_text.decode('utf-8')}"
                    return

                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            delta = data["choices"][0]["delta"]
                            content = delta.get("content", "")
                            if content:
                                print(f"Chunk: {content}", end="", flush=True)
                                yield content
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            print(f"LLM Exception: {e}")
            yield f"Error generating response: {str(e)}"

async def generate_chat_response(messages: list) -> str:
    """Non-streaming version for internal logic (e.g. query rewriting)"""
    if not OPENROUTER_API_KEY:
        return "Error: OPENROUTER_API_KEY not set."

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Project Cipher"
    }
    payload = {
        "model": LLM_MODEL,
        "messages": messages,
        "stream": False,
        "max_tokens": LLM_INTERNAL_MAX_TOKENS
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(OPENROUTER_API_URL, json=payload, headers=headers, timeout=30.0)
            if response.status_code != 200:
                return f"Error: {response.status_code}"
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"LLM Generation Exception: {e}")
            return ""
