import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";


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
            <div
                className="w-full pt-4 pb-24 overflow-hidden font-sans relative z-10 flex items-center justify-center bg-transparent"
            >
                <div className="boutique-width w-full mx-auto flex items-center h-[50px] md:h-[60px] relative">



                    {/* Infinite Scroll Ticker */}
                    <div
                        className="flex flex-1 overflow-hidden group/marquee px-4 h-full items-center"
                        style={{ maskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)' }}
                    >
                        <div className="flex animate-marquee whitespace-nowrap items-center min-w-full hover:[animation-play-state:paused]">
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
                                        className="group relative mx-8 flex items-center gap-3 select-none cursor-pointer text-[#0A2540]/40 transition-colors duration-300 hover:text-[#0A2540]"
                                        onClick={() => navigateToStoreCoordinates(store.id)}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400/80 shadow-[0_0_8px_rgba(148,163,184,0.3)] shrink-0" />

                                        <div className="flex flex-col items-start justify-center">
                                            <span
                                                className="font-medium tracking-tight transition-all duration-300 mb-0.5"
                                                style={{ fontSize: '14px' }}
                                            >
                                                {store.name}
                                            </span>
                                            <span
                                                className="font-medium transition-all duration-300"
                                                style={{ fontSize: 'clamp(13px, 0.9vw, 15px)' }}
                                            >
                                                {store.city || 'Location'}, {provinceCode}
                                            </span>
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
