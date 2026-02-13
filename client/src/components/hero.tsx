import { MapPin, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";


export function Hero() {
    const { t } = useI18n();

    return (
        <section
            className="relative z-10 w-full overflow-hidden font-sans flex items-center animate-in fade-in duration-500 bg-white"
        >
            {/* Background Blobs - Precision Positioned */}
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: '600px',
                    height: '600px',
                    left: '50%',
                    top: '-300px',
                    marginLeft: '-300px',
                    background: 'rgba(0, 113, 227, 0.12)',
                    filter: 'blur(120px)',
                    zIndex: 0
                }}
            />
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: '700px',
                    height: '700px',
                    left: '-200px',
                    top: '-250px',
                    background: 'rgba(244, 197, 66, 0.15)',
                    filter: 'blur(120px)',
                    zIndex: 0
                }}
            />

            <div className="boutique-width w-full pt-[5rem] lg:pt-[144px] pb-4 lg:pb-[2.5rem] flex items-center relative z-10 h-full pointer-events-none">
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
                        <span className="block text-[1.8125rem] md:text-[2.5625rem] font-normal italic tracking-tight text-[#2D50A0]/70 whitespace-nowrap mt-2">
                            {t('hero.subtitle') || 'sold across Canada'}
                        </span>
                    </h1>

                    <p className="mt-8 text-[16px] leading-7 text-slate-900/80 font-normal max-w-[55ch] tracking-[0.01em] whitespace-pre-line">
                        One map to <span className="font-medium text-slate-900">find, add and share local stores selling made in Ukraine</span> products in Canada. Support Ukraine's economy with each purchase.
                    </p>

                    <div className="flex flex-row items-center gap-6 mt-10 w-full md:w-auto md:mb-10">
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
                            <HelpCircle className="w-4 h-4 opacity-70 group-hover/help:opacity-100 transition-opacity" />
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
                className="hidden lg:block absolute top-0 right-0 w-[60%] h-full z-0 select-none overflow-hidden pointer-events-auto"
                style={{
                    maskImage: 'linear-gradient(to right, transparent 0%, black 18%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%)'
                }}
            >
                <Link href="/map" className="block w-full h-full cursor-pointer pointer-events-auto active:scale-[0.98] transition-transform duration-200">
                    <div className="relative w-full h-full overflow-hidden group/map flex flex-col">

                        {/* Premium Hover Overlay */}
                        <div className="absolute inset-0 z-10 bg-slate-900/0 group-hover/map:bg-slate-900/[0.02] transition-colors duration-500" />

                        <img
                            src="/assets/mapheronew.png"
                            alt="Interactive Map Display"
                            className="w-full h-full object-cover opacity-100"
                            style={{ objectPosition: '50% 5%' }}
                        />

                        {/* Integrated Status Bar Footer */}
                        <div className="hidden">
                            {/* Community-Driven */}
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm flex-shrink-0" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    community-driven
                                </span>
                            </div>

                            {/* Verified Stores */}
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm flex-shrink-0" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    verified stores
                                </span>
                            </div>

                            {/* Made in Ukraine Products Only */}
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm flex-shrink-0" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    made in Ukraine products only
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>


        </section>
    );
}
