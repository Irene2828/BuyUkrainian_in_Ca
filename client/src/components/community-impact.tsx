import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Map, Package, Plus } from "lucide-react";
import { Link } from "wouter";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { UkrainianFlagIcon } from "@/components/ui/ukrainian-flag-icon";

export function CommunityImpact() {
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
        <section className="relative w-full py-16 md:py-0 min-h-[700px] bg-white border-t border-slate-100 flex flex-col justify-center">
            <div className="max-w-[800px] mx-auto px-6 lg:px-0 flex flex-col items-center">



                {/* Stats Row - Apple Editorial Style */}
                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 mb-20">
                    {/* Stores */}
                    <div className="flex flex-col items-center gap-3">
                        <AnimatedCounter
                            end={stats.stores}
                            duration={2000}
                            delay={0}
                            className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-slate-900 leading-none opacity-60"
                        />
                        <div className="flex items-center gap-2 text-slate-500 mt-2">
                            <UkrainianFlagIcon className="w-4 h-4 opacity-80" />
                            <span className="text-[13px] font-medium tracking-[0.08em] uppercase">Stores on the map</span>
                        </div>
                    </div>

                    {/* Provinces */}
                    <div className="flex flex-col items-center gap-3">
                        <AnimatedCounter
                            end={stats.provinces}
                            duration={2000}
                            delay={200}
                            className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-slate-900 leading-none opacity-60"
                        />
                        <div className="flex items-center gap-2 text-slate-500 mt-2">
                            <Map className="w-4 h-4 opacity-80" strokeWidth={1.5} />
                            <span className="text-[13px] font-medium tracking-[0.08em] uppercase">Provinces Covered</span>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="flex flex-col items-center gap-3">
                        <AnimatedCounter
                            end={stats.products}
                            duration={2000}
                            delay={400}
                            className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-slate-900 leading-none opacity-60"
                        />
                        <div className="flex items-center gap-2 text-slate-500 mt-2">
                            <Package className="w-4 h-4 opacity-80" strokeWidth={1.5} />
                            <span className="text-[13px] font-medium tracking-[0.08em] uppercase">Unique Products</span>
                        </div>
                    </div>
                </div>

                {/* Bridge Headline - Moved below stats */}
                <h3 className="text-slate-900 opacity-60 font-medium text-xl mb-8 text-center max-w-lg leading-relaxed">
                    Keep Supporting Support Ukrainian Products in Canada
                </h3>

                {/* Signature CTA Button */}
                <div className="flex flex-col items-center gap-8">

                    <Link href="/map">
                        <button className="btn-premium-action shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 no-invert-hover group">
                            <Plus className="w-5 h-5 mr-1" strokeWidth={2.5} />
                            Add a Local Store
                        </button>
                    </Link>
                </div>

            </div>
        </section >
    );
}
