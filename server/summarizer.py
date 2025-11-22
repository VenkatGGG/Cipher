import asyncio
from llm_client import stream_chat_response
from database import conversations_collection

async def summarize_conversation(conversation_id: str, messages: list):
    """
    Summarizes the provided messages and stores the summary in the database.
    This is intended to be run as a background task.
    """
    print(f"Starting background summarization for {conversation_id}...")
    
    # Construct the prompt
    conversation_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
    prompt = f"""Summarize the following conversation concisely, capturing key facts, user preferences, and the current topic. 
    Do not lose important technical details.
    
    Conversation:
    {conversation_text}
    
    Summary:"""
    
    messages_payload = [{"role": "user", "content": prompt}]
    
    summary = ""
    try:
        async for chunk in stream_chat_response(messages_payload):
            if not chunk.startswith("Error:"):
                summary += chunk
        
        if summary:
            print(f"Generated summary for {conversation_id}: {summary[:50]}...")
            
            # Store summary (for now, we'll just append it to a 'summaries' collection or update a metadata field)
            # Let's create a new collection for summaries in database.py if we want, 
            # or just insert a special 'system' message with the summary.
            # For simplicity in this MVP, we'll insert a 'summary' type message.
            
            await conversations_collection.insert_one({
                "conversation_id": conversation_id,
                "role": "system",
                "type": "summary",
                "content": summary,
                "timestamp": messages[-1]["timestamp"] + 0.1 # Slightly after the last message
            })
            
            print(f"Summary stored for {conversation_id}")
            
    except Exception as e:
        print(f"Error during summarization: {e}")
