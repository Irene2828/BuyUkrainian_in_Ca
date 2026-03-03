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
            {/* Layer 1: Top Left Yellow Glow - Prefooter Style */}
            <div
                className="absolute pointer-events-none rounded-full z-[10]"
                style={{
                    width: '500px',
                    height: '500px',
                    left: '-100px',
                    top: '-100px',
                    background: 'rgba(255, 212, 39, 0.18)',
                    filter: 'blur(100px)',
                }}
            />

            {/* Layer 1.5: Top Center Blue Glow - Prefooter Style */}
            <div
                className="absolute pointer-events-none rounded-full z-[10]"
                style={{
                    width: '414px',
                    height: '460px',
                    left: '42%',
                    top: '-300px',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 113, 227, 0.15)',
                    filter: 'blur(108px)',
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
                        <span className="block text-[1.8125rem] md:text-[2.5625rem] font-normal tracking-tight text-[#0057B8]/70 whitespace-nowrap mt-2">
                            {t('hero.subtitle') || 'sold across Canada'}
                        </span>
                    </h1>

                    <p className="mt-8 mb-10 text-[16px] text-slate-600/85 leading-relaxed max-w-md lg:max-w-lg font-medium">
                        Find, add, and share local stores to support Ukraine's economy with every purchase.
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                        <Link href="/map" className="w-full md:w-auto">
                            <Button
                                className="h-[50px] 2xl:h-[54px] px-8 2xl:px-10 w-full md:w-auto rounded-full bg-[linear-gradient(to_bottom,#3A3F4F,#2F3341)] text-white font-medium text-[16px] 2xl:text-[18px] tracking-tight 2xl:tracking-normal antialiased transition-all duration-300 shadow-md hover:shadow-lg hover:bg-[linear-gradient(to_bottom,#3A3F4F,#3A3F4F)] hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-navy/20 group/cta-btn flex items-center justify-center gap-2 2xl:gap-3"
                            >
                                <span>{t('hero.ctaPrimary') || 'Open Interactive Map'}</span>
                                <MapPin className="w-4 h-4 2xl:w-5 2xl:h-5" />
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
                    className="hidden lg:block absolute top-0 right-0 w-[60%] h-full z-0 select-none overflow-hidden pointer-events-auto cursor-pointer group/map-peeking"
                    aria-label="Interactive map of Ukrainian stores in Canada"
                >
                    {/* Inner wrapper for shifted map content */}
                    <div className="absolute inset-0 transition-all duration-700 ease-out scale-[1.12] translate-x-[-1%]">
                        <div className="relative w-full h-full">
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

                    {/* Static Gradient Alpha Masking - pinned to the container edges */}
                    {/* Left Edge Fade - REFINED for West Coast Visibility */}
                    <div
                        className="absolute top-0 bottom-0 left-0 w-[280px] z-[20] pointer-events-none"
                        style={{
                            background: 'linear-gradient(to right, #FFFFFF 0%, #FFFFFF 15%, transparent 70%)'
                        }}
                    />

                    {/* Top Edge Fade */}
                    <div className="absolute top-0 left-0 right-0 h-[150px] z-[20] pointer-events-none bg-gradient-to-b from-white via-white/50 to-transparent" />

                    {/* Bottom Edge Fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-[100px] z-[20] pointer-events-none bg-gradient-to-t from-white/70 via-white/30 to-transparent" />
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
