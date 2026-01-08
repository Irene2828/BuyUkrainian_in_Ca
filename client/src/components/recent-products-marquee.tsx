import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { ArrowRight, MapPin, ExternalLink } from "lucide-react";
import { Link, useLocation } from "wouter";
import { StoreModal } from "./store-modal";
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
        setIsModalOpen(true);
    };

    const handleSeeOnMap = (store: Store) => {
        setIsModalOpen(false);
        setLocation(`/map?storeId=${store.id}`);
    };

    return (
        <div className="w-full bg-white overflow-hidden pt-[84px] pb-16 border-b border-gray-50 font-sans">
            <div className="mx-auto px-[64px] max-w-[1440px] flex items-center justify-end mb-12">
                <Link href="/map" className="text-[16px] font-semibold text-[#D3E4FD] hover:opacity-70 flex items-center gap-2 transition-all font-header">
                    View all <ArrowRight className="w-5 h-5" />
                </Link>
            </div>

            <div className="relative w-full overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap gap-8 px-8 items-center min-h-[160px]">
                    {displayStores.map((store, i) => (
                        <div
                            key={`${store.id}-${i}`}
                            onClick={() => handleStoreClick(store)}
                            /* Card: RESTORED TO AUDIT RADIUS [40px], WITH NEW STROKE #D3E4FD */
                            className="inline-flex flex-row items-center justify-between gap-6 bg-white min-w-[340px] max-w-[420px] p-8 rounded-[40px] border border-[#D3E4FD] cursor-pointer transition-all shadow-sm group"
                        >
                            <div className="flex flex-col gap-6 flex-1 min-w-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-6 h-6 rounded-full overflow-hidden relative shrink-0 border border-white shadow-sm">
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#3C93EA]"></div>
                                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#F3FF0A]" style={{ opacity: 0.8 }}></div>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[20px] font-medium text-[#1A1A1A] truncate font-header">{store.name}</span>
                                        <span className="text-[14px] font-bold text-gray-400 font-ui whitespace-normal">Local store</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-gray-400 text-[14px] font-bold transition-colors group-hover:text-[#D3E4FD] font-ui">
                                    <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    <span>See location</span>
                                </div>
                            </div>

                            {/* Store Image */}
                            <div className="w-[100px] h-[100px] bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-gray-100">
                                <img
                                    src="/assets/kyivcake.jpeg"
                                    alt="Store preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <StoreModal
                store={selectedStore}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSeeOnMap={handleSeeOnMap}
            />
        </div>
    );
}
