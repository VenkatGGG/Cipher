import React from 'react';
import type { Source } from '../../utils/citationUtils';

interface SourceCardProps {
    source: Source;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
    return (
        <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-source"
        >
            <div className="text-label">
                {source.title}
            </div>
            <div className="flex items-center gap-1.5">
                <div className="badge-source-id">
                    {source.id}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">Source {source.id}</div>
            </div>
        </a>
    );
};
