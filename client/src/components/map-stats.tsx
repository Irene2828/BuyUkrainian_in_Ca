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
        <section className="relative w-full pt-[70px] pb-[104px] md:pt-[116px] md:pb-[174px] bg-transparent flex flex-col justify-center items-center">
            <div className="boutique-width w-full flex flex-col items-center">
                <div className="flex max-w-[560px] flex-col items-center text-center mb-12 md:mb-16">
                    <p className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui leading-none">
                        The Map Is Growing
                    </p>
                </div>

                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-14 min-[1670px]:gap-20">
                    <div className="flex flex-row items-baseline gap-4 md:gap-6">
                        <AnimatedCounter
                            end={stats.stores}
                            duration={2000}
                            className="font-sans text-[42px] md:text-[64px] min-[1670px]:text-[72px] font-semibold tracking-tight tabular-nums text-[#0057B7] leading-none opacity-[0.68]"
                        />
                        <div className="flex items-center gap-2 text-[#0A2540] mb-0 pb-1 md:pb-2">
                            <Store className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.5} />
                            <span className="text-[12px] md:text-[13px] min-[1670px]:text-[16px] font-semibold tracking-widest uppercase">Stores Found</span>
                        </div>
                    </div>

                    {/* Hairline Divider */}
                    <div className="hidden md:block w-px h-16 bg-slate-200/60" aria-hidden="true" />

                    <div className="flex flex-row items-baseline gap-4 md:gap-6">
                        <AnimatedCounter
                            end={stats.provinces}
                            duration={2000}
                            delay={200}
                            className="font-sans text-[42px] md:text-[64px] min-[1670px]:text-[72px] font-semibold tracking-tight tabular-nums text-[#0057B7] leading-none opacity-[0.68]"
                        />
                        <div className="flex items-center gap-2 text-[#0A2540] mb-0 pb-1 md:pb-2">
                            <Map className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.5} />
                            <span className="text-[12px] md:text-[13px] min-[1670px]:text-[16px] font-semibold tracking-widest uppercase">Provinces Covered</span>
                        </div>
                    </div>

                    {/* Hairline Divider */}
                    <div className="hidden md:block w-px h-16 bg-slate-200/60" aria-hidden="true" />

                    <div className="flex flex-row items-baseline gap-4 md:gap-6">
                        <AnimatedCounter
                            end={stats.products}
                            duration={2000}
                            delay={400}
                            className="font-sans text-[42px] md:text-[64px] min-[1670px]:text-[72px] font-semibold tracking-tight tabular-nums text-[#0057B7] leading-none opacity-[0.68]"
                        />
                        <div className="flex items-center gap-2 text-[#0A2540] mb-0 pb-1 md:pb-2">
                            <Package className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.5} />
                            <span className="text-[12px] md:text-[13px] min-[1670px]:text-[16px] font-semibold tracking-widest uppercase">Products Listed</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center mt-12 md:mt-20">
                    <p className="text-[18px] font-medium text-slate-800 leading-relaxed text-center px-4 max-w-none mx-auto mb-5">
                        Every store on this map was added by someone like you.
                    </p>
                    <Link href="/map">
                        <Button
                            className="inline-flex items-center justify-center h-[46px] px-6 text-[16px] font-medium tracking-tight rounded-full bg-[#0057B7] text-white border-none transition-all duration-300 hover:bg-[#0047A0] 2xl:h-[54px] 2xl:text-[17px] shadow-[0_4px_12px_0_rgba(0,87,183,0.18)] hover:shadow-[0_6px_16px_rgba(0,87,183,0.28)] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0057B7]/40 gap-2.5 group/cta-btn"
                        >
                            <span>Add a Store to the Map</span>
                            <MapPin className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform duration-300 group-hover/cta-btn:translate-y-[-1px] text-white" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
