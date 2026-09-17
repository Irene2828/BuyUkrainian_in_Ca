import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Package, Plus, Store, Map } from "lucide-react";
import { Link } from "wouter";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { AddStoreCTA } from "@/components/add-store-cta";

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

    const { t } = useI18n();

    return (
        <section className="relative w-full pt-[72px] md:pt-[96px] pb-[9px] md:pb-[15px] bg-white flex flex-col justify-center items-center">
            <div className="content-width flex flex-col items-center">
                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-x-[2.74rem] lg:gap-x-[4.05rem] min-[1440px]:gap-x-[4.425rem] gap-y-24 md:gap-y-0">
                    <div className="flex flex-col items-center gap-4 transition-all duration-300">
                        <Store className="w-[24px] h-[24px] text-slate-500 mb-1" strokeWidth={1.25} />
                        <AnimatedCounter
                            end={stats.stores}
                            duration={2000}
                            className="font-ui text-[2.2rem] md:text-[2.64rem] font-thin tracking-tighter text-slate-500 leading-none antialiased tabular-nums"
                        />
                        <span className="text-reveal text-[13px] min-[1670px]:text-[14.5px] font-semibold tracking-wider text-slate-500 uppercase whitespace-nowrap">{t("stats.storesFound") || "Stores Added"}</span>
                    </div>

                    <div className="hidden md:block w-[1px] h-12 md:h-14 lg:h-16 bg-[#0057B7] rotate-[15deg] shrink-0 self-center pointer-events-none" aria-hidden="true" />

                    <div className="flex flex-col items-center gap-4 transition-all duration-300">
                        <Map className="w-[24px] h-[24px] text-slate-500 mb-1" strokeWidth={1.25} />
                        <AnimatedCounter
                            end={stats.provinces}
                            duration={2000}
                            delay={200}
                            className="font-ui text-[2.2rem] md:text-[2.64rem] font-thin tracking-tighter text-slate-500 leading-none antialiased tabular-nums"
                        />
                        <span className="text-reveal text-[13px] min-[1670px]:text-[14.5px] font-semibold tracking-wider text-slate-500 uppercase whitespace-nowrap" style={{ transitionDelay: "80ms" }}>{t("stats.provincesCovered") || "Provinces Covered"}</span>
                    </div>

                    <div className="hidden md:block w-[1px] h-12 md:h-14 lg:h-16 bg-[#0057B7] rotate-[15deg] shrink-0 self-center pointer-events-none" aria-hidden="true" />

                    <div className="flex flex-col items-center gap-4 transition-all duration-300">
                        <Package className="w-[24px] h-[24px] text-slate-500 mb-1" strokeWidth={1.25} />
                        <AnimatedCounter
                            end={stats.products}
                            duration={2000}
                            delay={400}
                            className="font-ui text-[2.2rem] md:text-[2.64rem] font-thin tracking-tighter text-slate-500 leading-none antialiased tabular-nums"
                        />
                        <span className="text-reveal text-[13px] min-[1670px]:text-[14.5px] font-semibold tracking-wider text-slate-500 uppercase whitespace-nowrap" style={{ transitionDelay: "160ms" }}>{t("stats.productsListed") || "Products Listed"}</span>
                    </div>
                </div>
            </div>
            <div className="mt-12 md:mt-16 w-full">
                <AddStoreCTA />
            </div>
        </section>
    );
}
