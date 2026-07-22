import { Store } from "@/lib/data";
import { Maximize2, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { useI18n } from "@/lib/i18n";

interface ListingCardProps extends HTMLAttributes<HTMLDivElement> {
    store: Store;
    variant?: "marquee" | "list";
}

export function ListingCard({ store, className, variant = "list", ...props }: ListingCardProps) {
    const { t } = useI18n();

    // Prioritize store.image (main thumbnail) then the first item in images array
    const editorialImage = store.image || store.images?.[0] || "/assets/kyivcake.jpeg";

    // For marquee variant - COMPLETELY REWRITTEN WITH NO PINS
    if (variant === "marquee") {
        return (
            <div
                className={cn(
                    "relative bg-white/95 p-8 rounded-[20px] milled-edge ring-1 ring-transparent ring-inset hover:ring-slate-300 transition-all duration-300 hover:shadow-sm group flex items-center justify-between gap-6",
                    className
                )}
                style={{ isolation: 'isolate' }}
                {...props}
            >
                {/* Store Image */}
                <div className="w-[100px] h-[100px] bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-brand-navy/15">
                    <img
                        src={editorialImage}
                        alt={store.name}
                        className="w-full h-full object-cover transition-opacity duration-700 opacity-0 animate-in fade-in fill-mode-forwards"
                        onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
                        loading="eager"
                    />
                </div>
                {/* Store Info - Name and Link Only */}
                <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
                    <span className="text-[15px] font-semibold text-slate-800 truncate font-header tracking-[-0.01em]">
                        {store.name}
                    </span>
                    <div className="flex items-center gap-2 text-slate-600 text-base font-normal transition-colors group-hover:text-slate-900 font-ui">
                        <Maximize2 size={16} className="fill-none stroke-current" strokeWidth={2} />
                        <span>{t ? t('modal.seeOnMap') : 'See on Map'}</span>
                    </div>
                </div>
            </div>
        );
    }

    // For list variant - Compact Gallery Row
    return (
        <div
            className={cn(
                "flex flex-row items-center p-3 rounded-2xl h-28 transition-all duration-300 group cursor-pointer hover:bg-slate-100/50 hover:shadow-sm",
                className
            )}
            {...props}
        >
            {/* Store Image - Small Thumbnail */}
            <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0">
                <img
                    src={editorialImage}
                    className="w-full h-full object-cover transition-all duration-700 opacity-0 animate-in fade-in fill-mode-forwards group-hover:scale-105"
                    onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
                    alt={store.name}
                />
            </div>

            {/* Content Area - Name, City/Province, and Details Link */}
            <div className="flex-1 pl-4 flex flex-col justify-between h-20 min-w-0">
                <div className="min-w-0">
                    <h3 className="text-[17px] font-semibold tracking-tight text-slate-800 truncate font-header mb-0.5">
                        {store.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 font-ui whitespace-nowrap overflow-hidden">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{store.city}, {store.province}</span>
                    </div>
                </div>

                {/* Secondary Action: Details Text link */}
                <div className="mt-1">
                    <span className="text-[12px] font-medium text-slate-400 group-hover:text-slate-900 transition-colors group-hover:underline decoration-slate-300 underline-offset-4">
                        Details
                    </span>
                </div>
            </div>
        </div>
    );
}
