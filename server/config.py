"""
Configuration file for Cipher AI Research Assistant

This file contains all configurable settings for the application.
Modify these values to customize the behavior of Cipher.
"""

# ============================================
# LLM Configuration
# ============================================

# OpenRouter Model Selection
# You can change this to any model available on OpenRouter
# Popular options:
#   - "moonshotai/kimi-k2-thinking" (Default - Good balance of speed and quality)
#   - "anthropic/claude-3.5-sonnet"
#   - "openai/gpt-4-turbo"
#   - "google/gemini-pro-1.5"
#   - "meta-llama/llama-3.1-70b-instruct"
LLM_MODEL = "moonshotai/kimi-k2-thinking"

# Maximum tokens for streaming responses
LLM_MAX_TOKENS = 2500

# Maximum tokens for internal tasks (query rewriting, summarization)
LLM_INTERNAL_MAX_TOKENS = 500

# ============================================
# Embedding Model Configuration
# ============================================

# Embedding model for vector search
# This is used for semantic search in the knowledge base
EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"

# ============================================
# Search Configuration
# ============================================

# Number of search results to retrieve
SEARCH_RESULTS_LIMIT = 5

# ============================================
# Conversation Configuration
# ============================================

# Maximum number of messages to include in conversation context
MAX_CONTEXT_MESSAGES = 10

# Trigger summarization when conversation exceeds this many messages
SUMMARIZATION_THRESHOLD = 20
