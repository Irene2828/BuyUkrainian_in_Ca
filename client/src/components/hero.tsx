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

// Lazy load the map to ensure fast initial page load
const InteractiveMap = lazy(() => import("@/components/interactive-map").then(module => ({ default: module.InteractiveMap })));


export function Hero() {
    const { t } = useI18n();
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [, setLocation] = useLocation();

    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: 1000 * 60 * 5,
    });

    return (
        <section
            className="relative z-10 w-full overflow-hidden font-sans flex items-center animate-in fade-in duration-700 bg-white min-h-[85vh] py-24 md:py-32"
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

            {/* Layer 3: Text Protection Mask - Liquid Fade */}
            <div
                className="absolute inset-0 pointer-events-none z-[2]"
                style={{
                    background: `linear-gradient(to right, 
                        #FFFFFF 0%, 
                        #FFFFFF 15%, 
                        rgba(255, 255, 255, 0) 30%
                    )`
                }}
            />

            <div className="boutique-width w-full py-10 lg:py-0 flex items-center relative z-10 h-full pointer-events-none">
                {/* Main Content Area - Glass Anchored Container */}
                <div className="relative z-10 max-w-2xl flex flex-col justify-center items-start pointer-events-none md:-mt-12">
                    {/* Jobsian Typographic Scale - OPTICAL BALANCE FIX */}
                    <h1
                        className="leading-none w-full antialiased pointer-events-auto"
                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                    >
                        <span className="block text-[2.4375rem] md:text-[3.375rem] font-semibold tracking-tight text-[#0057B7] leading-[1.1] font-sans max-w-[90%] md:max-w-none whitespace-pre-line">
                            {t('hero.title') || 'Discover\nUkrainian Products'}
                        </span>
                        <span className="block text-[1.8125rem] md:text-[2.5625rem] font-normal tracking-tight text-[#C69500] whitespace-nowrap mt-2">
                            sold across <span className="relative inline-block"><span className="relative z-10">Canada</span><span className="absolute bottom-1.5 left-0 w-full h-3 bg-[#FFF3C4] rounded-[2px] -z-10 opacity-0"></span></span>
                        </span>
                    </h1>

                    <p className="mt-6 mb-8 text-[16px] text-slate-600/85 leading-relaxed max-w-md lg:max-w-lg font-medium pointer-events-auto">
                        Find, add, and share local stores selling Ukrainian-made products<br />to support Ukraine's economy from Canada
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto pointer-events-auto">
                        <Link href="/map" className="w-full md:w-auto">
                            <Button
                                className="h-12 2xl:h-[54px] px-8 2xl:px-8 w-full md:w-auto rounded-full bg-[#0A2540] text-white font-medium text-[16px] 2xl:text-[18px] tracking-tight antialiased transition-all duration-300 shadow-sm hover:shadow-[0_4px_24px_rgba(255,232,133,0.2)] hover:bg-[#0F355C] hover:text-[#FFF4CC] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-navy/20 group/cta-btn flex items-center justify-center gap-2 2xl:gap-3"
                            >
                                <span>{t('hero.ctaPrimary') || 'Open Interactive Map'}</span>
                                <MapPin className="w-4 h-4 2xl:w-5 2xl:h-5 transition-colors duration-300 group-hover/cta-btn:text-[#FFF4CC]" />
                            </Button>
                        </Link>

                        <Link
                            href="/#how-it-works"
                            onClick={(e) => {
                                e.preventDefault(); // Prevent default wouter navigation
                                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-[#0F172A] transition-colors group/how-link"
                        >
                            <span>How it works</span>
                            <ChevronDown className="w-4 h-4 transition-transform group-hover/how-link:translate-y-0.5" />
                        </Link>
                    </div>

                    {/* Mobile Map Preview - Live Map */}
                    <div className="lg:hidden w-full mt-[50px] aspect-[4/3] rounded-[24px] overflow-hidden shadow-xl border border-slate-100 relative bg-slate-50">
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
            <Link href="/map" className="hidden lg:block absolute top-0 right-0 w-[60%] h-full z-[15] select-none overflow-hidden">
                <div
                    className="w-full h-full group/map-peeking"
                    aria-label="Interactive map of Ukrainian stores in Canada"
                    style={{
                        maskImage: 'linear-gradient(to right, transparent, black 15%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%)'
                    }}
                >
                    {/* Inner wrapper for shifted map content */}
                    <div className="absolute inset-0 transition-all duration-700 ease-out scale-[1.12] translate-x-[4%] -translate-y-[12%]">
                        <div className="relative w-full h-full pointer-events-auto">

                            {/* AURORA OVERLAY - STRICTLY FOREGROUND (Over Map) */}
                            {/* opacity-0 = hidden; remove to restore. Values: top-[25%] right-[45%] blue | top-[50%] right-[30%] yellow */}
                            <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none opacity-0">
                                <div className="absolute top-[25%] right-[45%] w-[350px] h-[150px] bg-[#0057B7] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                                <div className="absolute top-[50%] right-[30%] w-[350px] h-[150px] bg-[#FFD900] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                            </div>

                            <Suspense fallback={<div className="w-full h-full bg-slate-50 animate-pulse" />}>
                                <InteractiveMap
                                    stores={stores}
                                    selectedStore={null}
                                    onSelectStore={() => { }}
                                    onCloseStore={() => { }}
                                    variant="hero"
                                    isMobile={false}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </Link>

            {/* 6. Glass Runway - Trust & Origin Metadata */}
            <div className="absolute bottom-0 left-0 w-full z-30 pointer-events-none bg-white/40 backdrop-blur-md py-3">
                <div className="boutique-width w-full flex items-center justify-end md:gap-5 md:pr-0 overflow-x-hidden no-scrollbar px-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 italic">
                            VERIFIED STORES ONLY
                        </span>
                    </div>
                    <span className="text-slate-400 text-[10px] font-light hidden md:block">/</span>
                    <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 hidden md:block">
                        MADE IN UKRAINE PRODUCTS
                    </span>
                </div>
            </div>
        </section>
    );
}
