import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

/**
 * Refined Cursor Component
 * 
 * This cursor ONLY appears on primary CTAs and key interactive elements.
 * Uses a subtle glass/frosted effect with minimal scale on hover.
 * The system cursor is used everywhere else.
 */

// Selector for primary CTAs only - buttons, links meant to attract action
const CTA_SELECTOR = [
    'button:not([disabled])',
    'a[href]:not([data-no-cursor])',
    '[role="button"]:not([disabled])',
    '[data-cursor="cta"]',
    '.btn-strict',
    '.cta-button',
].join(', ');

export function Cursor() {
    const [isOnCTA, setIsOnCTA] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const ctaElementRef = useRef<Element | null>(null);

    // Motion values for cursor position
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Smooth spring physics for refined, elegant movement
    const springConfig = { stiffness: 400, damping: 40, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    // Handle cursor style on CTA elements
    const applyCTAStyles = useCallback((element: Element, hide: boolean) => {
        const el = element as HTMLElement;
        if (hide) {
            el.style.cursor = 'none';
        } else {
            el.style.cursor = '';
        }
    }, []);

    useEffect(() => {
        // Track mouse position - only update when on CTA
        const moveCursor = (e: MouseEvent) => {
            if (isOnCTA) {
                cursorX.set(e.clientX - 12); // Center the 24px cursor
                cursorY.set(e.clientY - 12);
            }
        };

        // Handle mouse down/up for very subtle click effect
        const handleMouseDown = () => {
            if (isOnCTA) setIsClicking(true);
        };
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [cursorX, cursorY, isOnCTA]);

    useEffect(() => {
        const handleMouseEnter = (e: Event) => {
            const target = e.currentTarget as Element;
            ctaElementRef.current = target;
            setIsOnCTA(true);
            applyCTAStyles(target, true);
        };

        const handleMouseLeave = (e: Event) => {
            const target = e.currentTarget as Element;
            if (ctaElementRef.current === target) {
                applyCTAStyles(target, false);
                ctaElementRef.current = null;
                setIsOnCTA(false);
            }
        };

        const attachListeners = (elements: NodeListOf<Element>) => {
            elements.forEach((el) => {
                el.addEventListener("mouseenter", handleMouseEnter);
                el.addEventListener("mouseleave", handleMouseLeave);
            });
        };

        const detachListeners = (elements: NodeListOf<Element>) => {
            elements.forEach((el) => {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
                applyCTAStyles(el, false);
            });
        };

        // Initial attachment
        const ctaElements = document.querySelectorAll(CTA_SELECTOR);
        attachListeners(ctaElements);

        // MutationObserver for dynamically added CTAs
        const observer = new MutationObserver(() => {
            const newElements = document.querySelectorAll(CTA_SELECTOR);
            // Reattach to all (simplest approach for dynamic content)
            detachListeners(newElements);
            attachListeners(newElements);
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            detachListeners(ctaElements);
            observer.disconnect();
        };
    }, [applyCTAStyles]);

    // Very subtle scale on hover - refined, almost invisible
    const getScale = () => {
        if (isClicking) return 0.92; // Very subtle press
        return 1;
    };

    // Only render when hovering over CTA
    if (!isOnCTA) return null;

    return (
        <motion.div
            className="refined-cursor"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: getScale(),
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
                opacity: { duration: 0.15, ease: "easeOut" },
                scale: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
            }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: 24,
                height: 24,
                borderRadius: "50%",
                pointerEvents: "none",
                zIndex: 99999,
                x: cursorXSpring,
                y: cursorYSpring,
                // Glass / frosted effect
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
        />
    );
}
