import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, setActiveId, fetchConversations, fetchMessages, deleteConversation } from './store';
import { useChatStream } from './useChatStream';
import { v4 as uuidv4 } from 'uuid';
import { parseSources } from './utils/citationUtils';
import { Sidebar } from './components/Sidebar/Sidebar';
import { EmptyState } from './components/Chat/EmptyState';
import { UserMessage } from './components/Chat/UserMessage';
import { AssistantMessage } from './components/Chat/AssistantMessage';
import { StreamingMessage } from './components/Chat/StreamingMessage';
import { ChatInput } from './components/Input/ChatInput';

const ChatInterface: React.FC = () => {
    const dispatch = useDispatch<any>();
    const activeId = useSelector((state: RootState) => state.chat.activeId);
    const conversations = useSelector((state: RootState) => state.chat.conversations);
    const conversationList = useSelector((state: RootState) => state.chat.conversationList);
    const [input, setInput] = useState('');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize conversation and fetch history
    useEffect(() => {
        dispatch(fetchConversations());
        if (!activeId) {
            dispatch(setActiveId(uuidv4()));
        }
    }, [activeId, dispatch]);

    const handleConversationClick = async (id: string) => {
        await dispatch(fetchMessages(id));
        dispatch(setActiveId(id));
    };

    const handleNewChat = () => {
        dispatch(setActiveId(uuidv4()));
        setInput('');
    };

    const handleDelete = (id: string) => {
        dispatch(deleteConversation(id));
        setActiveMenuId(null);
        if (activeId === id) {
            dispatch(setActiveId(uuidv4()));
        }
    };

    const { streamingContent, isStreaming, sendMessage } = useChatStream(activeId || '');
    const messages = activeId ? conversations[activeId] || [] : [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    const handleSubmit = async () => {
        if (!input.trim() || isStreaming) return;

        const query = input;
        setInput('');

        await sendMessage(query, () => {
            if (activeId) {
                dispatch(fetchMessages(activeId));
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Auto-refresh conversation list when a new conversation is created
    useEffect(() => {
        if (!isStreaming && activeId && !conversationList.find(c => c.id === activeId) && messages.length > 0) {
            dispatch(fetchConversations());
        }
    }, [isStreaming, activeId, conversationList, messages.length, dispatch]);

    return (
        <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
            <Sidebar
                conversations={conversationList}
                activeId={activeId}
                isHistoryOpen={isHistoryOpen}
                activeMenuId={activeMenuId}
                onNewChat={handleNewChat}
                onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
                onConversationClick={handleConversationClick}
                onMenuToggle={setActiveMenuId}
                onDelete={handleDelete}
            />

            <div className="flex-1 flex flex-col relative min-w-0 min-h-0 bg-zinc-950">
                <div className="flex-1 overflow-y-auto scroll-smooth min-h-0">
                    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 pb-64 md:pb-72 space-y-10 md:space-y-12">
                        {messages.length === 0 && !isStreaming && <EmptyState />}

                        {messages.map((msg, idx) => {
                            if (msg.role === 'user') {
                                return <UserMessage key={idx} content={msg.content} />;
                            } else {
                                const userMsg = messages[idx - 1];
                                const sources = userMsg ? parseSources(userMsg.content) : [];
                                return (
                                    <AssistantMessage
                                        key={idx}
                                        content={msg.content}
                                        sources={sources}
                                    />
                                );
                            }
                        })}

                        {isStreaming && (
                            <StreamingMessage
                                content={streamingContent}
                                lastUserMessage={messages.length > 0 ? messages[messages.length - 1].content : undefined}
                            />
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <ChatInput
                    input={input}
                    isStreaming={isStreaming}
                    onInputChange={setInput}
                    onSubmit={handleSubmit}
                    onKeyDown={handleKeyDown}
                />
            </div>
        </div>
    );
};

export default ChatInterface;
