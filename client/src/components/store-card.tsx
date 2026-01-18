import React, { useState, useEffect, useCallback } from 'react';
import { X, Copy, Navigation, MapPin, Check, Maximize2, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { Store } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from "@/lib/i18n";
import { cn } from '@/lib/utils';

interface StoreCardProps {
    store: Store;
    onClose: () => void;
    onSeeOnMap?: (store: Store) => void;
    actionSlot?: React.ReactNode;
    searchQuery?: string;
}

export function StoreCard({ store, onClose, onSeeOnMap, actionSlot, searchQuery }: StoreCardProps) {
    const { t } = useI18n();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Image logic
    const images = store.image ? [store.image] : ["/assets/kyivcake.jpeg"];
    const displayImages = images.length === 1 ? [images[0], "/assets/kyivcake.jpeg", "/assets/hero-bg.jpg"] : images;
    const uniqueImages = Array.from(new Set(displayImages)).filter(Boolean);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Check if search matched a product
    const matchedProduct = searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())
        ? store.products.find(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
        : null;

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(store.address);
        setCopied(true);
        if (navigator.vibrate) navigator.vibrate(50);
        toast({
            title: t('modal.addressCopied') || "Address Copied",
            description: t('modal.addressCopiedDesc') || "The address has been copied to your clipboard."
        });
        setTimeout(() => setCopied(false), 2000);
    };

    // Category mapping
    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            food: 'Food & Grocery',
            clothes: 'Clothing',
            retail: 'Retail & Gifts',
            other: 'Gifts'
        };
        return labels[category] || category;
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
        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col w-full max-w-sm animate-in fade-in zoom-in duration-300">
            {/* Lightbox Overlay */}
            {isLightboxOpen && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300" onClick={() => setIsLightboxOpen(false)}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-h-[70%] bg-white rounded-[24px] shadow-xl border border-black/5 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-3 right-3 z-50 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="flex-1 relative flex items-center justify-center bg-gray-50 p-6 min-h-0 overflow-auto">
                            {uniqueImages.length > 1 && (
                                <>
                                    <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-black transition-colors z-10 bg-white/80 hover:bg-white rounded-full shadow-sm">
                                        <ChevronLeft className="w-4 h-4 stroke-[2]" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-black transition-colors z-10 bg-white/80 hover:bg-white rounded-full shadow-sm">
                                        <ChevronRight className="w-4 h-4 stroke-[2]" />
                                    </button>
                                </>
                            )}
                            <img src={uniqueImages[currentImageIndex]} alt={store.name} className="max-w-full max-h-[250px] object-contain select-none" loading="lazy" />
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Header Section: Brand & Navigation */}
            <div className="px-6 pt-7 pb-4 flex justify-between items-start">
                <div className="space-y-1.5 flex-1 pr-2">
                    <h2 className="text-[17px] font-bold text-gray-900 leading-tight tracking-tight line-clamp-2">
                        {store.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-wider">
                            {getCategoryLabel(store.category)}
                        </span>
                        {matchedProduct && (
                            <span className="text-[10px] font-medium px-2.5 py-1 bg-green-50 text-green-600 rounded-full">
                                Matches: {matchedProduct}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 active:scale-90"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
            </div>

            {/* 2. Visual Content Section: Gallery & Product Overview */}
            <div className="px-6 pb-3 flex items-start gap-4">
                {/* Interactive Store Image */}
                <div
                    className="relative group w-24 h-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-[24px] shadow-sm ring-1 ring-gray-100"
                    onClick={() => { setCurrentImageIndex(0); setIsLightboxOpen(true); }}
                >
                    <img
                        src={uniqueImages[0]}
                        alt={store.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Zoom Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                        <div className="bg-white/95 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <ZoomIn size={14} className="text-gray-900" strokeWidth={3} />
                        </div>
                    </div>
                </div>


                {/* Product List Card - Scrollable UI with Scroll Indicator */}
                <div className="flex-1 relative">
                    <div className="bg-gray-50/50 border border-gray-100 rounded-[24px] p-3 h-24 overflow-y-auto custom-scrollbar">
                        <p className="text-[16px] font-normal italic text-gray-600 leading-[1.4] tracking-tight font-['Inter']">
                            {store.products && store.products.length > 0
                                ? store.products.flatMap(p => p.split(',')).map(p => p.trim()).filter(p => p.length > 0).join(', ')
                                : 'Authentic Ukrainian products'}
                        </p>
                    </div>
                    {/* Minimal Premium Scroll Indicator */}
                    <div className="absolute bottom-0 right-0 left-0 h-8 bg-gradient-to-t from-gray-50 to-transparent rounded-b-[24px] pointer-events-none"></div>
                </div>
            </div>

            {/* 3. Information Section: Location & Context */}
            <div className="mx-6 border-t border-gray-100"></div>

            <div className="p-3">
                <div className="flex items-start gap-4">
                    <div className="bg-gray-50 p-3 rounded-[20px] text-gray-500 flex-shrink-0">
                        <MapPin size={20} />
                    </div>
                    <div className="flex-1 pt-0.5">
                        <p className="text-[15px] font-semibold text-gray-500 leading-snug">
                            {store.address.split(',').slice(0, 2).join(',')}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5 font-medium">
                            {store.address.split(',').slice(2).join(',')}
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Action Section: Primary & Secondary */}
            <div className="px-6 pb-4 pt-1 space-y-1.5">
                {/* Primary Action */}
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-[52px] bg-black text-white font-bold rounded-[32px] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-xl shadow-gray-200 hover:bg-[#1A1A1A] hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] active:scale-[0.98]"
                >
                    <Navigation size={20} strokeWidth={2.5} />
                    Get Directions
                </a>

                {/* Secondary Dual Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleCopyAddress}
                        className={cn(
                            "flex h-[52px] items-center justify-center gap-2 rounded-[32px] border border-gray-200 font-medium hover:bg-gray-100 transition-all text-xs sm:text-sm active:scale-[0.97]",
                            copied ? "text-blue-600 border-blue-200" : "text-gray-700"
                        )}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "Copied!" : "Copy address"}
                    </button>
                    <button
                        onClick={onSeeOnMap ? () => onSeeOnMap(store) : () => { }}
                        className="flex h-[52px] items-center justify-center gap-2 rounded-[32px] border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-all text-xs sm:text-sm active:scale-[0.97]"
                    >
                        <Maximize2 size={16} />
                        {onSeeOnMap ? "See on Map" : "Expand"}
                    </button>
                </div>
            </div>
        </div>
    );
}
