import { Search, Info, ChevronDown, Plus, List, Map as MapIcon, Copy, CornerUpRight, Share2, MapPin } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import flagsDecoration from "@assets/0008.png";
import mapsDecoration from "@/assets/maps.png";
import canadaRoundFlag from "@/assets/canada-round-flag.png";
import { StoreCard } from "@/components/store-card";
import { LocationPermissionModal } from "@/components/location-permission-modal";

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
            <div className="md:hidden relative w-full overflow-hidden bg-white font-sans">
                <div className="relative overflow-hidden bg-[#0057B7] bg-[radial-gradient(120%_120%_at_50%_0%,rgba(45,145,245,0.95)_0%,rgba(0,87,183,1)_45%,rgba(0,55,125,1)_100%)] px-5 pt-16 pb-3 text-white [@media(max-height:700px)]:pt-10 [@media(max-height:700px)]:pb-3">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(0,87,183,0)_46%)]" />
                    <motion.div 
                        className="relative z-10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="mb-6 h-[16px] pointer-events-none" aria-hidden="true" />

                        <div className="w-fit flex flex-col">
                        <h1
                            className="relative z-10 max-w-full text-[clamp(2.39rem,12.17vw,3.33rem)] font-normal not-italic leading-[1.08] tracking-[-0.05em] antialiased [@media(max-height:700px)]:text-[2.57rem]"
                             style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                        >
                            <span className="block text-white font-normal not-italic tracking-[-0.05em] whitespace-nowrap">
                                {t("hero.headline.discover") || "Discover"}
                            </span>
                            <span className="block text-[#FFD700] font-normal not-italic tracking-[-0.05em] pr-1 whitespace-nowrap">
                                {t("hero.headline.ukrainian") || "Ukrainian"} {t("hero.headline.products") || "Products"}
                            </span>
                        </h1>

                        <div className="mt-2.5 flex items-center justify-start gap-2.5 w-full text-[clamp(1.82rem,8.5vw,2.41rem)] font-thin not-italic leading-tight tracking-[-0.03em] text-white/80 [@media(max-height:700px)]:text-[1.71rem]">
                            <span className="whitespace-nowrap">{t('hero.headline.sold') || 'sold'} <span className="font-normal px-1">{t('hero.headline.across') || 'across'}</span> {t('hero.headline.canada') || 'Canada'}</span>
                            
                            {/* Staircasy Flags - Mobile (inline in same row) */}
                            <div className="flex items-center pointer-events-none z-20 shrink-0 ml-1 mb-1" aria-hidden="true">
                                <div className="relative flex items-center">
                                    <div className="relative aspect-square w-[24px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-white/20 overflow-hidden z-30 shrink-0">
                                        <img src={canadaRoundFlag} alt="Canada" className="w-full h-full object-cover scale-[1.4]" />
                                    </div>
                                    <img src="https://flagcdn.com/ua.svg" alt="Ukraine" className="aspect-square w-[24px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-white/20 object-cover relative z-20 -ml-1.5 mt-2.5 shrink-0" />
                                </div>
                            </div>
                        </div>
                        </div>
                        <p className="mt-8 md:mt-4 w-full max-w-full text-left text-[clamp(16px,3.6vw,19px)] font-normal leading-relaxed tracking-[0.01em] text-white/85">
                            Interactive map to <strong className="font-bold text-white transition-colors duration-200 cursor-pointer hover:underline hover:decoration-[#FFD700]/70 hover:decoration-1 hover:underline-offset-4">find</strong>, <strong className="font-bold text-white transition-colors duration-200 cursor-pointer hover:underline hover:decoration-[#FFD700]/70 hover:decoration-1 hover:underline-offset-4">add</strong>, and <strong className="font-bold text-white transition-colors duration-200 cursor-pointer hover:underline hover:decoration-[#FFD700]/70 hover:decoration-1 hover:underline-offset-4">share</strong> products<br className="hidden xs:inline" /> made in Ukraine and sold locally.
                        </p>
                        {/* Yellow Decor Lines under body text on the right */}
                        <div className="flex flex-col gap-1.5 pointer-events-none mt-8 md:mt-4 mb-8 md:mb-3 items-end self-end w-full" aria-hidden="true">
                            <div className="h-[1px] w-[140px] bg-[#FFD700]" />
                            <div className="h-[1px] w-[52px] bg-[#FFD700]" />
                        </div>
                        <div className="hidden md:flex flex-col items-end self-end w-full gap-1 mt-2 text-[#FFD700] text-[14.5px] font-medium tracking-normal text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                                <span>—</span>
                                <span>{trustPillars[0]?.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 justify-end">
                                <span>—</span>
                                <span>{trustPillars[1]?.title}</span>
                            </div>
                        </div>

                        <div className="mt-8 mb-4 flex flex-col gap-3 w-full [@media(max-height:700px)]:mt-6" style={{ transform: 'translateY(0px)' }}>
                            <Link href="/map" className="pointer-events-auto w-full">
                                <button className="group/cta-btn relative inline-flex h-[46px] w-full items-center justify-center rounded-full bg-[#FFD700] hover:bg-[#FFE033] px-6 text-[15px] font-semibold tracking-[0.015em] text-[#003B7A] shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 font-sans antialiased cursor-pointer">
                                    <Search className="mr-2 h-4 w-4 text-current transition-transform duration-300 group-hover/cta-btn:scale-110" strokeWidth={2.5} />
                                    <span>{t('hero.ctaPrimary') || 'Find stores near me'}</span>
                                </button>
                            </Link>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('openAddStoreModal'))}
                                className="pointer-events-auto inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/15 text-[15px] font-semibold tracking-normal text-white shadow-sm transition-all duration-300 hover:bg-white/25 active:scale-[0.98] outline-none font-sans cursor-pointer"
                            >
                                <Plus className="h-4 w-4 text-current" strokeWidth={2.5} />
                                <span>{t('nav.addStore') || 'Add a store'}</span>
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
            <div className="hero-desktop-copy-layer boutique-width hidden md:flex w-full items-center relative z-30 h-full pointer-events-none">
                <div className="flex-1 min-w-full w-full flex justify-start items-center h-full relative md:translate-y-[0px] lg:translate-y-[10px]">
                    <motion.div 
                        className="hero-canopy-safe-content relative z-20 w-full max-w-full md:max-w-[562px] lg:max-w-[725px] xl:max-w-[775px] h-full flex flex-col justify-center items-start pointer-events-none pb-[11.75rem] md:pb-0 md:translate-x-0 min-[1670px]:translate-x-0 -translate-y-6 md:-translate-y-10 lg:-translate-y-12"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                    <div className="relative z-10 flex w-full flex-col items-start">
                        <div className="relative z-10 flex items-start justify-start w-fit hero-text-align transition-transform duration-300 mt-0 translate-y-0">
                            <motion.div 
                                initial={{ opacity: 0, y: 22 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 0.1, ease: [0.215, 0.61, 0.355, 1.0] }}
                                className="w-fit flex flex-col relative"
                            >
                                <h1
                                    ref={h1Ref}
                                    className="relative z-10 w-fit max-w-[calc(100vw-2.5rem)] md:max-w-none antialiased mb-0 text-white font-normal text-left flex flex-col gap-1 md:gap-1.5"
                                    style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                                >
                                    <span className="hero-headline-line block w-full text-left font-sans font-normal not-italic text-[clamp(2.337rem,8.227vw,3.272rem)] md:text-[2.842rem] lg:text-[3.553rem] tracking-[-0.05em] leading-none whitespace-nowrap">
                                        <span className="text-white font-normal not-italic tracking-[-0.05em]">{t('hero.headline.discover') || "Discover"}</span>
                                    </span>
                                    <div className="md:ml-0 flex w-full justify-start overflow-visible">
                                        <span className="hero-headline-line relative block w-fit font-sans font-normal not-italic text-[clamp(2.337rem,8.227vw,3.272rem)] md:text-[2.842rem] lg:text-[3.394rem] tracking-[-0.05em] leading-none whitespace-nowrap text-[#FFD700] pr-2">
                                            {t('hero.headline.ukrainian') || "Ukrainian"} {t('hero.headline.products') || "Products"}
                                        </span>
                                    </div>
                                     <div className="w-full flex items-center justify-start gap-4 mt-0.5 md:mt-0 lg:mt-0.5">
                                        <span className="relative z-10 flex items-center justify-start font-sans text-[clamp(1.68rem,5.6vw,2.10rem)] md:text-[1.85rem] lg:text-[2.40rem] font-thin not-italic tracking-[-0.03em] leading-none normal-case text-white/80 text-left whitespace-nowrap">
                                            <span>{t('hero.headline.sold') || 'sold'} <span className="font-normal pl-2 pr-2">{t('hero.headline.across') || 'across'}</span> {t('hero.headline.canada') || 'Canada'}</span>
                                        </span>
                                        {/* Staircasy Flags - Desktop Only */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.65, delay: 0.4, ease: [0.215, 0.61, 0.355, 1.0] }}
                                            className="hidden md:flex flex-col pointer-events-none z-20 shrink-0 mb-1 lg:mb-2" 
                                            aria-hidden="true"
                                        >
                                            <div className="relative flex items-center">
                                                <div className="relative aspect-square w-[28px] lg:w-[38px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-white/20 overflow-hidden z-30 shrink-0">
                                                    <img src={canadaRoundFlag} alt="Canada" className="w-full h-full object-cover scale-[1.4]" />
                                                </div>
                                                <img src="https://flagcdn.com/ua.svg" alt="Ukraine" className="aspect-square w-[28px] lg:w-[38px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-white/20 object-cover relative z-20 -ml-2 lg:-ml-3 mt-3 lg:mt-4 shrink-0" />
                                            </div>
                                        </motion.div>
                                    </div>
                                </h1>

                                {/* Description Wrapper */}
                                <div className="flex w-full flex-col items-start self-start mt-8 md:mt-10 mb-4 md:mb-6 gap-2.5 max-w-[700px] lg:max-w-[750px] relative">
                                    <div className="w-full flex flex-col items-start">
                                        <motion.p 
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.65, delay: 0.1, ease: [0.215, 0.61, 0.355, 1.0] }}
                                            className="hero-description-copy relative z-10 mt-0 md:mt-0 w-full translate-y-0 text-left font-sans text-[clamp(17px,1.2vw,20.5px)] min-[1670px]:text-[21px] font-normal leading-[1.65] tracking-[0.015em] text-white/85"
                                        >
                                            Interactive map to <strong className="font-bold text-white transition-colors duration-200 cursor-pointer hover:underline hover:decoration-[#FFD700]/70 hover:decoration-1 hover:underline-offset-4">find</strong>, <strong className="font-bold text-white transition-colors duration-200 cursor-pointer hover:underline hover:decoration-[#FFD700]/70 hover:decoration-1 hover:underline-offset-4">add</strong>, and <strong className="font-bold text-white transition-colors duration-200 cursor-pointer hover:underline hover:decoration-[#FFD700]/70 hover:decoration-1 hover:underline-offset-4">share</strong> products<br className="hidden sm:inline" /> made in Ukraine and sold locally.
                                        </motion.p>



                                        {/* Yellow Decor Lines under body text on the right aligned by 'Ukraine.' */}
                                        <div className="flex flex-col gap-1.5 pointer-events-none mt-3.5 md:mt-7 mb-0 items-end self-end w-full" aria-hidden="true">
                                            <div className="h-[1px] w-[192px] bg-[#FFD700]" />
                                            <div className="h-[1px] w-[72px] bg-[#FFD700]" />
                                        </div>
                                        
                                        {/* Two Trust Pillar Bullets in Yellow (Hidden on Desktop) */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.65, delay: 0.15, ease: [0.215, 0.61, 0.355, 1.0] }}
                                            className="hidden flex-col items-end w-full gap-1 mt-2 text-[#FFD700] text-[clamp(14px,1.0vw,17px)] font-medium tracking-[0.015em] font-sans antialiased text-right"
                                        >
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <span>—</span>
                                                <span>{trustPillars[0]?.title}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <span>—</span>
                                                <span>{trustPillars[1]?.title}</span>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

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
                    onAnimationComplete={() => window.dispatchEvent(new CustomEvent('heroMapAnimationComplete'))}
                    className="absolute inset-0 h-full w-full z-30 pointer-events-none"
                >
                    <div
                        className="hero-map-insert hidden md:flex flex-col items-center gap-3 absolute right-0 top-1/2 -translate-y-1/2 scale-[0.935] origin-right h-auto shrink-0 w-[396px] min-[1440px]:w-[408px] bottom-auto z-40 select-none border-none outline-none group/map-peeking pointer-events-auto"
                    >
                        <div
                            className="w-full shrink-0 aspect-[1.5] border-none outline-none relative overflow-hidden bg-white rounded-[28px] shadow-[0_20px_50px_-10px_rgba(0,25,65,0.28),0_4px_16px_rgba(0,0,0,0.08)]"
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
                                {trustPillars.map((pillar, idx) => (
                                    <div
                                        key={pillar.title}
                                        className="hero-map-pillar-card flex items-center justify-end px-3.5 py-1.5 lg:px-4 lg:py-2 bg-white/65 hover:bg-white/80 backdrop-blur-xl rounded-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] border-none pointer-events-auto transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-2.5 text-right">
                                            <span className="shrink-0 w-3.5 h-[2px] bg-slate-400/70 rounded-full" />
                                            <span className="hero-map-pillar-text text-[14px] lg:text-[15.5px] font-medium text-[#0057B7] tracking-[0.05em] whitespace-nowrap font-sans antialiased">
                                                {pillar.title}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Inner wrapper for shifted map content */}
                            <div
                                onTransitionEnd={(e) => {
                                    if (e.target === e.currentTarget && e.propertyName === 'transform') {
                                        window.dispatchEvent(new CustomEvent('heroMapAnimationComplete'));
                                    }
                                }}
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

                        {/* Yellow CTA Button placed under map insert */}
                        <Link href="/map" className="w-full flex justify-center mt-3 pointer-events-auto">
                            <button
                                className="group/cta-btn relative inline-flex scale-[1.05] h-[46px] items-center justify-center rounded-full bg-[#FFD700] hover:bg-[#FFE033] px-6 text-[15px] font-semibold tracking-[0.015em] text-[#003B7A] shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-[1.08] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 font-sans antialiased cursor-pointer"
                            >
                                <Search 
                                    className="mr-2 h-4 w-4 text-[#003B7A] transition-transform duration-300 group-hover/cta-btn:scale-110" 
                                    strokeWidth={2.5}
                                />
                                <span>{t('hero.ctaPrimary') || 'Find stores near me'}</span>
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </Suspense>
            </div>
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
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedHeroStore, setSelectedHeroStore] = useState<Store | null>(null);
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"map" | "list">("map");

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        const handleLocateMe = () => setShowLocationModal(true);
        window.addEventListener('locateMe', handleLocateMe);
        return () => window.removeEventListener('locateMe', handleLocateMe);
    }, []);

    const handleLocationPermissionGranted = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    if (mapRef.current) {
                        mapRef.current.flyToLocation(latitude, longitude, 12);
                    }
                    
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`, {
                            headers: { 'Accept-Language': 'en' }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            const provinceName = data.address?.state;
                            if (provinceName) {
                                const PROVINCE_MAP: Record<string, string> = {
                                    "Alberta": "AB",
                                    "British Columbia": "BC",
                                    "Manitoba": "MB",
                                    "New Brunswick": "NB",
                                    "Newfoundland and Labrador": "NL",
                                    "Nova Scotia": "NS",
                                    "Northwest Territories": "NT",
                                    "Nunavut": "NU",
                                    "Ontario": "ON",
                                    "Prince Edward Island": "PE",
                                    "Quebec": "QC",
                                    "Saskatchewan": "SK",
                                    "Yukon": "YT"
                                };
                                const matched = Object.keys(PROVINCE_MAP).find(p => p.toLowerCase() === provinceName.toLowerCase());
                                if (matched) {
                                    setSelectedProvince(PROVINCE_MAP[matched]);
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Failed to reverse geocode user location", err);
                    }
                },
                (err) => {
                    console.error(err);
                    toast({ title: t('mapPage.locationError') || "Location Error", description: "Could not fetch location.", variant: "destructive" });
                }
            );
        } else {
            toast({ title: "Not Supported", description: "Geolocation is not supported by your browser.", variant: "destructive" });
        }
    };

    const CANADIAN_PROVINCES = [
        "AB", "BC", "MB", "NB", "NL", "NT", "NS", "NU", "ON", "PE", "QC", "SK", "YT"
    ];

    const allCategories = Array.from(
        new Set(stores.flatMap((s) => s.products || []))
    ).map((product) => ({
        id: product.toLowerCase().replace(/\s+/g, "-"),
        label: product,
    }));

    const filteredStores = stores.filter((store) => {
        const matchesSearch =
            !searchQuery ||
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (store.products || []).some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesProvince = !selectedProvince || store.province === selectedProvince;
        const matchesCategory = !category ||
            (store.products || []).some(p => p.toLowerCase().replace(/\s+/g, "-") === category);
        return matchesSearch && matchesProvince && matchesCategory;
    });

    const closeAllDropdowns = () => {
        setIsProvinceDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setSelectedProvince(null);
        setCategory(null);
        closeAllDropdowns();
    };

    const isFilterActive = searchQuery.trim() !== "" || selectedProvince !== null || category !== null;

    return (
        <>
            <div className="flex flex-col h-auto bg-white justify-between relative">
                <section className="hero-desktop-frame flex-none relative z-10 w-full max-w-none mx-auto overflow-hidden font-sans flex items-stretch pt-0 mt-0 min-h-[calc(85vh-81px)] border-b border-slate-200">

                    {/* ==================== MOBILE VIEW ==================== */}
                    <div className="md:hidden relative w-full overflow-hidden bg-white font-sans">
                        <div className="relative overflow-hidden bg-[#0057B7] bg-[radial-gradient(120%_120%_at_50%_0%,rgba(45,145,245,0.95)_0%,rgba(0,87,183,1)_45%,rgba(0,55,125,1)_100%)] px-5 pt-16 pb-3 text-white [@media(max-height:700px)]:pt-10 [@media(max-height:700px)]:pb-3">
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(0,87,183,0)_46%)]" />
                            <motion.div
                                className="relative z-10"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <div className="mb-6 h-[16px] pointer-events-none" aria-hidden="true" />
                                <div className="w-fit flex flex-col">
                                    <h1
                                        className="relative z-10 max-w-full text-[clamp(2.39rem,12.17vw,3.33rem)] font-medium not-italic leading-[1.08] tracking-[-0.05em] antialiased [@media(max-height:700px)]:text-[2.57rem]"
                                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility', fontWeight: 480 }}
                                    >
                                        <span className="block text-white font-medium not-italic tracking-[-0.05em] whitespace-nowrap" style={{ fontWeight: 480 }}>
                                            {t("hero.headline.discover") || "Discover"}
                                        </span>
                                        <span className="block text-[#FFD700] font-medium not-italic tracking-[-0.05em] pr-1 whitespace-nowrap" style={{ fontWeight: 480 }}>
                                            {t("hero.headline.ukrainian") || "Ukrainian"} {t("hero.headline.products") || "Products"}
                                        </span>
                                    </h1>
                                    <div className="mt-2.5 flex items-center justify-start gap-2.5 w-full text-[clamp(2.0rem,9.35vw,2.65rem)] font-thin not-italic leading-tight tracking-[-0.03em] text-white/80 [@media(max-height:700px)]:text-[1.88rem]">
                                        <span className="whitespace-nowrap">{t('hero.headline.sold') || 'sold'} <span className="font-normal px-1">{t('hero.headline.across') || 'across'}</span> {t('hero.headline.canada') || 'Canada'}</span>
                                        <div className="flex items-center pointer-events-none z-20 shrink-0 ml-1 mb-1" aria-hidden="true">
                                            <div className="relative flex items-center">
                                                <div className="relative aspect-square w-[26.4px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-white overflow-hidden z-30 shrink-0">
                                                    <img src={canadaRoundFlag} alt="Canada" className="w-full h-full object-cover scale-[1.4]" />
                                                </div>
                                                <img src="https://flagcdn.com/ua.svg" alt="Ukraine" className="aspect-square w-[26.4px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-white object-cover relative z-20 -ml-1.5 mt-2.5 shrink-0" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-8 md:mt-4 w-full max-w-full text-left text-[clamp(18px,3.6vw,21px)] font-normal leading-relaxed tracking-[0.01em] text-white/85">
                                    Interactive map to <strong className="font-bold text-white">find</strong>, <strong className="font-bold text-white">add</strong>, and <strong className="font-bold text-white">share</strong> products<br className="hidden xs:inline" /> made in Ukraine and sold locally.
                                </p>
                                <div className="mt-6 mb-4 grid gap-2.5 [@media(max-height:700px)]:mt-5">
                                    <Link href="/map" className="pointer-events-auto">
                                        <button className="group/cta-btn relative inline-flex h-[46px] w-full items-center justify-center rounded-full bg-[#FFD700] hover:bg-[#FFE033] px-5 text-[15px] font-semibold tracking-[0.015em] text-[#003B7A] shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 font-sans antialiased cursor-pointer whitespace-nowrap">
                                            <Search className="mr-2 h-4 w-4 text-current transition-transform duration-300 group-hover/cta-btn:scale-110" strokeWidth={2.5} />
                                            <span>{t('hero.ctaPrimary') || 'Find stores near me'}</span>
                                        </button>
                                    </Link>
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
                                        <div className="pointer-events-none absolute inset-0 scale-[1.28] translate-x-[6%] translate-y-[-8%]">
                                            <InteractiveMap
                                                stores={stores}
                                                selectedStore={null}
                                                onSelectStore={noopSelectStore}
                                                onCloseStore={noop}
                                                variant="hero"
                                                isMobile={true}
                                            />
                                        </div>
                                    </Suspense>
                                </GoogleMapsProvider>
                            ) : (
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,#edf4fb_0%,#dbe9f5_100%)]" />
                            )}
                        </Link>
                    </div>

                    {/* ==================== DESKTOP VIEW: Two-Column Split Layout ==================== */}
                    <div className="hidden md:flex w-full items-stretch min-h-[calc(85vh-81px)]">

                        {/* LEFT 38% COLUMN — Blue Panel with Search/Filters */}
                        <div className="relative flex flex-col w-[38%] max-w-[540px] shrink-0 bg-[#0057B7] bg-[radial-gradient(120%_120%_at_30%_0%,rgba(45,145,245,0.95)_0%,rgba(0,87,183,1)_45%,rgba(0,55,125,1)_100%)] text-white overflow-hidden">
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(0,87,183,0)_46%)]" />

                            {/* Main Content */}
                            <div className="relative z-10 flex flex-col flex-1 px-8 lg:px-10 pb-8 justify-center top-[5%]">
                                {/* Headline */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1.0] }}
                                >
                                    <h1 className="font-medium not-italic leading-[1.02] tracking-[-0.06em] antialiased text-[clamp(2.2rem,3.8vw,3.2rem)]" style={{ fontWeight: 480 }}>
                                        <span className="block text-white">{t('hero.headline.discover') || 'Discover'}</span>
                                        <span className="block text-[#FFD700]">{t('hero.headline.ukrainian') || 'Ukrainian'} {t('hero.headline.products') || 'Products'}</span>
                                    </h1>
                                    <div className="mt-1.5 flex items-center text-[clamp(1.43rem,2.42vw,1.98rem)] font-light leading-[1.15] tracking-[-0.04em] text-white/80">
                                        <span>{t('hero.headline.sold') || 'sold'} <span className="font-normal px-0.5">{t('hero.headline.across') || 'across'}</span> {t('hero.headline.canada') || 'Canada'}</span>
                                        <div className="flex items-center ml-1.5 shrink-0" aria-hidden="true">
                                            <div className="relative flex items-center">
                                                <div className="relative aspect-square w-[25.4px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-white overflow-hidden z-30 shrink-0">
                                                    <img src={canadaRoundFlag} alt="Canada" className="w-full h-full object-cover scale-[1.4]" />
                                                </div>
                                                <img src="https://flagcdn.com/ua.svg" alt="Ukraine" className="aspect-square w-[25.4px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-white object-cover relative z-20 -ml-1.5 mt-2 shrink-0" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.65, delay: 0.1, ease: [0.215, 0.61, 0.355, 1.0] }}
                                    className="mt-5 text-[clamp(16px,1.05vw,18.5px)] font-normal leading-[1.65] tracking-[0.015em] text-white/80"
                                >
                                    Interactive map to <strong className="font-bold text-white">find</strong>, <strong className="font-bold text-white">add</strong>, and <strong className="font-bold text-white">share</strong> products made in Ukraine and sold locally.
                                </motion.p>

                                {/* Search & Filters */}
                                <div className="mt-12 flex flex-col gap-3 w-full">
                                    {/* Search Input */}
                                    <div className="flex items-center bg-white/10 border border-white/25 px-4 h-[44px] focus-within:bg-white/20 focus-within:border-white/40 transition-colors">
                                        <Search className="w-4 h-4 text-white/60 mr-3 shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="Search product or town"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-transparent border-none outline-none text-[14.2px] font-medium text-white placeholder:text-white/50 transition-colors duration-200"
                                        />
                                    </div>

                                    {/* Province & Category Dropdowns */}
                                    <div className="flex items-center gap-2.5 w-full">
                                        {/* Province Dropdown */}
                                        <div className="relative flex-1">
                                            <button
                                                onClick={() => {
                                                    const open = !isProvinceDropdownOpen;
                                                    closeAllDropdowns();
                                                    setIsProvinceDropdownOpen(open);
                                                }}
                                                className="w-full h-[42px] bg-white/10 border border-white/25 px-3 flex items-center justify-between text-[13.1px] tracking-normal font-medium text-white hover:bg-white/20 transition-colors"
                                            >
                                                <span className="truncate pr-2">{selectedProvince || "Province"}</span>
                                                <ChevronDown className={cn("w-4 h-4 text-[#FFD700] transition-transform", isProvinceDropdownOpen && "rotate-180")} />
                                            </button>
                                            {isProvinceDropdownOpen && (
                                                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 shadow-xl z-[700]">
                                                    <div className="max-h-[180px] overflow-y-auto custom-scrollbar p-1">
                                                        <button
                                                            onClick={() => { setSelectedProvince(null); setIsProvinceDropdownOpen(false); }}
                                                            className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                                                        >
                                                            All Provinces
                                                        </button>
                                                        {CANADIAN_PROVINCES.map((prov) => (
                                                            <button
                                                                key={prov}
                                                                onClick={() => { setSelectedProvince(prov); setIsProvinceDropdownOpen(false); }}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-1.5 text-[12px] font-medium transition-colors",
                                                                    selectedProvince === prov ? "bg-[#0057B7]/10 text-[#0057B7]" : "text-slate-700 hover:bg-slate-50"
                                                                )}
                                                            >
                                                                {prov}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Category Dropdown */}
                                        <div className="relative flex-1">
                                            <button
                                                onClick={() => {
                                                    const open = !isCategoryDropdownOpen;
                                                    closeAllDropdowns();
                                                    setIsCategoryDropdownOpen(open);
                                                }}
                                                className="w-full h-[42px] bg-white/10 border border-white/25 px-3 flex items-center justify-between text-[13.1px] tracking-normal font-medium text-white hover:bg-white/20 transition-colors"
                                            >
                                                <span className="truncate pr-2">{allCategories.find(c => c.id === category)?.label || "Category"}</span>
                                                <ChevronDown className={cn("w-4 h-4 text-[#FFD700] transition-transform", isCategoryDropdownOpen && "rotate-180")} />
                                            </button>
                                            {isCategoryDropdownOpen && (
                                                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 shadow-xl z-[700]">
                                                    <div className="max-h-[180px] overflow-y-auto custom-scrollbar p-1">
                                                        <button
                                                            onClick={() => { setCategory(null); setIsCategoryDropdownOpen(false); }}
                                                            className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                                                        >
                                                            All Categories
                                                        </button>
                                                        {allCategories.map((cat) => (
                                                            <button
                                                                key={cat.id}
                                                                onClick={() => { setCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-1.5 text-[12px] font-medium transition-colors",
                                                                    category === cat.id ? "bg-[#0057B7]/10 text-[#0057B7]" : "text-slate-700 hover:bg-slate-50"
                                                                )}
                                                            >
                                                                {cat.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Clear Filters Link */}
                                    {isFilterActive && (
                                        <div className="flex justify-center mt-4 w-full">
                                            <button 
                                                onClick={handleClearFilters}
                                                className="text-[13px] font-medium text-white/80 hover:text-[#FFD700] transition-colors underline decoration-white/40 hover:decoration-[#FFD700] underline-offset-4 cursor-pointer"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Yellow Decor Lines */}
                                {!isFilterActive && (
                                    <div className="flex flex-col gap-1.5 pointer-events-none mt-5 mb-0 items-end self-end w-full" aria-hidden="true">
                                        <div className="h-[1px] w-[140px] bg-[#FFD700]" />
                                        <div className="h-[1px] w-[52px] bg-[#FFD700]" />
                                    </div>
                                )}

                                {/* Yellow CTA Button */}
                                <div className={cn("w-full", isFilterActive ? "mt-3" : "mt-6")}>
                                    <button
                                        onClick={() => {
                                            if (isFilterActive) {
                                                // Clear focus from input to dismiss keyboard/dropdowns
                                                if (document.activeElement instanceof HTMLElement) {
                                                    document.activeElement.blur();
                                                }
                                                closeAllDropdowns();
                                                // We don't need to force a pan because the user sees the map update instantly.
                                                // This click acts as a firm "Submit" confirming their filter choices.
                                            } else {
                                                window.dispatchEvent(new CustomEvent('locateMe'));
                                            }
                                        }}
                                        className="group/cta-btn relative inline-flex h-[46px] w-full items-center justify-center rounded-full bg-[#FFD700] hover:bg-[#FFE033] px-5 text-[15px] font-semibold tracking-[0.015em] text-[#003B7A] shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 font-sans antialiased cursor-pointer whitespace-nowrap"
                                    >
                                        {isFilterActive ? (
                                            <>
                                                <MapIcon className="mr-2 h-4 w-4 text-current transition-transform duration-300 group-hover/cta-btn:scale-110" strokeWidth={2.5} />
                                                <span>
                                                    {filteredStores.length === 0 ? "No stores match filters" : `View ${filteredStores.length} store${filteredStores.length === 1 ? '' : 's'}`}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Search className="mr-2 h-4 w-4 text-current transition-transform duration-300 group-hover/cta-btn:scale-110" strokeWidth={2.5} />
                                                <span>{t('hero.ctaPrimary') || 'Find stores near me'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT 62% COLUMN — Interactive Map with Map/List Toggle */}
                        <div className="flex-1 relative h-full min-h-[calc(85vh-81px)] bg-white overflow-hidden z-10">
                            {/* Map/List Toggle */}
                            <div className="absolute top-4 left-4 z-[1000] pointer-events-auto">
                                <div className="flex items-center h-[42px] bg-white border border-slate-300 p-1 rounded-none shadow-xl w-[212px]">
                                    <button
                                        onClick={() => setViewMode("map")}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-3 h-full text-[13.5px] tracking-normal transition-colors rounded-none bg-transparent",
                                            viewMode === "map" ? "text-[#0057B7] font-semibold ring-1 ring-inset ring-[#0057B7]" : "text-slate-600 hover:text-[#0057B7] hover:bg-slate-50"
                                        )}
                                    >
                                        <MapIcon className="w-4 h-4" /> Map
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-3 h-full text-[13.5px] tracking-normal transition-colors rounded-none bg-transparent",
                                            viewMode === "list" ? "text-[#0057B7] font-semibold ring-1 ring-inset ring-[#0057B7]" : "text-slate-600 hover:text-[#0057B7] hover:bg-slate-50"
                                        )}
                                    >
                                        <List className="w-4 h-4" /> List
                                    </button>
                                </div>
                            </div>

                            {/* Results Count Chip */}
                            {viewMode === "map" && (
                                <div className="absolute bottom-8 left-4 z-[1000] pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="inline-flex items-center justify-center px-4 py-2 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_16px_rgba(0,35,90,0.08)] rounded-full transition-all duration-300">
                                        <span className="relative flex h-2 w-2 mr-2.5">
                                            {filteredStores.length > 0 && (
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0057B7] opacity-50"></span>
                                            )}
                                            <span className={cn(
                                                "relative inline-flex rounded-full h-2 w-2",
                                                filteredStores.length > 0 ? "bg-[#0057B7]" : "bg-slate-300"
                                            )}></span>
                                        </span>
                                        <span className="text-[13px] font-bold text-slate-700 tracking-wide font-sans">
                                            {filteredStores.length === 0 ? "0 stores found" : `${filteredStores.length} store${filteredStores.length === 1 ? '' : 's'} found`}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {viewMode === "map" ? (
                                /* Map View */
                                shouldRenderHeroMap && filteredStores.length > 0 ? (
                                    <GoogleMapsProvider>
                                        <Suspense fallback={<div className="w-full h-full bg-[linear-gradient(180deg,#edf4fb_0%,#dbe9f5_100%)]" />}>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                                className="w-full h-full pointer-events-auto"
                                            >
                                                <InteractiveMap
                                                    ref={mapRef}
                                                    stores={filteredStores}
                                                    selectedStore={selectedHeroStore}
                                                    onSelectStore={setSelectedHeroStore}
                                                    onCloseStore={() => setSelectedHeroStore(null)}
                                                    userLocation={userLocation}
                                                    variant="hero-b"
                                                    isMobile={false}
                                                />
                                            </motion.div>
                                        </Suspense>
                                    </GoogleMapsProvider>
                                ) : filteredStores.length === 0 && stores.length > 0 ? (
                                    /* No Stores Found State */
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-[600] p-6 text-center animate-in fade-in duration-500">
                                        <div className="w-[56px] h-[56px] bg-slate-100 rounded-full flex items-center justify-center mb-5">
                                            <Search className="w-[28px] h-[28px] text-slate-400" />
                                        </div>
                                        <h3 className="text-[14px] font-bold text-slate-800 mb-2 font-sans">
                                            No stores found
                                        </h3>
                                        <p className="text-[13px] text-slate-500 mb-5 max-w-md font-sans leading-relaxed">
                                            Try adjusting your search or filters.
                                        </p>
                                        <button
                                            onClick={handleClearFilters}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full border border-slate-300 bg-slate-50/80 hover:bg-[#FFD700] hover:border-[#FFD700] text-[#0057B7] hover:text-[#003B7A] text-[13px] font-semibold transition-all duration-300 shadow-sm cursor-pointer outline-none hover:scale-[1.05] active:scale-[0.98]"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(255,255,255,0.58)_35%,rgba(219,234,254,0.22)_100%)]" />
                                )
                            ) : (
                                /* List View */
                                <div className="w-full h-full overflow-y-auto pt-16 px-6 pb-6">
                                    {filteredStores.length > 0 ? (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 min-[1600px]:grid-cols-3 gap-y-5 gap-x-[30px] w-[90%]">
                                            {filteredStores.map((store) => (
                                                <div
                                                    key={store.id}
                                                    className="p-4 bg-white rounded-none hover:bg-slate-50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                                                    onClick={() => setLocation(`/map?store=${encodeURIComponent(String(store.id))}`)}
                                                >
                                                    <div className="flex flex-col justify-center">
                                                        <div className="flex flex-col items-start gap-1 group/title">
                                                            <h3 className="text-slate-900 font-semibold text-[15px] tracking-tight leading-tight antialiased line-clamp-2">
                                                                {store.name}
                                                            </h3>
                                                            <div className="h-[2px] w-6 mt-1 bg-[#FFD700] transition-colors duration-300" />
                                                        </div>
                                                        <p className="text-slate-600 text-[13px] mt-1.5 font-sans">
                                                            {store.city}, {store.province}
                                                        </p>
                                                        {store.products && store.products.length > 0 && (
                                                            <div className="flex flex-row items-center gap-2 overflow-x-auto whitespace-nowrap pb-3 pt-2 custom-scrollbar w-full mt-1">
                                                                {store.products.map((product, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="shrink-0 bg-transparent border border-slate-300 text-slate-500 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-default"
                                                                    >
                                                                        {product}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action Icons Row */}
                                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigator.clipboard.writeText(store.address);
                                                                toast({ title: "Address Copied", description: "Store address copied to clipboard." });
                                                            }}
                                                            className="text-slate-400 hover:text-[#0057B7] transition-colors p-1"
                                                            title="Copy Address"
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`, '_blank');
                                                            }}
                                                            className="text-slate-400 hover:text-[#0057B7] transition-colors p-1"
                                                            title="Get Directions"
                                                        >
                                                            <CornerUpRight size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const shareUrl = `${window.location.origin}/map?store=${encodeURIComponent(String(store.id))}`;
                                                                navigator.clipboard.writeText(shareUrl);
                                                                toast({ title: "Link Copied", description: "Store link copied to clipboard." });
                                                            }}
                                                            className="text-slate-400 hover:text-[#0057B7] transition-colors p-1"
                                                            title="Share Store"
                                                        >
                                                            <Share2 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setLocation(`/map?store=${encodeURIComponent(String(store.id))}`);
                                                            }}
                                                            className="text-slate-400 hover:text-[#0057B7] transition-colors p-1"
                                                            title="View on Map"
                                                        >
                                                            <MapPin size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <div className="w-[56px] h-[56px] bg-slate-100 rounded-full flex items-center justify-center mb-5">
                                                <Search className="w-[28px] h-[28px] text-slate-400" />
                                            </div>
                                            <h3 className="text-[14px] font-bold text-slate-800 mb-2">No stores found</h3>
                                            <p className="text-[13px] text-slate-500 mb-5">Try adjusting your search or filters.</p>
                                            <button onClick={handleClearFilters} className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full border border-slate-300 bg-slate-50/80 hover:bg-[#FFD700] hover:border-[#FFD700] text-[#0057B7] hover:text-[#003B7A] text-[13px] font-semibold transition-all duration-300 shadow-sm cursor-pointer">
                                                Clear filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
            
            <LocationPermissionModal 
                open={showLocationModal}
                onOpenChange={setShowLocationModal}
                onContinue={handleLocationPermissionGranted}
                onCancel={() => setShowLocationModal(false)}
            />
        </>
    );
}

function HeroTickerRow({ stores, isVariantB = false }: { stores: Store[]; isVariantB?: boolean }) {
    const { t } = useI18n();
    const shouldReduceMotion = useReducedMotion();

    return (
        <div className={cn(
            "z-[95] block w-full bg-white pt-3 pb-2 md:pt-[14px] md:pb-3 border-t border-slate-100",
            isVariantB ? "relative" : "pointer-events-none absolute inset-x-0 top-0 bg-transparent border-none"
        )}>
            <div className="content-width" aria-hidden="true">
                <div className="transition-all duration-300 w-full">
                    <div className="flex h-full items-center justify-between gap-4 md:gap-6">
                        {/* "ADDED RECENTLY" Label */}
                        <div className="shrink-0 flex items-center gap-2 z-10 select-none">
                            <div className="hero-ticker-dot relative flex h-[7px] w-[7px] items-center justify-center">
                                <span className="hero-ticker-dot-ring absolute inset-0 rounded-full border border-[#FFD700]/70"></span>
                                <span className="relative inline-flex h-[5px] w-[5px] rounded-full bg-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.72)]"></span>
                            </div>
                            <span className={cn(
                                "text-[9px] md:text-[11px] font-bold tracking-widest uppercase whitespace-nowrap font-sans antialiased",
                                isVariantB ? "text-slate-500" : "text-white/68"
                            )}>
                                {t('hero.addedRecently') || 'ADDED RECENTLY'}
                            </span>
                        </div>
                        <div
                            className="flex-1 overflow-hidden pointer-events-none"
                            style={{
                                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                                maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
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
                                        <div key={`b-${store.id}-${i}`} className="flex items-center px-6 md:px-10 shrink-0 group/ticker-item cursor-pointer">
                                            <span className={cn(
                                                "text-[14px] md:text-[14px] lg:text-[15px] font-normal tracking-wide font-sans antialiased whitespace-nowrap",
                                                isVariantB ? "text-slate-500" : "text-white/84 drop-shadow-[0_1px_8px_rgba(0,57,125,0.32)]"
                                            )}>
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
