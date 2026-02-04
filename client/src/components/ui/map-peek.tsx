import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

/**
 * MapPeek Component
 * Premium macOS-inspired 'Map Peek' tooltip.
 * Appears on hover with glassmorphism and spring animation.
 */
export function MapPeek({ children }: { children: React.ReactNode }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isTouchData, setIsTouchData] = useState(false);

    useEffect(() => {
        // Check for touch capability to disable on mobile
        if (window.matchMedia("(pointer: coarse)").matches) {
            setIsTouchData(true);
        }
    }, []);

    return (
        <div
            className="relative z-50 inline-flex items-center justify-center"
            onMouseEnter={() => !isTouchData && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: -10, y: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: -10, y: 10 }}
                        transition={{
                            duration: 0.3,
                            ease: [0.23, 1, 0.32, 1]
                        }}
                        // Centered more towards the button, overlapping the right side for better focus
                        className="absolute left-[20%] bottom-full mb-4 z-[999] pointer-events-none hidden md:block"
                        style={{
                            width: '280px',
                            height: '160px',
                        }}
                        aria-hidden="true"
                    >
                        {/* Solid Premium Container for Maximum Visibility */}
                        <div className="w-full h-full rounded-[16px] overflow-hidden bg-white border border-slate-200 shadow-[0_45px_90px_rgba(0,0,0,0.35)] relative group">

                            {/* The Real Map Screenshot - Fully Opaque */}
                            <img
                                src="/assets/map-preview.png"
                                alt="Map Preview"
                                className="w-full h-full object-cover select-none opacity-100"
                            />

                            {/* Inner Border Refinement */}
                            <div className="absolute inset-0 rounded-[16px] border border-black/10 pointer-events-none" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </div>
    );
}
