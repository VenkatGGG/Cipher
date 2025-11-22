/**
 * Utility functions for parsing and processing citations
 */

export interface Source {
    id: string;
    title: string;
    url: string;
    snippet: string;
}

/**
 * Parse search results from message content
 */
export const parseSources = (content: string): Source[] => {
    const searchBlock = content.match(/Search Results.*?\n([\s\S]*?)\n\nUser Query:/);
    const block = searchBlock ? searchBlock[1] : null;

    if (!block) return [];

    const results: Source[] = [];
    const regex = /\[(\d+)\]\s+(.*?)\s+\(([^)]+)\):\s+(.*?)(?=\n\[\d+\]|\n*$)/gs;
    let match;

    while ((match = regex.exec(block)) !== null) {
        results.push({
            id: match[1],
            title: match[2].trim(),
            url: match[3].trim(),
            snippet: match[4].trim().slice(0, 100) + '...'
        });
    }
    return results;
};
