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
        <div className="layout-message-container animate-fade-in-up">
            <MarkdownRenderer content={content} sources={sources} />
            <SourcesRow sources={sources} />
            <div className="divider-horizontal" />
        </div>
    );
};
