import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getApprovedStores } from "@/lib/api";
import { Map, Package, Plus } from "lucide-react";
import { Link } from "wouter";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { UkrainianFlagIcon } from "@/components/ui/ukrainian-flag-icon";
import { MapPeek } from "@/components/ui/map-peek";

export function CommunityImpact({ hideBorder = false }: { hideBorder?: boolean }) {
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
        <section className={cn(
            "relative w-full bg-white py-[72px] section-reveal flex items-center min-h-[468px] overflow-hidden",
            !hideBorder && "border-t border-slate-100"
        )}>
            {/* Background Blobs (Swapped from Map Page) */}
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: '600px',
                    height: '600px',
                    left: 'calc(50% - 714px)',
                    top: '-300px',
                    background: 'rgba(0, 113, 227, 0.16)',
                    filter: 'blur(120px)',
                    zIndex: 0
                }}
            />
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: '500px',
                    height: '500px',
                    left: 'calc(50% + 225px)',
                    top: '335px',
                    background: 'rgba(255, 212, 39, 0.23)',
                    filter: 'blur(100px)',
                    zIndex: 0
                }}
            />

            <div className="boutique-width w-full relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-center md:text-left">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-premium-pulse" />
                            <p className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui">
                                How You Can Help
                            </p>
                        </div>
                        <h2 className="text-[32px] md:text-[42px] font-semibold text-slate-900 leading-tight mb-4 stagger-item max-w-[15ch]">
                            Supporting resilience, one store at a time.
                        </h2>
                        <p className="text-[17px] text-[#424245] font-ui leading-relaxed max-w-[45ch] mx-auto md:mx-0 mb-8">
                            We're creating a community-driven resource to help you find and support Ukrainian makers and entrepreneurship across Canada.
                        </p>

                        <Link href="/map">
                            <button className="btn-premium-action shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 no-invert-hover group">
                                <Plus className="w-5 h-5 mr-1" strokeWidth={2.5} />
                                <span>Explore the Map</span>
                            </button>
                        </Link>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-6">
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                            <div className="w-2 h-2 bg-[#A5D8FF] rounded-full animate-premium-pulse" />
                            <span className="text-[13px] font-medium text-slate-700 font-sans tracking-tight">Community verified</span>
                        </div>
                        <p className="text-[14px] text-slate-500 font-ui italic text-center md:text-right">
                            Every addition makes our community stronger.<br />
                            Join us in building the most accurate map.
                        </p>
                    </div>
                </div>
            </div>
        </section >
    );
}
