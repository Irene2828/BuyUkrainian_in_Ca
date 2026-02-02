import { useEffect } from 'react';

/**
 * Obsidian Motion Scroll Reveal System
 * - Initial: opacity 0, translateY(20px)
 * - Final: opacity 1, translateY(0)
 * - Duration: 0.8s
 * - Easing: cubic-bezier(0.16, 1, 0.3, 1) [Silk-smooth deceleration]
 * - Viewport: once = true (no re-trigger)
 */
export function useScrollReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Once visible, stop observing (viewport: once)
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before entering viewport
        });

        // Observe major sections
        const sections = document.querySelectorAll('.section-reveal');
        sections.forEach((section) => observer.observe(section));

        // Observe stagger containers for card animations
        const staggerContainers = document.querySelectorAll('.stagger-container');
        staggerContainers.forEach((container) => observer.observe(container));

        return () => observer.disconnect();
    }, []); // Run on mount
}
