/**
 * PREMIUM MICRO-INTERACTIONS — INVISIBLE MODE
 * Ultra-subtle parallax and interaction utilities
 * Philosophy: "If it's noticeable, it's too strong"
 */

/**
 * Per-scroll parallax is intentionally disabled.
 * Static visuals plus text-only reveals keep the map and image sections smooth.
 */
export function initPremiumParallax() {
    return;
}

/**
 * Disable hover effects during scrolling for performance
 */
export function initScrollStateTracking() {
    let scrollTimeout: number;
    let scrollClassApplied = false;

    function onScroll() {
        if (!scrollClassApplied) {
            document.body.classList.add('is-scrolling');
            scrollClassApplied = true;
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(() => {
            document.body.classList.remove('is-scrolling');
            scrollClassApplied = false;
        }, 150);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Lazy load images with calm fade-in
 */
export function initImageLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target as HTMLImageElement;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
            imageObserver.observe(img);
        });
    }
}

/**
 * Intersection Observer for section headlines
 */
export function initSectionHeadlineReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Apply 'active' class with a small stagger delay if multiple in view
                const el = entry.target as HTMLElement;
                setTimeout(() => {
                    el.classList.add('active');
                }, index * 100);
                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Reveal slightly before it hits the center
    });

    document.querySelectorAll('.section-headline-reveal').forEach((headline) => {
        observer.observe(headline);
    });
}

/**
 * Initialize all premium interactions
 * Call this once on app mount
 */
let isInitialized = false;
export function initPremiumInteractions() {
    if (isInitialized) {
        // Still scan for new headlines on re-init (e.g. route change)
        initSectionHeadlineReveal();
        return;
    }

    isInitialized = true;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initPremiumParallax();
            initScrollStateTracking();
            initImageLoading();
            initSectionHeadlineReveal();
        });
    } else {
        initPremiumParallax();
        initScrollStateTracking();
        initImageLoading();
        initSectionHeadlineReveal();
    }
}
