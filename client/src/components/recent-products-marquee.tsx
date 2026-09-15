import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function RecentProductsMarquee() {
    const { t } = useI18n();

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
        return <div className="h-[200px] flex items-center justify-center bg-transparent rounded-[20px] overflow-hidden">
            <div className="w-full px-8 flex gap-6 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 w-64 bg-slate-100/50 rounded-2xl animate-pulse shrink-0" />
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
                className="w-full pt-8 pb-24 overflow-hidden font-sans relative z-10 flex items-center justify-center bg-transparent"
            >
                <div className="w-full mx-auto flex items-center h-[50px] md:h-[60px] relative">
                    {/* Gradient Fade Masks */}
                    <div className="absolute left-0 top-0 w-16 md:w-32 h-full bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
                    <div className="absolute right-0 top-0 w-16 md:w-32 h-full bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />
                    
                    {/* Infinite Scroll Ticker */}
                    <div
                        className="flex flex-1 overflow-hidden group/marquee h-full items-center relative"
                    >
                        <div
                            className="flex whitespace-nowrap items-center group-hover/marquee:[animation-play-state:paused] w-max"
                            style={{ animation: 'premium-scroll 460s linear infinite' }}
                        >
                            {repeatedStores.map((store, i) => {
                                return (
                                    <span
                                        key={`${store.id}-${i}`}
                                        className="group relative flex items-center select-none cursor-pointer transition-opacity duration-300 hover:opacity-80 pr-10"
                                        onClick={() => navigateToStoreCoordinates(store.id)}
                                    >
                                        <div className="flex items-center min-w-max">
                                            <div className="flex items-center gap-6">
                                                <span
                                                    className="font-medium tracking-tight text-slate-500 text-[10px] min-[1440px]:text-[12px] min-[1670px]:text-[13px]"
                                                >
                                                    {store.name}
                                                </span>
                                                {/* Hairline Divider */}
                                                <div className="w-[1px] h-3.5 bg-slate-300/60 shrink-0"></div>
                                            </div>
                                        </div>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
