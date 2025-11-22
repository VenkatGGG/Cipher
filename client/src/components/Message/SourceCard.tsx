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
            className="flex-shrink-0 w-48 p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded-xl cursor-pointer transition-all hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 group/card flex flex-col justify-between h-24"
        >
            <div className="text-xs text-zinc-300 line-clamp-2 group-hover/card:text-emerald-400 transition-colors leading-relaxed font-medium">
                {source.title}
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400 font-mono border border-white/5 group-hover/card:bg-emerald-500/20 group-hover/card:border-emerald-500/30 group-hover/card:text-emerald-400 transition-all">
                    {source.id}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">Source {source.id}</div>
            </div>
        </a>
    );
};
