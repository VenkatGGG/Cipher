import { useState, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage } from './store';

export const useChatStream = (conversationId: string) => {
    const [streamingContent, setStreamingContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const dispatch = useDispatch();
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (query: string) => {
        setIsStreaming(true);
        setStreamingContent('');
        abortControllerRef.current = new AbortController();

        // Dispatch user message immediately
        dispatch(addMessage({
            id: conversationId,
            message: { role: 'user', content: query, timestamp: Date.now() }
        }));

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, conversation_id: conversationId }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                fullContent += chunk;
                setStreamingContent(prev => prev + chunk);
            }

            // Dispatch assistant message when done
            dispatch(addMessage({
                id: conversationId,
                message: { role: 'assistant', content: fullContent, timestamp: Date.now() }
            }));

        } catch (error) {
            console.error('Streaming error:', error);
        } finally {
            setIsStreaming(false);
            setStreamingContent('');
            abortControllerRef.current = null;
        }
    }, [conversationId, dispatch]);

    return { streamingContent, isStreaming, sendMessage };
};
