import { MapPin, ChevronDown, ArrowRight, Search, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import heroFlagsBlend from "@/assets/flags_bg.png";
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

    return (
        <>
        <div className="flex flex-col h-auto md:min-h-[calc(100vh-81px)] 2xl:min-h-[calc(100vh-108px)] min-[1670px]:min-h-[calc(100vh-108px)] bg-white justify-between">
        <section
            className="flex-1 relative z-10 w-full max-w-[1920px] mx-auto overflow-hidden font-sans flex items-start pt-3 mt-[4vh] animate-in fade-in duration-700 bg-white"
        >

            {/* Soft Atmospheric Sky Glow - Luminous White (Clean Refresh) */}
            <div className="absolute top-[-6%] left-[-4%] w-[250px] h-[210px] md:top-[-15%] md:left-0 md:w-[800px] md:h-[700px] bg-white rounded-full blur-[92px] md:blur-[160px] opacity-[0.78] md:opacity-[0.38] lg:opacity-[0.44] min-[768px]:max-[1439px]:opacity-[0.52] min-[768px]:max-[1439px]:w-[600px] pointer-events-none z-[4]"></div>



            {/* Ambient Reading Glow - Radial anchored top-left to avoid masking Vancouver pin */}
            <div
                className="absolute left-[-10%] top-[-4%] w-[64%] h-[26%] md:left-[-12%] md:top-[-15%] md:w-[65%] max-[1669px]:md:w-[76%] md:h-[75%] pointer-events-none z-[6]"
                style={{
                    background: "var(--hero-ambient-glow, radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.76) 22%, rgba(255,255,255,0.34) 42%, rgba(255,255,255,0.08) 58%, transparent 72%))",
                }}
            />

            {/* Upper Airlight - keeps the headline readable */}
            <div
                className="absolute left-[8%] top-[6%] w-[34%] h-[26%] pointer-events-none z-[7] hidden md:block"
                style={{
                    background: "radial-gradient(ellipse at 46% 34%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.1) 24%, transparent 68%)",
                }}
            />

            {/* Center Bridge - luminous handoff into the map */}
            <div
                className="absolute inset-y-0 left-[15%] w-[50%] max-[1669px]:w-[62%] pointer-events-none z-[8] hidden md:block"
                style={{
                    background: "var(--hero-center-bridge, linear-gradient(to right, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 20%, transparent 80%))",
                }}
            />

            {/* Bottom Edge Melt */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-t from-white/30 to-transparent pointer-events-none z-10" />

            <div
                className="hidden md:max-[1439px]:block absolute bottom-0 inset-x-0 h-[35%] pointer-events-none z-[5]"
                style={{
                    background: "linear-gradient(to top, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                }}
            />
            <div className="absolute inset-x-0 bottom-0 h-[44%] bg-white pointer-events-none z-[8] md:hidden" />

            {/* National Anchor Ribbon - Aligned with Logo Divider */}
            {/* We recreate the exact boutique-width wrapper hierarchy to perfectly align with the header across all breakpoints */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-[9]">
                <div className="boutique-width h-full relative">
                    <div className="min-[1280px]:max-[1669px]:pl-[clamp(68.4px,4.75vw,87.4px)] min-[1670px]:pl-[clamp(49.4px,3.42vw,68.4px)] h-full relative">
                        <div 
                            className="hidden md:block absolute w-[2.1px] ml-[1.3px]"
                            style={{
                                top: '2%',
                                bottom: '23%',
                                background: '#FFD700',
                                opacity: 0.6,
                                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                            }}
                            aria-hidden="true"
                        />
                        <div 
                            className="hidden md:block absolute w-[2.1px] ml-[clamp(15.3px,1.615vw,29.75px)]"
                            style={{
                                top: '12%',
                                bottom: '13%',
                                background: '#0057B7',
                                opacity: 0.80,
                                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                            }}
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </div>

            <div className="boutique-width w-full flex items-center relative z-30 h-full pointer-events-none">
                <div className="px-[22.8px] md:px-[38px] lg:px-[60.8px] min-[1280px]:max-[1669px]:px-[clamp(68.4px,4.75vw,87.4px)] min-[1670px]:px-[clamp(49.4px,3.42vw,68.4px)] w-full">
                    <div className="hero-canopy-safe-content relative z-20 w-full max-w-full md:max-w-[520px] lg:max-w-2xl h-full flex flex-col justify-center items-start pointer-events-none bg-white pb-[11.75rem] md:bg-transparent md:py-[4.8rem]">
                    <div className="relative z-10 flex w-full flex-col items-start">
                        <div className="relative w-full min-[1280px]:max-[1669px]:pt-[clamp(30px,3.5vw,60px)] min-[1670px]:pt-[clamp(110px,10vw,175px)]">
                            <div className="relative z-10 flex flex-col items-start hero-text-align transition-transform duration-300 -translate-y-[5vh] md:ml-[clamp(67.4px,6.74vw,93.8px)] min-[1280px]:max-[1669px]:ml-[clamp(107.8px,8.08vw,134.8px)] min-[1670px]:ml-[clamp(93.8px,6.04vw,117.3px)]">

                                

                                {/* Flag Pill Language Toggle - Eyebrow above headline */}

                                <h1
                                    className="relative z-10 w-full max-w-[calc(100vw-2.5rem)] md:max-w-none leading-[1.04] md:leading-[1.08] min-[1670px]:leading-[1.08] antialiased pointer-events-auto mb-6"
                                    style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                                >
                                    <span className="flex items-baseline gap-[0.3em] font-['Lora'] text-[clamp(2.16rem,8.8vw,2.68rem)] md:text-[2.82rem] min-[1500px]:text-[3.17rem] min-[1670px]:text-[3.87rem] font-medium tracking-[-0.03em] text-[#0057B7]">
                                        Discover

                                    </span>
                                    <span className="block font-['Lora'] text-[clamp(2.16rem,8.8vw,2.68rem)] md:text-[2.82rem] min-[1500px]:text-[3.17rem] min-[1670px]:text-[3.87rem] font-medium tracking-[-0.03em] text-[#0057B7] md:whitespace-nowrap relative">
                                        <span className="relative inline-block">Ukrainian</span>
                                        {" "}Products
                                    </span>
                                    <span className="block font-['Inter'] text-[clamp(1.36rem,6.16vw,1.8rem)] md:text-[1.94rem] min-[1500px]:text-[2.2rem] min-[1670px]:text-[2.64rem] font-normal tracking-[-0.03em] md:whitespace-nowrap text-slate-600 opacity-[0.80]">
                                        sold across{" "}
                                        <span className="relative inline-block">
                                            Canada
                                        </span>
                                    </span>
                                </h1>

                                <p
                                    className="text-[17px] md:text-[18px] text-slate-500 leading-relaxed max-w-lg font-normal tracking-tight pointer-events-auto font-['Inter'] mb-9"
                                >
                                    Find stores selling products made in Ukraine near you
                                </p>

                                {/* CTA Row - Left Aligned To Header Branding Text */}
                                <div
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 w-full md:w-auto pointer-events-auto"
                                >
                                    <Link href="/map" className="w-full md:w-auto self-start">
                                        <button
                                            className="group/cta-btn relative inline-flex items-center justify-center h-[52px] px-6 text-[16px] font-medium tracking-tight rounded-[32px] bg-[#FFD700] text-slate-950 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_12px_32px_-8px_rgba(255,215,0,0.45)] hover:shadow-[0_20px_48px_-12px_rgba(255,215,0,0.55)] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/30 font-['Inter'] antialiased pointer-events-auto w-full md:w-auto"
                                        >
                                            <span>Explore the Map</span>
                                            <ArrowUpRight 
                                                className="w-5 h-5 ml-2.5 transition-transform duration-300 group-hover/cta-btn:translate-x-1" 
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
                                        className="group relative flex items-center gap-2 text-[14px] font-normal text-slate-600 transition-all duration-300 hover:text-[#0057B7] font-['Inter']"
                                    >
                                        <span>How it works</span>
                                        <ChevronDown className="w-4 h-4 text-current transition-transform duration-300 group-hover:translate-y-0.5" />
                                        <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-slate-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                    </Link>
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



            {/* Desktop Peeking Map Container - FULL BLEED LIVE MAP */}
            <div className="hidden md:block absolute top-[5%] right-0 w-[59%] bottom-0 z-20 select-none overflow-hidden border-none outline-none">
                <div
                    className="w-full h-full group/map-peeking border-none outline-none"
                    aria-label="Interactive map of Ukrainian stores in Canada"
                    style={{ 
                        maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.01) 8%, rgba(0,0,0,0.27) 18%, rgba(0,0,0,0.77) 32%, black 50%, black 85%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.01) 8%, rgba(0,0,0,0.27) 18%, rgba(0,0,0,0.77) 32%, black 50%, black 85%, transparent 100%)' 
                    }}
                >
                    {/* Inner wrapper for shifted map content */}
                    <div
                        className="absolute top-0 left-0 w-full h-[140%] border-none outline-none scale-[1.0] translate-x-[0%] translate-y-[0%] md:scale-[1.06] md:translate-x-[8%] md:translate-y-[-38%] lg:scale-[1.11] lg:translate-x-[14%] lg:translate-y-[-36%] min-[1280px]:max-[1669px]:scale-[1.15] min-[1280px]:max-[1669px]:translate-x-[6%] min-[1280px]:max-[1669px]:translate-y-[-34%] min-[1670px]:scale-[1.12] min-[1670px]:translate-x-[6%] min-[1670px]:translate-y-[-32%] transition-all duration-700 ease-out"
                    >
                        <div className="relative w-full h-full pointer-events-auto border-none outline-none">
                            <div className="absolute top-0 inset-x-0 h-[70%] bg-gradient-to-b from-white via-white/95 via-white/80 via-white/40 via-white/10 to-transparent pointer-events-none z-[50]" />
                            <div className="absolute right-0 inset-y-0 w-1/3 bg-gradient-to-l from-white via-white/95 via-white/40 to-transparent pointer-events-none z-[60]" />
                            <div className="absolute top-0 right-0 w-[45%] h-[45%] bg-[radial-gradient(circle_at_top_right,white_0%,white_40%,rgba(255,255,255,0.7)_60%,rgba(255,255,255,0.2)_80%,transparent_100%)] pointer-events-none z-[70]" />



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
                    {/* Bottom Fade - pinned to actual container floor, independent of map translation */}
                    <div className="absolute bottom-0 inset-x-0 h-[18%] bg-gradient-to-t from-white via-white/80 via-white/30 to-transparent pointer-events-none z-[80]" />
                    {/* Frosted Glass Bridge */}
                    <div className="absolute bottom-0 inset-x-0 h-[48px] bg-white/10 backdrop-blur-[12px] z-[85] border-t border-white/20 pointer-events-none" />
                </div>
            </div>
            {/* Desktop Trust Pillars - Anchored to Macro-Grid Right Boundary */}
            <div className="hidden lg:flex pointer-events-none absolute inset-x-0 top-[9%] z-30">
                <div className="boutique-width w-full mx-auto">
                    <div className="px-[22.8px] md:px-[38px] lg:px-[60.8px] min-[1280px]:max-[1669px]:px-[clamp(68.4px,4.75vw,87.4px)] min-[1670px]:px-[clamp(49.4px,3.42vw,68.4px)] w-full">
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
                                    <span className="shrink-0 text-[11px] uppercase tracking-[0.22em] font-bold text-[#0057B7] group-hover:tracking-[0.24em] whitespace-nowrap font-['Inter'] transition-all duration-500 antialiased">
                                        {pillar.title}
                                    </span>
                                </div>
                                <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:grid-rows-[1fr] group-hover:opacity-100">
                                    <div className="overflow-hidden">
                                        <div className="hero-trust-pill-detail flex flex-col items-end pt-3 pb-2 px-4 mt-1 bg-white/70 backdrop-blur-sm rounded-none opacity-0 transition-opacity duration-300 delay-0 group-hover:opacity-100 group-hover:delay-100">
                                            <div className="flex items-center justify-end text-[14.5px] text-[#0057B7]/80 leading-relaxed font-medium text-right font-['Inter']">
                                                <span className="max-w-[500px] tracking-[0.0125em] whitespace-pre-wrap group-hover:whitespace-nowrap">{pillar.detail}</span>
                                                <span className="shrink-0 ml-4 text-[#0057B7]/40">–</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>





        {/* Live Submissions Marquee Row — Combined label and ticker */}
        <div className="hidden md:block z-20 mt-auto py-4 w-full relative -translate-y-1/2">
            <div className="boutique-width">
                <div className="px-[22.8px] md:px-[38px] lg:px-[60.8px] min-[1280px]:max-[1669px]:px-[clamp(68.4px,4.75vw,87.4px)] min-[1670px]:px-[clamp(49.4px,3.42vw,68.4px)] transition-all duration-300">
                    <div className="flex h-full items-center justify-between gap-6">
                    <div className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm z-10 text-[11px] text-[#0057B7] font-medium antialiased">
                        <div className="relative flex h-[5px] w-[5px]">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-[5px] w-[5px] bg-[#FFD700]"></span>
                        </div>
                        <span className="whitespace-nowrap font-['Inter'] tracking-wider">
                            ADDED THIS MONTH
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
                                            <span className="text-[15px] font-medium text-slate-500 tabular-nums font-['Inter'] whitespace-nowrap antialiased">
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
