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

const EDITORIAL_IMAGES: Record<string, string> = {
    "montreal ukrainian store": "/assets/montreal-store.jpg",
    "yummy market": "/assets/yummy-market.jpg",
    "future bakery": "/assets/future-bakery.jpg",
    "shumka ukrainian foods": "/assets/shumka-foods.jpg",
    "saskatoon co-op": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800"
};

export function EditorialStoreCard({ store, onClick, className }: EditorialStoreCardProps) {
    const isNew = isStoreNew(store.createdAt);
    const storeNameKey = store.name.toLowerCase().trim();
    const editorialImage = EDITORIAL_IMAGES[storeNameKey] || store.image || store.images?.[0] || "/assets/kyivcake.jpeg";

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex flex-col cursor-pointer select-none",
                className
            )}
        >
            {/* Image (Hero) - 2:1 Aspect Ratio - Ultrawide Landscape (50% height reduction) */}
            <div className="relative w-full aspect-[2/1] overflow-hidden rounded-[20px] bg-slate-50 mb-5">
                {/* Subtle Inner Border to mimic print quality */}
                <div className="absolute inset-0 z-10 ring-1 ring-inset ring-black/5 rounded-[20px] pointer-events-none" />

                <img
                    src={editorialImage}
                    alt={store.name}
                    className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-105 group-hover:brightness-[0.95] opacity-0 animate-in fade-in fill-mode-forwards"
                    onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
                    loading="eager"
                />
            </div>

            {/* Typography & Content - Minimalist Centered Gallery Style */}
            <div className="flex flex-col items-center gap-1 px-1 relative text-center">
                {/* Status indicator row (Hidden if no status) */}
                {isNew && (
                    <div className="flex items-center justify-center h-4 mb-2">
                        <Circle className="w-1.5 h-1.5 fill-blue-600 text-blue-600 animate-pulse" />
                    </div>
                )}

                {/* Title & Action Row */}
                <div className="flex flex-col items-center justify-center gap-2 mt-2">
                    <h3 className="text-base font-semibold text-slate-900 leading-snug font-ui line-clamp-1 group-hover:text-black transition-colors">
                        {store.name}
                    </h3>

                    {/* Action Link - Centered directly below */}
                    <div className="flex items-center gap-1 text-[13px] font-medium text-slate-400 group-hover:text-black transition-all duration-300">
                        <span>See on Map</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </div>
    );
}
