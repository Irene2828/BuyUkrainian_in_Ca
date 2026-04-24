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
        <section className="relative w-full pt-12 md:pt-16 pb-24 md:pb-32 bg-white flex flex-col justify-center items-center">
            <div className="max-w-6xl mx-auto w-full flex flex-col items-center px-4 sm:px-6 lg:px-8">
                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-x-24 lg:gap-x-36 gap-y-16 md:gap-y-0">
                    <div className="flex flex-col items-center gap-4 transition-all duration-300">
                        <Store className="w-[22px] h-[22px] text-slate-600/95 mb-1" strokeWidth={1} />
                        <AnimatedCounter
                            end={stats.stores}
                            duration={2000}
                            className="font-['Inter'] text-[2rem] md:text-[2.4rem] font-light tracking-tighter text-slate-600/95 leading-none antialiased tabular-nums"
                        />
                        <span className="text-[11.7px] font-medium tracking-widest text-slate-600/95 uppercase whitespace-nowrap">Stores Found</span>
                    </div>

                    <div className="flex flex-col items-center gap-4 transition-all duration-300">
                        <Map className="w-[22px] h-[22px] text-slate-600/95 mb-1" strokeWidth={1} />
                        <AnimatedCounter
                            end={stats.provinces}
                            duration={2000}
                            delay={200}
                            className="font-['Inter'] text-[2rem] md:text-[2.4rem] font-light tracking-tighter text-slate-600/95 leading-none antialiased tabular-nums"
                        />
                        <span className="text-[11.7px] font-medium tracking-widest text-slate-600/95 uppercase whitespace-nowrap">Provinces Covered</span>
                    </div>

                    <div className="flex flex-col items-center gap-4 transition-all duration-300">
                        <Package className="w-[22px] h-[22px] text-slate-600/95 mb-1" strokeWidth={1} />
                        <AnimatedCounter
                            end={stats.products}
                            duration={2000}
                            delay={400}
                            className="font-['Inter'] text-[2rem] md:text-[2.4rem] font-light tracking-tighter text-slate-600/95 leading-none antialiased tabular-nums"
                        />
                        <span className="text-[11.7px] font-medium tracking-widest text-slate-600/95 uppercase whitespace-nowrap">Products Listed</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
