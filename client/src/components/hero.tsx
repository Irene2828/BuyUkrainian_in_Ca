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
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    return (
        <section
            className="relative z-10 w-full max-w-[1920px] mx-auto overflow-hidden font-sans flex items-center animate-in fade-in duration-700 bg-white min-h-[75vh]"
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

            <div className="boutique-width w-full flex items-center relative z-10 h-full pointer-events-none">
                {/* Main Content Area - Glass Anchored Container */}
                <div className="relative z-10 max-w-2xl h-full flex flex-col justify-center items-start pointer-events-none">
                    {/* Jobsian Typographic Scale - OPTICAL BALANCE FIX */}
                    <h1
                        className="leading-[1.1] w-full antialiased pointer-events-auto text-[#0F172A]/65"
                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                    >
                        <span className="block text-[2.4375rem] md:text-[3.0375rem] min-[1441px]:text-[3.375rem] font-semibold tracking-tight leading-[1.1] font-sans max-w-[90%] md:max-w-none whitespace-pre-line text-[#0F172A]/65">
                            {t('hero.title') || 'Discover\nUkrainian Products'}
                        </span>
                        <span className="block text-[1.8125rem] md:text-[2.306rem] min-[1441px]:text-[2.5625rem] font-normal tracking-tight whitespace-nowrap text-[#0F172A]/65">
                            sold across Canada
                        </span>
                    </h1>

                    <p className="mt-5 text-[16px] text-slate-600/85 leading-relaxed max-w-md lg:max-w-lg font-medium pointer-events-auto">
                        A map directory of local stores selling products made in Ukraine.
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto mt-10 pointer-events-auto">
                        <Link href="/map" className="w-full md:w-auto">
                            <Button
                                className="inline-flex items-center justify-center h-[46px] px-6 text-[16px] font-medium tracking-tight rounded-full bg-[#FFD700] text-[#0A2540] transition-all duration-300 2xl:h-[54px] 2xl:px-9 2xl:text-[17px] shadow-[0_4px_14px_0_rgba(255,215,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,215,0,0.4)] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FFD700]/50 gap-2.5 group/cta-btn border-none"
                            >
                                <span>{t('hero.ctaPrimary') || 'Open Interactive Map'}</span>
                                <MapPin className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform duration-300 group-hover/cta-btn:translate-y-[-1px]" />
                            </Button>
                        </Link>

                        <Link
                            href="/#how-it-works"
                            onClick={(e) => {
                                e.preventDefault(); // Prevent default wouter navigation
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
            <div className="hidden lg:block absolute top-0 right-0 w-[59%] h-full z-20 select-none overflow-hidden">
                <div
                    className="w-full h-full group/map-peeking"
                    aria-label="Interactive map of Ukrainian stores in Canada"
                    style={{
                        maskImage: 'linear-gradient(to right, transparent, black 15%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%)'
                    }}
                >
                    {/* Inner wrapper for shifted map content */}
                    <div className="absolute inset-0 transition-all duration-700 ease-out scale-[1.18] translate-x-[4%] -translate-y-[2%] min-[1441px]:-translate-y-[12%] min-[1670px]:-translate-y-[4%]">
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
            </div>


        </section>
    );
}
