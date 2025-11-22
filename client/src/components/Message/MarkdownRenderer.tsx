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
            <div className="text-section-header">
                <Sparkles size={14} className="icon-accent" /> Answer
            </div>
            <div className="prose-answer">
                <ReactMarkdown components={createMarkdownComponents(sources)}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};
