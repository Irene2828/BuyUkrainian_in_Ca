import { useEffect } from 'react';

/**
 * Text-only scroll reveal.
 * Keep maps, cards, images, and section blocks static so scroll stays light.
 */
export function useScrollReveal() {
    useEffect(() => {
        const revealSelector = '.text-reveal, .section-headline-reveal';
        const observedElements = new WeakSet<Element>();

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

        const observeRevealText = (root: ParentNode = document) => {
            root.querySelectorAll(revealSelector).forEach((element) => {
                if (!observedElements.has(element)) {
                    observedElements.add(element);
                    observer.observe(element);
                }
            });
        };

        observeRevealText();

        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (!(node instanceof Element)) return;
                    if (node.matches(revealSelector) && !observedElements.has(node)) {
                        observedElements.add(node);
                        observer.observe(node);
                    }
                    observeRevealText(node);
                });
            });
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            mutationObserver.disconnect();
        };
    }, []); // Run on mount
}
