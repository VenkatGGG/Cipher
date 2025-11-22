import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SourcesRow } from './SourcesRow';
import type { Source } from '../../utils/citationUtils';

describe('SourcesRow', () => {
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
        {
            id: '3',
            title: 'Third Source',
            url: 'https://third.com',
            snippet: 'Third snippet',
        },
    ];

    it('should render without crashing', () => {
        render(<SourcesRow sources={mockSources} />);
        expect(screen.getByText('Sources')).toBeInTheDocument();
    });

    it('should display "Sources" header', () => {
        render(<SourcesRow sources={mockSources} />);
        expect(screen.getByText('Sources')).toBeInTheDocument();
    });

    it('should render all source cards', () => {
        render(<SourcesRow sources={mockSources} />);

        expect(screen.getByText('First Source')).toBeInTheDocument();
        expect(screen.getByText('Second Source')).toBeInTheDocument();
        expect(screen.getByText('Third Source')).toBeInTheDocument();
    });

    it('should render nothing when sources array is empty', () => {
        const { container } = render(<SourcesRow sources={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('should apply correct CSS classes', () => {
        const { container } = render(<SourcesRow sources={mockSources} />);

        const header = screen.getByText('Sources').closest('div');
        expect(header?.className).toContain('text-section-header');

        const scrollContainer = container.querySelector('.scroll-horizontal');
        expect(scrollContainer).toBeTruthy();
    });

    it('should render single source correctly', () => {
        const singleSource = [mockSources[0]];
        render(<SourcesRow sources={singleSource} />);

        expect(screen.getByText('First Source')).toBeInTheDocument();
        expect(screen.queryByText('Second Source')).not.toBeInTheDocument();
    });

    it('should handle many sources', () => {
        const manySources: Source[] = Array.from({ length: 10 }, (_, i) => ({
            id: String(i + 1),
            title: `Source ${i + 1}`,
            url: `https://source${i + 1}.com`,
            snippet: `Snippet ${i + 1}`,
        }));

        render(<SourcesRow sources={manySources} />);

        // These texts appear multiple times (title + "Source X" label)
        expect(screen.getAllByText('Source 1').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Source 10').length).toBeGreaterThan(0);
    });
});
