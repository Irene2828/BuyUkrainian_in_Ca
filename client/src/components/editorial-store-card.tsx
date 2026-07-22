import { Store } from "@/lib/data";
import { ArrowUpRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorialStoreCardProps {
    store: Store;
    onClick?: () => void;
    className?: string;
}

const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
        food: 'Food & Grocery',
        clothes: 'Clothing',
        retail: 'Retail & Gifts',
        other: 'Gifts'
    };
    return labels[category] || category;
};

const isStoreNew = (dateString?: string) => {
    if (!dateString) return false; // Default to false if no date
    const oneDay = 24 * 60 * 60 * 1000;
    // Check if within 24 hours
    return (new Date().getTime() - new Date(dateString).getTime()) < oneDay;
};

export function EditorialStoreCard({ store, onClick, className }: EditorialStoreCardProps) {
    const isNew = isStoreNew(store.createdAt);
    // Prioritize store.image (main thumbnail) then the first item in images array
    const editorialImage = store.image || store.images?.[0] || "/assets/kyivcake.jpeg";

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex flex-col cursor-pointer select-none bg-white border border-slate-100 shadow-sm rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-md",
                className
            )}
        >
            {/* Image (Hero) - Strict 16:9 Aspect Ratio */}
            <div className="relative w-full aspect-video overflow-hidden bg-white">
                <img
                    src={editorialImage}
                    alt={store.name}
                    className="w-full h-full object-cover will-change-transform transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] group-hover:brightness-[0.98] opacity-0 animate-in fade-in fill-mode-forwards"
                    onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
                    loading="eager"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/70 via-[#0057B7]/20 to-transparent backdrop-blur-[2px]"
                />
            </div>

            {/* Typography & Content - Padded Area */}
            <div className="flex flex-col items-center gap-1.5 p-5 relative text-center">
                {/* Title & Action Row */}
                <div className="w-full flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 max-w-full group/text">
                        <h3 className="text-slate-900 font-semibold text-[15px] tracking-normal leading-tight antialiased truncate transition-all">
                            {store.name}
                        </h3>
                        <ArrowUpRight className="w-[14px] h-[14px] text-slate-400 opacity-60 transition-all duration-300 ease-out group-hover:text-black group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 flex-shrink-0" strokeWidth={2.5} />
                    </div>
                    {/* Location Row */}
                    <span
                        className="font-medium text-slate-500 leading-[1.2] mt-0.5"
                        style={{ fontSize: 'clamp(13px, 0.9vw, 15px)' }}
                    >
                        {store.city}, {store.province}
                    </span>
                </div>
            </div>
        </div>
    );
}
