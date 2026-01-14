import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Link, useLocation } from "wouter";
import { StoreCard } from "./store-card";
import { ListingCard } from "./listing-card";
import { Store } from "@/lib/data";

export function RecentProductsMarquee() {
    const { data: stores = [], isLoading } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: Infinity,
    });
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [_, setLocation] = useLocation();

    if (isLoading) return null;

    const displayStores = stores.length > 0 ? [...stores, ...stores, ...stores, ...stores].slice(0, 12) : [];

    if (displayStores.length === 0) return null;

    const handleStoreClick = (store: Store) => {
        setSelectedStore(store);
    };

    const handleSeeOnMap = (store: Store) => {
        setIsModalOpen(false);
        setLocation(`/map?storeId=${store.id}`);
    };

    return (
        <div className="w-full bg-white overflow-hidden pt-8 pb-12 md:pt-12 md:pb-[100px] font-sans">
            <div className="mx-auto px-6 md:px-[64px] max-w-[1440px] flex items-center justify-between mb-12">
                <span className="text-[14px] md:text-[16px] text-gray-500 font-semibold tracking-tight">New to the Map</span>
                <Link href="/map" className="text-[13px] md:text-[15px] font-semibold text-[#006CE4] hover:opacity-70 flex items-center gap-1 transition-all hover:translate-x-1 font-header">
                    View all stores →
                </Link>
            </div>

            <div className="relative w-full overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap gap-8 px-8 items-center min-h-[160px]">
                    {displayStores.map((store, i) => (
                        <ListingCard
                            key={`${store.id}-${i}`}
                            store={store}
                            variant="marquee"
                            onClick={() => handleStoreClick(store)}
                            className="min-w-[340px] max-w-[420px] inline-flex"
                        />
                    ))}
                </div>
            </div>

            {/* Store Card Popup - Same as map pin */}
            {selectedStore && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedStore(null)}>
                    <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <StoreCard store={selectedStore} onClose={() => setSelectedStore(null)} />
                    </div>
                </div>
            )}
        </div>
    );
}
