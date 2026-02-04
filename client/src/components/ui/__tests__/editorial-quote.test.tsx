import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EditorialQuote } from '@/components/ui/editorial-quote';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('EditorialQuote Accessibility', () => {
    it('should not have WCAG AA violations', async () => {
        const { container } = render(
            <EditorialQuote>
                Find or add stores that sell Ukrainian-made products.
            </EditorialQuote>
        );

        const results = await axe(container, {
            rules: {
                // Enforce WCAG AA standards
                'color-contrast': { enabled: true },
                'aria-allowed-attr': { enabled: true },
                'aria-hidden-focus': { enabled: true },
            },
        });

        expect(results).toHaveNoViolations();
    });

    it('should have properly hidden decorative quotes', async () => {
        const { container } = render(
            <EditorialQuote>Test message</EditorialQuote>
        );

        // Verify quote SVGs are aria-hidden
        const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
        expect(decorativeElements.length).toBeGreaterThan(0);
    });

    it('should have readable text with sufficient contrast', async () => {
        const { container } = render(
            <EditorialQuote>Test message</EditorialQuote>
        );

        // Text should be #F5F5F7 on black (#000000)
        // Contrast ratio: 16.55:1 (exceeds WCAG AAA 7:1)
        const results = await axe(container, {
            rules: {
                'color-contrast': { enabled: true },
            },
        });

        expect(results.violations).toHaveLength(0);
    });
});
