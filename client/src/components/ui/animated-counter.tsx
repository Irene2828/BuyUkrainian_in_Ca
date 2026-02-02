
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
    end: number;
    duration?: number;
    delay?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
}

export function AnimatedCounter({
    end,
    duration = 1500,
    delay = 0,
    className,
    prefix = "",
    suffix = ""
}: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const startTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const endRef = useRef(end);

    // Update ref if end prop changes, to handle dynamic updates if needed
    useEffect(() => {
        endRef.current = end;
    }, [end]);

    useEffect(() => {
        // Only start if in view
        if (!isInView) return;

        // Reset start time when effect runs
        startTimeRef.current = null;

        let timeoutId: NodeJS.Timeout;

        const startAnimation = () => {
            const step = (timestamp: number) => {
                if (!startTimeRef.current) startTimeRef.current = timestamp;

                const progress = timestamp - startTimeRef.current;
                const percentage = Math.min(progress / duration, 1);

                // Easing function: Ease Out Expo
                // 1 - pow(2, -10 * t)
                const easeOutExpo = (x: number): number => {
                    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
                };

                const currentCount = Math.floor(easeOutExpo(percentage) * endRef.current);

                setCount(currentCount);

                if (progress < duration) {
                    rafRef.current = requestAnimationFrame(step);
                } else {
                    setCount(endRef.current);
                }
            };
            rafRef.current = requestAnimationFrame(step);
        };

        if (delay > 0) {
            timeoutId = setTimeout(startAnimation, delay);
        } else {
            startAnimation();
        }

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            clearTimeout(timeoutId);
        };
    }, [end, duration, delay, isInView]);

    return (
        <span ref={ref} className={cn("inline-block tabular-nums tracking-tight", className)}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}
