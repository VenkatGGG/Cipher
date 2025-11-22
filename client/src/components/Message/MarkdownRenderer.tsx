import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles } from 'lucide-react';
import type { Source } from '../../utils/citationUtils';
import { createMarkdownComponents } from '../../utils/markdownUtils';

interface MarkdownRendererProps {
    content: string;
    sources: Source[];
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, sources }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <Sparkles size={14} className="text-emerald-500/50" /> Answer
            </div>
            <div className="prose prose-invert prose-p:text-[15px] prose-p:leading-relaxed prose-headings:tracking-tight prose-headings:font-bold prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl prose-code:text-emerald-400 prose-code:bg-zinc-800/80 prose-code:border prose-code:border-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md max-w-none">
                <ReactMarkdown components={createMarkdownComponents(sources)}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};
