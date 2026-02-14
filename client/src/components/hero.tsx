import { MapPin, Info } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";


export function Hero() {
    const { t } = useI18n();

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
                    width: '540px',
                    height: '540px',
                    left: '50%',
                    top: '-300px',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 113, 227, 0.16)',
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
                        rgba(255, 255, 255, 0) 55%
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
                        Find, add, and share local stores to support Ukraine's economy<br />
                        with every purchase.
                    </p>

                    <div className="flex flex-row items-center gap-6 w-full md:w-auto md:mb-10">
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
                            className="text-[15px] font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 hover:underline underline-offset-4 decoration-slate-300 group/help"
                        >
                            <Info className="w-4 h-4 opacity-70 group-hover/help:opacity-100 transition-opacity" />
                            <span>{t('hero.ctaSecondary') || 'How It Works'}</span>
                        </a>
                    </div>

                    {/* Mobile Map Preview - Visible only on mobile/tablet */}
                    <div className="lg:hidden w-full mt-[72px] aspect-[16/10] rounded-[24px] overflow-hidden shadow-xl border border-slate-100">
                        <img
                            src="/assets/hero-map-preview.png"
                            alt="Map Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Peeking Map Container - FULL BLEED EFFECT */}
            <div
                className="hidden lg:block absolute top-0 right-0 w-[85%] h-full z-0 select-none overflow-hidden point-events-auto translate-x-[25%] -translate-y-[12%]"
            >
                <Link href="/map" className="block w-full h-full cursor-pointer pointer-events-auto">
                    <div className="relative w-full h-full overflow-hidden flex flex-col items-center">

                        <img
                            src="/assets/mapnew.png"
                            alt="Interactive Map Display"
                            className="h-full w-full object-cover object-left opacity-100 origin-left"
                            style={{
                                maskImage: 'linear-gradient(to right, transparent 0%, black 400px)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 400px)'
                            }}
                        />
                    </div>
                </Link>
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
