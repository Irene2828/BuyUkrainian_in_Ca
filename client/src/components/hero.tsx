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
            className="relative z-10 w-full overflow-hidden font-sans flex items-center animate-in fade-in duration-700 bg-white py-[72px] lg:py-[85px] min-h-[500px] lg:min-h-[600px] min-[1440px]:min-h-[85vh] 2xl:py-[13.5vh]"
        >
            {/* Ambient Glow: Pale Wheat Yellow (Behind Map) */}
            <div
                className="absolute pointer-events-none rounded-full z-[0]"
                style={{
                    width: '60vw',
                    height: '80vh',
                    right: '-10%',
                    top: '-10%',
                    background: 'rgba(255, 244, 204, 0.4)',
                    filter: 'blur(120px)'
                }}
            />

            {/* Ambient Glow: Azure Blue (Behind Map) */}
            <div
                className="absolute pointer-events-none rounded-full z-[0]"
                style={{
                    width: '50vw',
                    height: '70vh',
                    right: '15%',
                    top: '15%',
                    background: 'rgba(196, 226, 255, 0.35)',
                    filter: 'blur(120px)'
                }}
            />

            {/* Layer 2: White Glow - Bottom Left (Natural Transition) */}
            <div
                className="absolute bottom-0 left-0 w-full h-[50%] pointer-events-none z-[10]"
                style={{
                    background: 'radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.5) 0%, transparent 35%)'
                }}
            />

            {/* Layer 3: Text Protection Mask - Liquid Fade */}
            <div
                className="absolute inset-0 pointer-events-none z-[5]"
                style={{
                    background: `linear-gradient(to right, 
                        #FFFFFF 0%, 
                        #FFFFFF 15%, 
                        rgba(255, 255, 255, 0) 30%
                    )`
                }}
            />

            <div className="boutique-width w-full py-10 lg:py-0 flex items-center relative z-10 h-full pointer-events-none">
                {/* Main Content Area */}
                <div className="w-full lg:max-w-[50%] flex flex-col justify-center items-start relative z-20 pointer-events-auto md:-mt-12">
                    {/* Jobsian Typographic Scale - OPTICAL BALANCE FIX */}
                    <h1
                        className="leading-none w-full antialiased"
                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                    >
                        <span className="block text-[2.4375rem] md:text-[3.375rem] font-semibold tracking-tight text-slate-900 leading-[1.1] font-sans max-w-[90%] md:max-w-none whitespace-pre-line">
                            {t('hero.title') || 'Discover\nUkrainian Products'}
                        </span>
                        <span className="block text-[1.8125rem] md:text-[2.5625rem] font-normal tracking-tight text-slate-900 whitespace-nowrap mt-2">
                            sold across <span className="relative inline-block"><span className="relative z-10">Canada</span><span className="absolute bottom-1.5 left-0 w-full h-3 bg-[#FFF3C4] rounded-[2px] -z-10"></span></span>
                        </span>
                    </h1>

                    <p className="mt-8 mb-10 text-[16px] text-slate-600/85 leading-relaxed max-w-md lg:max-w-lg font-medium">
                        Find, add, and share local stores selling Ukrainian-made products to support Ukraine's economy from Canada
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                        <Link href="/map" className="w-full md:w-auto">
                            <Button
                                className="h-[48px] px-8 2xl:px-10 w-full md:w-auto rounded-[32px] bg-[#0A2540] text-white font-medium text-[16px] 2xl:text-[18px] tracking-tight antialiased transition-all duration-300 shadow-sm hover:shadow-[0_4px_24px_rgba(255,232,133,0.2)] hover:bg-[#0F355C] hover:text-[#FFF4CC] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-navy/20 group/cta-btn flex items-center justify-center gap-2 2xl:gap-3"
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
            <Link href="/map">
                <div
                    className="hidden lg:block absolute top-0 right-0 w-[60%] h-full z-[10] select-none overflow-hidden hover:cursor-pointer group/map-peeking"
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
                            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden mix-blend-multiply">
                                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0057B7] opacity-15 blur-[100px] rounded-full"></div>
                                <div className="absolute top-[20%] right-[15%] w-[500px] h-[500px] bg-[#FFD900] opacity-15 blur-[100px] rounded-full"></div>
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
