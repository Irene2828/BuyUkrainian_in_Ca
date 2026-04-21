import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Package, Plus, Store, Map } from "lucide-react";
import { Link } from "wouter";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Button } from "@/components/ui/button";

export function MapStats() {
    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const stats = {
        stores: stores.length,
        provinces: new Set(stores.map(s => s.province)).size,
        products: stores.reduce((acc, s) => acc + (s.products?.length || 0), 0)
    };

    return (
        <section className="relative w-full pt-[63px] pb-[70px] md:pt-[105px] md:pb-[117px] bg-transparent flex flex-col justify-center items-center">
            <div className="boutique-width w-full flex flex-col items-center px-[22.8px] md:px-[38px] lg:px-[60.8px] min-[1280px]:max-[1669px]:px-[clamp(68.4px,4.75vw,87.4px)] min-[1670px]:px-[clamp(49.4px,3.42vw,68.4px)]">
                <div className="flex max-w-[560px] flex-col items-center text-center mb-12 md:mb-16">
                    <p className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui leading-none">
                        Keep the Map Growing
                    </p>
                </div>

                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-y-16 md:gap-y-0">
                    <div className="flex flex-col items-center gap-2 md:gap-3 px-8 md:px-12 lg:px-16 md:border-r border-slate-200">
                        <AnimatedCounter
                            end={stats.stores}
                            duration={2000}
                            className="font-['Inter'] text-[3.5rem] md:text-[4.2rem] min-[1670px]:text-[4.8rem] font-light tracking-tighter text-slate-400 leading-[0.8] antialiased tabular-nums"
                        />
                        <div className="flex items-center gap-2 text-slate-600/90 mb-0">
                            <Store className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.5} />
                            <span className="text-[12px] md:text-[13px] min-[1670px]:text-[15px] font-semibold tracking-widest uppercase">Stores Found</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 md:gap-3 px-8 md:px-12 lg:px-16 md:border-r border-slate-200">
                        <AnimatedCounter
                            end={stats.provinces}
                            duration={2000}
                            delay={200}
                            className="font-['Inter'] text-[3.5rem] md:text-[4.2rem] min-[1670px]:text-[4.8rem] font-light tracking-tighter text-slate-400 leading-[0.8] antialiased tabular-nums"
                        />
                        <div className="flex items-center gap-2 text-slate-600/90 mb-0">
                            <Map className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.5} />
                            <span className="text-[12px] md:text-[13px] min-[1670px]:text-[15px] font-semibold tracking-widest uppercase">Provinces Covered</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 md:gap-3 px-8 md:px-12 lg:px-16">
                        <AnimatedCounter
                            end={stats.products}
                            duration={2000}
                            delay={400}
                            className="font-['Inter'] text-[3.5rem] md:text-[4.2rem] min-[1670px]:text-[4.8rem] font-light tracking-tighter text-slate-400 leading-[0.8] antialiased tabular-nums"
                        />
                        <div className="flex items-center gap-2 text-slate-600/90 mb-0">
                            <Package className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.5} />
                            <span className="text-[12px] md:text-[13px] min-[1670px]:text-[15px] font-semibold tracking-widest uppercase">Products Listed</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center mt-10 md:mt-16">
                    <p className="text-[18px] md:text-[19px] font-medium text-slate-800 leading-relaxed text-center px-4 max-w-none mx-auto mb-8 tracking-tight">
                        Every store on this map was added by someone like you.
                    </p>
                    <Link href="/map">
                        <button
                            className="group/cta-btn relative inline-flex items-center justify-center h-[52px] px-6 text-[16px] font-medium tracking-tight rounded-[32px] bg-[#FFD700] text-slate-950 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_12px_32px_-8px_rgba(255,215,0,0.45)] hover:shadow-[0_20px_48px_-12px_rgba(255,215,0,0.55)] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/30 font-['Inter'] antialiased pointer-events-auto w-full md:w-auto"
                        >
                            <span>Add a New Store</span>
                            <Plus className="w-5 h-5 ml-2.5 transition-transform duration-300 group-hover/cta-btn:rotate-90 group-hover/cta-btn:scale-110 text-slate-950" strokeWidth={1.5} />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
