import React from 'react';
import { Layers } from 'lucide-react';
import type { Source } from '../../utils/citationUtils';
import { SourceCard } from './SourceCard';

interface SourcesRowProps {
    sources: Source[];
}

export const SourcesRow: React.FC<SourcesRowProps> = ({ sources }) => {
    if (sources.length === 0) return null;

    return (
        <div className="space-y-3 pt-2">
            <div className="text-section-header">
                <Layers size={14} className="icon-accent" /> Sources
            </div>
            <div className="scroll-horizontal scrollbar-hide">
                {sources.map((source, i) => (
                    <SourceCard key={i} source={source} />
                ))}
            </div>
        </div>
    );
};
