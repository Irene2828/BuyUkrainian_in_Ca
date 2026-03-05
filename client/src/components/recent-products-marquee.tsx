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
                className="w-full pt-3 pb-12 overflow-hidden font-sans relative z-20 flex items-center justify-center backdrop-blur-sm"
            >
                <div className="boutique-width w-full mx-auto flex items-center h-[50px] md:h-[60px] relative">



                    {/* Infinite Scroll Ticker */}
                    <div
                        className="flex flex-1 overflow-hidden group/marquee px-4 h-full items-center"
                        style={{ maskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)' }}
                    >
                        <div className="flex animate-marquee whitespace-nowrap items-center min-w-full">
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
                                        className="group relative mx-8 flex items-center gap-3 select-none cursor-pointer"
                                        onClick={() => navigateToStoreCoordinates(store.id)}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0] shadow-[0_0_8px_rgba(226,232,240,0.6)] shrink-0" />

                                        <div className="flex flex-col items-start justify-center transition-opacity duration-200 ease-out group-hover:opacity-70">
                                            <span
                                                className="font-medium tracking-[-0.02em] text-[#1A1A19]/60 leading-[1.2] mb-0.5"
                                                style={{ fontSize: 'clamp(16px, 1.2vw, 18px)' }}
                                            >
                                                {store.name}
                                            </span>
                                            <span
                                                className="font-medium text-[#555555]/80 leading-[1.2]"
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
