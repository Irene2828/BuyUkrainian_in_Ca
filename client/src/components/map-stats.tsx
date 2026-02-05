import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Package } from "lucide-react";
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
        <section className="relative w-full py-[72px] md:py-[80px] bg-white border-t border-slate-100 flex flex-col justify-center items-center">
            <div className="boutique-width flex flex-col items-center">
                {/* Stats Header */}
                <div className="flex flex-col items-center mb-12">
                    <div className="flex items-center gap-2.5">
                        <span className="font-sans text-[11px] font-semibold tracking-[0.1em] text-slate-900/70 uppercase">
                            Contributions to the map by today
                        </span>
                    </div>
                </div>

                {/* Stats Row - Apple Editorial Style */}
                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 mb-14">
                    <div className="flex flex-col items-center gap-3">
                        <AnimatedCounter
                            end={stats.stores}
                            duration={2000}
                            className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-slate-900 leading-none opacity-50"
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
                            className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-slate-900 leading-none opacity-50"
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
                            className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-slate-900 leading-none opacity-50"
                        />
                        <div className="flex items-center gap-2 text-slate-500 mt-2">
                            <Package className="w-4 h-4 opacity-80" strokeWidth={1.5} />
                            <span className="text-[13px] font-medium tracking-[0.08em] uppercase">Products listed</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <p className="text-[15px] text-slate-500 font-ui italic text-center max-w-[40ch]">
                        Every data point represents a Ukrainian entrepreneur supported by this community.
                    </p>
                </div>
            </div>
        </section>
    );
}
