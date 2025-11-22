import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Source } from '../../utils/citationUtils';
import { parseSources } from '../../utils/citationUtils';
import { createMarkdownComponents } from '../../utils/markdownUtils';

interface StreamingMessageProps {
    content: string;
    lastUserMessage?: string;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({ content, lastUserMessage }) => {
    // Parse sources from the last user message if available
    const sources: Source[] = lastUserMessage ? parseSources(lastUserMessage) : [];

    return (
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
                    <ReactMarkdown components={createMarkdownComponents(sources)}>
                        {content}
                    </ReactMarkdown>
                    <span className="inline-block w-1.5 h-4 bg-emerald-500 ml-1 animate-pulse align-middle rounded-full" />
                </div>
            </div>
        </div>
    );
};
