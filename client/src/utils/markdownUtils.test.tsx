import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { processCitations, createMarkdownComponents } from './markdownUtils';
import type { Source } from './citationUtils';

describe('markdownUtils', () => {
    const mockSources: Source[] = [
        {
            id: '1',
            title: 'First Source',
            url: 'https://first.com',
            snippet: 'First snippet',
        },
        {
            id: '2',
            title: 'Second Source',
            url: 'https://second.com',
            snippet: 'Second snippet',
        },
    ];

    describe('processCitations', () => {
        it('should convert citation markers to clickable badges', () => {
            const text = 'This is a test [1] with citations [2]';
            const result = processCitations(text, mockSources);

            expect(result).toHaveLength(5); // 3 text parts + 2 citations
        });

        it('should create links with correct URLs', () => {
            const text = 'Test [1]';
            const { container } = render(<div>{processCitations(text, mockSources)}</div>);

            const link = container.querySelector('a');
            expect(link).toBeTruthy();
            expect(link?.getAttribute('href')).toBe('https://first.com');
            expect(link?.getAttribute('target')).toBe('_blank');
            expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
        });

        it('should use # as href when source not found', () => {
            const text = 'Test [99]';
            const { container } = render(<div>{processCitations(text, mockSources)}</div>);

            const link = container.querySelector('a');
            expect(link?.getAttribute('href')).toBe('#');
            expect(link?.getAttribute('title')).toBe('Source not found');
        });

        it('should apply badge-citation class', () => {
            const text = 'Test [1]';
            const { container } = render(<div>{processCitations(text, mockSources)}</div>);

            const link = container.querySelector('a');
            expect(link?.className).toContain('badge-citation');
        });

        it('should handle text without citations', () => {
            const text = 'No citations here';
            const result = processCitations(text, mockSources);

            expect(result).toHaveLength(1);
        });

        it('should handle multiple consecutive citations', () => {
            const text = '[1][2][1]';
            const result = processCitations(text, mockSources);

            // Split creates empty strings between consecutive citations
            expect(result.length).toBeGreaterThan(3);
            // Verify all citations are present
            const { container } = render(<div>{result}</div>);
            const links = container.querySelectorAll('a');
            expect(links).toHaveLength(3);
        });
    });

    describe('createMarkdownComponents', () => {
        it('should create components object with custom renderers', () => {
            const components = createMarkdownComponents(mockSources);

            expect(components).toHaveProperty('p');
            expect(components).toHaveProperty('a');
            expect(components).toHaveProperty('code');
            expect(components).toHaveProperty('pre');
        });

        it('should process citations in paragraph text', () => {
            const components = createMarkdownComponents(mockSources);
            const PComponent = components.p;

            const { container } = render(<PComponent>Test [1] citation</PComponent>);
            const link = container.querySelector('a');

            expect(link).toBeTruthy();
            expect(link?.textContent).toBe('1');
        });

        it('should render links with correct styling', () => {
            const components = createMarkdownComponents(mockSources);
            const AComponent = components.a;

            const { container } = render(<AComponent href="https://test.com">Link</AComponent>);
            const link = container.querySelector('a');

            expect(link?.getAttribute('href')).toBe('https://test.com');
            expect(link?.getAttribute('target')).toBe('_blank');
            expect(link?.className).toContain('text-emerald-400');
        });

        it('should render inline code with correct styling', () => {
            const components = createMarkdownComponents(mockSources);
            const CodeComponent = components.code;

            const { container } = render(<CodeComponent inline={true}>code</CodeComponent>);
            const code = container.querySelector('code');

            expect(code?.className).toContain('bg-zinc-800/80');
            expect(code?.className).toContain('text-emerald-400');
        });

        it('should render block code with correct styling', () => {
            const components = createMarkdownComponents(mockSources);
            const CodeComponent = components.code;

            const { container } = render(<CodeComponent inline={false}>code block</CodeComponent>);
            const code = container.querySelector('code');

            expect(code?.className).toContain('block');
            expect(code?.className).toContain('bg-zinc-900');
        });
    });
});
