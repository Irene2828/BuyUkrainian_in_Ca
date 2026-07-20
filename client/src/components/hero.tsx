import { ChevronDown, Search } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Suspense, lazy, useCallback, useEffect, useState, useRef, type MouseEvent } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import wheatFieldBg from "@/assets/golden_wheat_sunset.png";
import mapleLeafIcon from "@/assets/maple_leaf.png";
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

const HERO_TICKER_LIFT_STYLE = { transform: "translateY(-96%)" };


export function Hero() {
    const [, setLocation] = useLocation();
    const [shouldRenderHeroMap, setShouldRenderHeroMap] = useState(false);
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
            accentClass: "border-[#0057B7]/70",
            surfaceClass: "bg-[#EFF6FF]/70",
            dotClass: "bg-[#0057B7]",
        },
        {
            title: "Volunteer-Verified Listings",
            detail: "every listing is reviewed before it appears on the map",
            accentClass: "border-[#0057B7]/70",
            surfaceClass: "bg-[#FFFBEB]/80",
            dotClass: "bg-[#FFD700]",
        },
        {
            title: "Updated Regularly",
            detail: "real people, real stores, real Ukrainian products",
            accentClass: "border-[#0057B7]/70",
            surfaceClass: "bg-[#EFF6FF]/70",
            dotClass: "bg-[#0057B7]",
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
    const blueWidth = '63%';

    const handleHowItWorksClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (heroVariant === "b") {
        return (
            <HeroVariantB
                stores={stores}
                shouldRenderHeroMap={shouldRenderHeroMap}
                trustPillars={trustPillars}
                onHowItWorksClick={handleHowItWorksClick}
            />
        );
    }

    return (
        <>
                <div className="flex flex-col h-auto md:min-h-[calc(85vh-81px)] bg-[#0057B7] md:bg-transparent justify-between relative">
        <section
            className="flex-1 relative z-10 w-full max-w-[1920px] mx-auto overflow-hidden font-sans flex items-start pt-0 mt-0 animate-in fade-in duration-700"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[80] hidden h-px bg-[linear-gradient(90deg,rgba(0,87,183,0.14)_0%,rgba(0,87,183,0.18)_32%,rgba(255,255,255,0.18)_52%,rgba(255,255,255,0.26)_100%)] md:block" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 bottom-[4rem] z-[80] hidden h-px bg-[linear-gradient(90deg,rgba(0,87,183,0.16)_0%,rgba(0,87,183,0.2)_32%,rgba(255,255,255,0.16)_52%,rgba(255,255,255,0.24)_100%)] md:block" aria-hidden="true" />
            <div className="md:hidden relative w-full overflow-hidden bg-white font-['Inter']">
                <div className="relative overflow-hidden bg-[#0057B7] px-5 pt-6 pb-6 text-white [@media(max-height:700px)]:pt-5 [@media(max-height:700px)]:pb-5">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(0,87,183,0)_46%)]" />
                    <div className="relative z-10">
                        <div className="mb-4 h-[10px] pointer-events-none" aria-hidden="true" />

                        <h1
                            className="relative z-10 max-w-full text-[clamp(2.05rem,10.4vw,2.85rem)] font-[900] uppercase leading-[0.94] tracking-normal antialiased [@media(max-height:700px)]:text-[2.2rem]"
                            style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                        >
                            {["DISCOVER", "UKRAINIAN", "PRODUCTS"].map((line) => (
                                <span
                                    key={line}
                                className={cn(
                                    "block text-transparent",
                                    line === "PRODUCTS" && "relative w-fit pb-3"
                                )}
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
                                {line === "PRODUCTS" && (
                                    <>
                                        <span className="pointer-events-none absolute left-0 bottom-[4px] h-[2px] w-[92%] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_12%,rgba(255,215,0,0.9)_78%,rgba(255,215,0,0)_100%)]" aria-hidden="true" />
                                        <span className="pointer-events-none absolute left-[4%] bottom-0 h-px w-[54%] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_16%,rgba(255,215,0,0.78)_74%,rgba(255,215,0,0)_100%)]" aria-hidden="true" />
                                    </>
                                )}
                            </span>
                        ))}
                        </h1>

                        <div className="mt-3 flex items-center text-[clamp(1.32rem,6.2vw,1.75rem)] font-normal leading-tight tracking-normal text-white/92 [@media(max-height:700px)]:text-[1.25rem]">
                            sold across Canada
                            <img src={mapleLeafIcon} alt="" className="ml-2 inline-block h-[1.64em] w-[1.64em]" style={{ filter: 'brightness(0) invert(1) opacity(0.9)' }} aria-hidden="true" />
                        </div>

                        <div className="mt-5 grid gap-2.5 [@media(max-height:700px)]:mt-4" style={{ transform: 'translateY(12px)' }}>
                            <Link href="/map" className="pointer-events-auto">
                                <button className="group/cta-btn relative inline-flex h-[46px] w-full items-center justify-center rounded-none bg-white/92 px-5 text-[16px] font-medium tracking-normal text-[#0057B7] shadow-none transition-all duration-300 hover:scale-[1.02] hover:bg-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/35">
                                    <span>Find stores near me</span>
                                    <Search className="ml-2.5 h-5 w-5 text-current transition-transform duration-300 group-hover/cta-btn:scale-110" strokeWidth={1.5} />
                                </button>
                            </Link>

                            <Link
                                href="/#how-it-works"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="pointer-events-auto inline-flex h-10 w-full items-center justify-center gap-2 border border-white/30 bg-white/[0.06] text-[14px] font-medium tracking-normal text-white/88 transition-all duration-300 hover:border-white/55 hover:bg-white/[0.11] hover:text-white active:scale-[0.98]"
                            >
                                <span>How it works</span>
                                <ChevronDown className="h-4 w-4 text-current" />
                            </Link>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-2 [@media(max-height:700px)]:gap-1.5">
                            {trustPillars.map((pillar) => (
                                <div key={`mobile-${pillar.title}`} className="flex items-center gap-2.5 text-white/82">
                                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#FFD700]" aria-hidden="true" />
                                    <span className="min-w-0 text-[11px] font-medium leading-snug tracking-normal">
                                        {pillar.title}
                                    </span>
                                </div>
                            ))}
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
                                <div className="pointer-events-none absolute inset-0 scale-[1.28] translate-x-[6%] translate-y-[-8%]">
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
            <div className="hidden md:block absolute top-0 right-0 bottom-[4rem] bg-[#0057B7] z-[25]" style={{ width: blueWidth, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            <div className="hidden md:block absolute top-0 left-0 w-full bottom-[4rem] bg-white z-[-2]" />
            <div className="boutique-width hidden md:flex w-full items-center relative z-30 h-full pointer-events-none">
                <div className="w-full flex justify-start pl-[38%]">
                    <div className="hero-canopy-safe-content relative z-20 w-full max-w-full md:max-w-[520px] lg:max-w-2xl h-full flex flex-col justify-center items-start pointer-events-none pb-[11.75rem] md:py-[4.8rem] min-[1670px]:translate-y-[10%]">
                    <div className="relative z-10 flex w-full flex-col items-start">
                        <div className="relative w-full min-[1280px]:pt-[clamp(30px,3.5vw,60px)]">
                            <div className="relative z-10 flex flex-col items-start w-fit hero-text-align transition-transform duration-300 mt-[5vh] -translate-y-[5vh] md:ml-[28px] lg:ml-[36px] xl:ml-[42px]">
                                    <div className="mb-[24px] h-[10px] pointer-events-none" aria-hidden="true" />
                                    <h1
                                        ref={h1Ref}
                                        className="relative z-10 w-fit max-w-[calc(100vw-2.5rem)] md:max-w-none leading-[0.95] md:leading-[0.95] min-[1670px]:leading-[0.95] antialiased mb-6 md:mb-10 text-white uppercase font-bold text-left"
                                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                                    >
                                        <span 
                                            className="block font-['Inter'] font-[900] text-[clamp(2.5rem,8.8vw,3.5rem)] md:text-[3.2rem] lg:text-[4rem] tracking-[-0.02em] mb-0 text-transparent"
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
                                                className="relative block w-fit pb-4 font-['Inter'] font-[900] text-[clamp(2.5rem,8.8vw,3.5rem)] md:text-[3.2rem] lg:text-[3.82rem] tracking-[-0.02em] mb-2 whitespace-nowrap text-transparent"
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
                                                <span className="pointer-events-none absolute left-0 bottom-[7px] h-[2px] w-[92%] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_12%,rgba(255,215,0,0.9)_78%,rgba(255,215,0,0)_100%)]" aria-hidden="true" />
                                                <span className="pointer-events-none absolute left-[4%] bottom-[2px] h-px w-[54%] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_16%,rgba(255,215,0,0.78)_74%,rgba(255,215,0,0)_100%)]" aria-hidden="true" />
                                            </span>
                                        </div>
                                    </h1>
                                    
                                    {/* Subline and CTA Wrapper */}
                                    <div className="flex w-full flex-col items-end self-start mt-[-2.2rem] md:mt-[-3.2rem] mb-6 md:mb-10 gap-4">
                                        <span className="relative z-10 flex items-center self-end font-['Inter'] text-[clamp(1.56rem,5.2vw,1.95rem)] md:text-[1.8rem] lg:text-[2.34rem] font-normal tracking-[-0.01em] opacity-90 normal-case text-white">
                                            sold across Canada 
                                            <img src={mapleLeafIcon} alt="" className="inline-block w-[1.6em] h-[1.6em] ml-[0.3em]" style={{ filter: 'brightness(0) invert(1) opacity(0.9)' }} aria-hidden="true" />
                                        </span>
                                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center self-end w-full md:w-auto relative z-20 pointer-events-auto" style={{ transform: 'translateY(8vh)' }}>
                                            <Link href="/map" className="w-full md:w-auto self-end">
                                                <button
                                                    className="group/cta-btn relative inline-flex items-center justify-center h-[46px] 2xl:h-[54px] px-6 text-[16px] 2xl:text-[17px] font-medium tracking-normal rounded-none bg-white/90 hover:bg-white text-[#0057B7] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-none hover:shadow-none focus:shadow-none focus:outline-none focus:ring-2 focus:ring-white/30 font-['Inter'] antialiased pointer-events-auto w-full md:w-auto"
                                                >
                                                    <span>Find stores near me</span>
                                                    <Search 
                                                        className="w-5 h-5 2xl:w-6 2xl:h-6 ml-2.5 text-[#0057B7] transition-transform duration-300 group-hover/cta-btn:scale-110" 
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

            <div className="hidden md:block absolute top-0 left-0 w-[50%] bottom-[4rem] z-20 select-none overflow-hidden border-none outline-none">
                <div
                    className="w-full h-full group/map-peeking border-none outline-none relative"
                    aria-label="Interactive map of Ukrainian stores in Canada"
                    style={{ 
                        maskImage: 'linear-gradient(to left, transparent 0%, rgba(0,0,0,0.01) 8%, rgba(0,0,0,0.27) 18%, rgba(0,0,0,0.77) 32%, black 50%, black 100%)',
                        WebkitMaskImage: 'linear-gradient(to left, transparent 0%, rgba(0,0,0,0.01) 8%, rgba(0,0,0,0.27) 18%, rgba(0,0,0,0.77) 32%, black 50%, black 100%)' 
                    }}
                >
                    <div
                        className="pointer-events-none absolute inset-0 z-[75] bg-[linear-gradient(90deg,rgba(0,87,183,0.18)_0%,rgba(0,87,183,0.12)_46%,rgba(0,87,183,0.22)_100%)] mix-blend-multiply"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute bottom-0 left-0 z-[76] h-[34%] w-[58%] bg-[radial-gradient(ellipse_90%_80%_at_0%_100%,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.12)_38%,rgba(255,255,255,0)_72%)]"
                        aria-hidden="true"
                    />
                    {/* Fixed Viewport Overlays - Water Color Bridge to White Header */}
                    <div className="absolute top-0 inset-x-0 h-[78px] md:h-[72px] xl:h-[64px] bg-gradient-to-b from-[#c8dff0]/95 via-[#c8dff0]/58 to-transparent xl:from-[#c8dff0]/68 xl:via-[#c8dff0]/32 pointer-events-none z-[60]" />
                    <div className="absolute top-0 left-0 h-[48%] w-[28%] bg-[radial-gradient(ellipse_100%_90%_at_0%_0%,rgba(200,223,240,0.58)_0%,rgba(200,223,240,0.24)_45%,rgba(255,255,255,0)_78%)] pointer-events-none z-[60]" />
                    <div className="absolute top-0 left-0 w-[78%] h-[330px] md:h-[270px] xl:h-[210px] bg-[radial-gradient(ellipse_100%_100%_at_top_left,_#c8dff0_0%,_#c8dff0_24%,_rgba(200,223,240,0.5)_40%,_transparent_64%)] xl:bg-[radial-gradient(ellipse_100%_100%_at_top_left,_rgba(200,223,240,0.62)_0%,_rgba(200,223,240,0.28)_28%,_transparent_52%)] pointer-events-none z-[70]" />
                    <div
                        className="absolute right-0 top-0 h-[58%] w-[46%] bg-[linear-gradient(270deg,rgba(0,87,183,0.6)_0%,rgba(0,87,183,0.32)_34%,rgba(73,143,203,0.14)_62%,rgba(255,255,255,0)_100%)] mix-blend-multiply pointer-events-none z-[66]"
                        style={{
                            maskImage: 'linear-gradient(to bottom, black 0%, black 46%, rgba(0,0,0,0.54) 68%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 46%, rgba(0,0,0,0.54) 68%, transparent 100%)'
                        }}
                    />
                    <div className="absolute right-0 top-0 h-[62%] w-[54%] bg-[radial-gradient(ellipse_86%_72%_at_100%_22%,rgba(0,87,183,0.22)_0%,rgba(0,87,183,0.12)_44%,rgba(200,223,240,0.06)_66%,rgba(255,255,255,0)_100%)] pointer-events-none z-[67]" />
                    <div className="absolute top-0 right-0 h-[170px] w-[72%] bg-[radial-gradient(ellipse_90%_120%_at_100%_0%,rgba(200,223,240,0.22)_0%,rgba(200,223,240,0.1)_38%,rgba(255,255,255,0)_74%)] pointer-events-none z-[68]" />
                    <div className="absolute top-0 left-0 h-[170px] w-[76%] bg-[radial-gradient(ellipse_95%_120%_at_0%_0%,rgba(237,247,253,0.48)_0%,rgba(200,223,240,0.18)_42%,rgba(255,255,255,0)_78%)] pointer-events-none z-[69]" />

                    {/* Inner wrapper for shifted map content */}
                    <div
                        className="absolute top-0 left-0 w-full h-[170%] border-none outline-none scale-[1.0] translate-x-[0%] translate-y-[0%] md:scale-[1.06] md:translate-x-[-8%] md:translate-y-[-44%] lg:scale-[1.11] lg:translate-x-[-14%] lg:translate-y-[-42%] min-[1280px]:scale-[1.15] min-[1280px]:translate-x-[-6%] min-[1280px]:translate-y-[-40%] transition-all duration-700 ease-out"
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
            {/* Desktop Trust Pillars - Anchored to Macro-Grid Right Boundary */}
            <div className="hidden lg:flex pointer-events-none absolute inset-x-0 top-[9%] z-[90]">
                <div className="boutique-width w-full mx-auto">
                    <div className="w-full">
                        <div className="flex h-full flex-col items-start gap-2">
                        {trustPillars.map((pillar) => (
                            <div
                                key={pillar.title}
                                className={cn(
                                    "group isolate flex flex-col items-start overflow-hidden px-[22px] py-2.5 border-l-[2.5px] cursor-default pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left w-fit bg-white/50 backdrop-blur-md rounded-none",
                                    pillar.accentClass,
                                    "max-w-[calc(100vw-40px)] md:max-w-[calc(100vw-300px)]"
                                )}
                            >
                                <div className="flex items-center justify-start gap-3 text-left">
                                    <span className="shrink-0 text-[11px] uppercase tracking-[0.22em] font-bold text-[#0057B7]/70 group-hover:tracking-[0.24em] whitespace-nowrap font-['Inter'] transition-all duration-500 antialiased">
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
        <div className="hidden md:block z-20 mt-auto py-4 w-full relative" style={HERO_TICKER_LIFT_STYLE}>
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
                                            <span className="text-[13.6px] min-[1670px]:text-[15.6px] font-normal text-slate-500 tabular-nums font-['Inter'] whitespace-nowrap antialiased">
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
    onHowItWorksClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}

function HeroVariantB({
    stores,
    shouldRenderHeroMap,
    trustPillars,
    onHowItWorksClick,
}: HeroVariantBProps) {
    return (
        <>
            <div className="flex flex-col h-auto md:min-h-[calc(85vh-81px)] bg-white justify-between relative">
                <section className="relative z-10 w-full max-w-[1920px] mx-auto overflow-hidden bg-white font-sans animate-in fade-in duration-700">
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-[80] hidden h-px bg-[#0057B7]/20 md:block" aria-hidden="true" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-[4rem] z-[80] hidden h-px bg-[#0057B7]/20 md:block" aria-hidden="true" />
                    <div className="md:hidden relative z-10 w-full overflow-hidden bg-white font-['Inter']">
                        <div className="relative px-5 pt-7 pb-7 text-slate-700">
                            <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[radial-gradient(ellipse_112%_94%_at_0%_0%,rgba(0,87,183,0.11)_0%,rgba(200,223,240,0.13)_38%,rgba(200,223,240,0.055)_58%,rgba(255,255,255,0)_86%)]" aria-hidden="true" />
                            <div className="relative z-10">
                                <h1 className="font-['Lora'] text-[clamp(2.55rem,11vw,3.25rem)] font-semibold leading-[1.02] tracking-normal text-[#0057B7] antialiased">
                                    <span className="block">Discover</span>
                                    <span className="block">
                                        <span className="relative inline-block pb-3">
                                            Ukrainian
                                            <span className="pointer-events-none absolute left-0 bottom-[4px] h-[2px] w-[96%] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_12%,rgba(255,215,0,0.9)_78%,rgba(255,215,0,0)_100%)]" aria-hidden="true" />
                                            <span className="pointer-events-none absolute left-[5%] bottom-0 h-px w-[56%] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_16%,rgba(255,215,0,0.78)_74%,rgba(255,215,0,0)_100%)]" aria-hidden="true" />
                                        </span>{" "}
                                        Products
                                    </span>
                                </h1>
                                <div className="mt-3 flex items-center text-[clamp(1.45rem,6.8vw,1.95rem)] font-normal leading-tight tracking-normal text-slate-600">
                                    sold across Canada
                                    <img src={mapleLeafIcon} alt="" className="ml-2 inline-block h-[1.52em] w-[1.52em]" aria-hidden="true" />
                                </div>
                                <div className="mt-5 grid gap-2.5" style={{ transform: 'translateY(12px)' }}>
                                    <Link href="/map" className="pointer-events-auto">
                                        <button className="group/cta-btn relative inline-flex h-[46px] w-full items-center justify-center rounded-none border border-[#FFD700] bg-[#FFD700] px-5 text-[16px] font-medium tracking-normal text-[#0057B7] shadow-none transition-all duration-300 hover:scale-[1.02] hover:border-[#0057B7] hover:bg-[#0057B7] hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#0057B7]/30">
                                            <span>Find stores near me</span>
                                            <Search className="ml-2.5 h-5 w-5 text-current transition-transform duration-300 group-hover/cta-btn:scale-110" strokeWidth={1.5} />
                                        </button>
                                    </Link>
                                    <Link
                                        href="/#how-it-works"
                                        onClick={onHowItWorksClick}
                                        className="pointer-events-auto inline-flex h-10 w-full items-center justify-center gap-2 border border-[#0057B7]/25 bg-white/70 text-[14px] font-medium tracking-normal text-[#0057B7] transition-all duration-300 hover:border-[#0057B7] hover:bg-[#EFF6FF] active:scale-[0.98]"
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
                                        <div className="pointer-events-none absolute inset-0 scale-[1.28] translate-x-[6%] translate-y-[-8%]">
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
                        <div className="pointer-events-none absolute left-0 top-0 z-[11] h-[74%] w-[78%] bg-[radial-gradient(ellipse_96%_86%_at_0%_0%,rgba(0,87,183,0.11)_0%,rgba(200,223,240,0.13)_34%,rgba(200,223,240,0.055)_56%,rgba(255,255,255,0)_84%)]" aria-hidden="true" />
                        <div
                            className="absolute inset-y-0 right-0 z-0 w-[64%] select-none overflow-hidden"
                            aria-label="Interactive map of Ukrainian stores in Canada"
                            style={{
                                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.75) 32%, black 50%, black 100%)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.75) 32%, black 50%, black 100%)'
                            }}
                        >
                            <div className="absolute inset-0 scale-[1.08] translate-x-[4%] translate-y-[-10%]">
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
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-white via-white/78 to-transparent" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-[11] h-[190px] bg-[linear-gradient(180deg,rgba(200,223,240,0.68)_0%,rgba(200,223,240,0.3)_42%,rgba(255,255,255,0)_100%)]" />
                    </div>

                        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_92%_110%_at_0%_50%,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.94)_28%,rgba(255,255,255,0.72)_49%,rgba(255,255,255,0.24)_70%,rgba(255,255,255,0)_90%)]" />

                        <div className="hidden lg:flex pointer-events-none absolute right-[56px] top-[10%] z-30 flex-col items-end gap-2">
                            {trustPillars.map((pillar) => (
                                <div
                                    key={`b-${pillar.title}`}
                                    className={cn(
                                        "flex w-fit max-w-[520px] flex-col items-end border-r-[2.5px] bg-white/45 px-[22px] py-2.5 text-right backdrop-blur-md",
                                        pillar.accentClass
                                    )}
                                >
                                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0057B7]/70 antialiased">
                                        {pillar.title}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="boutique-width relative z-20 mx-auto flex min-h-[calc(85vh-81px)] items-center translate-y-[5vh]">
                            <div className="relative ml-[64px] w-fit max-w-[calc(100vw-160px)] pointer-events-auto lg:max-w-[760px]">
                                <h1 className="mb-6 md:mb-10 w-fit font-['Lora'] text-[clamp(3.25rem,4.7vw,4rem)] font-semibold leading-[1.03] tracking-normal text-[#0057B7] antialiased">
                                    <span className="block">Discover</span>
                                    <span className="block whitespace-nowrap">
                                        <span className="relative inline-block pb-4">
                                            Ukrainian
                                            <span className="pointer-events-none absolute left-0 bottom-[5px] h-[2px] w-[96%] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_12%,rgba(255,215,0,0.9)_78%,rgba(255,215,0,0)_100%)]" aria-hidden="true" />
                                            <span className="pointer-events-none absolute left-[5%] bottom-0 h-px w-[56%] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_16%,rgba(255,215,0,0.78)_74%,rgba(255,215,0,0)_100%)]" aria-hidden="true" />
                                        </span>{" "}
                                        Products
                                    </span>
                                </h1>
                                <div className="mt-[-2.2rem] md:mt-[-3.2rem] mb-6 md:mb-10 flex w-full flex-col items-start gap-4">
                                    <span className="relative z-10 flex items-center self-start md:self-end font-['Inter'] text-[clamp(1.9rem,2.65vw,3rem)] font-normal leading-tight tracking-normal text-slate-600">
                                        sold across Canada
                                        <img src={mapleLeafIcon} alt="" className="ml-3 inline-block h-[1.44em] w-[1.44em]" aria-hidden="true" />
                                    </span>
                                    <div className="flex items-center gap-8 self-start md:self-end relative z-20 pointer-events-auto" style={{ transform: 'translateY(8vh)' }}>
                                        <Link href="/map">
                                            <button className="group/cta-btn relative inline-flex h-[46px] items-center justify-center rounded-none border border-[#FFD700] bg-[#FFD700] px-6 text-[16px] font-medium tracking-normal text-[#0057B7] shadow-none transition-all duration-300 hover:scale-[1.02] hover:border-[#0057B7] hover:bg-[#0057B7] hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#0057B7]/30">
                                                <span>Find stores near me</span>
                                                <Search className="ml-2.5 h-5 w-5 text-current transition-transform duration-300 group-hover/cta-btn:scale-110" strokeWidth={1.5} />
                                            </button>
                                        </Link>
                                        <Link
                                            href="/#how-it-works"
                                            onClick={onHowItWorksClick}
                                            className="group relative flex items-center gap-2 text-[14px] font-medium tracking-normal text-slate-600 transition-all duration-300 hover:text-[#0057B7] font-['Inter']"
                                        >
                                            <span>How it works</span>
                                            <ChevronDown className="h-4 w-4 text-current transition-transform duration-300 group-hover:translate-y-0.5" />
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
        <div className="hidden md:block z-20 mt-auto py-4 w-full relative bg-white" style={HERO_TICKER_LIFT_STYLE}>
            <div className="boutique-width">
                <div className="transition-all duration-300 w-full">
                    <div className="flex h-full items-center justify-between gap-6">
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
                                            <span className="text-[13.6px] font-normal text-slate-500 tabular-nums font-['Inter'] whitespace-nowrap antialiased">
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
