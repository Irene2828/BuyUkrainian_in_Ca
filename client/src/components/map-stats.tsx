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
                            <Store className="w-4 h-4 opacity-80" strokeWidth={1.5} />
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
                            <Map className="w-4 h-4 opacity-80" strokeWidth={1.5} />
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
                    <p className="text-[12px] md:text-[14px] text-slate-600 font-ui italic leading-relaxed text-center max-w-[40ch]">
                        Ready to find or add more stores selling made in Ukraine?
                    </p>
                    <Link href="/map">
                        <Button
                            className="h-[50px] 2xl:h-[54px] px-8 2xl:px-10 w-full md:w-auto rounded-full bg-[linear-gradient(to_bottom,#3A3F4F,#2F3341)] text-white font-medium text-[16px] 2xl:text-[18px] tracking-tight 2xl:tracking-normal antialiased transition-all duration-300 shadow-md hover:shadow-lg hover:bg-[linear-gradient(to_bottom,#3A3F4F,#3A3F4F)] hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-navy/20 group/cta-btn flex items-center justify-center gap-2 2xl:gap-3"
                        >
                            <span>Open interactive map</span>
                            <MapPin className="w-4 h-4 2xl:w-5 2xl:h-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
