import { MapPin, ChevronDown, ArrowRight, Search, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Suspense, lazy, useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import heroFlagsBlend from "@/assets/flags_bg.png";
import wheatFieldBg from "@/assets/golden_wheat_sunset.png";
import mapleLeafIcon from "@/assets/maple_leaf.png";
import { GoogleMapsProvider } from "@/components/google-maps-provider";

// Lazy load the map to ensure fast initial page load
const InteractiveMap = lazy(() => import("@/components/interactive-map").then(module => ({ default: module.InteractiveMap })));
const noop = () => {};
const noopSelectStore = (_store?: unknown) => {};
const PROVINCE_STRIP = [
    { label: "British Columbia", abbr: "BC" },
    { label: "Alberta", abbr: "AB" },
    { label: "Manitoba", abbr: "MB" },
    { label: "Ontario", abbr: "ON" },
    { label: "Quebec", abbr: "QC" },
    { label: "Nova Scotia", abbr: "NS" },
];
const PROVINCE_NAME_TO_ABBR: Record<string, string> = {
    Alberta: "AB",
    "British Columbia": "BC",
    Manitoba: "MB",
    "New Brunswick": "NB",
    "Newfoundland and Labrador": "NL",
    "Nova Scotia": "NS",
    Ontario: "ON",
    "Prince Edward Island": "PE",
    Quebec: "QC",
    Saskatchewan: "SK",
    "Northwest Territories": "NT",
    Nunavut: "NU",
    Yukon: "YT",
};


export function Hero() {
    const [, setLocation] = useLocation();
    const [shouldRenderHeroMap, setShouldRenderHeroMap] = useState(false);

    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const trustPillars = [
        {
            title: "Local support of Ukraine's economy",
            detail: "every purchase goes directly to Ukrainian makers",
            accentClass: "border-[#FFD700]",
            surfaceClass: "bg-[#EFF6FF]/70",
            dotClass: "bg-[#0057B7]",
        },
        {
            title: "Volunteer-Verified Listings",
            detail: "every listing is reviewed before it appears on the map",
            accentClass: "border-[#0057B7]",
            surfaceClass: "bg-[#FFFBEB]/80",
            dotClass: "bg-[#FFD700]",
        },
        {
            title: "Updated Regularly",
            detail: "real people, real stores, real Ukrainian products",
            accentClass: "border-[#FFD700]",
            surfaceClass: "bg-[#EFF6FF]/70",
            dotClass: "bg-[#0057B7]",
        },
    ];

    const provinceCounts = useMemo(() => {
        return stores.reduce<Record<string, number>>((counts, store) => {
            const normalizedProvince = store.province.trim();
            const provinceAbbr =
                PROVINCE_NAME_TO_ABBR[normalizedProvince] ||
                normalizedProvince.toUpperCase();

            counts[provinceAbbr] = (counts[provinceAbbr] ?? 0) + 1;
            return counts;
        }, {});
    }, [stores]);

    const mobileTeaserStores = useMemo(() => {
        const validStores = stores.filter((store) => {
            return Array.isArray(store.coordinates)
                && Number.isFinite(store.coordinates[0])
                && Number.isFinite(store.coordinates[1]);
        });

        const preferredStore = validStores.find((store) => {
            const province = store.province.trim().toUpperCase();
            return province === "ON" || province === "ONTARIO" || province === "QC" || province === "QUEBEC";
        });

        return preferredStore ? [preferredStore] : validStores.slice(0, 1);
    }, [stores]);

    useEffect(() => {
        const win = window as Window & {
            requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
            cancelIdleCallback?: (handle: number) => void;
        };

        if (win.requestIdleCallback) {
            const idleId = win.requestIdleCallback(() => {
                setShouldRenderHeroMap(true);
            }, { timeout: 900 });

            return () => {
                win.cancelIdleCallback?.(idleId);
            };
        }

        const timeoutId = window.setTimeout(() => {
            setShouldRenderHeroMap(true);
        }, 220);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, []);

    const textRef = useRef<HTMLDivElement>(null);
    const [blueWidth, setBlueWidth] = useState('60%');

    useEffect(() => {
        const updateWidth = () => {
            if (textRef.current) {
                const rect = textRef.current.getBoundingClientRect();
                const symmetricalWidth = rect.left + rect.width + rect.left;
                const requiredWidth = (symmetricalWidth * 1.09) + 9; // Extended by 9% + 9px
                setBlueWidth(`${requiredWidth}px`);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    return (
        <>
                <div className="flex flex-col h-auto md:min-h-[calc(85vh-81px)] 2xl:min-h-[calc(85vh-108px)] min-[1670px]:min-h-[calc(85vh-108px)] bg-[#0057B7] md:bg-transparent justify-between relative">
        <section
            className="flex-1 relative z-10 w-full max-w-[1920px] mx-auto overflow-hidden font-sans flex items-start pt-0 mt-0 animate-in fade-in duration-700"
        >
            <div className="hidden md:block absolute top-0 left-0 bottom-[calc(4rem+6.5px)] bg-[#0057B7] z-[25]" style={{ width: blueWidth, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            <div className="hidden md:block absolute top-0 right-0 w-full bottom-[calc(4rem+6.5px)] bg-white z-[-2]" />

            <div className="boutique-width w-full flex items-center relative z-30 h-full pointer-events-none">
                <div className="w-full">
                    <div ref={textRef} className="hero-canopy-safe-content relative z-20 w-full max-w-full md:max-w-[520px] lg:max-w-2xl h-full flex flex-col justify-center items-start pointer-events-none pb-[11.75rem] md:py-[4.8rem]">
                    <div className="relative z-10 flex w-full flex-col items-start">
                        <div className="relative w-full min-[1280px]:max-[1669px]:pt-[clamp(30px,3.5vw,60px)] min-[1670px]:pt-[clamp(121px,11vw,192px)]">
                            <div className="relative z-10 flex flex-col items-start w-fit hero-text-align transition-transform duration-300 mt-[5vh] md:ml-[50px] lg:ml-[65px] xl:ml-[75px] md:-translate-x-[10%]">
                                    <h1
                                        className="relative z-10 w-full max-w-[calc(100vw-2.5rem)] md:max-w-none leading-[0.95] md:leading-[0.95] min-[1670px]:leading-[0.95] antialiased mb-6 md:mb-10 text-white uppercase font-bold"
                                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                                    >
                                        <span 
                                            className="block font-['Inter'] font-[900] text-[clamp(2.5rem,8.8vw,3.5rem)] md:text-[3.2rem] lg:text-[4rem] min-[1500px]:text-[4.5rem] min-[1670px]:text-[5rem] tracking-[-0.02em] mb-0 text-transparent"
                                            style={{ 
                                                backgroundImage: `linear-gradient(rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.2)), url(${wheatFieldBg})`,
                                                backgroundSize: '120%',
                                                backgroundPosition: 'center 60%',
                                                WebkitBackgroundClip: 'text',
                                                backgroundClip: 'text',
                                                color: 'transparent',
                                                filter: 'brightness(1.3)'
                                            }}
                                        >
                                            DISCOVER
                                        </span>
                                        <div className="md:ml-0">
                                            <span 
                                                className="block font-['Inter'] font-[900] text-[clamp(2.5rem,8.8vw,3.5rem)] md:text-[3.2rem] lg:text-[4rem] min-[1500px]:text-[4.5rem] min-[1670px]:text-[5rem] tracking-[-0.02em] mb-2 whitespace-nowrap text-transparent"
                                                style={{ 
                                                    backgroundImage: `linear-gradient(rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.2)), url(${wheatFieldBg})`,
                                                    backgroundSize: '120%',
                                                    backgroundPosition: 'center 60%',
                                                    WebkitBackgroundClip: 'text',
                                                    backgroundClip: 'text',
                                                    color: 'transparent',
                                                    filter: 'brightness(1.3)'
                                                }}
                                            >
                                                UKRAINIAN PRODUCTS
                                            </span>
                                        </div>
                                    </h1>
                                    
                                    {/* Subline and CTA Wrapper */}
                                    <div className="flex flex-col items-start self-start w-full mt-[-2.2rem] md:mt-[-3.2rem] mb-6 md:mb-10 gap-4">
                                        <span className="relative z-10 flex items-center self-start md:self-end font-['Inter'] text-[clamp(1.56rem,5.2vw,1.95rem)] md:text-[1.8rem] lg:text-[2.34rem] min-[1500px]:text-[2.6rem] font-normal tracking-[-0.01em] opacity-90 normal-case text-white">
                                            sold across Canada 
                                            <img src={mapleLeafIcon} alt="" className="inline-block w-[0.8em] h-[0.8em] ml-[0.3em]" style={{ filter: 'brightness(0) invert(1) opacity(0.9)' }} aria-hidden="true" />
                                        </span>
                                        <div className="flex flex-col md:flex-row gap-4 items-center self-start md:self-start w-full md:w-auto relative z-20 pointer-events-auto">
                                            <Link href="/map" className="w-full md:w-auto self-start">
                                                <button
                                                    className="group/cta-btn relative inline-flex items-center justify-center h-[52px] px-6 text-[16px] font-medium tracking-tight rounded-none bg-white/80 hover:bg-white/90 text-[#0057B7] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-none hover:shadow-none focus:shadow-none focus:outline-none focus:ring-2 focus:ring-white/30 font-['Inter'] antialiased pointer-events-auto w-full md:w-auto"
                                                >
                                                    <span>Explore the Map</span>
                                                    <ArrowUpRight 
                                                        className="w-5 h-5 ml-2.5 text-[#0057B7] transition-transform duration-300 group-hover/cta-btn:translate-x-1" 
                                                        strokeWidth={1.5}
                                                    />
                                                </button>
                                            </Link>
                                            
                                            <Link
                                                href="/#how-it-works"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="group relative flex items-center gap-2 text-[14px] font-normal text-white/90 transition-all duration-300 hover:text-white font-['Inter']"
                                            >
                                                <span>How it works</span>
                                                <ChevronDown className="w-4 h-4 text-current transition-transform duration-300 group-hover:translate-y-0.5" />
                                                <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                            </Link>
                                        </div>
                                    </div>


                                <div className="md:hidden mt-6 flex w-[calc(100%+1rem)] gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar pr-[8.5rem] pb-1 pointer-events-auto">
                                    {trustPillars.map((pillar) => (
                                        <div
                                            key={`mobile-${pillar.title}`}
                                            className="snap-start shrink-0 bg-transparent px-0.5 py-1"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className={cn("h-2 w-2 rounded-full", pillar.dotClass)} aria-hidden="true" />
                                                <span className="text-[11px] leading-none font-medium tracking-tight text-slate-500 font-['Inter'] whitespace-nowrap">
                                                    {pillar.title}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            </div>

            <Link
                href="/map"
                className="md:hidden [@media(max-height:450px)]:hidden absolute bottom-4 right-[-1rem] z-[12] block h-36 w-36 overflow-hidden rounded-full border border-white/90 bg-white shadow-lg ring-1 ring-slate-200/80 pointer-events-auto"
                aria-label="Explore the interactive map"
            >
                <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                    {shouldRenderHeroMap && mobileTeaserStores.length > 0 ? (
                        <GoogleMapsProvider>
                            <Suspense fallback={<div className="h-full w-full bg-[linear-gradient(180deg,#edf4fb_0%,#dbe9f5_100%)]" />}>
                                <div className="pointer-events-none absolute inset-0 scale-[1.4] translate-x-[8%] translate-y-[10%]">
                                    <InteractiveMap
                                        stores={mobileTeaserStores}
                                        selectedStore={null}
                                        onSelectStore={noopSelectStore}
                                        onCloseStore={noop}
                                        variant="hero"
                                        isMobile={true}
                                    />
                                </div>
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_34%_30%,rgba(255,255,255,0.22)_0%,transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.24)_0%,transparent_42%,rgba(255,255,255,0.16)_100%)]" />
                            </Suspense>
                        </GoogleMapsProvider>
                    ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,#edf4fb_0%,#dbe9f5_100%)]" />
                    )}
                </div>
            </Link>



            <div className="hidden md:block absolute top-0 right-0 w-[50%] bottom-[4rem] z-20 select-none overflow-hidden border-none outline-none">
                <div
                    className="w-full h-full group/map-peeking border-none outline-none relative"
                    aria-label="Interactive map of Ukrainian stores in Canada"
                    style={{ 
                        maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.01) 8%, rgba(0,0,0,0.27) 18%, rgba(0,0,0,0.77) 32%, black 50%, black 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.01) 8%, rgba(0,0,0,0.27) 18%, rgba(0,0,0,0.77) 32%, black 50%, black 100%)' 
                    }}
                >
                    {/* Fixed Viewport Overlays - Water Color Bridge to White Header */}
                    <div className="absolute top-0 inset-x-0 h-[60px] md:h-[50px] xl:h-[40px] bg-gradient-to-b from-[#c8dff0]/85 via-[#c8dff0]/40 to-transparent xl:from-[#c8dff0]/30 xl:via-[#c8dff0]/10 pointer-events-none z-[60]" />
                    <div className="absolute right-0 inset-y-0 w-[15%] bg-gradient-to-l from-[#c8dff0]/50 via-[#c8dff0]/10 to-transparent pointer-events-none z-[60]" />
                    <div className="absolute top-0 right-0 w-[75%] h-[300px] md:h-[240px] xl:h-[180px] bg-[radial-gradient(ellipse_100%_100%_at_top_right,_#c8dff0_0%,_#c8dff0_20%,_rgba(200,223,240,0.4)_35%,_transparent_60%)] xl:bg-[radial-gradient(ellipse_100%_100%_at_top_right,_rgba(200,223,240,0.4)_0%,_rgba(200,223,240,0.15)_20%,_transparent_45%)] pointer-events-none z-[70]" />

                    {/* Inner wrapper for shifted map content */}
                    <div
                        className="absolute top-0 left-0 w-full h-[140%] border-none outline-none scale-[1.0] translate-x-[0%] translate-y-[0%] md:scale-[1.06] md:translate-x-[8%] md:translate-y-[-38%] lg:scale-[1.11] lg:translate-x-[14%] lg:translate-y-[-36%] min-[1280px]:max-[1669px]:scale-[1.15] min-[1280px]:max-[1669px]:translate-x-[6%] min-[1280px]:max-[1669px]:translate-y-[-34%] min-[1670px]:scale-[1.12] min-[1670px]:translate-x-[6%] min-[1670px]:translate-y-[-32%] transition-all duration-700 ease-out"
                    >
                        <div className="relative w-full h-full pointer-events-auto border-none outline-none">



                            {/* AURORA OVERLAY */}
                            <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none opacity-0">
                                <div className="absolute top-[25%] right-[45%] w-[350px] h-[150px] bg-[#0057B7] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                                <div className="absolute top-[50%] right-[30%] w-[350px] h-[150px] bg-[#FFD900] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                            </div>

                            {shouldRenderHeroMap ? (
                                <GoogleMapsProvider>
                                    <Suspense fallback={<div className="w-full h-full bg-slate-50 animate-pulse" />}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 1 }}
                                            animate={{ opacity: 1, scale: 1.015 }}
                                            transition={{ 
                                                duration: 10, 
                                                ease: "easeOut",
                                                opacity: { duration: 1.2, ease: "easeOut" }
                                            }}
                                            className="w-full h-full cursor-pointer pointer-events-auto will-change-transform"
                                            onClick={() => setLocation('/map')}
                                        >
                                            <InteractiveMap
                                                stores={stores}
                                                selectedStore={null}
                                                onSelectStore={noopSelectStore}
                                                onCloseStore={noop}
                                                variant="hero"
                                                isMobile={false}
                                            />
                                        </motion.div>
                                    </Suspense>
                                </GoogleMapsProvider>
                            ) : (
                                <div className="w-full h-full bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(255,255,255,0.58)_35%,rgba(219,234,254,0.22)_100%)]" />
                            )}
                        </div>
                    </div>

                </div>
            </div>
            {/* Desktop Trust Pillars - Anchored to Macro-Grid Right Boundary */}
            <div className="hidden lg:flex pointer-events-none absolute inset-x-0 top-[9%] z-30">
                <div className="boutique-width w-full mx-auto">
                    <div className="w-full">
                        <div className="flex h-full flex-col items-end gap-2">
                        {trustPillars.map((pillar) => (
                            <div
                                key={pillar.title}
                                className={cn(
                                    "group isolate flex flex-col items-end overflow-hidden px-[22px] py-2.5 border-r-[2.5px] cursor-default pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-right w-fit bg-white/20 backdrop-blur-md rounded-none",
                                    pillar.accentClass,
                                    "max-w-[calc(100vw-40px)] md:max-w-[calc(100vw-300px)]"
                                )}
                            >
                                <div className="flex items-center justify-end gap-3 text-right">
                                    <span className="shrink-0 text-[11px] uppercase tracking-[0.22em] font-bold text-[#0057B7]/80 group-hover:tracking-[0.24em] whitespace-nowrap font-['Inter'] transition-all duration-500 antialiased">
                                        {pillar.title}
                                    </span>
                                </div>

                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>





        {/* Live Submissions Marquee Row — Combined label and ticker */}
        <div className="hidden md:block z-20 mt-auto py-4 w-full relative -translate-y-[100%] min-[1670px]:-translate-y-[20%]">
            <div className="boutique-width">
                <div className="transition-all duration-300 w-full">
                    <div className="flex h-full items-center justify-between gap-6">

                    {/* Scrolling Ticker — masked for smooth transition */}
                    <div 
                        className="flex-1 overflow-hidden pointer-events-none"
                        style={{
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 100%)',
                            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 100%)'
                        }}
                    >
                        <div className="flex whitespace-nowrap overflow-hidden">
                            <motion.div 
                                className="flex shrink-0 items-center will-change-transform"
                                initial={{ x: 0 }}
                                animate={{ x: "-50%" }}
                                transition={{ 
                                    duration: 110, 
                                    repeat: Infinity, 
                                    ease: "linear",
                                    repeatType: "loop"
                                }}
                            >
                                {[...stores.slice(0, 10), ...stores.slice(0, 10)].map((store, i) => {
                                    const provinceAbbr = PROVINCE_NAME_TO_ABBR[store.province] || store.province;
                                    return (
                                        <div key={`${store.id}-${i}`} className="flex items-center px-10 shrink-0 group/ticker-item cursor-pointer">
                                            <span className="text-[13.6px] font-normal text-slate-500 tabular-nums font-['Inter'] whitespace-nowrap antialiased">
                                                {store.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
        </div>

        </>
    );
}