import { MapPin, Info } from "lucide-react";
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
            className="relative z-10 w-full overflow-hidden font-sans flex items-center animate-in fade-in duration-700 bg-white py-[80px] lg:py-[120px] min-h-[500px] lg:min-h-[600px] min-[1440px]:min-h-[85vh] 2xl:py-[15vh]"
        >
            {/* Layer 1: Top Left Yellow Glow - Prefooter Style */}
            <div
                className="absolute pointer-events-none rounded-full z-[10]"
                style={{
                    width: '500px',
                    height: '500px',
                    left: '-100px',
                    top: '-100px',
                    background: 'rgba(255, 212, 39, 0.23)',
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
                    background: 'rgba(0, 113, 227, 0.26)',
                    filter: 'blur(108px)',
                }}
            />

            {/* Layer 2: White Glow - Bottom Left (Natural Transition) */}
            <div
                className="absolute bottom-0 left-0 w-full h-[50%] pointer-events-none z-[10]"
                style={{
                    background: 'radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.5) 0%, transparent 45%)'
                }}
            />

            {/* Layer 3: Text Protection Mask - Liquid Fade */}
            <div
                className="absolute inset-0 pointer-events-none z-[5]"
                style={{
                    background: `linear-gradient(to right, 
                        #FFFFFF 0%, 
                        #FFFFFF 25%, 
                        rgba(255, 255, 255, 0) 40%
                    )`
                }}
            />

            <div className="boutique-width w-full py-10 lg:py-0 flex items-center relative z-10 h-full pointer-events-none">
                {/* Main Content Area */}
                <div className="w-full lg:max-w-[50%] flex flex-col justify-center items-start relative z-20 pointer-events-auto">
                    {/* Jobsian Typographic Scale - OPTICAL BALANCE FIX */}
                    <h1
                        className="leading-none w-full antialiased"
                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                    >
                        <span className="block text-[2.4375rem] md:text-[3.375rem] font-semibold tracking-tight text-slate-900 leading-[1.1] font-sans max-w-[90%] md:max-w-none whitespace-pre-line">
                            {t('hero.title') || 'Discover\nUkrainian Products'}
                        </span>
                        <span className="block text-[1.8125rem] md:text-[2.5625rem] font-normal tracking-tight text-[#2D50A0]/70 whitespace-nowrap mt-2">
                            {t('hero.subtitle') || 'sold across Canada'}
                        </span>
                    </h1>

                    <p className="mt-8 mb-8 text-[18px] text-slate-600 leading-relaxed max-w-md lg:max-w-lg font-normal">
                        Find, add, and share local stores to support Ukraine's economy with every purchase.
                    </p>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto md:mb-10">
                        <Link href="/map" className="w-full md:w-auto">
                            <Button
                                className="h-[50px] 2xl:h-[54px] px-8 2xl:px-10 w-full md:w-auto rounded-full bg-[linear-gradient(to_bottom,#3A3F4F,#2F3341)] text-white font-medium text-[16px] 2xl:text-[18px] tracking-tight 2xl:tracking-normal antialiased transition-all duration-300 shadow-md hover:shadow-lg hover:bg-[linear-gradient(to_bottom,#3A3F4F,#3A3F4F)] hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-navy/20 group/cta-btn flex items-center justify-center gap-2 2xl:gap-3"
                            >
                                <span>{t('hero.ctaPrimary') || 'Explore the Map'}</span>
                                <MapPin className="w-4 h-4 2xl:w-5 2xl:h-5" />
                            </Button>
                        </Link>

                        <a
                            href="#how-it-works"
                            className="text-[15px] font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center w-full md:w-auto gap-1.5 hover:underline underline-offset-4 decoration-slate-300 group/help"
                        >
                            <Info className="w-4 h-4 opacity-70 group-hover/help:opacity-100 transition-opacity" />
                            <span>{t('hero.ctaSecondary') || 'How It Works'}</span>
                        </a>
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
            <div
                className="hidden lg:block absolute top-0 right-0 w-[60%] h-full z-0 select-none overflow-hidden translate-x-[0%] pointer-events-auto"
                aria-label="Interactive map of Ukrainian stores in Canada"
            >
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

                    {/* Gradient Alpha Masking - The "Built-in" Feel */}
                    {/* Left Edge Fade (Stronger to make text legible) */}
                    <div className="absolute top-0 bottom-0 left-0 w-[400px] z-[20] pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent" />

                    {/* Top Edge Fade */}
                    <div className="absolute top-0 left-0 right-0 h-[150px] z-[20] pointer-events-none bg-gradient-to-b from-white via-white/50 to-transparent" />

                    {/* Bottom Edge Fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-[100px] z-[20] pointer-events-none bg-gradient-to-t from-white via-white/50 to-transparent" />
                </div>
            </div>

            {/* 6. Trust & Origin Metadata - Desktop (Bottom Right) */}
            <div className="hidden md:flex absolute bottom-12 right-12 z-20 items-center gap-4 mix-blend-multiply pointer-events-none select-none">
                <div className="flex items-center gap-5">
                    <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                        Community-driven map
                    </span>
                    <span className="text-slate-400 text-[10px] font-light">/</span>
                    <div className="flex items-center gap-2.5">
                        <div className="w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 italic">
                            Verified stores
                        </span>
                    </div>
                    <span className="text-slate-400 text-[10px] font-light">/</span>
                    <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                        Made in Ukraine only
                    </span>
                </div>
            </div>

            {/* 6b. Trust & Origin Metadata - Mobile (Centered) */}
            <div className="md:hidden absolute bottom-8 left-0 right-0 z-20 flex justify-center pointer-events-none select-none px-6">
                <div className="flex items-center gap-2.5 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-100/50">
                    <div className="w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.4)]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                        Verified Ukrainian Products
                    </span>
                </div>
            </div>
        </section>
    );
}
