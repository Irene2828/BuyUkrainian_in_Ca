import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Link, useLocation } from "wouter";
import { StoreCard } from "./store-card";
import { Store } from "@/lib/data";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function RecentProductsMarquee() {
    const { t } = useI18n();
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
        <div className="w-full bg-white overflow-hidden pt-8 pb-12 md:pt-20 md:pb-[100px] font-sans">
            <div className="mx-auto px-6 md:px-[64px] max-w-[1440px] flex items-center justify-between mb-12">
                <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400">{t('home.newToMap') || 'New to the Map'}</span>
                <Link href="/map" className="group text-[15px] font-medium tracking-tight text-slate-500 hover:text-black flex items-center gap-1.5 transition-colors font-sans mr-4 md:mr-8">
                    {t('map.viewAllStores') || 'View all stores'}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-black transition-colors" />
                </Link>
            </div>

            <div className="relative w-full overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap gap-8 px-8 items-center min-h-[160px]">
                    {displayStores.map((store, i) => (
                        <div
                            key={`${store.id}-${i}`}
                            onClick={() => handleStoreClick(store)}
                            className="min-w-[340px] max-w-[420px] inline-flex bg-white p-8 rounded-[32px] border border-slate-100 cursor-pointer transition-all hover:border-slate-200 hover:shadow-sm group"
                        >
                            {/* Store Image */}
                            <div className="w-[100px] h-[100px] bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-black/5">
                                <img
                                    src={store.image || "/assets/kyivcake.jpeg"}
                                    alt={store.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Store Info - NO PINS, NO CATEGORY */}
                            <div className="flex flex-col justify-center gap-1 flex-1 min-w-0 ml-6">
                                <span className="text-[15px] font-semibold text-gray-900 truncate font-header">
                                    {store.name}
                                </span>
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium transition-colors group-hover:text-black font-ui">
                                    <span className="no-underline">
                                        {t ? t('modal.seeOnMap') : 'See on Map'}
                                    </span>
                                </div>
                            </div>
                        </div>
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
