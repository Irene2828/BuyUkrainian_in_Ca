import { ArrowRight, CheckCircle, ChevronRight, MapPin, Search, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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

            <div className="boutique-width w-full pt-[5rem] lg:pt-[5rem] pb-4 lg:pb-0 flex items-center relative z-10 h-full pointer-events-none">
                {/* Main Content Area */}
                <div className="w-full lg:max-w-[50%] flex flex-col justify-center items-start relative z-20 pointer-events-auto">
                    {/* Jobsian Typographic Scale - OPTICAL BALANCE FIX */}
                    <h1
                        className="leading-none mb-6 w-full antialiased"
                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                    >
                        <span className="block text-[2.4375rem] md:text-[3.375rem] font-semibold tracking-tight text-slate-900 whitespace-nowrap mb-1 leading-[1.1] font-sans">Find & Share</span>
                        <span className="block text-[2.4375rem] md:text-[3.375rem] font-semibold tracking-tight text-slate-900 whitespace-nowrap mb-1 leading-[1.1] font-sans">Ukrainian Products</span>
                        <span className="block text-[1.8125rem] md:text-[2.5625rem] font-normal tracking-tight text-[#2D50A0]/70 whitespace-nowrap">sold across Canada</span>
                    </h1>

                    <p className="text-[1.125rem] leading-[1.5] text-slate-800 font-medium max-w-[33.75rem] tracking-[0.01em]">
                        Interactive map to find, add, and share stores selling Ukrainian-made products
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mt-8 w-full md:w-auto md:mb-10">
                        <Link href="/map" className="w-full md:w-auto">
                            <Button
                                className="h-[50px] px-8 w-full md:w-auto rounded-2xl bg-slate-900/85 backdrop-blur-md text-white font-medium text-[16px] tracking-normal transition-all duration-200 shadow-sm border border-white/10 hover:bg-slate-900 hover:translate-y-[-1px] active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-navy/20 group/cta-btn"
                            >
                                <span>Open interactive map</span>
                                <MapPin className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>

                        <a
                            href="#how-it-works"
                            className="group relative text-[15px] font-medium text-slate-900 opacity-70 hover:opacity-100 transition-all duration-300 py-3 md:py-0 flex items-center gap-1.5"
                        >
                            <HelpCircle className="w-4 h-4" />
                            <span>How it works</span>
                            <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
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
                    maskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, black 25%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, black 25%)'
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
                            style={{ objectPosition: '95% 15%' }}
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
