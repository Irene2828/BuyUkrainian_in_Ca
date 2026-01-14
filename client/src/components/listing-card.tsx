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
                    "bg-white p-8 rounded-[32px] border border-blue-50 cursor-pointer transition-all hover:border-blue-100 hover:shadow-sm group selection-none flex items-center justify-between gap-6",
                    className
                )}
                {...props}
            >
                <div className="flex flex-col gap-6 flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                        {/* Pin */}
                        <div className="w-6 h-6 rounded-full overflow-hidden relative shrink-0 border border-white">
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#3C93EA]"></div>
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#F3FF0A]" style={{ opacity: 0.8 }}></div>
                        </div>

                        <div className="flex flex-col min-w-0">
                            {variant === 'marquee' && store.category && (
                                <span className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.12em] mb-1 font-ui whitespace-normal">
                                    {store.category}
                                </span>
                            )}
                            <span className="text-[14px] font-semibold text-gray-900 truncate font-header">{store.name}</span>
                        </div>
                    </div>

                    {/* Footer Content */}
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium transition-colors group-hover:!text-black font-ui">
                        <span>{t ? t('modal.seeOnMap') : 'See on Map'}</span>
                    </div>
                </div>

                {/* Image - Standardized to 100x100 square */}
                <div className="w-[100px] h-[100px] bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-black/5">
                    <img
                        src={store.image || "/assets/kyivcake.jpeg"}
                        alt="Store preview"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        );
    }

    // For list variant, use tight admin-style row
    return (
        <div
            className={cn(
                "flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0",
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
                <p className="text-[12px] text-gray-400 truncate font-ui leading-tight mt-0.5">
                    {store.address}
                </p>
            </div>
        </div>
    );
}
