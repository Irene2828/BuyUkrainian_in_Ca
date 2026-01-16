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
                <div className="sticky left-0 bg-white/90 backdrop-blur-md z-30 py-2 pr-6 pl-6 md:pl-20 flex items-center gap-3 h-full shadow-[10px_0_20px_-5px_rgba(255,255,255,1)]">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-fast shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                        Live Findings
                    </span>
                </div>

                {/* Infinite Scroll Ticker */}
                <div className="flex flex-1 overflow-hidden mask-ticker">
                    <div className="flex animate-marquee whitespace-nowrap items-center min-w-full">
                        {repeatedNames.map((name, i) => (
                            <span key={i} className="text-[14px] md:text-[16px] font-medium text-slate-900 mx-3 md:mx-4 flex items-center gap-3 md:gap-4">
                                {name} <span className="text-slate-300">·</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
