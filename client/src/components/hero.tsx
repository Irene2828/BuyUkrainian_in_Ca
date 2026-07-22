import { ArrowUpRight, Info, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Suspense, lazy, useCallback, useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import wheatFieldBg from "@/assets/golden_wheat_sunset.png";
import mapleLeafIcon from "@/assets/maple_leaf.png";
import newHeroWhiteBg from "@/assets/meta-new.png";
import { GoogleMapsProvider } from "@/components/google-maps-provider";
import type { Store } from "@/lib/data";

// Lazy load the map to ensure fast initial page load
const InteractiveMap = lazy(() => import("@/components/interactive-map").then(module => ({ default: module.InteractiveMap })));
const noop = () => {};
const noopSelectStore = (_store?: unknown) => {};
type HeroVariant = "a" | "b";
type TrustPillar = {
    title: string;
    detail: string;
    accentClass: string;
    surfaceClass: string;
    dotClass: string;
};

const getHeroVariantFromUrl = (): HeroVariant => {
    if (typeof window === "undefined") return "a";

    const params = new URLSearchParams(window.location.search);
    const rawVariant = (params.get("hero") || params.get("variant") || params.get("ab") || "").toLowerCase();

    return rawVariant === "b" || rawVariant === "variant-b" || rawVariant === "version-b" ? "b" : "a";
};

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
    const [shouldRenderHeroMap, setShouldRenderHeroMap] = useState(true);
    const [heroVariant, setHeroVariant] = useState<HeroVariant>(() => getHeroVariantFromUrl());

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
            accentClass: "",
            surfaceClass: "bg-[#EFF6FF]/70",
            dotClass: "bg-[#0057B7]",
        },
        {
            title: "Volunteer-Verified Listings",
            detail: "every listing is reviewed before it appears on the map",
            accentClass: "",
            surfaceClass: "bg-[#FFFBEB]/80",
            dotClass: "bg-[#FFD700]",
        },
    ];

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

    const setHeroVariantInUrl = useCallback((nextVariant: HeroVariant) => {
        const nextUrl = new URL(window.location.href);

        if (nextVariant === "b") {
            nextUrl.searchParams.set("hero", "b");
        } else {
            nextUrl.searchParams.delete("hero");
        }

        window.history.replaceState({}, "", nextUrl.toString());
        setHeroVariant(nextVariant);
    }, []);

    useEffect(() => {
        const syncVariant = () => setHeroVariant(getHeroVariantFromUrl());

        window.addEventListener("popstate", syncVariant);
        return () => window.removeEventListener("popstate", syncVariant);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const isEditable =
                target?.tagName === "INPUT" ||
                target?.tagName === "TEXTAREA" ||
                target?.isContentEditable;

            if (isEditable) return;

            if (event.metaKey && event.shiftKey && event.key.toLowerCase() === "v") {
                event.preventDefault();
                setHeroVariantInUrl(heroVariant === "b" ? "a" : "b");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [heroVariant, setHeroVariantInUrl]);

    const h1Ref = useRef<HTMLHeadingElement>(null);

    if (heroVariant === "b") {
        return (
            <HeroVariantB
                stores={stores}
                shouldRenderHeroMap={shouldRenderHeroMap}
                trustPillars={trustPillars}
            />
        );
    }

    return (
        <>
                <div className="flex flex-col h-auto bg-white justify-between relative">
        <section
            className="flex-1 relative z-10 w-full max-w-[1920px] mx-auto overflow-hidden font-sans flex items-start pt-0 mt-0 md:min-h-[calc(100svh-73px)] md:py-[2.5vh] animate-in fade-in duration-700"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[80] hidden h-px bg-[linear-gradient(90deg,rgba(0,87,183,0.14)_0%,rgba(0,87,183,0.18)_32%,rgba(255,255,255,0.18)_52%,rgba(255,255,255,0.26)_100%)] md:block" aria-hidden="true" />

            <div className="md:hidden relative w-full overflow-hidden bg-white font-sans">
                <div className="relative overflow-hidden bg-[#0057B7] px-5 pt-6 pb-3 text-white [@media(max-height:700px)]:pt-5 [@media(max-height:700px)]:pb-3">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(0,87,183,0)_46%)]" />
                    <div className="relative z-10">
                        <div className="mb-4 h-[10px] pointer-events-none" aria-hidden="true" />

                        <h1
                            className="relative z-10 max-w-full text-[clamp(2.15rem,10.92vw,2.99rem)] font-[900] uppercase leading-[1.02] tracking-[0.18em] antialiased [@media(max-height:700px)]:text-[2.31rem]"
                            style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                        >
                            {["DISCOVER", "UKRAINIAN", "PRODUCTS"].map((line) => (
                                <span
                                    key={line}
                                    className="block text-transparent"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(255, 215, 0, 0.18), rgba(255, 215, 0, 0.18)), url(${wheatFieldBg})`,
                                        backgroundSize: '130%',
                                        backgroundPosition: 'center 58%',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        filter: 'brightness(1.3)'
                                    }}
                                >
                                    {line}
                                </span>
                            ))}
                        </h1>

                        <div className="mt-[5px] flex flex-col items-start gap-[2.5px] sm:flex-row sm:items-center sm:gap-2 w-fit text-[clamp(1.455rem,6.84vw,1.93rem)] font-normal leading-tight tracking-normal text-white/92 [@media(max-height:700px)]:text-[1.378rem]">
                            <span className="whitespace-nowrap">sold across Canada</span>
                            <img src={newHeroWhiteBg} alt="" className="h-[1em] w-auto shrink-0" aria-hidden="true" />
                        </div>
                        <p className="mt-2 max-w-[18rem] text-left text-[15px] font-normal leading-snug tracking-normal text-white/76">
                            One map to find, share and add new stores selling #madeinUkraine next to you.
                        </p>

                        <div className="mt-[36px] mb-4 grid gap-2.5 [@media(max-height:700px)]:mt-6" style={{ transform: 'translateY(0px)' }}>
                            <Link href="/map" className="pointer-events-auto">
                                <button className="group/cta-btn relative inline-flex h-[50px] w-full items-center justify-center rounded-none bg-white/92 px-5 text-[16px] min-[1024px]:text-[17px] xl:text-[18px] font-semibold tracking-normal text-[#0057B7] shadow-none transition-all duration-300 hover:scale-[1.02] hover:bg-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/35">
                                    <span>Find stores near me</span>
                                    <ArrowUpRight className="ml-2.5 h-5 w-5 text-current transition-transform duration-300 group-hover/cta-btn:translate-x-0.5 group-hover/cta-btn:-translate-y-0.5" strokeWidth={1.5} />
                                </button>
                            </Link>
                            <Link
                                href="/#how-it-works"
                                className="pointer-events-auto inline-flex h-10 w-full items-center justify-center gap-2 border border-white/20 bg-white/10 text-[14px] font-medium tracking-normal text-white transition-all duration-300 hover:bg-white/20 active:scale-[0.98]"
                            >
                                <span>How it works</span>
                                <ChevronDown className="h-4 w-4 text-current" />
                            </Link>
                        </div>
                    </div>
                </div>

                <Link
                    href="/map"
                    className="group/mobile-map pointer-events-auto relative block h-[42svh] min-h-[280px] max-h-[390px] w-full overflow-hidden border-y border-slate-200 bg-white [@media(max-height:700px)]:h-[260px] [@media(max-height:700px)]:min-h-[240px]"
                    aria-label="Explore the interactive map"
                >
                    {shouldRenderHeroMap && stores.length > 0 ? (
                        <GoogleMapsProvider>
                            <Suspense fallback={<div className="h-full w-full bg-[linear-gradient(180deg,#edf4fb_0%,#dbe9f5_100%)]" />}>
                                <div className="pointer-events-none absolute inset-0 scale-[1.28] translate-x-[6%] translate-y-[-4%]">
                                    <InteractiveMap
                                        stores={stores}
                                        selectedStore={null}
                                        onSelectStore={noopSelectStore}
                                        onCloseStore={noop}
                                        variant="hero"
                                        isMobile={true}
                                    />
                                </div>
                                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,transparent_34%,rgba(255,255,255,0.1)_100%)]" />
                            </Suspense>
                        </GoogleMapsProvider>
                    ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,#edf4fb_0%,#dbe9f5_100%)]" />
                    )}
                </Link>
            </div>
            <div className="hidden md:block absolute inset-x-0 top-0 bottom-0 bg-[#0057B7] z-[25]" />
            <div className="boutique-width hidden md:flex w-full items-center relative z-30 h-full pointer-events-none">
                <div className="w-full flex justify-start">
                    <div className="hero-canopy-safe-content relative z-20 w-full max-w-full md:max-w-[520px] lg:max-w-2xl h-full flex flex-col justify-center items-start pointer-events-none pb-[11.75rem] md:py-[4.8rem]">
                    <div className="relative z-10 flex w-full flex-col items-start">
                        <div className="relative w-full min-[1280px]:pt-[clamp(30px,3.5vw,60px)]">
                            <div className="relative z-10 flex flex-col items-end w-fit hero-text-align transition-transform duration-300 mt-[5vh] -translate-y-[2vh]">
                                    <h1
                                        ref={h1Ref}
                                        className="relative z-10 w-fit max-w-[calc(100vw-2.5rem)] md:max-w-none leading-[0.94] md:leading-[0.94] antialiased mb-6 md:mb-9 text-white uppercase font-bold text-right md:-translate-y-[5%]"
                                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                                    >
                                        <span 
                                            className="block w-full text-left font-sans font-[900] text-[clamp(2.5rem,8.8vw,3.5rem)] md:text-[3.04rem] lg:text-[3.8rem] tracking-[-0.005em] mb-0 text-transparent"
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
                                        <div className="md:ml-0 flex w-full justify-end">
                                            <span 
                                                className="relative block w-fit pb-4 font-sans font-[900] text-[clamp(2.5rem,8.8vw,3.5rem)] md:text-[3.04rem] lg:text-[3.63rem] tracking-[-0.005em] mb-1 whitespace-nowrap text-transparent"
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
                                    <div className="flex w-full flex-col items-end self-end mt-[-2.35rem] md:mt-[-3.55rem] mb-6 md:mb-10 gap-4">
                                        <span className="relative z-10 flex items-center self-start font-sans text-[clamp(1.638rem,5.46vw,2.0475rem)] md:text-[1.7955rem] lg:text-[2.331rem] font-normal tracking-[-0.01em] opacity-90 normal-case text-white md:-translate-y-[10%] gap-3">
                                            sold across Canada 
                                            <img src={newHeroWhiteBg} alt="" className="inline-block h-[1em] w-auto" aria-hidden="true" />
                                        </span>
                                        <p className="relative z-10 max-w-none self-start text-left font-sans text-[18px] font-normal leading-snug tracking-normal text-white/76 md:whitespace-nowrap">
                                            One map to find, share and add new stores selling #madeinUkraine next to you.
                                        </p>
                                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center self-start w-full md:w-auto relative z-20 pointer-events-auto" style={{ transform: 'translateY(calc(4vh - 8px))' }}>
                                            <Link href="/map" className="w-full md:w-auto self-start">
                                                <button
                                                    className="group/cta-btn relative inline-flex items-center justify-center h-[50px] min-[1670px]:h-[56px] px-6 min-[1670px]:px-8 text-[16px] min-[1024px]:text-[17px] xl:text-[18px] min-[1670px]:text-[19px] font-semibold tracking-normal rounded-none bg-white/90 hover:bg-white text-[#0057B7] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-none hover:shadow-none focus:shadow-none focus:outline-none focus:ring-2 focus:ring-white/30 font-sans antialiased pointer-events-auto w-full md:w-auto"
                                                >
                                                    <span>Find stores near me</span>
                                                    <ArrowUpRight 
                                                        className="w-5 h-5 ml-2.5 text-[#0057B7] transition-transform duration-300 group-hover/cta-btn:translate-x-0.5 group-hover/cta-btn:-translate-y-0.5" 
                                                        strokeWidth={1.5}
                                                    />
                                                </button>
                                            </Link>
                                            <Link
                                                href="/#how-it-works"
                                                className="group inline-flex h-[46px] min-[1670px]:h-[50px] items-center justify-center gap-2 bg-transparent px-0 text-[15px] min-[1670px]:text-[16px] font-medium tracking-normal text-white/72 transition-colors duration-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 font-sans antialiased"
                                            >
                                                <Info className="h-4 w-4 text-current" strokeWidth={1.5} />
                                                <span>How it works</span>
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
                                                <span className="text-[11px] leading-none font-medium tracking-tight text-slate-500 font-sans whitespace-nowrap">
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

            {/* Yellow offset backing block under/behind the map card */}
            <div className="hidden md:block absolute right-[12px] top-[calc(50%+16px)] h-[58%] w-[42%] min-[1440px]:right-[23px] min-[1440px]:w-[39.25%] bottom-auto z-30 -translate-y-1/2 bg-[#FFD700]" />

            <div className="hidden md:block absolute right-[28px] top-1/2 h-[58%] w-[42%] min-[1440px]:right-[43px] min-[1440px]:w-[39.25%] bottom-auto z-40 -translate-y-1/2 select-none border-none outline-none group/map-peeking">
                <div
                    className="w-full h-full border-none outline-none relative overflow-hidden bg-white shadow-[3px_6px_24px_-2px_rgba(0,87,183,0.14),1px_2px_8px_rgba(0,0,0,0.07)]"
                    aria-label="Interactive map of Ukrainian stores in Canada"
                >
                    <div
                        className="pointer-events-none absolute inset-0 z-[75] bg-[linear-gradient(135deg,rgba(255,255,255,0.36)_0%,rgba(255,255,255,0.10)_38%,rgba(255,255,255,0)_58%,rgba(0,87,183,0.06)_100%)]"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute inset-0 z-[80] shadow-[inset_0_0_34px_rgba(255,255,255,0.92),inset_0_0_0_1px_rgba(255,255,255,0.46)]"
                        aria-hidden="true"
                    />

                    {/* Inner wrapper for shifted map content */}
                    <div
                        className="absolute top-0 left-0 w-[122%] h-[150%] border-none outline-none scale-[1.0] translate-x-[0%] translate-y-[-1%] md:scale-[1.12] md:translate-x-[-17%] md:translate-y-[-27%] lg:scale-[1.18] lg:translate-x-[-20%] lg:translate-y-[-26%] min-[1280px]:scale-[1.2] min-[1280px]:translate-x-[-16%] min-[1280px]:translate-y-[-25%] group-hover/map-peeking:md:scale-[1.18] group-hover/map-peeking:lg:scale-[1.24] group-hover/map-peeking:min-[1280px]:scale-[1.26] transition-all duration-700 ease-out"
                    >
                        <div className="relative w-full h-full pointer-events-auto border-none outline-none">



                            {/* AURORA OVERLAY */}
                            <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none opacity-0">
                                <div className="absolute top-[25%] right-[45%] w-[350px] h-[150px] bg-[#0057B7] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                                <div className="absolute top-[50%] right-[30%] w-[350px] h-[150px] bg-[#FFD900] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                            </div>

                            {shouldRenderHeroMap ? (
                                <GoogleMapsProvider>
                                    <Suspense fallback={<div className="w-full h-full bg-white animate-pulse" />}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 1 }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1.03
                                            }}
                                            transition={{ 
                                                opacity: { duration: 1.2, ease: "easeOut" },
                                                scale: { duration: 1.2, ease: "easeOut" }
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
            {/* Desktop Trust Pillars - Anchored to the right-side map frame */}
            <div className="hidden lg:flex pointer-events-none absolute right-[28px] top-[calc(50%-29%+24px)] z-[90] w-[42%] min-[1440px]:right-[43px] min-[1440px]:w-[39.25%]">
                <div className="w-full">
                    <div className="w-full">
                        <div className="flex h-full flex-col items-end gap-2 pr-6">
                        {trustPillars.map((pillar) => (
                            <div
                                key={pillar.title}
                                className={cn(
                                    "group isolate flex flex-col items-end overflow-hidden px-[22px] py-2.5 cursor-default pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-right w-fit bg-white/60 backdrop-blur-md rounded-none shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.015)]",
                                    pillar.accentClass,
                                    "max-w-[calc(100vw-40px)] md:max-w-[calc(100vw-300px)]"
                                )}
                            >
                                <div className="flex items-center justify-end gap-3 text-right">
                                    <span className="shrink-0 w-3 h-[2px] bg-[#0057B7]/40" />
                                    <span className="shrink-0 text-right text-[11px] uppercase tracking-[0.22em] font-bold text-[#0057B7]/70 group-hover:tracking-[0.24em] whitespace-nowrap font-sans transition-all duration-500 antialiased">
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
        <div className="hidden md:block z-20 mt-auto py-4 w-full relative bg-white -translate-y-[18%]">
            <div className="boutique-width">
                <div className="transition-all duration-300 w-full">
                    <div className="flex h-full items-center justify-between gap-6">
                        {/* "ADDED RECENTLY" Label */}
                        <div className="shrink-0 flex items-center z-10 select-none">
                            <span className="text-[11px] min-[1670px]:text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#D9A300] font-sans whitespace-nowrap antialiased">
                                ADDED RECENTLY
                            </span>
                        </div>

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
                                            <span className="text-[13.6px] min-[1670px]:text-[15.6px] font-normal text-slate-500 tabular-nums font-sans whitespace-nowrap antialiased">
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

interface HeroVariantBProps {
    stores: Store[];
    shouldRenderHeroMap: boolean;
    trustPillars: TrustPillar[];
}

function HeroVariantB({
    stores,
    shouldRenderHeroMap,
    trustPillars,
}: HeroVariantBProps) {
    return (
        <>
            <div className="flex flex-col h-auto bg-white justify-between relative">
                <section className="relative z-10 w-full max-w-[1920px] mx-auto overflow-hidden bg-white font-sans animate-in fade-in duration-700">
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-[80] hidden h-px bg-[#0057B7]/20 md:block" aria-hidden="true" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-[4rem] z-[80] hidden h-px bg-[#0057B7]/20 md:block" aria-hidden="true" />

                    <div className="md:hidden relative z-10 w-full overflow-hidden bg-white font-sans">
                        <div className="relative px-5 pt-7 pb-3.5 text-slate-700">
                            <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[radial-gradient(ellipse_112%_94%_at_0%_0%,rgba(0,87,183,0.11)_0%,rgba(200,223,240,0.13)_38%,rgba(200,223,240,0.055)_58%,rgba(255,255,255,0)_86%)]" aria-hidden="true" />
                            <div className="relative z-10">
                                <h1 className="font-['Lora'] text-[clamp(2.55rem,11vw,3.25rem)] font-semibold leading-[1.02] tracking-normal text-[#0057B7] antialiased">
                                    <span className="block">Discover</span>
                                    <span className="block">
                                        Ukrainian Products
                                    </span>
                                </h1>
                                <div className="mt-[5px] flex flex-col items-start gap-[2.5px] sm:flex-row sm:items-center sm:gap-2 w-fit text-[clamp(1.598rem,7.5vw,2.15rem)] font-normal leading-tight tracking-normal text-slate-600">
                                    <span className="whitespace-nowrap">sold across Canada</span>
                                    <img src={newHeroWhiteBg} alt="" className="h-[1em] w-auto shrink-0" aria-hidden="true" />
                                </div>
                                <p className="mt-2 max-w-[18rem] text-left text-[15px] font-normal leading-snug tracking-normal text-slate-600">
                                    One map to find, share and add new stores selling #madeinUkraine next to you.
                                </p>
                                <div className="mt-[36px] mb-4 grid gap-2.5" style={{ transform: 'translateY(0px)' }}>
                                    <Link href="/map" className="pointer-events-auto">
                                            <button className="group/cta-btn relative inline-flex h-[50px] w-full items-center justify-center rounded-none border border-[#FFD700] bg-[#FFD700] px-5 text-[16px] min-[1024px]:text-[17px] xl:text-[18px] font-semibold tracking-normal text-[#0057B7] shadow-none transition-all duration-300 hover:scale-[1.02] hover:border-[#0057B7] hover:bg-[#0057B7] hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#0057B7]/30">
                                                <span>Find stores near me</span>
                                                <ArrowUpRight className="ml-2.5 h-5 w-5 text-current transition-transform duration-300 group-hover/cta-btn:translate-x-0.5 group-hover/cta-btn:-translate-y-0.5" strokeWidth={1.5} />
                                            </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/map"
                            className="group/mobile-map pointer-events-auto relative block h-[42svh] min-h-[280px] max-h-[390px] w-full overflow-hidden border-y border-slate-200 bg-white [@media(max-height:700px)]:h-[260px] [@media(max-height:700px)]:min-h-[240px]"
                            aria-label="Explore the interactive map"
                        >
                            {shouldRenderHeroMap && stores.length > 0 ? (
                                <GoogleMapsProvider>
                                    <Suspense fallback={<div className="h-full w-full bg-[linear-gradient(180deg,#edf4fb_0%,#dbe9f5_100%)]" />}>
                                        <div className="pointer-events-none absolute inset-0 scale-[1.28] translate-x-[6%] translate-y-[-4%]">
                                            <InteractiveMap
                                                stores={stores}
                                                selectedStore={null}
                                                onSelectStore={noopSelectStore}
                                                onCloseStore={noop}
                                                variant="hero"
                                                isMobile={true}
                                            />
                                        </div>
                                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,transparent_34%,rgba(255,255,255,0.1)_100%)]" />
                                    </Suspense>
                                </GoogleMapsProvider>
                            ) : (
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,#edf4fb_0%,#dbe9f5_100%)]" />
                            )}
                        </Link>
                    </div>

                    <div className="hidden md:block relative z-10 min-h-[calc(85vh-81px)] overflow-hidden bg-white">
                        <div className="pointer-events-none absolute left-0 top-0 z-[11] h-[78%] w-[86%] bg-[radial-gradient(ellipse_106%_92%_at_0%_0%,rgba(0,87,183,0.07)_0%,rgba(200,223,240,0.08)_36%,rgba(200,223,240,0.035)_62%,rgba(255,255,255,0)_88%)]" aria-hidden="true" />
                        <div
                            className="absolute inset-y-0 right-0 z-0 w-[64%] select-none overflow-hidden group/map-peeking"
                            aria-label="Interactive map of Ukrainian stores in Canada"
                            style={{
                                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.75) 32%, black 50%, black 100%)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.75) 32%, black 50%, black 100%)'
                            }}
                        >
                            <div className="absolute inset-0 scale-[1.08] translate-x-[4%] translate-y-[-6%] group-hover/map-peeking:scale-[1.14] transition-all duration-700 ease-out">
                                {shouldRenderHeroMap ? (
                                    <GoogleMapsProvider>
                                        <Suspense fallback={<div className="h-full w-full bg-white animate-pulse" />}>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 1 }}
                                                animate={{ opacity: 1, scale: 1.02 }}
                                                transition={{
                                                    opacity: { duration: 1.2, ease: "easeOut" },
                                                    scale: { duration: 1.2, ease: "easeOut" }
                                                }}
                                                className="h-full w-full cursor-pointer pointer-events-auto will-change-transform"
                                            >
                                                <Link href="/map" className="block h-full w-full">
                                                    <InteractiveMap
                                                        stores={stores}
                                                        selectedStore={null}
                                                        onSelectStore={noopSelectStore}
                                                        onCloseStore={noop}
                                                        variant="hero"
                                                        isMobile={false}
                                                    />
                                                </Link>
                                            </motion.div>
                                        </Suspense>
                                    </GoogleMapsProvider>
                                ) : (
                                    <div className="h-full w-full bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(219,234,254,0.25)_100%)]" />
                                )}
                            </div>
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-[44%] bg-gradient-to-r from-white via-white/72 to-transparent" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-[11] h-[210px] bg-[linear-gradient(180deg,rgba(255,255,255,0.46)_0%,rgba(226,238,248,0.2)_46%,rgba(255,255,255,0)_100%)]" />
                        
                        <Link href="/map" className="absolute bottom-6 left-1/2 z-[85] -translate-x-1/2">
                            <button className="group/cta-btn relative inline-flex h-[50px] min-[1670px]:h-[56px] items-center justify-center whitespace-nowrap rounded-none border border-[#FFD700] bg-[#FFD700] px-6 min-[1670px]:px-8 text-[16px] min-[1024px]:text-[17px] xl:text-[18px] min-[1670px]:text-[19px] font-semibold tracking-normal text-[#0057B7] shadow-none transition-all duration-300 hover:scale-[1.02] hover:border-[#0057B7] hover:bg-[#0057B7] hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#0057B7]/30">
                                <span>Find stores near me</span>
                                <ArrowUpRight className="ml-2.5 h-5 w-5 text-current transition-transform duration-300 group-hover/cta-btn:translate-x-0.5 group-hover/cta-btn:-translate-y-0.5" strokeWidth={1.5} />
                            </button>
                        </Link>
                    </div>

                        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_96%_112%_at_0%_50%,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.93)_27%,rgba(255,255,255,0.68)_48%,rgba(255,255,255,0.2)_68%,rgba(255,255,255,0)_88%)]" />

                        <div className="hidden lg:flex pointer-events-none absolute right-[56px] top-[10%] z-30 flex-col items-end gap-2">
                            {trustPillars.map((pillar) => (
                                <div
                                    key={`b-${pillar.title}`}
                                    className={cn(
                                        "flex w-fit max-w-[520px] flex-col items-end bg-white/55 px-[22px] py-2.5 text-right backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.015)]",
                                        pillar.accentClass
                                    )}
                                >
                                    <div className="flex items-center justify-end gap-3 text-right">
                                        <span className="shrink-0 w-3 h-[2px] bg-[#0057B7]/40" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0057B7]/70 antialiased">
                                            {pillar.title}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="boutique-width relative z-20 mx-auto flex min-h-[calc(85vh-81px)] items-center translate-y-0">
                            <div className="relative ml-[64px] w-fit max-w-[calc(100vw-160px)] pointer-events-auto lg:max-w-[760px]">
                                {/* Golden stroke ornament — above Discover, left-aligned */}
                                <div className="pointer-events-none self-start mb-[18px] flex flex-col items-start gap-[4px]" aria-hidden="true">
                                    <span className="block h-[2px] w-[200px] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_12%,rgba(255,215,0,0.9)_78%,rgba(255,215,0,0)_100%)]" />
                                    <span className="block h-px w-[110px] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_16%,rgba(255,215,0,0.78)_74%,rgba(255,215,0,0)_100%)]" />
                                </div>
                                <h1 className="mb-6 md:mb-10 w-fit font-['Lora'] text-[clamp(3.25rem,4.7vw,4rem)] font-semibold leading-[1.03] tracking-normal text-[#0057B7] antialiased md:-translate-y-[5%]">
                                    <span className="block">Discover</span>
                                    <span className="block whitespace-nowrap">
                                        <span className="relative inline-block pb-4">
                                            Ukrainian
                                        </span>{" "}
                                        Products
                                    </span>
                                </h1>
                                <div className="mt-[-2.2rem] md:mt-[-3.2rem] mb-6 md:mb-10 flex w-full flex-col items-start gap-4">
                                    <span className="relative z-10 flex items-center self-start font-sans text-[clamp(1.995rem,2.7825vw,3.15rem)] font-normal leading-tight tracking-normal text-slate-600 md:-translate-y-[10%] gap-3">
                                        sold across Canada
                                        <img src={newHeroWhiteBg} alt="" className="inline-block h-[1em] w-auto" aria-hidden="true" />
                                    </span>
                                    <p className="relative z-10 max-w-none self-start text-left font-sans text-[18px] font-normal leading-snug tracking-normal text-slate-600 md:whitespace-nowrap">
                                        One map to find, share and add new stores selling #madeinUkraine next to you.
                                    </p>
                                    <div className="flex md:hidden items-center gap-8 self-start relative z-20 pointer-events-auto" style={{ transform: 'translateY(13vh)' }}>
                                        <Link href="/map">
                                            <button className="group/cta-btn relative inline-flex h-[50px] items-center justify-center rounded-none border border-[#FFD700] bg-[#FFD700] px-6 text-[16px] min-[1024px]:text-[17px] xl:text-[18px] font-semibold tracking-normal text-[#0057B7] shadow-none transition-all duration-300 hover:scale-[1.02] hover:border-[#0057B7] hover:bg-[#0057B7] hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#0057B7]/30">
                                                <span>Find stores near me</span>
                                                <ArrowUpRight className="ml-2.5 h-5 w-5 text-current transition-transform duration-300 group-hover/cta-btn:translate-x-0.5 group-hover/cta-btn:-translate-y-0.5" strokeWidth={1.5} />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <HeroTickerRow stores={stores} />
            </div>
        </>
    );
}

function HeroTickerRow({ stores }: { stores: Store[] }) {
    return (
        <div className="hidden md:block z-20 mt-auto py-4 w-full relative bg-white -translate-y-[18%]">
            <div className="boutique-width">
                <div className="transition-all duration-300 w-full">
                    <div className="flex h-full items-center justify-between gap-6">
                        {/* "ADDED RECENTLY" Label */}
                        <div className="shrink-0 flex items-center z-10 select-none">
                            <span className="text-[11px] min-[1670px]:text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#D9A300] font-sans whitespace-nowrap antialiased">
                                ADDED RECENTLY
                            </span>
                        </div>
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
                                    {[...stores.slice(0, 10), ...stores.slice(0, 10)].map((store, i) => (
                                        <div key={`b-${store.id}-${i}`} className="flex items-center px-10 shrink-0 group/ticker-item cursor-pointer">
                                            <span className="text-[13.6px] min-[1670px]:text-[15.6px] font-normal text-slate-500 tabular-nums font-sans whitespace-nowrap antialiased">
                                                {store.name}
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
