from prompts import get_system_prompt, get_contextualization_prompt

# ... (existing imports)

# ... (inside contextualize_query)
    messages = [
        {"role": "system", "content": get_contextualization_prompt()},
    ]

# ... (inside chat_pipeline)
        # 4. Construct Messages for Final Generation
        messages = [{"role": "system", "content": get_system_prompt()}]
from search_client import search_parallel
from llm_client import stream_chat_response, generate_chat_response
from fastembed import TextEmbedding
from prompts import get_system_prompt, get_contextualization_prompt
from config import EMBEDDING_MODEL, SEARCH_RESULTS_LIMIT, MAX_CONTEXT_MESSAGES, SUMMARIZATION_THRESHOLD

# Initialize embedding model (lightweight)
embedding_model = TextEmbedding(model_name=EMBEDDING_MODEL)

from summarizer import summarize_conversation

async def get_conversation_context(conversation_id: str, query: str) -> List[Dict]:
    # 1. Try Vector Search first (if query is long enough to be semantic)
    context_messages = []
    
    try:
        query_embedding = list(embedding_model.embed([query]))[0].tolist()
        
        # MongoDB Atlas Vector Search Pipeline
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": 100,
                    "limit": 5,
                    "filter": {"conversation_id": conversation_id}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "role": 1,
                    "content": 1,
                    "timestamp": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        cursor = conversations_collection.aggregate(pipeline)
        vector_results = await cursor.to_list(length=5)
        
        if vector_results:
            print(f"Vector search found {len(vector_results)} relevant messages.")
            context_messages = vector_results
            # Sort by timestamp to maintain some order if needed, or keep by relevance
            context_messages.sort(key=lambda x: x['timestamp'])
        else:
            print("Vector search returned no results (index might be missing or empty). Falling back to recent.")
            
    except Exception as e:
        print(f"Vector search failed (likely no index): {e}. Falling back to recent.")

    # 2. Fallback / Augment with Recent Messages
    # Always fetch the last few messages for immediate context continuity
    cursor = conversations_collection.find({"conversation_id": conversation_id}).sort("timestamp", -1).limit(5)
    recent_messages = await cursor.to_list(length=5)
    recent_messages.reverse()
    
    # Merge and Deduplicate
    # (Simple dedup by content/timestamp if needed, but for now just appending recent if not in vector)
    # Actually, let's just use recent if vector failed, or combine them.
    # A simple strategy: Use Recent + Vector.
    
    final_context = recent_messages
    for msg in context_messages:
        if msg not in final_context:
            final_context.insert(0, msg) # Add vector matches to the beginning (background context)

    # 3. Check token count for summarization
    total_chars = sum([len(m['content']) for m in final_context])
    if total_chars / 4 > 25000:
        # Trigger background summarization
        asyncio.create_task(summarize_conversation(conversation_id, final_context))

    return final_context

async def contextualize_query(query: str, history: List[Dict]) -> str:
    """Rewrites the user query to be standalone based on chat history."""
    if not history:
        return query
        
    # Use last 3 messages for context to avoid noise
    recent_history = history[-3:]
    
    messages = [
        {"role": "system", "content": get_contextualization_prompt()},
    ]
    
    for msg in recent_history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    messages.append({"role": "user", "content": query})
    
    print(f"Contextualizing query: '{query}' with history length {len(recent_history)}")
    new_query = await generate_chat_response(messages)
    
    # Cleanup response (remove quotes etc if model adds them)
    new_query = new_query.strip().strip('"').strip("'")
    print(f"Rewritten query: '{new_query}'")
    return new_query

async def chat_pipeline(query: str, conversation_id: str):
    try:
        # 1. Context Retrieval (Moved UP before search)
        history = await get_conversation_context(conversation_id, query)
        
        # 2. Contextualize Query
        try:
            search_query = await contextualize_query(query, history)
            if not search_query:
                print("Contextualization returned empty query, falling back to original.")
                search_query = query
        except Exception as e:
            print(f"Contextualization failed: {e}")
            search_query = query
        
        # 3. Search (using rewritten query)
        search_results = await search_parallel(search_query)
        
        # Format search results
        search_context = "\n".join([f"[{i+1}] {res.get('title', 'Untitled')} ({res.get('url', '#')}): {res.get('body', '')[:300]}..." for i, res in enumerate(search_results)])
        
        # 4. Construct Messages for Final Generation
        messages = [{"role": "system", "content": get_system_prompt()}]
        
        # Add history
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add current query with search context
        user_content = f"Search Results (for query: '{search_query}'):\n{search_context}\n\nUser Query: {query}"
        messages.append({"role": "user", "content": user_content})
        
        # 5. Stream & Persist
        full_response = ""
        async for chunk in stream_chat_response(messages):
            full_response += chunk
            yield chunk
        
        # 6. Persist to MongoDB
        timestamp = time.time()
        
        # Embed user query (original)
        query_embedding = list(embedding_model.embed([query]))[0]
        
        # Save User Message
        await conversations_collection.insert_one({
            "conversation_id": conversation_id,
            "role": "user",
            "content": user_content, # Store full content with search results for frontend parsing
            "timestamp": timestamp,
            "embedding": query_embedding.tolist()
        })
        
        # Save Assistant Message
        await conversations_collection.insert_one({
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": full_response,
            "timestamp": timestamp + 1
        })

    except Exception as e:
        print(f"Pipeline Error: {e}")
        yield f"Error processing request: {str(e)}"

async def get_user_conversations() -> List[Dict]:
    """Retrieves a list of unique conversations with metadata."""
    # Group by conversation_id and get the first message (usually user query) as title
    pipeline = [
        {"$sort": {"timestamp": 1}},
        {"$group": {
            "_id": "$conversation_id",
            "first_message": {"$first": "$content"},
            "last_updated": {"$last": "$timestamp"}
        }},
        {"$sort": {"last_updated": -1}},
        {"$project": {
            "id": "$_id",
            "title": {"$substr": ["$first_message", 0, 50]}, # Truncate for title
            "timestamp": "$last_updated",
            "_id": 0
        }}
    ]
    cursor = conversations_collection.aggregate(pipeline)
    return await cursor.to_list(length=100)

async def get_conversation_messages(conversation_id: str) -> List[Dict]:
    """Retrieves full message history for a conversation."""
    cursor = conversations_collection.find({"conversation_id": conversation_id}).sort("timestamp", 1)
    messages = await cursor.to_list(length=None)
    # Format for frontend
    return [{
        "role": msg["role"],
        "content": msg["content"],
        "timestamp": msg["timestamp"]
    } for msg in messages]

async def delete_conversation(conversation_id: str):
    result = await conversations_collection.delete_many({"conversation_id": conversation_id})
    return result.deleted_count > 0
