import { ArrowRight, CheckCircle, ChevronRight, Search } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Hero() {
    const { t } = useI18n();

    return (
        <section
            className="relative z-10 w-full overflow-hidden font-sans flex items-center animate-in fade-in duration-500 border-b border-[rgba(45,80,160,0.08)] bg-white"
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

            <div className="boutique-width w-full pt-[4.75rem] lg:pt-[6.25rem] pb-[4.75rem] lg:pb-[10.75rem] flex items-center relative z-10 h-full">
                {/* Main Content Area */}
                <div className="w-full lg:max-w-[50%] flex flex-col justify-center items-start relative z-20">
                    {/* Jobsian Typographic Scale - OPTICAL BALANCE FIX */}
                    <h1
                        className="leading-none mb-[1.5rem] w-full antialiased"
                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                    >
                        <span className="block text-[2.4375rem] md:text-[3.375rem] font-semibold tracking-[-0.03em] text-slate-900 whitespace-nowrap mb-1 leading-[1.1] font-sans">Find & Share</span>
                        <span className="block text-[2.4375rem] md:text-[3.375rem] font-semibold tracking-[-0.03em] text-slate-900 whitespace-nowrap mb-1 leading-[1.1] font-sans">Ukrainian Products</span>
                        <span className="block text-[1.8125rem] md:text-[2.5625rem] font-normal tracking-[-0.02em] text-[#2D50A0]/60 whitespace-nowrap">sold across Canada</span>
                    </h1>

                    <p className="text-[1.125rem] leading-[1.5] text-slate-800 font-medium max-w-[33.75rem] mt-8 mb-4 tracking-[0.01em]">
                        Interactive map to find, add, and share stores selling Ukrainian-made products
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-8 mt-6 w-full md:w-auto">
                        <Link href="/map" className="w-full md:w-auto">
                            <Button
                                className="h-[52px] px-10 w-full md:w-auto rounded-full bg-slate-900/80 text-white font-medium text-[16px] tracking-[0.03em] transition-all duration-300 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.25)] border border-white/10 hover:bg-slate-900 hover:translate-y-[-1px] group/cta-btn"
                            >
                                <span className="uppercase">Open interactive map</span>
                                <ArrowRight className="w-4 h-4 ml-2 group-hover/cta-btn:translate-x-1 transition-transform" />
                            </Button>
                        </Link>

                        <a
                            href="#how-it-works"
                            className="group flex items-center gap-2 text-[16px] font-medium text-slate-500 hover:text-slate-900 transition-colors py-2"
                        >
                            <div className="w-1.5 h-1.5 bg-[#F4C542] rounded-full shadow-[0_0_4px_rgba(244,197,66,0.5)]" />
                            <span>How it works</span>
                        </a>
                    </div>

                    {/* Mobile Map Preview - Visible only on mobile/tablet */}
                    <div className="lg:hidden w-full mt-12 aspect-[16/10] rounded-[24px] overflow-hidden shadow-xl border border-slate-100">
                        <img
                            src="/assets/hero-map-preview.png"
                            alt="Map Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Desktop Peeking Map Container - BLEED EFFECT */}
                <div
                    className="hidden lg:block absolute bottom-0 right-0 w-[60%] h-[85%] z-10 select-none overflow-hidden"
                    style={{
                        maskImage: 'linear-gradient(to right, transparent, black 20%), linear-gradient(to bottom, transparent, black 15%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%), linear-gradient(to bottom, transparent, black 15%)',
                        maskComposite: 'intersect',
                        WebkitMaskComposite: 'source-in'
                    }}
                >
                    <div className="relative w-full h-full bg-white rounded-tl-[80px] overflow-hidden border-t border-l border-slate-200/50 group/map">
                        {/* Curve Start Jewel Accent */}
                        <div className="absolute top-[-3px] left-[-3px] w-[6px] h-[6px] rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.8)] z-30" />

                        <img
                            src="/assets/hero-map-preview.png"
                            alt="Interactive Map Display"
                            className="w-full h-full object-cover opacity-90 group-hover/map:opacity-100 group-hover/map:scale-[1.02] transition-all duration-[1.2s] ease-out-quint"
                            style={{ objectPosition: 'left top' }}
                        />



                        {/* Integrated Status Bar Footer */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 w-full bg-white/90 backdrop-blur-md border-t border-slate-100 z-30 flex items-center justify-end gap-x-8 px-16">
                            <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-slate-500/80">
                                community-driven
                            </span>
                            <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-slate-500/80">
                                verified stores
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700] border border-white shadow-[0_0_6px_rgba(255,215,0,0.8)]" />
                                <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-slate-500/80">
                                    made in Ukraine products only
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
