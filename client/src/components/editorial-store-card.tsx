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
                "group relative flex flex-col cursor-pointer select-none",
                className
            )}
        >
            {/* Image (Hero) - 1.9:1 Aspect Ratio - 5% Taller than before */}
            <div className="relative w-full aspect-[1.9/1] overflow-hidden rounded-[4px] bg-slate-50 mb-[18px]">
                {/* Subtle Inner Border to mimic print quality */}
                <div className="absolute inset-0 z-10 ring-1 ring-inset ring-black/5 rounded-[4px] pointer-events-none" />

                <img
                    src={editorialImage}
                    alt={store.name}
                    className="w-full h-full object-cover will-change-transform transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] group-hover:brightness-[0.98] opacity-0 animate-in fade-in fill-mode-forwards"
                    onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
                    loading="eager"
                />
            </div>

            {/* Typography & Content - Minimalist Centered Gallery Style */}
            <div className="flex flex-col items-center gap-1.5 px-1 py-1 relative text-center">
                {/* Title & Action Row - Strictly Centered Unit */}
                <div className="w-full flex flex-col items-center justify-center mt-0 px-1">
                    <div className="flex items-center gap-1.5 max-w-full group/text">
                        <h3
                            className="font-medium tracking-[-0.02em] text-slate-900/65 leading-[1.2] truncate transition-all"
                            style={{ fontSize: 'clamp(16px, 1.2vw, 18px)' }}
                        >
                            {store.name}
                        </h3>
                        <ArrowUpRight className="w-[14px] h-[14px] text-slate-400 opacity-60 transition-all duration-300 ease-out group-hover:text-black group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 flex-shrink-0" strokeWidth={2.5} />
                    </div>
                    {/* Location Row - Matching Homepage Flicker Style */}
                    <span
                        className="font-medium text-slate-900/65 leading-[1.2] mt-0.5"
                        style={{ fontSize: 'clamp(13px, 0.9vw, 15px)' }}
                    >
                        {store.city}, {store.province}
                    </span>
                </div>
            </div>
        </div>
    );
}
