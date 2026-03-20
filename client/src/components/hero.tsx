import { MapPin, Info, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Suspense, lazy, useState } from "react";
import { Store } from "@/lib/data";
import { StoreBottomSheet } from "@/components/store-bottom-sheet";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

// Lazy load the map to ensure fast initial page load
const InteractiveMap = lazy(() => import("@/components/interactive-map").then(module => ({ default: module.InteractiveMap })));


export function Hero() {
    const { t } = useI18n();
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [, setLocation] = useLocation();

    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    return (
        <>
        <div className="flex flex-col min-h-[calc(100vh-80px)] min-[1670px]:min-h-[calc(100vh-80px)]">
        <section
            className="flex-1 relative z-10 w-full max-w-[1920px] mx-auto overflow-hidden font-sans flex items-center animate-in fade-in duration-700 bg-white min-[1670px]:pb-[5%]"
        >
            {/* Soft Atmospheric Sky Glow - Senior Designer Polish (Visible Fix) */}
            <div className="absolute top-[-15%] left-0 w-[800px] h-[700px] bg-[#BAE6FD] rounded-full blur-[160px] opacity-20 pointer-events-none z-[4]"></div>



            {/* Layer 2: White Glow - Bottom Left (Natural Transition) */}
            <div
                className="absolute bottom-0 left-0 w-full h-[50%] pointer-events-none z-[1]"
                style={{
                    background: 'radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.5) 0%, transparent 35%)'
                }}
            />

            {/* Layer 3: The "Fog" - Text Protection Mask */}
            <div 
                className="absolute inset-y-0 left-0 w-[85%] pointer-events-none z-10 border-none outline-none" 
                style={{
                    background: 'linear-gradient(to right, white 0%, white 50%, rgba(255,255,255,0.7) 65%, rgba(255,255,255,0.2) 78%, transparent 100%)'
                }}
            />

            {/* Layer 4: Bottom Edge Melt */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white/70 to-transparent pointer-events-none z-10" />

            <div className="boutique-width w-full flex items-center relative z-10 h-full pointer-events-none">
                {/* Main Content Area - Glass Anchored Container */}
                <div className="relative z-10 w-full max-w-2xl h-full flex flex-col justify-center items-start pointer-events-none py-16">
                    {/* Jobsian Typographic Scale - OPTICAL BALANCE FIX */}
                    <h1
                        className="leading-[1.25] antialiased pointer-events-auto min-[1670px]:mt-[5%]"
                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                    >
                        <span className="block text-[2.4375rem] md:text-[3.0375rem] min-[1441px]:text-[3.375rem] font-semibold tracking-tight text-[#0057B7]">
                            Discover
                        </span>
                        <span className="block text-[2.4375rem] md:text-[3.0375rem] min-[1441px]:text-[3.375rem] font-semibold tracking-tight text-[#0057B7] whitespace-nowrap relative">
                            <span className="relative inline-block">Ukrainian</span>
                            {" "}Products
                        </span>
                        <span className="block text-[1.8125rem] md:text-[2.306rem] min-[1441px]:text-[2.5625rem] font-normal tracking-tight whitespace-nowrap text-slate-400">
                            sold across{" "}
                            <span className="relative inline-block">
                                Canada
                            </span>
                        </span>
                    </h1>

                    <p 
                        className="text-[16px] text-[#0F172A] leading-relaxed max-w-lg font-medium pointer-events-auto"
                        style={{ marginTop: 'clamp(16px, 1.8vw, 28px)' }}
                    >
                        Find Ukrainian-made products near you — and help grow the map.
                    </p>

                    {/* CTA Row - Perfectly Left Aligned */}
                    <div 
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto pointer-events-auto"
                        style={{ marginTop: 'clamp(20px, 2.2vw, 36px)' }}
                    >
                        <Link href="/map" className="w-full md:w-auto self-start">
                            <Button
                                className="inline-flex items-center justify-center h-[46px] px-6 text-[16px] font-medium tracking-tight rounded-full bg-[#FFD700] text-[#0A2540] transition-all duration-300 2xl:h-[54px] 2xl:text-[17px] shadow-[0_4px_14px_0_rgba(255,215,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,215,0,0.4)] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FFD700]/50 gap-2.5 group/cta-btn border-none"
                            >
                                <span>{t('hero.ctaPrimary') || 'Open Interactive Map'}</span>
                                <MapPin className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform duration-300 group-hover/cta-btn:translate-y-[-1px]" />
                            </Button>
                        </Link>

                        <Link
                            href="/#how-it-works"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="relative flex items-center gap-2 text-[#0F172A] text-[15px] font-medium transition-all duration-300 group/how-link opacity-60 hover:opacity-100"
                        >
                            <span>How it works</span>
                            <ChevronDown className="w-4 h-4 transition-transform group-hover/how-link:translate-y-0.5" />
                            <span className="absolute bottom-[-4px] left-0 right-0 h-[1px] bg-[#0F172A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                        </Link>
                    </div>


                    {/* Mobile Map Preview - Live Map */}
                    <div className="lg:hidden w-full mt-[50px] aspect-[4/3] rounded-[24px] overflow-hidden relative bg-slate-50 border-none outline-none">
                        <Suspense fallback={<div className="w-full h-full bg-slate-100 animate-pulse" />}>
                            <InteractiveMap
                                stores={stores}
                                selectedStore={selectedStore}
                                onSelectStore={setSelectedStore}
                                onCloseStore={() => setSelectedStore(null)}
                                variant="hero"
                                isMobile={true}
                            />
                            {/* Mobile Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/20 to-transparent" />
                        </Suspense>
                    </div>

                    {/* Mobile Store Bottom Sheet */}
                    {selectedStore && (
                        <div className="lg:hidden">
                            <StoreBottomSheet
                                store={selectedStore}
                                onClose={() => setSelectedStore(null)}
                                onSeeOnMap={(store) => {
                                    setLocation("/map");
                                    // Optional: You could pass state here if wouter supports it, or use context
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Peeking Map Container - FULL BLEED LIVE MAP */}
            <div className="hidden lg:block absolute top-0 right-0 w-[59%] h-full z-20 select-none overflow-hidden border-none outline-none">
                <div
                    className="w-full h-full group/map-peeking border-none outline-none"
                    aria-label="Interactive map of Ukrainian stores in Canada"
                    style={{ 
                        maskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, rgba(0,0,0,0.4) 15%, black 35%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, rgba(0,0,0,0.4) 15%, black 35%)' 
                    }}
                >
                    {/* Inner wrapper for shifted map content */}
                    <div className="absolute inset-y-0 -left-[12%] w-[112%] transition-all duration-700 ease-out scale-[1.11] translate-x-[20%] -translate-y-[9%] min-[1441px]:left-0 min-[1441px]:w-full min-[1441px]:scale-[1.18] min-[1441px]:translate-x-[4%] min-[1441px]:-translate-y-[12%] min-[1670px]:scale-[1.18] min-[1670px]:translate-x-[4%] min-[1670px]:-translate-y-[4%] border-none outline-none">
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
                                        onSelectStore={() => { }}
                                        onCloseStore={() => { }}
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
              <div className="group isolate flex items-center px-4 py-2 border-l-[3px] border-[#0057B7] bg-[#EFF6FF]/60 cursor-default pointer-events-auto shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0057B7] whitespace-nowrap">
                  Support Ukraine's Economy
                </span>
                <span className="text-[11px] text-[#0057B7]/60 font-medium whitespace-nowrap border-l border-[#0057B7]/10 pl-4 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  — every purchase makes a difference
                </span>
              </div>

              {/* Pill 1: Growing Map — shortest — yellow border */}
              <div className="group isolate flex items-center px-4 py-2 border-l-[3px] border-[#FFD700] bg-[#FFFBEB]/60 cursor-default pointer-events-auto shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0057B7] whitespace-nowrap">
                  Up-to-date Growing Map
                </span>
                <span className="text-[11px] text-[#0057B7]/60 font-medium whitespace-nowrap border-l border-[#0057B7]/10 pl-4 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  — new stores added by people just like you
                </span>
              </div>

              {/* Pill 2: Authentic Goods — medium — blue border */}
              <div className="group isolate flex items-center px-4 py-2 border-l-[3px] border-[#0057B7] bg-[#EFF6FF]/60 cursor-default pointer-events-auto shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0057B7] whitespace-nowrap">
                  Authentic Ukrainian Goods
                </span>
                <span className="text-[11px] text-[#0057B7]/60 font-medium whitespace-nowrap border-l border-[#0057B7]/10 pl-4 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  — made in Ukraine products only
                </span>
              </div>
            </div>

        </section>

        {/* Location Intent Strip */}
        <div className="w-full bg-white border-t-[3px] border-[#FFD700] overflow-hidden">
            <div className="boutique-width flex items-stretch min-[1670px]:pt-[10px]">
                <div className="flex-1 overflow-x-auto scrollbar-hide min-w-0">
                    <div className="flex items-stretch min-w-max">
                        {stores.length > 0 && [...new Map(stores.map(s =>
                            [`${s.city}-${s.province}`, s]
                        )).values()].map((store, i) => (
                            <button
                                key={`${store.city}-${store.province}-${i}`}
                                onClick={() => setLocation(`/map?city=${encodeURIComponent(store.city)}&province=${encodeURIComponent(store.province)}`)}
                                className="group flex flex-col items-start px-6 py-3 min-[1441px]:px-8 border-r border-slate-100 hover:bg-[#FFFBEB] transition-all duration-200 cursor-pointer text-left min-w-[140px]"
                            >
                                <span className="text-[14px] font-bold text-slate-800 group-hover:text-[#0057B7] transition-colors duration-200 whitespace-nowrap">
                                    {store.city}
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap group-hover:text-[#FFD700] transition-colors duration-200">
                                    {store.province}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-shrink-0 border-l-2 border-[#EFF6FF] ml-4">
                    <button
                        onClick={() => setLocation('/map')}
                        className="group flex flex-col items-start px-6 py-3 bg-[#EFF6FF] hover:bg-[#FFFBEB] transition-colors duration-200 cursor-pointer text-left h-full"
                    >
                        <span className="text-[14px] font-bold text-[#0057B7] whitespace-nowrap group-hover:text-[#0057B7]">
                            View All
                        </span>
                        <span className="text-[10px] text-[#0057B7]/60 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                            Full Map →
                        </span>
                    </button>
                </div>
            </div>
        </div>
        </div>

        </>
    );
}
