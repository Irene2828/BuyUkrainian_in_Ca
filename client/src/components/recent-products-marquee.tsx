import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function RecentProductsMarquee() {
    const { t } = useI18n();
    const [location] = useLocation();
    const [isStuck, setIsStuck] = useState(false);
    const isHome = location === "/";

    useEffect(() => {
        if (!isHome) return;

        const handleScroll = () => {
            // Header is approx 80-100px. When scroll passes this, we are likely stuck.
            // Using 60px as a safe threshold for visual transition
            setIsStuck(window.scrollY > 60);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHome]);

    const { data: stores = [], isLoading } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: Infinity,
    });

    if (isLoading || stores.length === 0) return null;

    // Duplicate stores to create seamless loop
    const storeNames = stores.map(s => s.name);
    const repeatedNames = Array(10).fill(storeNames).flat();

    return (
        <div
            className={cn(
                "w-full py-3.5 overflow-hidden font-sans transition-all duration-300",
                isHome
                    ? "sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50"
                    : "relative z-20 bg-white border-b border-slate-50",
                isStuck && isHome && "shadow-sm"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center h-[50px] md:h-[60px] relative px-6 md:px-12">

                {/* Fixed Live Label */}
                <div className="sticky left-0 z-30 py-2 pr-6 flex items-center gap-3 h-full">
                    {/* Glass gradient background for label to mask marquee behind it */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/90 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-premium-pulse shrink-0" />
                        <span className="text-[12px] md:text-[13px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                            Live Findings
                        </span>
                    </div>
                </div>

                {/* Infinite Scroll Ticker */}
                <div className="flex flex-1 overflow-hidden mask-ticker group/marquee ml-4">
                    <div className="flex animate-marquee whitespace-nowrap items-center min-w-full group-hover/marquee:[animation-play-state:paused]">
                        {repeatedNames.map((name, i) => (
                            <span key={i} className="group text-[14px] md:text-[16px] font-medium text-slate-800 hover:text-slate-950 mx-6 flex items-center gap-2.5 select-none cursor-default transition-colors duration-300 ease-in-out">
                                {/* Identity Dot: 10px, Split 50/50, Opacity 60->100 */}
                                <span
                                    className="w-[10px] h-[10px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                                    style={{ background: 'linear-gradient(to bottom, #0057B7 50%, #FFD700 50%)' }}
                                />
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
