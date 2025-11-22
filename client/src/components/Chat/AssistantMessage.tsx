import React from 'react';
import { MarkdownRenderer } from '../Message/MarkdownRenderer';
import { SourcesRow } from '../Message/SourcesRow';
import type { Source } from '../../utils/citationUtils';

interface AssistantMessageProps {
    content: string;
    sources: Source[];
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ content, sources }) => {
    return (
        <div className="space-y-6 animate-fade-in-up group">
            <MarkdownRenderer content={content} sources={sources} />
            <SourcesRow sources={sources} />
            <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent w-full mt-8" />
        </div>
    );
};
