import { Store } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ExternalLink, MapPin } from "lucide-react";
import { HTMLAttributes } from "react";
import { useI18n } from "@/lib/i18n";

interface ListingCardProps extends HTMLAttributes<HTMLDivElement> {
    store: Store;
    variant?: "marquee" | "list";
}

export function ListingCard({ store, className, variant = "list", ...props }: ListingCardProps) {
    const { t } = useI18n();

    return (
        <div
            className={cn(
                "bg-white p-8 rounded-[40px] border border-[#D3E4FD] cursor-pointer transition-all hover:bg-gray-50 group selection-none flex items-center justify-between gap-6",
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
                        <span className="text-[20px] font-medium text-[#1A1A1A] truncate font-header">{store.name}</span>
                        {variant === 'marquee' && (
                            <span className="text-[14px] font-bold text-gray-400 font-ui whitespace-normal">
                                {t ? t('map.store') : 'store'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer Content */}
                <div className="flex items-center gap-2 text-gray-400 text-[14px] font-bold transition-colors group-hover:text-black font-ui">
                    {variant === 'marquee' ? (
                        <>
                            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            <span>{t ? t('modal.seeOnMap') : 'See on Map'}</span>
                        </>
                    ) : (
                        <>
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="text-[14px] truncate font-normal">{store.address}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Image - Standardized to 100x100 square */}
            <div className="w-[100px] h-[100px] bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-black/5">
                <img
                    src="/assets/kyivcake.jpeg"
                    alt="Store preview"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
}
