import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Link, useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export function RecentProductsMarquee() {
    const { t } = useI18n();
    const [location] = useLocation();


    // Hover Tracking State
    const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | number | undefined>(undefined);
    // Initial coords to prevent 0,0 slide
    const [initialCoords, setInitialCoords] = useState<{ top: number, left: number } | null>(null);
    const [hoveredStore, setHoveredStore] = useState<any | null>(null);

    const isHome = location === "/";



    // Continuous Tracking Effect (Syncs overlay position with moving marquee)
    useEffect(() => {
        if (!hoveredElement) return;

        let animationFrameId: number;

        const updatePosition = () => {
            if (hoveredElement && overlayRef.current) {
                const rect = hoveredElement.getBoundingClientRect();

                // Logic: Centered Above
                // Image is 75px wide, 101px tall
                // Left = rect.left + (rect.width / 2) - (75 / 2)
                // Top = rect.top - 101 - 12 (gap)

                const top = rect.top - 101 - 10;
                const left = rect.left + (rect.width / 2) - (75 / 2);

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
        staleTime: Infinity,
    });

    if (isLoading || stores.length === 0) return null;

    // Duplicate stores to create seamless loop
    const repeatedStores = Array(10).fill(stores).flat();



    const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>, store: any) => {
        // Only show preview if store has an image
        const imageToUse = store.image || store.images?.[0];

        if (imageToUse) {
            // Calculate initial position immediately to prevent slide from 0,0
            const rect = e.currentTarget.getBoundingClientRect();
            const top = rect.top - 101 - 10;
            const left = rect.left + (rect.width / 2) - (75 / 2);

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
                className="w-full py-3.5 overflow-hidden font-sans bg-white relative z-20"
            >
                <div className="max-w-7xl mx-auto flex items-center h-[50px] md:h-[60px] relative px-6 md:px-12">

                    {/* Fixed Live Label */}
                    <div className="sticky left-0 z-30 py-2 pr-20 flex items-center gap-3 h-full">
                        {/* Glass gradient background for label to mask marquee behind it */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-transparent pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-premium-pulse shrink-0" />
                            <span className="text-[12px] md:text-[13px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                                New Findings
                            </span>
                        </div>
                    </div>

                    {/* Infinite Scroll Ticker - REMOVED group-hover pause class to allow moving overlay */}
                    <div className="flex flex-1 overflow-hidden mask-ticker group/marquee px-4">
                        <div className="flex animate-marquee whitespace-nowrap items-center min-w-full">
                            {repeatedStores.map((store, i) => (
                                <span
                                    key={`${store.id}-${i}`}
                                    className="group relative text-[14px] md:text-[16px] font-medium text-slate-900 hover:text-slate-900 mx-6 flex items-center gap-2.5 select-none cursor-pointer transition-colors duration-300 ease-in-out"
                                    onClick={() => window.open(`/map?store=${encodeURIComponent(store.name)}`, '_blank')}
                                    onMouseEnter={(e) => handleMouseEnter(e, store)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {/* Identity Dot: 10px, Split 50/50, Opacity 60->100 */}
                                    <span
                                        className="w-[10px] h-[10px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                                        style={{ background: 'linear-gradient(to bottom, #0057B7 50%, #FFD700 50%)' }}
                                    />
                                    {store.name}
                                </span>
                            ))}
                        </div>
                    </div>


                </div>
            </div>

            {/* Fixed Hover Preview Overlay */}
            {hoveredElement && initialCoords && (
                <div
                    ref={overlayRef}
                    className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-300"
                    style={{
                        top: initialCoords.top,
                        left: initialCoords.left
                    }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-black/5 blur-md rounded-[10px]" />
                        <img
                            src={hoveredStore?.previewImage}
                            alt={hoveredStore?.name}
                            className="relative w-[75px] h-[101px] rounded-[10px] object-cover border-[2px] border-white shadow-lg bg-gray-100"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
