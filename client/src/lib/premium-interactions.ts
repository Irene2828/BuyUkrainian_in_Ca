/**
 * PREMIUM MICRO-INTERACTIONS — INVISIBLE MODE
 * Ultra-subtle parallax and interaction utilities
 * Philosophy: "If it's noticeable, it's too strong"
 */

// Scroll state tracking
let isScrolling: number | null = null;
let ticking = false;

/**
 * Subtle parallax effect for hero background and text
 * Movement: Background (-5px range), Text (-2px range)
 */
export function initPremiumParallax() {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const heroBg = document.querySelector('.premium-parallax-hero');
    const heroTexts = document.querySelectorAll('.premium-parallax-text');

    if (!heroBg && heroTexts.length === 0) return;

    function updateParallax() {
        const scrollY = window.scrollY;
        const maxScroll = 600; // Parallax effect active for first 600px of scroll

        if (scrollY <= maxScroll) {
            const progress = scrollY / maxScroll;

            // Background movement: 5px total range
            if (heroBg) {
                const bgOffset = progress * 5;
                (heroBg as HTMLElement).style.transform = `translateY(${bgOffset}px) translateZ(0)`;
            }

            // Text movement: 2px total range (slightly different velocity for depth)
            heroTexts.forEach((el) => {
                const textOffset = progress * 2;
                (el as HTMLElement).style.transform = `translateY(${textOffset}px) translateZ(0)`;
            });
        }

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Disable hover effects during scrolling for performance
 */
export function initScrollStateTracking() {
    let scrollTimeout: number;

    function onScroll() {
        document.body.classList.add('is-scrolling');

        clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(() => {
            document.body.classList.remove('is-scrolling');
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
