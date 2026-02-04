import { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ComponentType } from "react";

interface StatisticCardProps {
    value: number;
    label: string;
    icon: LucideIcon | ComponentType<{ className?: string }>;
    delay?: number;
}

/**
 * Atomic component for displaying a single statistic
 * Following Number -> Label -> Icon hierarchy
 */
export function StatisticCard({ value, label, icon: Icon, delay = 0 }: StatisticCardProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center w-full md:w-1/3 gap-2">
            {/* Number */}
            <span className="font-sans text-3xl font-light text-slate-900 leading-none">
                <AnimatedCounter end={value} duration={2000} delay={delay} />
            </span>

            {/* Label + Icon (Horizontal) */}
            <div className="flex items-center justify-center gap-1.5">
                <Icon className="w-3.5 h-3.5 stroke-[1.5] text-slate-900" aria-hidden="true" />
                <span className="text-[11px] text-slate-900 font-bold tracking-widest font-sans uppercase">
                    {label}
                </span>
            </div>
        </div>
    );
}
