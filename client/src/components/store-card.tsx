import React, { useState, useEffect, useCallback } from 'react';
import { X, Copy, Share2, MapPin, Check, Map as MapIcon, ZoomIn, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Store } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from "@/lib/i18n";
import { cn } from '@/lib/utils';

interface StoreCardProps {
    store: Store;
    onClose: () => void;
    onSeeOnMap?: (store: Store) => void;
    actionSlot?: React.ReactNode;
    searchQuery?: string; // For showing matched products
}

export function StoreCard({ store, onClose, onSeeOnMap, actionSlot, searchQuery }: StoreCardProps) {
    const { t } = useI18n();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Image logic - treating as array for future proofing
    const images = store.image ? [store.image] : ["/assets/kyivcake.jpeg"];
    const displayImages = images.length === 1 ? [images[0], "/assets/kyivcake.jpeg", "/assets/hero-bg.jpg"] : images;
    const uniqueImages = Array.from(new Set(displayImages)).filter(Boolean);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Check if search matched a product (not the store name)
    const matchedProduct = searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())
        ? store.products.find(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
        : null;

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(store.address);
        setCopied(true);
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/map?storeId=${store.id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: store.name,
                    text: `Check out ${store.name} on BuyUkrainian.ca!`,
                    url: shareUrl,
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast({ title: "Link Copied", description: "Store link copied to clipboard." });
        }
    };

    // Lightbox Navigation
    const nextImage = useCallback(() => {
        if (uniqueImages.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length);
        }
    }, [uniqueImages.length]);

    const prevImage = useCallback(() => {
        if (uniqueImages.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
        }
    }, [uniqueImages.length]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isLightboxOpen) return;
        if (e.key === 'Escape') setIsLightboxOpen(false);
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    }, [isLightboxOpen, nextImage, prevImage]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="flex flex-col h-auto w-full font-sans relative bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-[32px] overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">

            {/* Close Button */}
            {!isLightboxOpen && (
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 text-slate-300 transition-colors duration-200 hover:text-black z-50 focus:outline-none focus-visible:ring-0"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            {/* Gallery Inset */}
            {isLightboxOpen && (
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-40 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-h-[70%] bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-black/5 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-3 right-3 z-50 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors focus:outline-none focus-visible:ring-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="flex-1 relative flex items-center justify-center bg-gray-50 p-6 min-h-0 overflow-auto">
                            {uniqueImages.length > 1 && (
                                <>
                                    <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-black transition-colors z-10 bg-white/80 hover:bg-white rounded-full shadow-sm focus:outline-none focus-visible:ring-0">
                                        <ChevronLeft className="w-4 h-4 stroke-[2]" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-black transition-colors z-10 bg-white/80 hover:bg-white rounded-full shadow-sm focus:outline-none focus-visible:ring-0">
                                        <ChevronRight className="w-4 h-4 stroke-[2]" />
                                    </button>
                                </>
                            )}
                            <img src={uniqueImages[currentImageIndex]} alt={store.name} className="max-w-full max-h-[250px] object-contain select-none" loading="lazy" />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area - SYMMETRICAL PADDING (py-8) */}
            <div className={cn("flex flex-col h-full overflow-y-auto custom-scrollbar px-6 py-8", isLightboxOpen && "opacity-10 pointer-events-none")}>

                {/* TIER 1: Identity Header (Div to avoid semantic conflicts) - DEFINITIVE BLACK */}
                <div className="mb-4">
                    <div className="!text-[18px] !font-bold text-slate-950 tracking-tight leading-tight line-clamp-1 pr-8" title={store.name}>
                        {store.name}
                    </div>
                </div>

                {/* TIER 2: Category */}
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4">
                    {store.category === 'food' ? 'FOOD & GROCERY' :
                        store.category === 'clothes' ? 'CLOTHING' :
                            store.category === 'retail' ? 'RETAIL & GIFTS' :
                                store.category?.toUpperCase() || 'STORE'}
                </span>

                {/* TIER 3: The "Shop Window" Split */}
                <div className="flex flex-row items-stretch gap-6 mt-1 mb-4">
                    {/* Left Column: Hero Icon */}
                    <div
                        className="w-24 h-24 bg-slate-50 rounded-2xl p-3 flex-shrink-0 cursor-pointer hover:bg-slate-100 transition-colors shadow-sm"
                        onClick={() => { setCurrentImageIndex(0); setIsLightboxOpen(true); }}
                    >
                        <img
                            src={uniqueImages[0]}
                            alt={store.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                        />
                    </div>

                    {/* Right Column: Highlights Stack - CLEAN INVENTORY LIST */}
                    <div className="flex-1 min-w-0 flex flex-col justify-start pt-1">
                        <ul className="text-[16px] font-normal text-slate-900 leading-snug max-h-32 overflow-y-auto pr-2 custom-scrollbar space-y-1.5 font-sans">
                            {store.products && store.products.length > 0 ? (
                                store.products.map((product, i) => (
                                    <li key={i} className="truncate">
                                        - {product}
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li className="truncate">
                                        - Authentic Selection
                                    </li>
                                    <li className="truncate">
                                        - Fresh Imports
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Metadata Block (Address & Hours) - Match Icon Color */}
                <div className="space-y-1.5 mt-auto mb-6 pl-1">
                    <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-[2px] shrink-0" />
                        <span className="text-[14px] font-medium text-slate-400 leading-tight block">
                            {store.address}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[14px] font-medium text-slate-400">
                            Open today: 9:00 AM - 8:00 PM
                        </span>
                    </div>
                </div>

                {matchedProduct && (
                    <div className="text-[11px] text-blue-600 font-medium mb-3 font-ui bg-blue-50/50 inline-block px-2 py-1 rounded-md self-start">
                        Matches: {matchedProduct}
                    </div>
                )}

                {/* ANCHOR: Primary Action - Reduced Dead Zone */}
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-[46px] md:h-[52px] w-full bg-white text-black border border-black rounded-full text-[14px] font-bold mt-4 hover:bg-black hover:text-white transition-all duration-300 ease-in-out gap-2 shadow-sm focus:outline-none focus-visible:ring-0"
                >
                    Get Directions
                </a>

                {/* Secondary Actions Footer - ACTION CLUSTER (Tightened to Primary) */}
                <div className="flex items-center justify-center gap-2 pt-3 mt-1">
                    <button
                        onClick={handleCopyAddress}
                        className={cn(
                            "bg-transparent hover:bg-slate-50 text-slate-700 hover:text-black rounded-full px-4 py-2 transition-all border-none outline-none ring-0 flex items-center gap-1.5 text-[13px] font-medium",
                            copied && "text-blue-600 hover:text-blue-700"
                        )}
                    >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Address Copied" : "Copy Info"}
                    </button>
                    <button
                        onClick={onSeeOnMap ? () => onSeeOnMap(store) : handleShare}
                        className="bg-transparent hover:bg-slate-50 text-slate-700 hover:text-black rounded-full px-4 py-2 transition-all border-none outline-none ring-0 flex items-center gap-1.5 text-[13px] font-medium"
                    >
                        {onSeeOnMap ? <MapIcon className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                        {onSeeOnMap ? "Show on the map" : "Share"}
                    </button>
                </div>

            </div>
        </div>
    );
}
