import { Store } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Image } from "lucide-react";
import { HTMLAttributes } from "react";
import { useI18n } from "@/lib/i18n";

interface ListingCardProps extends HTMLAttributes<HTMLDivElement> {
    store: Store;
    variant?: "marquee" | "list";
}

export function ListingCard({ store, className, variant = "list", ...props }: ListingCardProps) {
    const { t } = useI18n();

    // For marquee variant, keep the card style
    if (variant === "marquee") {
        return (
            <div
                className={cn(
                    "listing-card-marquee bg-white p-8 rounded-[32px] border border-slate-100 cursor-pointer transition-all hover:border-slate-200 hover:shadow-sm group selection-none flex items-center justify-between gap-6",
                    className
                )}
                {...props}
            >
                {/* Image - Standardized to 100x100 square */}
                <div className="w-[100px] h-[100px] bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-black/5">
                    <img
                        src={store.image || "/assets/kyivcake.jpeg"}
                        alt="Store preview"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
                    <span className="text-[15px] font-semibold text-gray-900 truncate font-header mb-1">{store.name}</span>

                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium transition-colors group-hover:!text-black font-ui no-underline">
                        <span>{t ? t('modal.seeOnMap') : 'See on Map'}</span>
                    </div>
                </div>
            </div>
        );
    }

    // For list variant, use tight admin-style row
    return (
        <div
            className={cn(
                "flex items-center gap-4 px-4 py-5 bg-white transition-all cursor-pointer rounded-2xl",
                "hover:shadow-md",
                className
            )}
            {...props}
        >
            {/* Thumbnail - 40x40 */}
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {store.image ? (
                    <img src={store.image} className="w-full h-full object-cover" alt={store.name} />
                ) : (
                    <img src="/assets/kyivcake.jpeg" className="w-full h-full object-cover" alt={store.name} />
                )}
            </div>

            {/* Store Info */}
            <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-gray-900 truncate font-ui leading-tight">
                    {store.name}
                </p>
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
