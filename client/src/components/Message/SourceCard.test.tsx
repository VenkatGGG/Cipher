import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SourceCard } from './SourceCard';
import type { Source } from '../../utils/citationUtils';

describe('SourceCard', () => {
    const mockSource: Source = {
        id: '1',
        title: 'Example Source Title',
        url: 'https://example.com/article',
        snippet: 'This is an example snippet from the source',
    };

    it('should render without crashing', () => {
        render(<SourceCard source={mockSource} />);
        expect(screen.getByText('Example Source Title')).toBeInTheDocument();
    });

    it('should display source title', () => {
        render(<SourceCard source={mockSource} />);
        expect(screen.getByText('Example Source Title')).toBeInTheDocument();
    });

    it('should display source ID', () => {
        render(<SourceCard source={mockSource} />);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText(/Source 1/)).toBeInTheDocument();
    });

    it('should render as a link with correct URL', () => {
        const { container } = render(<SourceCard source={mockSource} />);
        const link = container.querySelector('a');

        expect(link).toBeTruthy();
        expect(link?.getAttribute('href')).toBe('https://example.com/article');
        expect(link?.getAttribute('target')).toBe('_blank');
        expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should apply card-source class', () => {
        const { container } = render(<SourceCard source={mockSource} />);
        const link = container.querySelector('a');

        expect(link?.className).toContain('card-source');
    });

    it('should handle long titles gracefully', () => {
        const longTitleSource: Source = {
            ...mockSource,
            title: 'This is a very long title that should be displayed properly in the card component',
        };

        render(<SourceCard source={longTitleSource} />);
        expect(screen.getByText(/This is a very long title/)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
        const specialSource: Source = {
            ...mockSource,
            title: 'Title with "quotes" & special <chars>',
        };

        render(<SourceCard source={specialSource} />);
        expect(screen.getByText(/Title with "quotes" & special <chars>/)).toBeInTheDocument();
    });

    it('should handle different source IDs', () => {
        const source2: Source = { ...mockSource, id: '42' };
        render(<SourceCard source={source2} />);

        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText(/Source 42/)).toBeInTheDocument();
    });
});
