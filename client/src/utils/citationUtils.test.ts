import { describe, it, expect } from 'vitest';
import { parseSources } from './citationUtils';

describe('citationUtils', () => {
    describe('parseSources', () => {
        it('should parse sources from message content', () => {
            const content = `
Search Results
[1] Example Source (https://example.com): This is a test snippet with some content
[2] Another Source (https://example2.com): Another test snippet with more information

User Query: test query`;

            const sources = parseSources(content);

            expect(sources).toHaveLength(2);
            expect(sources[0]).toEqual({
                id: '1',
                title: 'Example Source',
                url: 'https://example.com',
                snippet: 'This is a test snippet with some content...',
            });
            expect(sources[1]).toEqual({
                id: '2',
                title: 'Another Source',
                url: 'https://example2.com',
                snippet: 'Another test snippet with more information...',
            });
        });

        it('should return empty array when no sources found', () => {
            const content = 'Just some regular text without sources';
            const sources = parseSources(content);
            expect(sources).toEqual([]);
        });

        it('should return empty array when Search Results block is missing', () => {
            const content = 'User Query: test\nSome other content';
            const sources = parseSources(content);
            expect(sources).toEqual([]);
        });

        it('should handle sources with special characters in title', () => {
            const content = `
Search Results
[1] Source with "quotes" & special chars (https://example.com): Test snippet here

User Query: test`;

            const sources = parseSources(content);
            expect(sources).toHaveLength(1);
            expect(sources[0].title).toBe('Source with "quotes" & special chars');
        });

        it('should trim whitespace from parsed values', () => {
            const content = `
Search Results
[1]   Spaced Title   (  https://example.com  ):   Spaced snippet content   

User Query: test`;

            const sources = parseSources(content);
            expect(sources).toHaveLength(1);
            expect(sources[0].title).toBe('Spaced Title');
            expect(sources[0].url).toBe('https://example.com');
            expect(sources[0].snippet).toContain('Spaced snippet');
        });

        it('should truncate long snippets to 100 characters', () => {
            const longSnippet = 'a'.repeat(150);
            const content = `
Search Results
[1] Test Source (https://example.com): ${longSnippet}

User Query: test`;

            const sources = parseSources(content);
            expect(sources[0].snippet).toHaveLength(103); // 100 chars + '...'
            expect(sources[0].snippet.endsWith('...')).toBe(true);
        });

        it('should parse multiple sources correctly', () => {
            const content = `
Search Results
[1] First (https://first.com): First snippet
[2] Second (https://second.com): Second snippet
[3] Third (https://third.com): Third snippet

User Query: test`;

            const sources = parseSources(content);
            expect(sources).toHaveLength(3);
            expect(sources.map(s => s.id)).toEqual(['1', '2', '3']);
        });
    });
});
