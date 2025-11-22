from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from chat_service import chat_pipeline
import uuid

app = FastAPI(title="Project Cipher")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str
    conversation_id: str = None

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    async def generate():
        async for chunk in chat_pipeline(request.query, conversation_id):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")

@app.get("/health")
async def health():
    return {"status": "ok"}

from chat_service import get_user_conversations, get_conversation_messages
from chat_service import get_user_conversations, get_conversation_messages, delete_conversation

@app.get("/conversations")
async def list_conversations():
    return await get_user_conversations()

@app.get("/conversations/{conversation_id}")
async def read_conversation(conversation_id: str):
    return await get_conversation_messages(conversation_id)

@app.delete("/conversations/{conversation_id}")
async def remove_conversation(conversation_id: str):
    success = await delete_conversation(conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "success", "deleted_id": conversation_id}
