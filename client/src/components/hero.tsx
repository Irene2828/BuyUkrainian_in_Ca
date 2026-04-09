import { MapPin, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Suspense, lazy } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Lazy load the map to ensure fast initial page load
const InteractiveMap = lazy(() => import("@/components/interactive-map").then(module => ({ default: module.InteractiveMap })));
const noop = () => {};
const noopSelectStore = (_store?: unknown) => {};
const MAX_CITY_STRIP_CITIES = 6;


export function Hero() {
    const { t } = useI18n();
    const [, setLocation] = useLocation();

    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const cityStripStores = Array.from(
        new Map(
            stores
                .filter(s => s.city.toLowerCase() !== 'maple' && s.city.toLowerCase() !== 'etobicoke')
                .sort((a, b) => a.city.localeCompare(b.city))
                .map(s => [`${s.city}-${s.province}`, s])
        ).values()
    ).slice(0, MAX_CITY_STRIP_CITIES);

    return (
        <>
        <div className="flex flex-col h-auto md:h-[calc(100vh-81px)] 2xl:h-[calc(100vh-108px)] min-[1670px]:h-[calc(100vh-108px)] min-[1670px]:max-h-[820px]">
        <section
            className="flex-1 relative z-10 w-full max-w-[1920px] mx-auto overflow-hidden font-sans flex items-center animate-in fade-in duration-700 bg-white"
        >
            {/* Soft Atmospheric Sky Glow - Blue (Existing, Refined) */}
            <div className="absolute top-[-15%] left-0 w-[800px] h-[700px] bg-[#BAE6FD] rounded-full blur-[160px] opacity-[0.22] pointer-events-none z-[4]"></div>

            {/* Soft Atmospheric Sky Glow - Canadian Red Hint */}
            <div
                className="absolute top-[-20%] right-0 w-[850px] h-[750px] bg-[#DA291C] rounded-full blur-[170px] opacity-[0.06] pointer-events-none z-[4]"
                style={{
                    transform: "translateX(20%)",
                }}
            />



            {/* Ambient Reading Glow - light field rather than a floating slab */}
            <div
                className="absolute left-[-18%] top-[-12%] w-[76%] h-[108%] pointer-events-none z-[6]"
                style={{
                    background: "radial-gradient(ellipse at 30% 36%, rgba(255,255,255,0.64) 0%, rgba(255,255,255,0.42) 24%, rgba(255,255,255,0.16) 48%, rgba(255,255,255,0.035) 64%, transparent 84%), radial-gradient(ellipse at 18% 72%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 24%, transparent 60%)",
                }}
            />

            {/* Upper Airlight - keeps the headline readable without reading like a surface */}
            <div
                className="absolute left-[8%] top-[6%] w-[34%] h-[26%] pointer-events-none z-[7]"
                style={{
                    background: "radial-gradient(ellipse at 46% 34%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 24%, transparent 68%)",
                }}
            />

            {/* Center Bridge - a luminous handoff into the map rather than a milky overlay */}
            <div
                className="absolute inset-y-0 left-[20%] w-[48%] pointer-events-none z-[8]"
                style={{
                    background: "linear-gradient(to right, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.052) 22%, rgba(255,255,255,0.018) 48%, transparent 78%), radial-gradient(ellipse at 10% 46%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.042) 18%, transparent 54%)",
                }}
            />

            {/* Bottom Edge Melt */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white/70 to-transparent pointer-events-none z-10" />

            <div className="boutique-width w-full flex items-center relative z-10 h-full pointer-events-none">
                {/* Main Content Area - Glass Anchored Container */}
                <div className="relative z-10 md:z-30 lg:z-10 w-full max-w-full md:max-w-[520px] lg:max-w-2xl h-full flex flex-col justify-center items-start pointer-events-none pt-[5rem] pb-[4rem] md:py-[4.5rem]">
                    <div className="relative z-10 flex w-full flex-col items-start">
                        <div className="w-full">
                            <h1
                                className="leading-[1.06] antialiased pointer-events-auto"
                                style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                            >
                                <span className="block text-[calc(2.578rem-2px)] md:text-[calc(2.9rem-2px)] min-[1500px]:text-[calc(3.2rem-2px)] min-[1670px]:text-[3.2rem] font-semibold tracking-tight text-[#0057B7]">
                                    Discover
                                </span>
                                <span className="block text-[calc(2.578rem-2px)] md:text-[calc(2.9rem-2px)] min-[1500px]:text-[calc(3.2rem-2px)] min-[1670px]:text-[3.2rem] font-semibold tracking-tight text-[#0057B7] whitespace-nowrap relative">
                                    <span className="relative inline-block">Ukrainian</span>
                                    {" "}Products
                                </span>
                                <span className="block text-[calc(1.8125rem-2px)] md:text-[calc(2.1rem-2px)] min-[1500px]:text-[calc(2.25rem-2px)] min-[1670px]:text-[2.25rem] font-normal tracking-tight whitespace-nowrap text-slate-400">
                                    sold across{" "}
                                    <span className="relative inline-block">
                                        Canada
                                    </span>
                                </span>
                            </h1>

                            <p 
                                className="text-[16px] text-slate-500 leading-relaxed max-w-lg font-normal pointer-events-auto"
                                style={{ marginTop: 'clamp(16px, calc(0.9vw + 8px), 22px)' }}
                            >
                                One map to find authentic Ukrainian-made products near you
                            </p>

                            {/* CTA Row - Left Aligned To Header Branding Text */}
                            <div 
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto pointer-events-auto"
                                style={{ marginTop: 'clamp(23px, calc(1.65vw + 8px), 35px)' }}
                            >
                                <Link href="/map" className="w-full md:w-auto self-start">
                                    <Button
                                        className="inline-flex items-center justify-center h-[46px] px-6 text-[16px] font-medium tracking-tight rounded-full bg-[#FFD700] text-black transition-all duration-300 hover:bg-[#FFE55C] 2xl:h-[54px] 2xl:text-[16px] shadow-[0_6px_18px_rgba(255,215,0,0.28)] hover:shadow-[0_10px_24px_rgba(255,215,0,0.36)] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FFD700]/45 gap-2.5 group/cta-btn border border-[#F1C40F]/70"
                                    >
                                        <span>{t('hero.ctaPrimary') || 'Explore the Map'}</span>
                                        <MapPin className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform duration-300 group-hover/cta-btn:translate-y-[-1px]" />
                                    </Button>
                                </Link>

                                <Link
                                    href="/#how-it-works"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="group relative flex items-center gap-2 text-[15px] font-medium text-slate-900/60 transition-all duration-300 hover:text-[#0057B7]"
                                >
                                    <span>How it works</span>
                                    <ChevronDown className="w-4 h-4 text-current transition-transform duration-300 group-hover:translate-y-0.5" />
                                    <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-[#FFD700] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                </Link>
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
                    <div className="absolute inset-y-0 left-0 w-full border-none outline-none scale-[1.0] translate-x-[0%] translate-y-[0%] md:scale-[1.06] md:translate-x-[8%] md:translate-y-[2%] lg:scale-[1.11] lg:translate-x-[14%] lg:translate-y-[1%] min-[1441px]:scale-[1.15] min-[1441px]:translate-x-[6%] min-[1441px]:translate-y-[-4%] min-[1670px]:scale-[1.12] min-[1670px]:translate-x-[6%] min-[1670px]:translate-y-[2%] transition-all duration-700 ease-out">
                        <div className="relative w-full h-full pointer-events-auto border-none outline-none">
                            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-30" />
                            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none z-30" />

                            {/* AURORA OVERLAY - STRICTLY FOREGROUND (Over Map) */}
                            {/* opacity-0 = hidden; remove to restore. Values: top-[25%] right-[45%] blue | top-[50%] right-[30%] yellow */}
                            <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none opacity-0">
                                <div className="absolute top-[25%] right-[45%] w-[350px] h-[150px] bg-[#0057B7] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                                <div className="absolute top-[50%] right-[30%] w-[350px] h-[150px] bg-[#FFD900] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                            </div>



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
                        </div>
                    </div>
                </div>
            </div>
            <div className="hidden lg:flex flex-col items-end gap-2 absolute right-0 top-[12%] z-30 pointer-events-none">
              {/* Pill 3: Support Economy — longest — yellow border */}
              <div className="group isolate flex items-center pl-4 pr-2 py-2 border-l-[3px] border-[#0057B7] bg-[#EFF6FF]/60 cursor-default pointer-events-auto shadow-sm hover:shadow-md hover:pr-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-right">
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0057B7] whitespace-nowrap">
                  Support of Ukraine's Economy
                </span>
                <span className="hero-trust-pill-detail text-[12px] text-[#0057B7]/60 font-medium whitespace-nowrap border-l border-[#0057B7]/10 pl-4 py-0.5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-700 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  — every purchase goes directly to Ukrainian makers
                </span>
              </div>

              {/* Pill 1: Growing Map — shortest — yellow border */}
              <div className="group isolate flex items-center pl-4 pr-2 py-2 border-l-[3px] border-[#FFD700] bg-[#FFFBEB]/60 cursor-default pointer-events-auto shadow-sm hover:shadow-md hover:pr-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-right">
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0057B7] whitespace-nowrap">
                  Volunteer-Verified Listings
                </span>
                <span className="hero-trust-pill-detail text-[12px] text-[#0057B7]/60 font-medium whitespace-nowrap border-l border-[#0057B7]/10 pl-4 py-0.5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-700 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  — every listing is reviewed before it appears
                </span>
              </div>

              {/* Pill 2: Authentic Goods — medium — blue border */}
              <div className="group isolate flex items-center pl-4 pr-2 py-2 border-l-[3px] border-[#0057B7] bg-[#EFF6FF]/60 cursor-default pointer-events-auto shadow-sm hover:shadow-md hover:pr-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-right">
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0057B7] whitespace-nowrap">
                  Updated Regurarly
                </span>
                <span className="hero-trust-pill-detail text-[12px] text-[#0057B7]/60 font-medium whitespace-nowrap border-l border-[#0057B7]/10 pl-4 py-0.5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-700 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  — real people, real stores, real Ukrainian products
                </span>
              </div>
            </div>

        </section>

        {/* Location Intent Strip — hidden on mobile */}
        <div className="hidden md:block w-full max-w-[1920px] mx-auto bg-white border-t border-slate-200 overflow-hidden">
            <div className="boutique-width flex items-stretch">
                        <div className="flex-1 flex items-stretch md:min-w-0 px-0">
                        {cityStripStores.length > 0 && cityStripStores.map((store, i) => (
                            <motion.div
                                key={`${store.city}-${store.province}-${i}`}
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
                                    onClick={() => setLocation(`/map?city=${encodeURIComponent(store.city)}&province=${encodeURIComponent(store.province)}`)}
                                    className={cn(
                                        "group flex h-full w-full flex-col items-start justify-center border-r border-slate-100 pt-[18px] pb-3 transition-all duration-200 cursor-pointer text-left",
                                        i === 0 ? "pl-0 pr-4" : "px-4"
                                    )}
                                >
                                <span className={cn(
                                        "hero-city-strip-label text-[13px] md:text-[13px] lg:text-[13px] font-bold tracking-[0.0075em] text-[#0057B7] whitespace-nowrap"
                                    )}>
                                        {store.city}
                                    </span>
                                    <span className={cn(
                                        "hero-city-strip-meta text-[9px] text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap",
                                    )}>
                                        {store.province}
                                    </span>
                                </button>
                            </motion.div>
                        ))}

                        <motion.div
                            className="min-w-0 flex-1"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.2 + cityStripStores.length * 0.05,
                                duration: 0.5,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            <button
                                onClick={() => setLocation('/map')}
                                className="group flex h-full w-full flex-col items-start justify-center bg-white px-4 pt-[18px] pb-3 transition-colors duration-200 cursor-pointer text-left"
                            >
                                <span className="hero-city-strip-label text-[13px] md:text-[13px] lg:text-[13px] font-bold tracking-[0.0075em] text-slate-500 whitespace-nowrap group-hover:text-slate-600">
                                    View All
                                </span>
                                <span className="hero-city-strip-meta text-[9px] text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap group-hover:text-slate-500">
                                    Full Map →
                                </span>
                            </button>
                        </motion.div>
                    </div>
            </div>
        </div>
        </div>

        </>
    );
}
