import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Package, MapPin } from "lucide-react";
import { Link } from "wouter";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function MapStats() {
    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
    });

    const stats = {
        stores: stores.length,
        provinces: new Set(stores.map(s => s.province)).size,
        products: stores.reduce((acc, s) => acc + (s.products?.length || 0), 0)
    };

    return (
        <section className="relative w-full pt-[100px] pb-[100px] bg-white border-t border-slate-100 flex flex-col justify-center items-center">
            <div className="boutique-width flex flex-col items-center pb-3">
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
                            className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-[#2D50A0] leading-none opacity-80"
                        />
                        <div className="flex items-center gap-2 text-slate-500 mt-2">
                            <div className="w-3 h-3 rounded-full bg-blue-400" />
                            <span className="text-[13px] font-medium tracking-[0.08em] uppercase">Stores Found</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <AnimatedCounter
                            end={stats.provinces}
                            duration={2000}
                            delay={200}
                            className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-[#2D50A0] leading-none opacity-80"
                        />
                        <div className="flex items-center gap-2 text-slate-500 mt-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <span className="text-[13px] font-medium tracking-[0.08em] uppercase">Provinces Covered</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <AnimatedCounter
                            end={stats.products}
                            duration={2000}
                            delay={400}
                            className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-[#2D50A0] leading-none opacity-80"
                        />
                        <div className="flex items-center gap-2 text-slate-500 mt-2">
                            <Package className="w-4 h-4 opacity-80" strokeWidth={1.5} />
                            <span className="text-[13px] font-medium tracking-[0.08em] uppercase">Products listed</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6 mt-10">
                    <p className="text-[14px] md:text-[15px] text-slate-500 font-medium font-ui text-center max-w-[40ch]">
                        Ready to find or add more stores selling made in Ukraine?
                    </p>
                    <Link href="/map">
                        <button
                            className="h-12 px-8 rounded-2xl bg-slate-900/85 backdrop-blur-md text-white font-medium text-[15px] tracking-normal transition-all duration-200 shadow-sm border border-brand-navy/15 hover:bg-slate-900 hover:translate-y-[-1px] active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-navy/20 group flex items-center gap-2"
                        >
                            <span>Open interactive map</span>
                            <MapPin className="w-4 h-4 ml-1" />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
