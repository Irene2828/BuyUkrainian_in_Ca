import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Package, MapPin, Store, Map } from "lucide-react";
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
        <section className="relative w-full pt-24 pb-24 bg-transparent flex flex-col justify-center items-center">
            <div className="w-full flex flex-col items-center px-6">
                {/* Stats Header */}
                <div className="flex flex-col items-center mb-12">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-premium-pulse" />
                        <p className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui">
                            Contributions to the map by today
                        </p>
                    </div>
                </div>

                {/* Stats Row - Apple Editorial Style */}
                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 mb-7">
                    <div className="flex flex-col items-center gap-3">
                        <AnimatedCounter
                            end={stats.stores}
                            duration={2000}
                            className="font-sans text-[52px] md:text-[81px] font-bold tracking-tight text-slate-700 leading-none opacity-40"
                        />
                        <div className="flex items-center gap-2 text-[#0A2540] mt-2">
                            <Store className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={1.5} />
                            <span className="text-[8px] md:text-[10px] font-semibold tracking-widest uppercase">Stores Found</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <AnimatedCounter
                            end={stats.provinces}
                            duration={2000}
                            delay={200}
                            className="font-sans text-[52px] md:text-[81px] font-bold tracking-tight text-slate-700 leading-none opacity-40"
                        />
                        <div className="flex items-center gap-2 text-[#0A2540] mt-2">
                            <Map className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={1.5} />
                            <span className="text-[8px] md:text-[10px] font-semibold tracking-widest uppercase">Provinces Covered</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <AnimatedCounter
                            end={stats.products}
                            duration={2000}
                            delay={400}
                            className="font-sans text-[52px] md:text-[81px] font-bold tracking-tight text-slate-700 leading-none opacity-40"
                        />
                        <div className="flex items-center gap-2 text-[#0A2540] mt-2">
                            <Package className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={1.5} />
                            <span className="text-[8px] md:text-[10px] font-semibold tracking-widest uppercase">Products listed</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center mt-10">
                    <p className="text-[18px] font-medium text-slate-800 leading-relaxed text-center max-w-[40ch] mb-6">
                        Ready to find or add more stores selling made in Ukraine?
                    </p>
                    <Link href="/map">
                        <Button
                            className="inline-flex items-center justify-center h-[46px] px-6 text-[16px] font-medium tracking-tight rounded-full bg-[#FFD700] text-[#0A2540] transition-all duration-300 2xl:h-[54px] 2xl:px-9 2xl:text-[17px] shadow-[0_4px_14px_0_rgba(255,215,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,215,0,0.4)] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FFD700]/50 gap-2.5 group/cta-btn border-none"
                        >
                            <span>Open interactive map</span>
                            <MapPin className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform duration-300 group-hover/cta-btn:translate-y-[-1px]" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
