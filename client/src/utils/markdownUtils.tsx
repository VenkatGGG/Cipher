import React from 'react';
import type { Source } from './citationUtils';

/**
 * Process citation markers [1], [2] etc. and convert to clickable badges
 */
export const processCitations = (text: string, sources: Source[]) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, idx) => {
        const match = part.match(/\[(\d+)\]/);
        if (match) {
            const sourceId = match[1];
            const source = sources.find(s => s.id === sourceId);
            const url = source ? source.url : '#';

            return (
                <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-1.5 py-0.5 mx-0.5 text-[10px] font-mono font-medium bg-zinc-800/80 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 rounded-md transition-all hover:scale-105 cursor-pointer no-underline"
                    title={source ? source.title : "Source not found"}
                >
                    {sourceId}
                </a>
            );
        }
        return <span key={idx}>{part}</span>;
    });
};

/**
 * Create markdown components factory with citation support
 */
export const createMarkdownComponents = (sources: Source[]) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p: ({ children }: any) => {
        const processedChildren = React.Children.map(children, child => {
            if (typeof child === 'string') {
                return processCitations(child, sources);
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
        if (inline) {
            return <code className="bg-zinc-800/80 border border-white/10 px-1.5 py-0.5 rounded-md text-sm font-mono text-emerald-400" {...props}>{children}</code>;
        }
        return (
            <code className="block bg-zinc-900 border border-white/5 p-4 rounded-xl text-sm font-mono text-zinc-200 overflow-x-auto" {...props}>
                {children}
            </code>
        );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pre: ({ children }: any) => <pre className="my-4 overflow-x-auto rounded-xl">{children}</pre>,
});
