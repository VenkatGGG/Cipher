import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

from pathlib import Path

# Load .env from parent directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    # Fallback for development if not set, though it should be.
    MONGODB_URI = "mongodb://localhost:27017"

client = AsyncIOMotorClient(MONGODB_URI)
db = client.cipher_db
conversations_collection = db.conversations

# Ensure index for vector search (Atlas Vector Search)
# Note: This usually requires setting up a Search Index in Atlas UI.
# We will assume the index name is "vector_index" and the field is "embedding".
