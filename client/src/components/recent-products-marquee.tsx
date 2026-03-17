import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Plus, ArrowUpRight } from "lucide-react";


export function RecentProductsMarquee() {
    const { t } = useI18n();



    const [hoveredStore, setHoveredStore] = useState<any | null>(null);



    const navigateToStoreCoordinates = (storeId: number | string) => {
        // Direct navigation to Map with query param to trigger "Teleport" focus
        window.location.assign(`/map?store=${encodeURIComponent(storeId)}`);
    };





    const { data: stores = [], isLoading } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    if (isLoading) {
        return <div className="h-[200px] flex items-center justify-center bg-slate-50/30 rounded-[32px] overflow-hidden">
            <div className="w-full px-8 flex gap-6 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 w-64 bg-slate-100 rounded-2xl animate-pulse shrink-0" />
                ))}
            </div>
        </div>;
    }

    if (stores.length === 0) return null;

    // Duplicate stores to create seamless loop
    const repeatedStores = Array(10).fill(stores).flat();





    return (
        <>
            <style>
                {`
            @keyframes premium-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            `}
            </style>
            <div
                className="w-full pt-4 pb-24 overflow-hidden font-sans relative z-10 flex items-center justify-center bg-transparent"
            >
                <div className="w-full mx-auto flex items-center h-[50px] md:h-[60px] relative">
                    {/* Gradient Fade Masks */}
                    <div className="absolute left-0 top-0 w-16 md:w-32 h-full bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
                    <div className="absolute right-0 top-0 w-16 md:w-32 h-full bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />                    {/* Infinite Scroll Ticker */}
                    <div
                        className="flex flex-1 overflow-hidden group/marquee h-full items-center relative"
                    >
                        <div
                            className="flex whitespace-nowrap items-center group-hover/marquee:[animation-play-state:paused] w-max"
                            style={{ animation: 'premium-scroll 460s linear infinite' }}
                        >
                            {repeatedStores.map((store, i) => {
                                const provinceCode = (() => {
                                    const p = store.province || "";
                                    const map: Record<string, string> = {
                                        "Alberta": "AB", "British Columbia": "BC", "Manitoba": "MB", "New Brunswick": "NB",
                                        "Newfoundland and Labrador": "NL", "Nova Scotia": "NS", "Ontario": "ON",
                                        "Prince Edward Island": "PE", "Quebec": "QC", "Saskatchewan": "SK",
                                        "Northwest Territories": "NT", "Nunavut": "NU", "Yukon": "YT"
                                    };
                                    return map[p] || (p.length === 2 ? p.toUpperCase() : "CA");
                                })();

                                return (
                                    <span
                                        key={`${store.id}-${i}`}
                                        className="group relative flex items-center select-none cursor-pointer transition-opacity duration-300 hover:opacity-80"
                                        onClick={() => navigateToStoreCoordinates(store.id)}
                                    >
                                        <div className="flex items-center min-w-max">
                                            {/* Subtle Separator Dot */}
                                            <div className="w-1 h-1 bg-slate-300/80 rounded-full mx-4 shrink-0"></div>
                                            
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className="font-medium tracking-tight text-slate-500 text-[14px] 2xl:text-[15px]"
                                                >
                                                    {store.name}
                                                </span>
                                                {/* Direction Arrow - Diagonal and close */}
                                                <ArrowUpRight className="w-3 h-3 text-slate-400/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                                            </div>
                                        </div>
                                    </span>
                                );
                            })}
                        </div>
                    </div>


                </div>
            </div>




            {/* Quick Look Modal Removed - Direct Navigation Implemented */}
        </>
    );
}
