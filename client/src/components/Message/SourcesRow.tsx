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
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <Layers size={14} className="text-emerald-500/50" /> Sources
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {sources.map((source, i) => (
                    <SourceCard key={i} source={source} />
                ))}
            </div>
        </div>
    );
};
