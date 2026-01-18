import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export function RecentProductsMarquee() {
    const { t } = useI18n();
    const { data: stores = [], isLoading } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: Infinity,
    });

    if (isLoading || stores.length === 0) return null;

    // Duplicate stores to create seamless loop
    // Ensure we have enough items for the marquee
    const storeNames = stores.map(s => s.name);
    const repeatedNames = Array(10).fill(storeNames).flat(); // Repeat plenty of times

    return (
        <div className="w-full bg-white relative z-20 py-4 border-b border-slate-50 overflow-hidden font-sans">
            <div className="max-w-[1440px] mx-auto flex items-center h-[50px] md:h-[60px] relative">

                {/* Fixed Live Label */}
                <div className="sticky left-0 bg-white/90 backdrop-blur-md z-30 py-2 pr-6 pl-6 md:pl-12 flex items-center gap-3 h-full shadow-[10px_0_20px_-5px_rgba(255,255,255,1)]">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-premium-pulse shrink-0" />
                    <span className="text-[12px] md:text-[13px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                        Live Findings
                    </span>
                </div>

                {/* Infinite Scroll Ticker */}
                <div className="flex flex-1 overflow-hidden mask-ticker group/marquee">
                    <div className="flex animate-marquee whitespace-nowrap items-center min-w-full group-hover/marquee:[animation-play-state:paused]">
                        {repeatedNames.map((name, i) => (
                            <span key={i} className="group text-[14px] md:text-[16px] font-medium text-slate-400 hover:text-slate-950 mx-6 flex items-center gap-2.5 select-none cursor-default transition-colors duration-300">
                                {/* Identity Dot: 10px, Split 50/50, Opacity 40->100 */}
                                <span
                                    className="w-[10px] h-[10px] rounded-full opacity-40 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                                    style={{ background: 'linear-gradient(to bottom, #0057B7 50%, #FFD700 50%)' }}
                                />
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
