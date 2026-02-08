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
                    width: '500px',
                    height: '500px',
                    left: 'calc(50% + 225px)',
                    top: '-300px',
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
                    left: 'calc(50% - 714px)',
                    top: '335px',
                    background: 'rgba(0, 113, 227, 0.16)',
                    filter: 'blur(120px)',
                    zIndex: 0
                }}
            />

            <div className="boutique-width w-full pt-[120px] pb-[135px] flex items-center justify-center relative z-10">
                {/* Main Grid: Mathematically Centered Architecture */}
                <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12 xl:gap-24 mx-auto max-w-[1280px] min-[1537px]:max-w-[1440px]">

                    {/* Left-Side: Narrative - Left-Aligned Text Focus */}
                    <div className="flex-1 max-w-[620px] flex flex-col justify-center items-center order-1 text-left">
                        <div className="w-full">
                            {/* Jobsian Typographic Scale - OPTICAL BALANCE FIX */}
                            <h1
                                className="leading-none mb-[24px] w-full antialiased"
                                style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                            >
                                <span className="block text-[39px] md:text-[54px] font-semibold tracking-[-0.03em] text-slate-900 whitespace-nowrap mb-1 leading-[1.1] font-sans">Find & Share</span>
                                <span className="block text-[39px] md:text-[54px] font-semibold tracking-[-0.03em] text-slate-900 whitespace-nowrap mb-1 leading-[1.1] font-sans">Ukrainian Products</span>
                                <span className="block text-[29px] md:text-[41px] font-normal tracking-[-0.03em] text-[#4A4A48] whitespace-nowrap">sold across Canada</span>
                            </h1>

                            <p className="text-[20px] leading-[1.5] text-slate-800 font-medium max-w-[540px] mt-8 mb-6 tracking-[0.01em]">
                                One intuitive map to find, add, and share stores selling Ukrainian-made products
                            </p>

                            {/* Secondary CTA - "Jobs-era" Minimalist Link */}
                            {/* Secondary CTA - "Jobs-era" Minimalist Link */}
                            <motion.a
                                href="#how-it-works"
                                className="group relative inline-flex items-center text-[17px] font-normal text-[#2D50A0] transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D50A0]/30 focus-visible:ring-offset-2 rounded-md px-1 -ml-1"
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

                    {/* Right-Side: Map Preview Frame */}
                    <div className="flex-1 flex flex-col items-center justify-center order-2 w-full max-w-[580px] -mt-[12px]">
                        <div className="relative w-full aspect-[16/10] bg-white rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.04),0_10px_20px_rgba(45,80,160,0.03)] group/map transform transition-all duration-500 hover:shadow-[0_35px_70px_-15px_rgba(0,0,0,0.15)]">
                            {/* Map Screenshot - FINAL HIGH-FIDELITY MAP */}
                            <img
                                src="/assets/hero-map-preview.png"
                                alt="Interactive Map Display"
                                className="w-full h-full object-cover opacity-90 group-hover/map:opacity-100 transition-all duration-700 transform scale-[1.05]"
                                style={{ objectPosition: 'center' }}
                            />

                            {/* High-Key Alabaster Polish & Blue Inner Glow */}
                            <div
                                className="absolute inset-0 pointer-events-none rounded-[32px] z-10"
                                style={{
                                    background: 'rgba(250, 250, 249, 0.03)',
                                    boxShadow: 'inset 0 0 20px rgba(45, 80, 160, 0.04)'
                                }}
                            />

                            {/* Deep Horizon Border - Multiply Blend */}
                            <div className="absolute inset-0 z-50 pointer-events-none rounded-[32px] border border-[rgba(45,80,160,0.20)] mix-blend-multiply" />

                            {/* Centered Map CTA Overlay - RESTORED FOR GUIDANCE */}
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <Link href="/map">
                                    <Button
                                        className="h-[52px] px-8 rounded-full bg-slate-900/90 text-white hover:bg-black/80 group-hover/map:scale-[1.02] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 ease-out shadow-[0_10px_25px_rgba(45,80,160,0.15)] backdrop-blur-[8px] flex items-center gap-3 group/cta-btn border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                                    >
                                        <span className="text-[14px] font-bold tracking-widest uppercase">Open Interactive Map</span>
                                        <ArrowRight className="w-5 h-5 group-hover/cta-btn:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Accessible Map Metadata - Centered Perfectly Under Map */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 w-full px-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-[#2D50A0]" strokeWidth={1.5} />
                                <span className="text-[11px] uppercase tracking-widest font-semibold text-zinc-400">
                                    Community-driven map
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-[#2D50A0]" strokeWidth={1.5} />
                                <span className="text-[11px] uppercase tracking-widest font-semibold text-zinc-400">
                                    Made in Ukraine only
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-[#2D50A0]" strokeWidth={1.5} />
                                <span className="text-[11px] uppercase tracking-widest font-semibold text-zinc-400">
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
