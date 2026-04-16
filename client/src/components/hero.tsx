import { MapPin, ChevronDown, ArrowRight, Search } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Suspense, lazy, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import heroFlagsBlend from "@/assets/flags-clean-transparent-960.png";
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
            title: "Support of Ukraine's Economy",
            detail: "every purchase goes directly to Ukrainian makers",
            accentClass: "border-[#0057B7]",
            surfaceClass: "bg-[#EFF6FF]/70"
        },
        {
            title: "Volunteer-Verified Listings",
            detail: "every listing is reviewed before it appears on the map",
            accentClass: "border-[#FFD700]",
            surfaceClass: "bg-[#FFFBEB]/80"
        },
        {
            title: "Updated Regularly",
            detail: "real people, real stores, real Ukrainian products",
            accentClass: "border-[#0057B7]",
            surfaceClass: "bg-[#EFF6FF]/70"
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

    return (
        <>
        <div className="flex flex-col h-auto md:h-[calc(100vh-81px)] 2xl:h-[calc(100vh-108px)] min-[1670px]:h-[calc(100vh-108px)] min-[1670px]:max-h-[820px] bg-white">
        <section
            className="flex-1 relative z-10 w-full max-w-[1920px] mx-auto overflow-hidden font-sans flex items-center animate-in fade-in duration-700 bg-white"
        >
            <img
                src={heroFlagsBlend}
                alt=""
                aria-hidden="true"
                className="absolute -top-4 -left-4 z-[5] opacity-100 pointer-events-none"
                style={{
                    width: "560px",
                    height: "auto",
                    maskImage: "radial-gradient(ellipse at 15% 15%, black 0%, transparent 115%)",
                    WebkitMaskImage: "radial-gradient(ellipse at 15% 15%, black 0%, transparent 115%)",
                }}
            />

            {/* Soft Atmospheric Sky Glow - Luminous White (Clean Refresh) */}
            <div className="absolute top-[-15%] left-0 w-[800px] h-[700px] bg-white rounded-full blur-[160px] opacity-[0.45] min-[768px]:max-[1439px]:opacity-[0.6] min-[768px]:max-[1439px]:w-[600px] pointer-events-none z-[4]"></div>

            {/* Soft Atmospheric Sky Glow - Canadian Red Hint */}
            <div
                className="absolute top-[-20%] right-0 w-[850px] h-[750px] bg-[#DA291C] rounded-full blur-[170px] opacity-[0.06] pointer-events-none z-[4]"
                style={{
                    transform: "translateX(20%)",
                }}
            />



            {/* Ambient Reading Glow - Radial anchored top-left to avoid masking Vancouver pin */}
            <div
                className="absolute left-[-12%] top-[-15%] w-[65%] max-[1669px]:w-[76%] h-[75%] pointer-events-none z-[6]"
                style={{
                    background: "var(--hero-ambient-glow, radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.76) 22%, rgba(255,255,255,0.34) 42%, rgba(255,255,255,0.08) 58%, transparent 72%))",
                }}
            />

            {/* Upper Airlight - keeps the headline readable */}
            <div
                className="absolute left-[8%] top-[6%] w-[34%] h-[26%] pointer-events-none z-[7]"
                style={{
                    background: "radial-gradient(ellipse at 46% 34%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.1) 24%, transparent 68%)",
                }}
            />

            {/* Center Bridge - luminous handoff into the map */}
            <div
                className="absolute inset-y-0 left-[15%] w-[50%] max-[1669px]:w-[62%] pointer-events-none z-[8]"
                style={{
                    background: "var(--hero-center-bridge, linear-gradient(to right, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 20%, transparent 80%))",
                }}
            />

            {/* Bottom Edge Melt */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-t from-white/30 to-transparent pointer-events-none z-10" />

            <div
                className="hidden max-[1439px]:block absolute bottom-0 inset-x-0 h-[35%] pointer-events-none z-[5]"
                style={{
                    background: "linear-gradient(to top, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                }}
            />

            <div className="boutique-width w-full flex items-center relative z-10 h-full pointer-events-none">
                {/* Main Content Area - Glass Anchored Container */}
                <div className="relative z-10 md:z-30 lg:z-10 w-full max-w-full md:max-w-[520px] lg:max-w-2xl h-full flex flex-col justify-center items-start pointer-events-none py-[4.5rem]">
                    <div className="relative z-10 flex w-full flex-col items-start">
                        <div className="relative w-full min-[1280px]:max-[1669px]:pt-[clamp(32px,3vw,56px)] min-[1670px]:pt-[clamp(112px,10.5vw,170px)]">
                            <div className="relative z-10 flex flex-col items-start hero-text-align transition-transform duration-300 md:ml-[clamp(72px,7vw,104px)] min-[1280px]:max-[1669px]:ml-[clamp(118px,7.8vw,148px)] min-[1670px]:ml-[clamp(96px,5.8vw,124px)]">

                                {/* Flag Pill Language Toggle - Eyebrow above headline */}

                                <h1
                                    className="relative z-10 leading-[1.08] min-[1670px]:leading-[1.08] antialiased pointer-events-auto"
                                    style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                                >
                                    <span className="block font-['Lora'] text-[calc(3rem)] md:text-[calc(3.4rem)] min-[1500px]:text-[calc(3.7rem)] min-[1670px]:text-[calc(4.25rem+6px)] font-medium tracking-[-0.03em] text-[#0057B7]">
                                        Discover
                                    </span>
                                    <span className="block font-['Lora'] text-[calc(3rem)] md:text-[calc(3.4rem)] min-[1500px]:text-[calc(3.7rem)] min-[1670px]:text-[calc(4.25rem+6px)] font-medium tracking-[-0.03em] text-[#0057B7] whitespace-nowrap relative mb-[9px]">
                                        <span className="relative inline-block">Ukrainian</span>
                                        {" "}Products
                                    </span>
                                    <span className="block font-['Inter'] text-[calc(2.1rem-2px)] md:text-[calc(2.4rem-2px)] min-[1500px]:text-[calc(2.6rem-2px)] min-[1670px]:text-[calc(2.85rem+4px)] font-normal tracking-[-0.03em] whitespace-nowrap text-slate-400 mb-6">
                                        sold across{" "}
                                        <span className="relative inline-block">
                                            Canada
                                        </span>
                                    </span>
                                </h1>

                                <p
                                    className="text-[16px] text-slate-500 leading-relaxed max-w-lg font-normal tracking-tight pointer-events-auto font-['Inter'] mb-8"
                                    style={{ marginTop: '0' }}
                                >
                                    Explore authentic Ukrainian-made products near you
                                </p>

                                {/* CTA Row - Left Aligned To Header Branding Text */}
                                <div
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 w-full md:w-auto pointer-events-auto"
                                    style={{ marginTop: '0' }}
                                >
                                    <Link href="/map" className="w-full md:w-auto self-start">
                                        <Button
                                            className="inline-flex items-center justify-center h-[44px] px-6 text-[16px] font-medium tracking-[0.01em] rounded-[32px] bg-[#0057B7] text-white border-none transition-all duration-300 hover:bg-[#0047A0] 2xl:h-[54px] 2xl:text-[16px] shadow-[0_4px_12px_0_rgba(0,87,183,0.18)] hover:shadow-[0_6px_16px_rgba(0,87,183,0.28)] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0057B7]/40 gap-2.5 group/cta-btn font-['Inter']"
                                        >
                                            <span>Find stores near me</span>
                                            <Search className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform duration-300 group-hover/cta-btn:translate-y-[-1px] text-white" />
                                        </Button>
                                    </Link>

                                    <Link
                                        href="/#how-it-works"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="group relative flex items-center gap-2 text-[14px] font-normal text-slate-900/60 transition-all duration-300 hover:text-[#0057B7] font-['Inter']"
                                    >
                                        <span>How it works</span>
                                        <ChevronDown className="w-4 h-4 text-current transition-transform duration-300 group-hover:translate-y-0.5" />
                                        <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-slate-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>



            {/* Desktop Peeking Map Container - FULL BLEED LIVE MAP */}
            <div className="hidden md:block absolute top-0 right-0 w-[59%] h-full z-20 select-none overflow-hidden border-none outline-none">
                <div
                    className="w-full h-full group/map-peeking border-none outline-none"
                    aria-label="Interactive map of Ukrainian stores in Canada"
                    style={{ 
                        maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.01) 12%, rgba(0,0,0,0.27) 26%, rgba(0,0,0,0.77) 42%, black 58%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.01) 12%, rgba(0,0,0,0.27) 26%, rgba(0,0,0,0.77) 42%, black 58%)' 
                    }}
                >
                    {/* Inner wrapper for shifted map content */}
                    <div
                        className="absolute inset-y-0 left-0 w-full border-none outline-none scale-[1.0] translate-x-[0%] translate-y-[0%] md:scale-[1.06] md:translate-x-[8%] md:translate-y-[-7%] lg:scale-[1.11] lg:translate-x-[14%] lg:translate-y-[-9%] min-[1280px]:max-[1669px]:scale-[1.15] min-[1280px]:max-[1669px]:translate-x-[6%] min-[1280px]:max-[1669px]:translate-y-[6%] min-[1670px]:scale-[1.12] min-[1670px]:translate-x-[6%] min-[1670px]:translate-y-[8%] transition-all duration-700 ease-out"
                    >
                        <div className="relative w-full h-full pointer-events-auto border-none outline-none">
                            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-30" />
                            <div className="hidden md:max-[1439px]:block absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white via-white/30 to-transparent pointer-events-none z-30" />


                            {/* AURORA OVERLAY */}
                            <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none opacity-0">
                                <div className="absolute top-[25%] right-[45%] w-[350px] h-[150px] bg-[#0057B7] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                                <div className="absolute top-[50%] right-[30%] w-[350px] h-[150px] bg-[#FFD900] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                            </div>

                            {shouldRenderHeroMap ? (
                                <GoogleMapsProvider>
                                    <Suspense fallback={<div className="w-full h-full bg-slate-50 animate-pulse" />}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 1.03 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                                            className="w-full h-full cursor-pointer pointer-events-auto"
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

            <div className="hidden lg:flex flex-col items-end gap-2 absolute right-0 top-[12%] z-30 pointer-events-none">
                {trustPillars.map((pillar) => (
                    <div
                        key={pillar.title}
                        className={cn(
                            "group isolate flex items-center overflow-hidden pl-5 pr-5 py-2.5 border-l-[3px] cursor-default pointer-events-auto shadow-sm hover:shadow-md transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-right w-max max-w-[calc(100vw-40px)] md:max-w-[calc(100vw-300px)]",
                            pillar.accentClass,
                            pillar.surfaceClass
                        )}
                    >
                        <span className="shrink-0 text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0057B7]/65 group-hover:text-[#0057B7] whitespace-nowrap font-['Inter'] transition-colors duration-[1200ms]">
                            {pillar.title}
                        </span>
                        <span className="transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-[70px] lg:w-[100px] group-hover:w-0 block shrink-0" aria-hidden="true" />
                        <span className="hero-trust-pill-detail inline-flex items-center overflow-hidden max-w-0 opacity-0 translate-x-2 pl-0 py-0.5 text-[14px] text-[#0057B7]/10 font-medium whitespace-nowrap group-hover:max-w-[1000px] group-hover:opacity-100 group-hover:text-[#0057B7]/80 group-hover:translate-x-0 group-hover:pl-3 transition-[max-width,color,opacity,transform,padding] duration-[1200ms] delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] font-['Inter']">
                            <span className="shrink-0 mr-4">–</span>
                            <span>{pillar.detail}</span>
                        </span>
                        <span className="ml-2 pr-1 opacity-20 group-hover:opacity-0 transition-opacity duration-[1000ms] shrink-0 text-[#0057B7]">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </div>
                ))}
            </div>

            <div className="pointer-events-none absolute bottom-0 right-0 z-[25] hidden md:max-[1439px]:block h-[10px] w-[59%] bg-white" />

        </section>

        {/* Location Intent Strip — hidden on mobile */}
        <div className="hidden md:block w-full max-w-[1920px] mx-auto bg-white border-t border-slate-200 overflow-hidden mt-[-12px] min-[1280px]:max-[1669px]:mt-[-24px] min-[1670px]:mt-[-28px] relative z-20">
            <div className="boutique-width flex items-stretch">
                    <div className="flex-1 flex items-stretch md:min-w-0 px-0 min-[1280px]:max-[1669px]:pl-[clamp(72px,5vw,92px)] min-[1670px]:pl-[clamp(52px,3.6vw,72px)]">
                        {PROVINCE_STRIP.map((province, i) => (
                            <motion.div
                                key={province.abbr}
                                className="min-w-0 flex-1"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.2 + i * 0.05,
                                        duration: 0.5,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                            >
                                <button
                                    onClick={() => setLocation(`/map?province=${encodeURIComponent(province.abbr)}`)}
                                    className={cn(
                                        "group flex h-full w-full flex-col items-start justify-center border-r border-slate-100 pt-[18px] pb-3 transition-all duration-200 cursor-pointer text-left",
                                        i === 0 ? "pl-0 pr-4" : "px-4"
                                    )}
                                >
                                <span className={cn(
                                        "hero-city-strip-label text-[13px] md:text-[13px] lg:text-[13px] font-bold tracking-[0.0075em] text-slate-700 whitespace-nowrap font-['Inter']"
                                    )}>
                                        {province.label}
                                    </span>
                                </button>
                            </motion.div>
                        ))}

                        <motion.div
                            className="min-w-0 flex-1"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.2 + PROVINCE_STRIP.length * 0.05,
                                duration: 0.5,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            <button
                                onClick={() => setLocation('/map')}
                                className="group flex h-full w-full flex-col items-start justify-center bg-white px-4 pt-[18px] pb-3 transition-colors duration-200 cursor-pointer text-left"
                            >
                                <div className="flex items-center gap-1.5 group">
                                    <span className="hero-city-strip-label text-[13px] md:text-[13px] lg:text-[13px] font-medium tracking-[0.0075em] text-slate-500 whitespace-nowrap group-hover:text-[#0057B7] font-['Inter'] transition-colors">
                                        View All
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[#0057B7]" strokeWidth={1.8} />
                                </div>
                            </button>
                        </motion.div>
                    </div>
            </div>
        </div>
        </div>

        </>
    );
}
