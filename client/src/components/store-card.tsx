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
        <div className="flex flex-col max-h-[600px] h-auto bg-white w-full font-sans relative shadow-[0_0_0_1px_rgba(0,0,0,0.02)] rounded-[32px] overflow-hidden transition-all duration-300">

            {/* Close Button - Conditional positioning */}
            {!isLightboxOpen && (
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-full text-gray-400 transition-all duration-200 hover:text-black hover:bg-gray-50 z-50"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            {/* Gallery Inset - Floating smaller modal within the card */}
            {isLightboxOpen && (
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-40 flex items-center justify-center animate-in fade-in duration-300">
                    {/* Inner Gallery Modal - 85% width, 70% max-height, centered */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-h-[70%] bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-black/5 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
                    >
                        {/* Close Button - Absolute, Outside Content Flow */}
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-3 right-3 z-50 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Micro-Label Store Name */}
                        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                            <div className="px-4 py-3">
                                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 text-center font-ui">
                                    {store.name}
                                </p>
                            </div>
                        </div>

                        {/* Image Container - Scrollable for multiple images */}
                        <div className="flex-1 relative flex items-center justify-center bg-gray-50 p-6 min-h-0 overflow-auto">
                            {/* Navigation Arrows */}
                            {uniqueImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-black transition-colors z-10 bg-white/80 hover:bg-white rounded-full shadow-sm"
                                    >
                                        <ChevronLeft className="w-4 h-4 stroke-[2]" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-black transition-colors z-10 bg-white/80 hover:bg-white rounded-full shadow-sm"
                                    >
                                        <ChevronRight className="w-4 h-4 stroke-[2]" />
                                    </button>
                                </>
                            )}

                            <img
                                key={currentImageIndex}
                                src={uniqueImages[currentImageIndex]}
                                alt={store.name}
                                className="max-w-full max-h-[250px] object-contain select-none"
                                loading="lazy"
                            />
                        </div>

                        {/* Pagination */}
                        <div className="px-6 pb-4 pt-2 flex items-center justify-center border-t border-gray-100 bg-white">
                            {uniqueImages.length > 1 && (
                                <span className="text-[10px] font-medium text-gray-400 font-ui tabular-nums tracking-wide">
                                    {currentImageIndex + 1} / {uniqueImages.length}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Store Details View - Dimmed when gallery is open */}
            <div className={cn("flex flex-col h-full transition-opacity duration-300", isLightboxOpen && "opacity-10 pointer-events-none")}>
                {/* --- FIXED TOP SECTION: Header & Actions --- */}
                <div className="flex-none px-8 pt-8 pb-0 bg-white z-20">

                    {/* Header: Name (Left) + Image (Right) */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[18px] font-bold text-[#111111] leading-[1.2] font-header tracking-tight mb-2">
                                {store.name}
                            </h3>
                            {matchedProduct && (
                                <div className="text-[11px] text-blue-600 font-medium mb-1 font-ui">
                                    Matches: {matchedProduct}
                                </div>
                            )}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-[3px] shrink-0" />
                                    <span className="text-[13px] text-[#6B7280] font-normal font-ui leading-tight">
                                        {store.address}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400 pl-0.5">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[12px] font-ui">Open today: 9:00 AM - 8:00 PM</span>
                                </div>
                            </div>
                        </div>

                        {/* Image: Compact 80x80 Rounded Square */}
                        <div
                            className="w-[80px] h-[80px] rounded-[14px] bg-white border border-gray-200 overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-all shrink-0 p-1"
                            onClick={() => {
                                setCurrentImageIndex(0);
                                setIsLightboxOpen(true);
                            }}
                        >
                            <img
                                src={uniqueImages[0]}
                                alt={store.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-[10px]"
                            />
                        </div>
                    </div>

                    {/* --- PRIMARY ACTIONS --- */}
                    <div className="flex flex-col gap-3 mt-4 pb-2 border-b border-gray-100 mb-2">
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 h-[44px] bg-white text-gray-900 border border-black rounded-full font-semibold text-[14px] shadow-sm hover:bg-gray-50 active:scale-95 transition-all font-ui w-full"
                        >
                            <MapPin className="w-3.5 h-3.5 text-gray-900" /> Get Directions
                        </a>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleCopyAddress}
                                className={cn(
                                    "flex items-center justify-center gap-2 h-[38px] bg-white text-gray-700 rounded-full font-bold text-[12px] border border-gray-200 active:scale-95 transition-all duration-200 font-ui hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100",
                                    copied && "text-blue-600 border-blue-200 bg-blue-50"
                                )}
                            >
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? "Copied" : "Copy Info"}
                            </button>

                            <button
                                onClick={onSeeOnMap ? () => onSeeOnMap(store) : handleShare}
                                className="flex items-center justify-center gap-2 h-[38px] bg-white text-gray-700 rounded-full font-bold text-[12px] border border-gray-200 active:scale-95 transition-all duration-200 font-ui hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100"
                            >
                                {onSeeOnMap ? <MapIcon className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                                {onSeeOnMap ? "Show on Map" : "Share"}
                            </button>
                        </div>
                    </div>

                    {/* Inventory Title */}
                    <span className="text-[12px] font-semibold text-gray-900 block mb-3 font-ui">
                        {t ? t('store.whatsHere') : "Що тут можна купити:"}
                    </span>
                </div>

                {/* --- SCROLLABLE INVENTORY LIST --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-6 pt-0 relative group">
                    <ul className="flex flex-col gap-2">
                        {store.products.length > 0 ? store.products.map((product, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-[14px] text-gray-600 font-ui leading-normal group/item hover:text-gray-900 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-100 border border-blue-200 mt-1.5 shrink-0 group-hover/item:bg-blue-500 group-hover/item:border-blue-500 transition-colors"></div>
                                {product}
                            </li>
                        )) : (
                            <li className="text-[13px] text-gray-500 italic pl-1">
                                Various Ukrainian products available at this location.
                            </li>
                        )}
                    </ul>

                    {/* Gradient Fade at Bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
