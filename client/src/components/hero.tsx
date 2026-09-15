import { Search, Info, ChevronDown, Plus } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Suspense, lazy, useCallback, useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import wheatFieldBg from "@/assets/golden_wheat_sunset.png";
import mapleLeafIcon from "@/assets/maple_leaf.png";
import { GoogleMapsProvider } from "@/components/google-maps-provider";
import type { Store } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import flagsDecoration from "@assets/0008.png";
import mapsDecoration from "@/assets/maps.png";

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

export function Hero() {
    const [, setLocation] = useLocation();
    const [shouldRenderHeroMap, setShouldRenderHeroMap] = useState(true);
    const [heroVariant, setHeroVariant] = useState<HeroVariant>(() => getHeroVariantFromUrl());
    const { t } = useI18n();

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
            title: t('hero.trustPillars.economy.title') || "Local support for Ukraine's economy",
            detail: t('hero.trustPillars.economy.detail') || "every purchase goes directly to Ukrainian makers",
            accentClass: "",
            surfaceClass: "bg-[#EFF6FF]/70",
            dotClass: "bg-[#0057B7]",
        },
        {
            title: t('hero.trustPillars.verified.title') || "Volunteer-verified listings",
            detail: t('hero.trustPillars.verified.detail') || "every listing is reviewed before it appears on the map",
            accentClass: "",
            surfaceClass: "bg-[#FFFBEB]/80",
            dotClass: "bg-[#FFD700]",
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

    if (heroVariant === "b") {
        return (
            <HeroVariantB
                stores={stores}
                shouldRenderHeroMap={shouldRenderHeroMap}
                trustPillars={trustPillars}
            />
        );
    }

    return (
        <>
                <div className="flex flex-col h-auto bg-white justify-between relative">
        <section
            className="hero-desktop-frame flex-none relative z-10 w-full max-w-none mx-auto overflow-hidden font-sans flex items-stretch pt-0 mt-0"
        >
            <HeroTickerRow stores={stores} />
            <div className="md:hidden relative w-full overflow-hidden bg-white font-sans">
                <div className="relative overflow-hidden bg-[#0057B7] bg-[radial-gradient(120%_120%_at_50%_0%,rgba(45,145,245,0.95)_0%,rgba(0,87,183,1)_45%,rgba(0,55,125,1)_100%)] px-5 pt-14 pb-3 text-white [@media(max-height:700px)]:pt-9 [@media(max-height:700px)]:pb-3">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(0,87,183,0)_46%)]" />
                    <motion.div 
                        className="relative z-10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="mb-4 h-[10px] pointer-events-none" aria-hidden="true" />

                        <div className="w-fit flex flex-col">
                        <h1
                            className="relative z-10 max-w-full text-[clamp(2.28rem,11.59vw,3.17rem)] font-normal not-italic leading-[1.08] tracking-[-0.035em] antialiased [@media(max-height:700px)]:text-[2.45rem] translate-y-[12px]"
                             style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                        >
                            <span className="block text-white font-normal not-italic tracking-[-0.035em] whitespace-nowrap">
                                {t("hero.headline.discover") || "Discover"}
                            </span>
                            <span className="block text-[#FFD700] font-normal not-italic tracking-[-0.035em] pr-1 whitespace-nowrap">
                                {t("hero.headline.ukrainian") || "Ukrainian"} {t("hero.headline.products") || "Products"}
                            </span>
                        </h1>

                        <div className="mt-[-2px] flex items-center justify-start gap-2.5 w-full text-[clamp(1.50rem,7.05vw,1.99rem)] font-light italic leading-tight tracking-[-0.01em] text-white/90 [@media(max-height:700px)]:text-[1.42rem]">
                            <span className="whitespace-nowrap translate-y-[-12px] md:translate-y-[-16px] lg:translate-y-[-20px]">{t('hero.headline.soldAcross')} {t('hero.headline.canada')}</span>
                            <img 
                                src={mapsDecoration} 
                                alt="Ukraine to Canada" 
                                className="h-[96px] w-auto object-contain opacity-95 shrink-0 translate-y-[-10px]" 
                            />
                        </div>
                        </div>
                        <p className="mt-1 w-full max-w-full text-left text-[clamp(14px,3.6vw,17px)] font-normal leading-snug tracking-[0.01em] text-white/85">
                            {t('hero.descriptionFind') || 'One map to'} <strong className="font-bold text-white border-b border-[#FFD700]/70 pb-[1px]">{t('hero.descriptionFindBold') || 'find'}</strong>{t('hero.descriptionAdd') || ','} <strong className="font-bold text-white border-b border-[#FFD700]/70 pb-[1px]">{t('hero.descriptionAddBold') || 'add'}</strong>{t('hero.descriptionShare') || ', and'} <strong className="font-bold text-white border-b border-[#FFD700]/70 pb-[1px]">{t('hero.descriptionShareBold') || 'share'}</strong> stores selling <strong className="font-bold text-white border-b border-[#FFD700]/70 pb-[1px]">#madeinUkraine</strong> near you.
                        </p>

                        <div className="mt-6 mb-4 grid gap-2.5 [@media(max-height:700px)]:mt-5" style={{ transform: 'translateY(0px)' }}>
                            <Link href="/map" className="pointer-events-auto">
                                <button className="group/cta-btn relative inline-flex h-[51px] w-full md:scale-[0.97] items-center justify-center rounded-none bg-[#edf3f9]/96 px-6 text-[clamp(15px,1.2vw,19px)] font-bold tracking-[0.03em] text-[#0057B7] shadow-[5px_5px_0px_#FFD700] transition-all duration-300 hover:md:scale-[0.99] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#edf3f9]/35">
                                    <span>{t('hero.ctaPrimary') || 'Find stores near me'}</span>
                                    <Search className="ml-2.5 h-5 w-5 text-current transition-transform duration-300 group-hover/cta-btn:scale-110" strokeWidth={1.5} />
                                </button>
                            </Link>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('openAddStoreModal'))}
                                className="pointer-events-auto inline-flex h-10 w-full items-center justify-center gap-2 border border-white/20 bg-white/10 text-[14px] font-medium tracking-normal text-white transition-all duration-300 hover:bg-white/20 active:scale-[0.98] outline-none"
                            >
                                <span>{t('nav.addStore') || 'Add a New Store'}</span>
                                <Plus className="h-4 w-4 text-current" strokeWidth={2.5} />
                            </button>
                        </div>
                    </motion.div>
                </div>

                <Link
                    href="/map"
                    className="group/mobile-map pointer-events-auto relative block h-[42svh] min-h-[280px] max-h-[390px] w-full overflow-hidden border-y border-slate-200 bg-white [@media(max-height:700px)]:h-[260px] [@media(max-height:700px)]:min-h-[240px]"
                    aria-label="Explore the interactive map"
                >
                    {shouldRenderHeroMap && stores.length > 0 ? (
                        <GoogleMapsProvider>
                            <Suspense fallback={<div className="h-full w-full bg-[linear-gradient(180deg,#edf4fb_0%,#dbe9f5_100%)]" />}>
                                <div className="pointer-events-none absolute inset-0 scale-[1.28] translate-x-[6%] translate-y-[-4%]">
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
            <div className="hidden md:block absolute inset-x-0 top-0 bottom-0 bg-[#0057B7] bg-[radial-gradient(110%_110%_at_35%_0%,rgba(45,145,245,0.85)_0%,rgba(0,87,183,1)_50%,rgba(0,55,125,1)_100%)] z-[25]" />
            <div className="hero-desktop-copy-layer content-width hidden md:flex w-full items-center relative z-30 h-full pointer-events-none px-3 md:px-5 lg:px-6">
                <div className="w-full flex justify-start items-center h-full relative md:-translate-y-[30px]">
                    <motion.div 
                        className="hero-canopy-safe-content relative z-20 w-full max-w-full md:max-w-[562px] lg:max-w-[725px] xl:max-w-[775px] h-full flex flex-col justify-center items-start pointer-events-none pb-[11.75rem] md:pb-0 md:translate-x-[3vw] min-[1670px]:-translate-x-[3vw]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                    <div className="relative z-10 flex w-full flex-col items-start">
                        <div className="relative z-10 flex flex-col items-start w-fit hero-text-align transition-transform duration-300 mt-[12vh] translate-y-0">
                            <motion.div 
                                initial={{ opacity: 0, y: 22 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 0.1, ease: [0.215, 0.61, 0.355, 1.0] }}
                                className="w-fit flex flex-col"
                            >
                                <h1
                                    ref={h1Ref}
                                    className="relative z-10 w-fit max-w-[calc(100vw-2.5rem)] md:max-w-none leading-[1.05] md:leading-[1.08] antialiased mb-1.5 md:mb-2 text-white font-normal text-left translate-y-[12px] md:translate-y-[18px] lg:translate-y-[24px]"
                                    style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                                >
                                    <span className="hero-headline-line block w-full text-left font-sans font-normal not-italic text-[clamp(2.226rem,7.835vw,3.116rem)] md:text-[2.707rem] lg:text-[3.384rem] tracking-[-0.035em] mb-0 whitespace-nowrap">
                                        <span className="text-white font-normal not-italic tracking-[-0.035em]">{t('hero.headline.discover') || "Discover"}</span>
                                    </span>
                                    <div className="md:ml-0 flex w-full justify-start overflow-visible">
                                        <span className="hero-headline-line relative block w-fit font-sans font-normal not-italic text-[clamp(2.226rem,7.835vw,3.116rem)] md:text-[2.707rem] lg:text-[3.232rem] tracking-[-0.035em] whitespace-nowrap text-[#FFD700] pr-2 pb-1">
                                            {t('hero.headline.ukrainian') || "Ukrainian"} {t('hero.headline.products') || "Products"}
                                        </span>
                                    </div>
                                </h1>
                                
                                {/* Subline aligned to the left side of the headline */}
                                <div className="w-full flex items-center justify-start gap-3 mt-[-2px] md:mt-[-4px]">
                                    <span className="relative z-10 flex items-center justify-start font-sans text-[clamp(1.392rem,4.641vw,1.74rem)] md:text-[1.526rem] lg:text-[1.981rem] font-light italic tracking-[-0.01em] normal-case text-white/90 text-left whitespace-nowrap translate-y-[-12px] md:translate-y-[-18px] lg:translate-y-[-24px]">
                                        <span>{t('hero.headline.soldAcross')} {t('hero.headline.canada')}</span>
                                    </span>
                                    <img 
                                        src={mapsDecoration} 
                                        alt="Ukraine to Canada" 
                                        className="h-[112px] md:h-[136px] lg:h-[160px] w-auto object-contain opacity-95 shrink-0 translate-y-[-12px] md:translate-y-[-16px] lg:translate-y-[-20px]" 
                                    />
                                </div>
                            </motion.div>
                        </div>
                                    
                                    {/* Description and CTA Wrapper */}
                                    <div className="flex w-full flex-col items-start self-start mt-0 md:mt-0 mb-6 md:mb-10 gap-1.5 md:gap-2">
                                        <motion.p 
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.65, delay: 0.1, ease: [0.215, 0.61, 0.355, 1.0] }}
                                            className="hero-description-copy relative z-10 mt-0 w-full max-w-none md:whitespace-nowrap translate-y-[-2vh] self-start text-left font-sans text-[clamp(15px,1.1vw,19px)] min-[1670px]:text-[19px] font-normal leading-relaxed tracking-[0.015em] text-white/85"
                                        >
                                            {t('hero.descriptionFind') || 'One map to'} <strong className="font-bold text-white border-b border-[#FFD700]/70 pb-[1px]">{t('hero.descriptionFindBold') || 'find'}</strong>{t('hero.descriptionAdd') || ','} <strong className="font-bold text-white border-b border-[#FFD700]/70 pb-[1px]">{t('hero.descriptionAddBold') || 'add'}</strong>{t('hero.descriptionShare') || ', and'} <strong className="font-bold text-white border-b border-[#FFD700]/70 pb-[1px]">{t('hero.descriptionShareBold') || 'share'}</strong> stores selling<br className="md:hidden" /> <strong className="font-bold text-white border-b border-[#FFD700]/70 pb-[1px]">#madeinUkraine</strong> near you.
                                        </motion.p>

                                    </div>
                                </div>
                        </motion.div>
                    </div>
                </div>

            {/* Suspense boundary ensures both the map and its yellow accent load at exactly the same time */}
            <Suspense fallback={null}>
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                        duration: 1.4, 
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className="absolute inset-0 z-30 pointer-events-none content-width left-1/2 -translate-x-1/2 px-3 md:px-5 lg:px-6"
                >
            <div
                className="hero-map-insert hidden md:block absolute right-3 md:right-5 lg:right-6 top-1/2 h-auto aspect-[1.5] w-[39.7%] min-[1440px]:w-[36.57%] bottom-auto z-40 select-none border-none outline-none group/map-peeking pointer-events-auto"
            >
                {/* CTA 1 Button positioned directly under the map insert block in brand yellow */}
                <div 
                    className="absolute -bottom-[3.6rem] min-[1670px]:-bottom-[4.0rem] left-0 right-0 flex justify-center items-center pointer-events-auto z-50"
                >
                    <Link href="/map" className="w-auto">
                        <button
                            className="group/cta-btn relative inline-flex scale-[0.97] min-[1670px]:scale-[0.97] items-center justify-center h-[51px] 2xl:h-[55px] min-[1670px]:h-[57px] px-7.5 min-[1670px]:px-[31.35px] text-[clamp(15px,1.1vw,19px)] min-[1670px]:text-[19px] font-bold tracking-[0.03em] rounded-none bg-[#FFD700] hover:bg-[#ffe033] text-[#0057B7] transition-all duration-300 hover:scale-[0.99] hover:min-[1670px]:scale-[0.99] active:scale-[0.98] shadow-none focus:outline-none focus:ring-2 focus:ring-[#FFD700]/40 font-sans antialiased cursor-pointer"
                        >
                            <span>{t('hero.ctaPrimary') || 'Find stores near me'}</span>
                            <Search 
                                className="w-5 h-5 min-[1670px]:w-[20px] min-[1670px]:h-[20px] ml-2.5 text-[#0057B7] transition-transform duration-300 group-hover/cta-btn:scale-110" 
                                strokeWidth={1.5}
                            />
                        </button>
                    </Link>
                </div>

                <div
                    className="w-full h-full border-none outline-none relative overflow-hidden bg-white rounded-[28px] shadow-[0_20px_50px_-10px_rgba(0,25,65,0.28),0_4px_16px_rgba(0,0,0,0.08)]"
                    aria-label="Interactive map of Ukrainian stores in Canada"
                >
                    <div
                        className="pointer-events-none absolute inset-0 z-[75] bg-[linear-gradient(135deg,rgba(255,255,255,0.36)_0%,rgba(255,255,255,0.10)_38%,rgba(255,255,255,0)_58%,rgba(0,87,183,0.06)_100%)]"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute inset-0 z-[80] shadow-[inset_0_0_34px_rgba(255,255,255,0.92),inset_0_0_0_1px_rgba(255,255,255,0.46)]"
                        aria-hidden="true"
                    />

                    {/* Floating Trust Pillars inside map insert */}
                    <div className="absolute top-4 right-4 lg:top-5 lg:right-6 z-[85] flex flex-col items-end gap-2.5 pointer-events-none">
                        {trustPillars.map((pillar) => (
                            <div
                                key={pillar.title}
                                className="hero-map-pillar-card flex items-center justify-end px-3.5 py-1.5 lg:px-4 lg:py-2 bg-white/65 hover:bg-white/80 backdrop-blur-xl rounded-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] border-none pointer-events-auto transition-all duration-300"
                            >
                                <div className="flex items-center gap-2.5 text-right">
                                    <span className="shrink-0 w-3.5 h-[2px] bg-[#0057B7]/50 rounded-full" />
                                    <span className="hero-map-pillar-text text-[12px] lg:text-[13.5px] font-medium text-[#0057B7] tracking-[0.05em] whitespace-nowrap font-sans antialiased">
                                        {pillar.title}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Inner wrapper for shifted map content */}
                    <div
                        className="absolute top-0 left-0 w-[122%] h-[150%] border-none outline-none scale-[1.0] translate-x-[0%] translate-y-[-1%] md:scale-[1.12] md:translate-x-[-17%] md:translate-y-[-27%] lg:scale-[1.18] lg:translate-x-[-20%] lg:translate-y-[-26%] min-[1280px]:scale-[1.2] min-[1280px]:translate-x-[-16%] min-[1280px]:translate-y-[-25%] group-hover/map-peeking:md:scale-[1.14] group-hover/map-peeking:lg:scale-[1.20] group-hover/map-peeking:min-[1280px]:scale-[1.22] transition-all duration-700 ease-out"
                    >
                        <div className="relative w-full h-full pointer-events-auto border-none outline-none">



                            {/* AURORA OVERLAY */}
                            <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none opacity-0">
                                <div className="absolute top-[25%] right-[45%] w-[350px] h-[150px] bg-[#0057B7] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                                <div className="absolute top-[50%] right-[30%] w-[350px] h-[150px] bg-[#FFD900] rounded-[100%] blur-[60px] opacity-[0.35] -rotate-45"></div>
                            </div>

                            {shouldRenderHeroMap ? (
                                <GoogleMapsProvider>
                                        <motion.div
                                            initial={{ scale: 1, opacity: 0 }}
                                            animate={{ scale: 1.03, opacity: 1 }}
                                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                                            className="w-full h-full cursor-pointer pointer-events-auto will-change-transform group/map-hover relative bg-white"
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
                                </GoogleMapsProvider>
                            ) : (
                                <div className="w-full h-full bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(255,255,255,0.58)_35%,rgba(219,234,254,0.22)_100%)]" />
                            )}
                        </div>
                    </div>

                </div>
            </div>
            </motion.div>
            </Suspense>
        </section>





        </div>

        </>
    );
}

interface HeroVariantBProps {
    stores: Store[];
    shouldRenderHeroMap: boolean;
    trustPillars: TrustPillar[];
}

function HeroVariantB({
    stores,
    shouldRenderHeroMap,
    trustPillars,
}: HeroVariantBProps) {
    const { t } = useI18n();
    return (
        <>
            <div className="flex flex-col h-auto bg-white justify-between relative">
                <section className="relative z-10 w-full max-w-none mx-auto overflow-hidden bg-white font-sans animate-in fade-in duration-700">
                    <HeroTickerRow stores={stores} />
                    <div className="md:hidden relative z-10 w-full overflow-hidden bg-white font-sans">
                        <div className="relative px-5 pt-7 pb-3.5 text-slate-700">
                            <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[radial-gradient(ellipse_112%_94%_at_0%_0%,rgba(0,87,183,0.11)_0%,rgba(200,223,240,0.13)_38%,rgba(200,223,240,0.055)_58%,rgba(255,255,255,0)_86%)]" aria-hidden="true" />
                            <div className="relative z-10">
                                <div className="w-fit flex flex-col">
                                    <h1 className="font-['Lora'] text-[clamp(2.71rem,11.67vw,3.45rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-[#0057B7] antialiased">
                                        <span className="block">{t('hero.headline.discover') || 'Discover'}</span>
                                        <span className="block">
                                            {t('hero.headline.ukrainianProducts') || 'Ukrainian Products'}
                                        </span>
                                    </h1>
                                    <div className="mt-[1px] flex justify-start w-full text-[clamp(1.65rem,7.73vw,2.21rem)] font-light italic leading-tight tracking-normal text-slate-600">
                                        <span className="whitespace-nowrap">{t('hero.headline.soldAcross') || 'sold across'} {t('hero.headline.canada') || 'Canada'}</span>
                                    </div>
                                </div>
                            <p className="mt-1 max-w-[18rem] min-[375px]:max-w-[22rem] min-[410px]:max-w-[24rem] text-left text-[15px] font-bold leading-snug tracking-[0.015em] text-slate-600">
                                    {t('hero.descriptionFind') || 'One map to'} <span className="font-semibold">{t('hero.descriptionFindBold') || 'find'}</span>{t('hero.descriptionAdd') || ','} <span className="font-semibold">{t('hero.descriptionAddBold') || 'add'}</span>{t('hero.descriptionShare') || ', and'} <span className="font-semibold">{t('hero.descriptionShareBold') || 'share'}</span> {(t('hero.descriptionEnd') || 'stores selling #madeinUkraine near you.').split('#madeinUkraine')[0]}<span className="font-bold">#madeinUkraine</span>{(t('hero.descriptionEnd') || 'stores selling #madeinUkraine near you.').split('#madeinUkraine')[1]}
                                </p>
                                <div className="mt-6 mb-4 grid gap-2.5 [@media(max-height:700px)]:mt-[30px]" style={{ transform: 'translateY(0px)' }}>
                                    <Link href="/map" className="pointer-events-auto">
                                            <button className="group/cta-btn relative inline-flex h-[54px] w-full md:scale-[1.02] items-center justify-center rounded-none border border-[#FFD700] bg-[#FFD700] px-6 text-[clamp(16px,1.25vw,20px)] font-bold tracking-[0.03em] text-[#0057B7] shadow-none transition-all duration-300 hover:md:scale-[1.04] hover:border-[#0057B7] hover:bg-[#0057B7] hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#0057B7]/30">
                                                <span>{t('hero.ctaPrimary') || 'Find stores near me'}</span>
                                                <Search className="ml-2.5 h-5 w-5 text-current transition-transform duration-300 group-hover/cta-btn:scale-110" strokeWidth={1.5} />
                                            </button>
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
                                        <div className="pointer-events-none absolute inset-0 scale-[1.28] translate-x-[6%] translate-y-[-4%]">
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
                        <div className="pointer-events-none absolute left-0 top-0 z-[11] h-[78%] w-[86%] bg-[radial-gradient(ellipse_106%_92%_at_0%_0%,rgba(0,87,183,0.07)_0%,rgba(200,223,240,0.08)_36%,rgba(200,223,240,0.035)_62%,rgba(255,255,255,0)_88%)]" aria-hidden="true" />
                        <div
                            className="absolute inset-y-0 right-0 z-0 w-[64%] select-none overflow-hidden group/map-peeking"
                            aria-label="Interactive map of Ukrainian stores in Canada"
                            style={{
                                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.75) 32%, black 50%, black 100%)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 15%, rgba(0,0,0,0.75) 32%, black 50%, black 100%)'
                            }}
                        >
                            <div className="absolute inset-0 scale-[1.08] translate-x-[4%] translate-y-[-6%] group-hover/map-peeking:scale-[1.14] transition-all duration-700 ease-out">
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
                                                className="h-full w-full cursor-pointer pointer-events-auto will-change-transform group/map-hover relative"
                                            >
                                                <Link href="/map" className="block h-full w-full relative">
                                                    <InteractiveMap
                                                        stores={stores}
                                                        selectedStore={null}
                                                        onSelectStore={noopSelectStore}
                                                        onCloseStore={noop}
                                                        variant="hero"
                                                        isMobile={false}
                                                    />
                                                    {/* Hover Hint Overlay */}
                                                    <div className="absolute inset-0 z-[70] flex flex-col justify-start pt-[18%] items-center opacity-0 group-hover/map-hover:opacity-100 transition-all duration-500 group-hover/map-hover:delay-300 pointer-events-none bg-slate-900/[0.03]">
                                                        <div className="transform translate-y-2 group-hover/map-hover:translate-y-0 transition-all duration-500 group-hover/map-hover:delay-300">
                                                            <span className="text-[11px] font-extrabold tracking-[0.32em] group-hover/map-hover:tracking-[0.40em] uppercase text-[#7B93AC] whitespace-nowrap font-sans transition-all duration-500 antialiased drop-shadow-sm">
                                                                {t('hero.tapToExplore') || 'TAP TO EXPLORE THE MAP'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        </Suspense>
                                    </GoogleMapsProvider>
                                ) : (
                                    <div className="h-full w-full bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(219,234,254,0.25)_100%)]" />
                                )}
                            </div>
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-[44%] bg-gradient-to-r from-white via-white/72 to-transparent" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-[11] h-[210px] bg-[linear-gradient(180deg,rgba(255,255,255,0.46)_0%,rgba(226,238,248,0.2)_46%,rgba(255,255,255,0)_100%)]" />
                        
                        <Link href="/map" className="absolute bottom-6 left-1/2 z-[85] -translate-x-1/2">
                            <button className="group/cta-btn relative inline-flex h-[54px] 2xl:h-[58px] min-[1670px]:h-[60.34px] scale-[1.02] items-center justify-center whitespace-nowrap rounded-none border border-[#FFD700] bg-[#FFD700] px-8 min-[1670px]:px-[33.29px] text-[clamp(16px,1.17vw,19.89px)] font-bold tracking-[0.03em] text-[#0057B7] shadow-none transition-all duration-300 hover:scale-[1.02] hover:border-[#0057B7] hover:bg-[#0057B7] hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#0057B7]/30">
                                <span>Find stores near me</span>
                                <Search className="ml-2.5 h-5 w-5 text-current transition-transform duration-300 group-hover/cta-btn:scale-110" strokeWidth={1.5} />
                            </button>
                        </Link>
                    </div>

                        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_96%_112%_at_0%_50%,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.93)_27%,rgba(255,255,255,0.68)_48%,rgba(255,255,255,0.2)_68%,rgba(255,255,255,0)_88%)]" />

                        <div className="hidden lg:flex pointer-events-none absolute right-[56px] top-[10%] z-30 flex-col items-end gap-2">
                            {trustPillars.map((pillar) => (
                                <div
                                    key={`b-${pillar.title}`}
                                    className={cn(
                                        "flex w-fit max-w-[520px] flex-col items-end bg-white/55 px-[22px] py-2.5 text-right backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.015)]",
                                        pillar.accentClass
                                    )}
                                >
                                    <div className="flex items-center justify-end gap-3 text-right">
                                        <span className="shrink-0 w-3 h-[2px] bg-[#0057B7]/40" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0057B7]/70 antialiased">
                                            {pillar.title}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="boutique-width relative z-20 mx-auto flex min-h-[calc(85vh-81px)] items-center translate-y-0 pointer-events-none">
                            <div className="relative ml-[64px] w-fit max-w-[calc(100vw-160px)] pointer-events-auto lg:max-w-[760px]">
                                {/* Golden stroke ornament — above Discover, left-aligned */}
                                <div className="pointer-events-none self-start mb-[18px] flex flex-col items-start gap-[4px]" aria-hidden="true">
                                    <span className="block h-[2px] w-[200px] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_12%,rgba(255,215,0,0.9)_78%,rgba(255,215,0,0)_100%)]" />
                                    <span className="block h-px w-[110px] bg-[linear-gradient(90deg,rgba(255,215,0,0)_0%,rgba(255,215,0,0.95)_16%,rgba(255,215,0,0.78)_74%,rgba(255,215,0,0)_100%)]" />
                                </div>
                                <h1 className="mb-6 md:mb-10 w-fit font-['Lora'] text-[clamp(3.25rem,4.7vw,4rem)] font-semibold leading-[1.03] tracking-normal text-[#0057B7] antialiased md:-translate-y-[5%]">
                                    <span className="block">Discover</span>
                                    <span className="block whitespace-nowrap">
                                        <span className="relative inline-block pb-4">
                                            Ukrainian
                                        </span>{" "}
                                        Products
                                    </span>
                                </h1>
                                <div className="mt-[-2.6rem] md:mt-[-3.6rem] mb-6 md:mb-10 flex w-full flex-col items-start gap-6">
                                    <span className="relative z-10 flex items-center self-start font-sans text-[clamp(1.995rem,2.7825vw,3.15rem)] font-normal leading-tight tracking-normal text-slate-600 md:-translate-y-[10%] gap-3">
                                         sold across Canada
                                    </span>
                                    <p className="relative z-10 max-w-none self-start text-left font-sans text-[18px] min-[1670px]:text-[18.36px] font-bold leading-snug tracking-normal text-slate-600 md:whitespace-nowrap">
                                        One map to <span className="font-semibold">find</span>, <span className="font-semibold">add</span>, and <span className="font-semibold">share</span> stores selling <span className="font-bold">#madeinUkraine</span> near you.
                                    </p>
                                    <div className="flex md:hidden items-center gap-8 self-start relative z-20 pointer-events-auto" style={{ transform: 'translateY(13vh)' }}>
                                        <Link href="/map">
                                            <button className="group/cta-btn relative inline-flex h-[50px] scale-[1.02] items-center justify-center rounded-none border border-[#FFD700] bg-[#FFD700] px-6 text-[16px] min-[1024px]:text-[17px] xl:text-[18px] font-semibold tracking-normal text-[#0057B7] shadow-none transition-all duration-300 hover:scale-[1.02] hover:border-[#0057B7] hover:bg-[#0057B7] hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#0057B7]/30">
                                                <span>Find stores near me</span>
                                                <Search className="ml-2.5 h-5 w-5 text-current transition-transform duration-300 group-hover/cta-btn:scale-110" strokeWidth={1.5} />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </>
    );
}

function HeroTickerRow({ stores }: { stores: Store[] }) {
    const { t } = useI18n();
    const shouldReduceMotion = useReducedMotion();
    
    return (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[95] block w-full bg-transparent pt-4 pb-2 md:pt-[18px] md:pb-3">
            <div className="content-width" aria-hidden="true">
                <div className="transition-all duration-300 w-full">
                    <div className="flex h-full items-center justify-between gap-4 md:gap-6">
                        {/* "ADDED RECENTLY" Label */}
                        <div className="shrink-0 flex items-center gap-2 z-10 select-none">
                            <div className="hero-ticker-dot relative flex h-[7px] w-[7px] items-center justify-center">
                                <span className="hero-ticker-dot-ring absolute inset-0 rounded-full border border-[#FFD700]/70"></span>
                                <span className="relative inline-flex h-[5px] w-[5px] rounded-full bg-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.72)]"></span>
                            </div>
                            <span className="text-[10px] md:text-[12px] lg:text-[12.5px] xl:text-[13.5px] min-[1670px]:text-[15.5px] 2xl:text-[17px] font-bold tracking-widest text-white/68 uppercase whitespace-nowrap font-sans antialiased">
                                {t('hero.addedRecently') || 'ADDED RECENTLY'}
                            </span>
                        </div>
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
                                    animate={{ x: shouldReduceMotion ? 0 : "-50%" }}
                                    transition={{
                                        duration: 110,
                                        repeat: Infinity,
                                        ease: "linear",
                                        repeatType: "loop"
                                    }}
                                >
                                    {[...stores.slice(0, 10), ...stores.slice(0, 10)].map((store, i) => (
                                        <div key={`b-${store.id}-${i}`} className="flex items-center px-6 md:px-10 min-[1670px]:px-12 shrink-0 group/ticker-item cursor-pointer">
                                            <span className="text-[12.2px] md:text-[14.5px] lg:text-[13.5px] xl:text-[15.5px] min-[1670px]:text-[16.5px] 2xl:text-[18px] font-normal text-white/84 tracking-wide font-sans antialiased whitespace-nowrap drop-shadow-[0_1px_8px_rgba(0,57,125,0.32)]">
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
