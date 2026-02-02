import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { MapPin, Map, Package, Search } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

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
        <section className="relative w-full pt-20 md:pt-32 pb-[100px] bg-white border-t border-slate-100">
            <div className="max-w-[800px] mx-auto px-6 lg:px-0 flex flex-col items-center">

                {/* 1. High-End Stats Alignment (Tight Row) */}
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10 md:gap-0 mb-10 border-b border-transparent">

                    {/* Stores */}
                    <div className="flex flex-col items-center justify-center text-center w-full md:w-1/3">
                        <MapPin className="w-6 h-6 stroke-[1] text-[#1A1A1A] mb-2" />
                        <span className="font-sans font-light text-[#1A1A1A] leading-none mb-1 text-[48px]">
                            <AnimatedCounter end={stats.stores} duration={2000} />
                        </span>
                        <span className="text-[12px] text-slate-500 font-semibold tracking-[0.03em] font-sans uppercase">
                            Stores
                        </span>
                    </div>

                    {/* Provinces */}
                    <div className="flex flex-col items-center justify-center text-center w-full md:w-1/3">
                        <Map className="w-6 h-6 stroke-[1] text-[#1A1A1A] mb-2" />
                        <span className="font-sans font-light text-[#1A1A1A] leading-none mb-1 text-[48px]">
                            <AnimatedCounter end={stats.provinces} duration={2000} delay={200} />
                        </span>
                        <span className="text-[12px] text-slate-500 font-semibold tracking-[0.03em] font-sans uppercase">
                            Provinces
                        </span>
                    </div>

                    {/* Products */}
                    <div className="flex flex-col items-center justify-center text-center w-full md:w-1/3">
                        <Package className="w-6 h-6 stroke-[1] text-[#1A1A1A] mb-2" />
                        <span className="font-sans font-light text-[#1A1A1A] leading-none mb-1 text-[48px]">
                            <AnimatedCounter end={stats.products} duration={2000} delay={400} />
                        </span>
                        <span className="text-[12px] text-slate-500 font-semibold tracking-[0.03em] font-sans uppercase">
                            Products
                        </span>
                    </div>
                </div>

                <div className="text-center max-w-xl mb-[40px]">
                    <p className="text-[18px] font-sans font-medium text-slate-600 leading-relaxed tracking-tight scale-up-reveal">
                        The Map grows with each contribution by Ukraine's supporters — like you.
                        <br className="block my-2" />
                        The more stores are there — the more purchases will be made to support the economy of the brave country.
                    </p>
                </div>

                {/* 3. The Final Action (Anchor) */}
                <Link href="/map" className="btn-premium-action gap-2">
                    See What's on the Map
                    <Search className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                </Link>

            </div>
        </section>
    );
}
