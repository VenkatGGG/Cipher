import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import {
    Send, Plus, MessageSquare, Search, Globe, ChevronRight,
    Menu, Home, Compass, Library, Zap, Mic, Paperclip, Layers, Sparkles,
    MoreVertical, Trash2, Command
} from 'lucide-react';
import { type RootState, setActiveId, fetchConversations, fetchMessages, deleteConversation } from './store';
import { useChatStream } from './useChatStream';
import { v4 as uuidv4 } from 'uuid';

// ... (imports remain the same)

const ChatInterface: React.FC = () => {
    const dispatch = useDispatch<any>(); // Type cast for thunks
    const activeId = useSelector((state: RootState) => state.chat.activeId);
    const conversations = useSelector((state: RootState) => state.chat.conversations);
    const conversationList = useSelector((state: RootState) => state.chat.conversationList);
    const [input, setInput] = useState('');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    const { streamingContent, isStreaming, sendMessage } = useChatStream(activeId || '');
    const messages = activeId ? conversations[activeId] || [] : [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isStreaming) return;
        const query = input;
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        await sendMessage(query);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Convert [1] style citations to clickable badges
    const processCitations = (text: string) => {
        const parts = text.split(/(\[\d+\])/g);
        return parts.map((part, idx) => {
            const match = part.match(/\[(\d+)\]/);
            if (match) {
                return (
                    <button
                        key={idx}
                        onClick={() => {
                            const sourceCard = document.querySelector(`[data-source-id="${match[1]}"]`);
                            sourceCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }}
                        className="inline-flex items-center px-1.5 py-0.5 mx-0.5 text-[10px] font-mono font-medium bg-zinc-800/80 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 rounded-md transition-all hover:scale-105 cursor-pointer"
                        title="Jump to source"
                    >
                        {match[1]}
                    </button>
                );
            }
            return <span key={idx}>{part}</span>;
        });
    };

    // Helper to parse search results
    const parseSources = (content: string) => {
        const searchBlock = content.match(/Search Results \(for query: '.*?'\):\n([\s\S]*?)\n\nUser Query:/);
        // Fallback for older messages or slightly different format
        const searchBlockFallback = content.match(/Search Results:\n([\s\S]*?)\n\nUser Query:/);

        const block = searchBlock ? searchBlock[1] : (searchBlockFallback ? searchBlockFallback[1] : null);

        if (!block) return [];

        const results = [];
        const regex = /\[(\d+)\] (.*?): (.*?)(?=\n\[\d+\]|\n*$)/gs;
        let match;

        while ((match = regex.exec(block)) !== null) {
            results.push({
                id: match[1],
                title: match[2],
                snippet: match[3].slice(0, 100) + '...'
            });
        }
        return results;
    };

    // Markdown Components
    const markdownComponents = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p: ({ children }: any) => {
            // Process text children for citations
            const processedChildren = React.Children.map(children, child => {
                if (typeof child === 'string') {
                    return processCitations(child);
                }
                return child;
            });
            return <p className="mb-4 leading-relaxed text-zinc-300">{processedChildren}</p>;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        a: ({ href, children }: any) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 hover:underline underline-offset-4 decoration-emerald-500/30 transition-all">
                {children}
            </a>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: ({ inline, children, ...props }: any) => {
            // Inline code
            if (inline) {
                return <code className="bg-zinc-800/80 border border-white/10 px-1.5 py-0.5 rounded-md text-sm font-mono text-emerald-400" {...props}>{children}</code>;
            }
            // Code blocks
            return (
                <code className="block bg-zinc-900 border border-white/5 p-4 rounded-xl text-sm font-mono text-zinc-200 overflow-x-auto" {...props}>
                    {children}
                </code>
            );
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pre: ({ children }: any) => <pre className="my-4 overflow-x-auto rounded-xl">{children}</pre>,
    };

    // Auto-refresh conversation list when a new conversation is created (streaming finishes)
    useEffect(() => {
        if (!isStreaming && activeId && !conversationList.find(c => c.id === activeId) && messages.length > 0) {
            dispatch(fetchConversations());
        }
    }, [isStreaming, activeId, conversationList, messages.length, dispatch]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-emerald-500/20 antialiased">
            {/* Glass Rail Sidebar (Fixed) */}
            <div className="w-14 md:w-16 lg:w-20 glass flex flex-col items-center py-4 md:py-6 gap-6 md:gap-8 z-30 flex-shrink-0 relative">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-400/20 flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/20 mb-2 md:mb-4 hover:scale-105 transition-all cursor-pointer">
                    <Command size={20} className="md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                </div>

                <div className="flex flex-col gap-4 md:gap-6 w-full px-2">
                    <button
                        onClick={() => dispatch(setActiveId(uuidv4()))}
                        className={`flex flex-col items-center gap-1 md:gap-1.5 group relative ${!activeId || !conversationList.find(c => c.id === activeId) ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {(!activeId || !conversationList.find(c => c.id === activeId)) && (
                            <div className="absolute left-0 w-1 h-7 md:h-8 bg-emerald-500 rounded-r-full shadow-lg shadow-emerald-500/50 transition-all" />
                        )}
                        <div className={`p-2 md:p-2.5 rounded-xl transition-all shadow-sm ${!activeId || !conversationList.find(c => c.id === activeId) ? 'bg-zinc-800/60' : 'group-hover:bg-zinc-800/50'}`}>
                            <Plus size={18} className="md:w-5 md:h-5" />
                        </div>
                        <span className="text-[9px] md:text-[10px] font-semibold tracking-wide hidden md:block">New</span>
                    </button>

                    <button
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        className={`flex flex-col items-center gap-1 md:gap-1.5 group relative ${isHistoryOpen ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <div className={`p-2 md:p-2.5 rounded-xl transition-all shadow-sm ${isHistoryOpen ? 'bg-zinc-800/60' : 'group-hover:bg-zinc-800/50'}`}>
                            <Layers size={18} className="md:w-5 md:h-5" />
                        </div>
                        <span className="text-[9px] md:text-[10px] font-semibold tracking-wide hidden md:block">History</span>
                    </button>
                </div>
            </div>

            {/* Slide-out History Panel */}
            <div className={`fixed inset-y-0 left-14 md:left-16 lg:left-20 w-64 bg-zinc-900/95 backdrop-blur-xl border-r border-white/5 z-20 transition-transform duration-300 ease-in-out transform ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-6 px-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Command size={14} className="text-emerald-500" />
                        </div>
                        <span className="text-sm font-bold tracking-widest text-zinc-100">CIPHER</span>
                    </div>
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">Recent Chats</h3>
                    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1">
                        {conversationList.map((conv) => (
                            <div key={conv.id} className="group relative flex items-center">
                                <button
                                    onClick={() => { handleConversationClick(conv.id); setIsHistoryOpen(false); }}
                                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 pr-8 ${activeId === conv.id ? 'bg-zinc-800/80 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
                                >
                                    <MessageSquare size={16} className={`flex-shrink-0 ${activeId === conv.id ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-500'}`} />
                                    <span className="text-sm font-medium truncate">{conv.title || 'Untitled Conversation'}</span>
                                </button>
                                <div className={`absolute right-2 transition-opacity ${activeMenuId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === conv.id ? null : conv.id);
                                            }}
                                            className={`p-1 rounded-md transition-colors ${activeMenuId === conv.id ? 'bg-zinc-700 text-zinc-300' : 'text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'}`}
                                        >
                                            <MoreVertical size={14} />
                                        </button>
                                        {activeMenuId === conv.id && (
                                            <div className="absolute right-0 top-full mt-1 w-32 bg-zinc-900 border border-white/10 rounded-lg shadow-xl py-1 z-50 animate-fade-in-up">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(deleteConversation(conv.id));
                                                        setActiveMenuId(null);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                                >
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative min-w-0 min-h-0 bg-zinc-950">
                {/* Chat Scroll Area */}
                <div className="flex-1 overflow-y-auto scroll-smooth min-h-0">
                    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 pb-64 md:pb-72 space-y-10 md:space-y-12">
                        {messages.length === 0 && !isStreaming && (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in-up">
                                <div className="space-y-6">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/10">
                                        <Sparkles size={32} className="text-emerald-400" />
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                                        What do you want to <span className="text-emerald-500">know</span>?
                                    </h2>
                                    <p className="text-zinc-400 text-lg md:text-xl font-light max-w-md mx-auto">
                                        Ask anything. I'll search, analyze, and deliver the answer.
                                    </p>
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            if (msg.role === 'user') {
                                const displayContent = msg.content.includes('User Query:')
                                    ? msg.content.split('User Query: ')[1]
                                    : msg.content;
                                return (
                                    <div key={idx} className="flex flex-col items-end gap-3 animate-fade-in-up">
                                        <div className="flex items-start gap-3 max-w-2xl">
                                            <h3 className="text-2xl md:text-3xl font-semibold text-white text-right leading-tight tracking-tight">{displayContent}</h3>
                                        </div>
                                    </div>
                                );
                            } else {
                                const userMsg = messages[idx - 1];
                                const sources = userMsg ? parseSources(userMsg.content) : [];

                                return (
                                    <div key={idx} className="space-y-6 animate-fade-in-up group">
                                        {/* Sources Row */}
                                        {sources.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                                    <Layers size={14} className="text-emerald-500/50" /> Sources
                                                </div>
                                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                                    {sources.map((source, i) => (
                                                        <a
                                                            key={i}
                                                            href="#"
                                                            data-source-id={source.id}
                                                            className="flex-shrink-0 w-48 p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded-xl cursor-pointer transition-all hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 group/card flex flex-col justify-between h-24"
                                                        >
                                                            <div className="text-xs text-zinc-300 line-clamp-2 group-hover/card:text-emerald-400 transition-colors leading-relaxed font-medium">{source.title}</div>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400 font-mono border border-white/5 group-hover/card:bg-emerald-500/20 group-hover/card:border-emerald-500/30 group-hover/card:text-emerald-400 transition-all">
                                                                    {source.id}
                                                                </div>
                                                                <div className="text-[10px] text-zinc-500 truncate">Source {source.id}</div>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Answer */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                                <Sparkles size={14} className="text-emerald-500/50" /> Answer
                                            </div>
                                            <div className="prose prose-invert prose-p:text-[15px] prose-p:leading-relaxed prose-headings:tracking-tight prose-headings:font-bold prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl prose-code:text-emerald-400 prose-code:bg-zinc-800/80 prose-code:border prose-code:border-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md max-w-none">
                                                <ReactMarkdown components={markdownComponents}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent w-full mt-8" />
                                    </div>
                                );
                            }
                        })}

                        {isStreaming && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 uppercase tracking-wider">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        Generating...
                                    </div>
                                    <div className="prose prose-invert prose-p:text-[15px] prose-p:leading-relaxed prose-headings:tracking-tight prose-headings:font-bold prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl prose-code:text-emerald-400 prose-code:bg-zinc-800/80 prose-code:border prose-code:border-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md max-w-none">
                                        <ReactMarkdown components={markdownComponents}>
                                            {streamingContent}
                                        </ReactMarkdown>
                                        <span className="inline-block w-1.5 h-4 bg-emerald-500 ml-1 animate-pulse align-middle rounded-full" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Floating Input Island */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/98 to-transparent pt-32 md:pt-40 pointer-events-none">
                    <div className="max-w-3xl mx-auto pointer-events-auto">
                        <div className={`relative group transition-all duration-300 ${input.trim() ? 'input-island-active' : 'input-island'}`}>
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything..."
                                className="w-full bg-transparent py-5 pl-6 pr-14 text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none min-h-[60px] max-h-[200px] font-medium text-[15px] leading-relaxed"
                                rows={1}
                                disabled={isStreaming}
                            />

                            <div className="flex items-center justify-between px-4 pb-3">
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold border border-transparent hover:border-white/10 hover:shadow-sm active:scale-95">
                                        <Zap size={14} className="text-emerald-500" /> Focus
                                    </button>
                                    <button className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold border border-transparent hover:border-white/10 hover:shadow-sm active:scale-95">
                                        <Paperclip size={14} /> Attach
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleSubmit()}
                                        disabled={isStreaming || !input.trim()}
                                        className={`p-2.5 rounded-xl transition-all duration-300 ${input.trim()
                                            ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95'
                                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                            }`}
                                    >
                                        {isStreaming ? (
                                            <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                                        ) : (
                                            <ChevronRight size={20} strokeWidth={2.5} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {messages.length === 0 && (
                            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap animate-slide-in-bottom" style={{ animationDelay: '150ms' }}>
                                {["Teach me", "Summarize", "Research", "Code"].map((action) => (
                                    <button
                                        key={action}
                                        onClick={() => { setInput(action + " "); if (textareaRef.current) textareaRef.current.focus(); }}
                                        className="px-4 py-2 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 hover:border-emerald-500/40 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-500/5 hover:scale-105 active:scale-95"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="text-center mt-4 text-[10px] text-zinc-600 font-mono tracking-wider">
                            CIPHER v2.3 <span className="text-zinc-700 mx-1">●</span> PREMIUM DARK
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
