import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";


export function RecentProductsMarquee() {
    const { t } = useI18n();



    // Hover Tracking State
    const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | number | undefined>(undefined);
    // Initial coords to prevent 0,0 slide
    const [initialCoords, setInitialCoords] = useState<{ top: number, left: number } | null>(null);
    const [hoveredStore, setHoveredStore] = useState<any | null>(null);



    const navigateToStoreCoordinates = (storeId: number | string) => {
        // Direct navigation to Map with query param to trigger "Teleport" focus
        window.location.assign(`/map?store=${encodeURIComponent(storeId)}`);
    };



    // Continuous Tracking Effect (Syncs overlay position with moving marquee)
    useEffect(() => {
        if (!hoveredElement) return;

        let animationFrameId: number;

        const updatePosition = () => {
            if (hoveredElement && overlayRef.current) {
                const rect = hoveredElement.getBoundingClientRect();

                // Logic: To the right, vertically centered with the element
                // Image is 75px wide, 101px tall
                // Left = rect.right + 12 (gap to the right)
                // Top = rect.top + (rect.height / 2) - (101 / 2)

                const top = rect.top + (rect.height / 2) - (101 / 2);
                const left = rect.right + 12;

                overlayRef.current.style.top = `${top}px`;
                overlayRef.current.style.left = `${left}px`;
            }
            animationFrameId = requestAnimationFrame(updatePosition);
        };

        // Start tracking loop
        animationFrameId = requestAnimationFrame(updatePosition);
        return () => cancelAnimationFrame(animationFrameId);
    }, [hoveredElement]);

    const { data: stores = [], isLoading } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: 1000 * 60 * 5, // 5 minutes fresh before re-fetching
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



    const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>, store: any) => {
        // Only show preview if store has an image
        const imageToUse = store.image || store.images?.[0];

        if (imageToUse) {
            // Calculate initial position immediately to prevent slide from 0,0
            const rect = e.currentTarget.getBoundingClientRect();
            const top = rect.top + (rect.height / 2) - (101 / 2);
            const left = rect.right + 12;

            setInitialCoords({ top, left });
            setHoveredElement(e.currentTarget);
            setHoveredStore({ ...store, previewImage: imageToUse });

            // 2 Second Timeout Logic
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setHoveredElement(null);
                setInitialCoords(null);
                setHoveredStore(null);
            }, 2000);
        }
    };

    const handleMouseLeave = () => {
        // Clear immediately on leave to keep UI clean and prevent detached elements
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHoveredElement(null);
        setInitialCoords(null);
        setHoveredStore(null);
    };

    return (
        <>
            <div
                className="w-full pt-6 pb-12 overflow-hidden font-sans relative z-20 flex items-center justify-center backdrop-blur-sm"
            >
                <div className="boutique-width w-full mx-auto flex items-center h-[50px] md:h-[60px] relative">

                    {/* Fixed Live Label */}
                    <div className="sticky left-0 z-30 py-2 pr-12 flex items-center gap-3 h-full bg-white/0">
                        {/* Glass gradient background for label to mask marquee behind it */}
                        <div className="absolute inset-0 bg-transparent pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-2.5 pl-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#CFA144] shadow-[0_0_6px_rgba(207,161,68,0.5)] shrink-0" />
                            <p className="text-[13px] font-bold tracking-[0.08em] uppercase whitespace-nowrap m-0 font-ui text-slate-900/50">
                                {t('ticker.label') || 'ADDED THIS MONTH'}
                            </p>
                        </div>
                    </div>

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
                                        onMouseEnter={(e) => handleMouseEnter(e, store)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#CFA144] shadow-[0_0_6px_rgba(207,161,68,0.5)] shrink-0" />

                                        <div className="flex flex-col items-start justify-center transition-opacity duration-200 ease-out group-hover:opacity-70">
                                            <span
                                                className="font-medium tracking-[-0.02em] text-[#1A1A19]/80 leading-[1.2] mb-0.5"
                                                style={{ fontSize: 'clamp(16px, 1.2vw, 18px)' }}
                                            >
                                                {store.name}
                                            </span>
                                            <span
                                                className="font-medium text-[#555555] leading-[1.2]"
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


            {/* Fixed Hover Preview Overlay */}
            {hoveredElement && initialCoords && (
                <div
                    ref={overlayRef}
                    className="fixed z-[9999] pointer-events-auto cursor-pointer animate-in fade-in zoom-in-95 duration-300"
                    style={{
                        top: initialCoords.top,
                        left: initialCoords.left
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hoveredStore) navigateToStoreCoordinates(hoveredStore.id);
                    }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-black/5 blur-md rounded-[10px]" />
                        <img
                            src={hoveredStore?.previewImage}
                            alt={hoveredStore?.name}
                            className="relative w-[75px] h-[101px] rounded-[10px] object-cover border-[2px] border-white shadow-lg bg-gray-100 transition-transform group-hover:scale-105"
                        />
                    </div>
                </div>
            )}

            {/* Quick Look Modal Removed - Direct Navigation Implemented */}
        </>
    );
}
