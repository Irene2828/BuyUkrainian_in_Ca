import { Store } from "@/lib/data";
import { Maximize2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { useI18n } from "@/lib/i18n";

interface ListingCardProps extends HTMLAttributes<HTMLDivElement> {
    store: Store;
    variant?: "marquee" | "list";
}

export function ListingCard({ store, className, variant = "list", ...props }: ListingCardProps) {
    const { t } = useI18n();

    const EDITORIAL_IMAGES: Record<string, string> = {
        "montreal ukrainian store": "/assets/montreal-store.jpg",
        "yummy market": "/assets/yummy-market.jpg",
        "future bakery": "/assets/future-bakery.jpg",
        "shumka ukrainian foods": "/assets/shumka-foods.jpg"
    };

    const storeNameKey = store.name.toLowerCase().trim();
    const editorialImage = EDITORIAL_IMAGES[storeNameKey] || store.image || store.images?.[0] || "/assets/kyivcake.jpeg";

    // For marquee variant - COMPLETELY REWRITTEN WITH NO PINS
    if (variant === "marquee") {
        return (
            <div
                className={cn(
                    "relative bg-white p-8 rounded-[32px] border border-slate-100 cursor-pointer transition-all hover:border-slate-200 hover:shadow-sm group flex items-center justify-between gap-6",
                    className
                )}
                style={{ isolation: 'isolate' }}
                {...props}
            >
                {/* Store Image */}
                <div className="w-[100px] h-[100px] bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-black/5">
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
                    <span className="text-sm font-semibold text-slate-900 truncate font-header tracking-[-0.01em]">
                        {store.name}
                    </span>
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium transition-colors group-hover:text-slate-900 font-ui">
                        <Maximize2 size={16} className="fill-none stroke-current" strokeWidth={2} />
                        <span>{t ? t('modal.seeOnMap') : 'See on Map'}</span>
                    </div>
                </div>
            </div>
        );
    }

    // For list variant - unchanged
    return (
        <div
            className={cn(
                "flex items-center gap-4 px-4 py-5 bg-white transition-all cursor-pointer rounded-2xl",
                className
            )}
            {...props}
        >
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                    src={editorialImage}
                    className="w-full h-full object-cover transition-opacity duration-700 opacity-0 animate-in fade-in fill-mode-forwards"
                    onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
                    alt={store.name}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    {/* Ukrainian Flag Pin Icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                        <defs>
                            <clipPath id={`pin-clip-${store.id}`}>
                                <circle cx="12" cy="10" r="6" />
                            </clipPath>
                        </defs>
                        {/* Pin Shape */}
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" stroke="currentColor" strokeWidth="1.5" className="text-slate-300" />
                        {/* Flag Colors Inside Pin */}
                        <g clipPath={`url(#pin-clip-${store.id})`}>
                            <rect x="6" y="4" width="12" height="6" fill="#0057B8" />
                            <rect x="6" y="10" width="12" height="6" fill="#FFD700" />
                        </g>
                        {/* Pin Outline */}
                        <circle cx="12" cy="10" r="6" fill="none" stroke="white" strokeWidth="1.2" />
                    </svg>
                    <p className="text-[15px] font-semibold text-gray-900 truncate font-ui leading-tight">
                        {store.name}
                    </p>
                </div>
                {store.products && store.products.length > 0 && (
                    <p className="text-[12px] text-gray-500 truncate font-ui leading-tight mt-0.5">
                        {store.products.join(', ')}
                    </p>
                )}
                <p className="text-[12px] text-gray-400 truncate font-ui leading-tight mt-0.5">
                    {store.address}
                </p>
            </div>
        </div>
    );
}
