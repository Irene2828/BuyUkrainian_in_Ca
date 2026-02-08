import { ArrowRight, CheckCircle, ChevronRight } from "lucide-react";
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
            {/* Background Blobs */}
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: '600px',
                    height: '600px',
                    left: '-200px',
                    top: '-250px',
                    background: 'rgba(255, 212, 39, 0.23)',
                    filter: 'blur(120px)',
                    zIndex: 0
                }}
            />
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: '600px',
                    height: '600px',
                    right: 'calc(50% - 714px)',
                    top: '335px',
                    background: 'rgba(0, 113, 227, 0.16)',
                    filter: 'blur(120px)',
                    zIndex: 0
                }}
            />

            <div className="boutique-width w-full pt-[7.5rem] pb-[8.4375rem] flex items-center justify-center relative z-10">
                {/* Main Grid: Mathematically Centered Architecture */}
                <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12 xl:gap-24 mx-auto max-w-[80rem] min-[1537px]:max-w-[90rem]">

                    {/* Left-Side: Narrative - Left-Aligned Text Focus */}
                    <div className="flex-1 max-w-[620px] flex flex-col justify-center items-center order-1 text-left">
                        <div className="w-full">
                            {/* Jobsian Typographic Scale - OPTICAL BALANCE FIX */}
                            <h1
                                className="leading-none mb-[1.5rem] w-full antialiased"
                                style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                            >
                                <span className="block text-[2.4375rem] md:text-[3.375rem] font-semibold tracking-[-0.03em] text-slate-900 whitespace-nowrap mb-1 leading-[1.1] font-sans">Find & Share</span>
                                <span className="block text-[2.4375rem] md:text-[3.375rem] font-semibold tracking-[-0.03em] text-slate-900 whitespace-nowrap mb-1 leading-[1.1] font-sans">Ukrainian Products</span>
                                <span className="block text-[1.8125rem] md:text-[2.5625rem] font-normal tracking-[-0.03em] text-[#4A4A48] whitespace-nowrap">sold across Canada</span>
                            </h1>

                            <p className="text-[1.25rem] leading-[1.5] text-slate-800 font-medium max-w-[33.75rem] mt-8 mb-6 tracking-[0.01em]">
                                Interactive map to find, add, and share stores selling Ukrainian-made products
                            </p>

                            {/* Secondary CTA - "Jobs-era" Minimalist Link */}
                            {/* Secondary CTA - "Jobs-era" Minimalist Link */}
                            <motion.a
                                href="#how-it-works"
                                className="group relative inline-flex items-center text-[1.0625rem] font-normal text-[#2D50A0] transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D50A0]/30 focus-visible:ring-offset-2 rounded-md px-1 -ml-1"
                                initial="initial"
                                whileHover="hover"
                            >
                                How it works
                                <motion.span
                                    variants={{
                                        initial: { x: 0 },
                                        hover: {
                                            x: [0, 4, 0],
                                            transition: {
                                                duration: 0.7,
                                                ease: "easeInOut",
                                                repeat: Infinity
                                            }
                                        }
                                    }}
                                    className="flex items-center"
                                >
                                    <ChevronRight className="w-4 h-4 ml-1 text-[#2D50A0]" strokeWidth={2} />
                                </motion.span>
                                <span className="absolute -bottom-0.5 left-1/2 w-0 h-[1px] bg-[#2D50A0]/40 -translate-x-1/2 transition-all duration-300 ease-out group-hover:w-full" />
                            </motion.a>

                            {/* Modern Image "Constellation" - REMOVED AS REQUESTED */}
                            <div className="hidden"></div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center order-2 w-full max-w-[36.25rem] -mt-[0.75rem]">
                        <div className="relative w-full aspect-[16/10] bg-white rounded-3xl overflow-hidden shadow-levitation shadow-levitation-hover milled-edge group/map transform transition-all duration-500 ease-out hover:scale-[1.01]">
                            {/* Map Screenshot - FINAL HIGH-FIDELITY MAP */}
                            <img
                                src="/assets/hero-map-preview.png"
                                alt="Interactive Map Display"
                                className="w-full h-full object-cover opacity-90 group-hover/map:opacity-100 transition-all duration-700 transform scale-[1.05]"
                                style={{ objectPosition: 'center' }}
                            />

                            {/* Center Map CTA Overlay - RESTORED FOR GUIDANCE */}
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <Link href="/map">
                                    <Button
                                        className="h-[3.25rem] px-8 rounded-full bg-slate-900/90 text-white hover:bg-black/80 group-hover/map:scale-[1.02] hover:scale-[1.03] active:scale-[0.98] transition-all duration-500 ease-[0.23,1,0.32,1] shadow-[0_10px_25px_rgba(45,80,160,0.15)] backdrop-blur-[8px] flex items-center gap-3 group/cta-btn border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                                    >
                                        <span className="text-[0.875rem] font-bold tracking-widest uppercase">Open Interactive Map</span>
                                        <ArrowRight className="w-5 h-5 group-hover/cta-btn:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Accessible Map Metadata - Centered Perfectly Under Map */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 w-full px-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-[#2D50A0]" strokeWidth={1.5} />
                                <span className="text-[0.6875rem] uppercase tracking-widest font-semibold text-[#2D50A0]/60">
                                    Community-driven map
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-[#2D50A0]" strokeWidth={1.5} />
                                <span className="text-[0.6875rem] uppercase tracking-widest font-semibold text-[#2D50A0]/60">
                                    Made in Ukraine only
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-[#2D50A0]" strokeWidth={1.5} />
                                <span className="text-[0.6875rem] uppercase tracking-widest font-semibold text-[#2D50A0]/60">
                                    Every Store is Verified
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
