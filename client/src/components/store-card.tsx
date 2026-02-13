import React, { useState, useEffect, useCallback } from 'react';
import { X, Copy, Navigation, MapPin, Check, Maximize2, ZoomIn, ChevronLeft, ChevronRight, ArrowUpRight, Globe } from 'lucide-react';
import { Store } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from "@/lib/i18n";
import { cn } from '@/lib/utils';
import { createPortal } from "react-dom";

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

    // Image logic - Priority: store.image, then first item in store.images array, then placeholder
    const baseImage = store.image || (store.images && store.images.length > 0 ? store.images[0] : null);
    const images = baseImage ? [baseImage] : ["/assets/kyivcake.jpeg"];
    const displayImages = images.length === 1 && baseImage ? [images[0], "/assets/kyivcake.jpeg", "/assets/hero-bg.jpg"] : images;
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
        <div className={cn(
            "bg-white/95 backdrop-blur-xl rounded-[32px] overflow-hidden flex flex-col w-full max-w-[400px] transition-all duration-300",
            "shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-brand-navy/15"
        )}>
            {/* Lightbox Overlay - Boutique Gallery Preview */}
            {isLightboxOpen && createPortal(
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[3000] flex items-center justify-center p-4"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    {/* Modal Container - Boutique Frame */}
                    <div
                        className="relative max-w-2xl w-full bg-slate-900 rounded-[20px] border border-white/20 overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button - Inside Modal */}
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-sm"
                        >
                            <X className="w-5 h-5 !fill-none !stroke-current" strokeWidth={2} />
                        </button>

                        {/* Image Display - Gallery Quality */}
                        <div className="relative aspect-video bg-slate-800">
                            <img
                                src={uniqueImages[currentImageIndex]}
                                alt={store.name}
                                className="w-full h-full object-cover select-none"
                                loading="lazy"
                            />

                            {/* Navigation Arrows - Inside Frame */}
                            {uniqueImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 backdrop-blur-sm"
                                    >
                                        <ChevronLeft className="w-6 h-6 !fill-none !stroke-current stroke-white" strokeWidth={2.5} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 backdrop-blur-sm"
                                    >
                                        <ChevronRight className="w-6 h-6 !fill-none !stroke-current stroke-white" strokeWidth={2.5} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Image Counter - Optional Indicator */}
                        {uniqueImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                                {currentImageIndex + 1} / {uniqueImages.length}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* 1. Header Section: Brand & Navigation */}
            <div className="px-6 pt-7 pb-4 flex justify-between items-start gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                    <h2 className="text-[18px] font-bold text-gray-900 leading-tight tracking-tight line-clamp-2">
                        {store.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-[#2D50A0] rounded-lg uppercase tracking-wider">
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
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full transition-all active:scale-95 flex-shrink-0"
                    aria-label="Close"
                >
                    <X size={20} className="fill-none stroke-current" strokeWidth={2.5} />
                </button>
            </div>

            {/* 2. Visual Content Section: Gallery & Product Overview */}
            <div className="px-6 pb-3 flex items-start gap-4">
                {/* Interactive Store Image */}
                <div
                    className={cn(
                        "relative group w-24 h-24 flex-shrink-0 overflow-hidden rounded-[24px] shadow-sm ring-1 ring-gray-100",
                        store.image ? "cursor-pointer" : "cursor-default"
                    )}
                    onClick={() => {
                        if (store.image) {
                            setCurrentImageIndex(0);
                            setIsLightboxOpen(true);
                        }
                    }}
                >
                    <img
                        src={uniqueImages[0]}
                        alt={store.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Zoom Overlay - Only if image exists */}
                    {store.image && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                            <div className="bg-white/95 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <ZoomIn size={14} className="text-gray-900 fill-none stroke-current" strokeWidth={3} />
                            </div>
                        </div>
                    )}
                </div>


                {/* Product List Card - Scrollable Gallery */}
                <div className="flex-1 min-w-0 h-24 flex flex-col justify-center relative">
                    {store.products && store.products.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 snap-x scrollbar-hide mask-fade pr-4">
                            {store.products.flatMap(p => p.split(',')).map(p => p.trim()).filter(p => p.length > 0).map((product, idx) => (
                                <div key={idx} className="flex-shrink-0 bg-slate-50 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 border border-slate-100 snap-start whitespace-nowrap shadow-sm">
                                    {product}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic pl-1">Authentic Ukrainian products</p>
                    )}
                    {/* Minimal Premium Scroll Indicator */}
                    <div className="absolute bottom-0 right-0 left-0 h-8 bg-gradient-to-t from-gray-50 to-transparent rounded-b-[24px] pointer-events-none"></div>
                </div>
            </div>

            {/* 3. Information Section: Location & Context */}
            <div className="mx-6 border-t border-gray-100"></div>

            <div className="p-3 flex flex-col gap-3">
                <div className="flex items-start gap-4">
                    <div className="bg-gray-50 p-3 rounded-[20px] text-gray-500 flex-shrink-0">
                        <MapPin size={20} className="fill-none stroke-current" strokeWidth={2} />
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

                {store.website && (
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-50 p-3 rounded-[20px] text-gray-500 flex-shrink-0">
                            <Globe size={20} className="fill-none stroke-current" strokeWidth={2} />
                        </div>
                        <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 font-medium hover:underline truncate"
                        >
                            {store.website.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                    </div>
                )}
            </div>

            {/* 4. Action Section: Primary & Secondary */}
            <div className="px-6 pb-4 mt-6 space-y-3">
                {/* Primary Action - Full Width Directions */}
                <div className="grid grid-cols-1">
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-slate-900 border border-slate-900 rounded-full px-8 h-12 text-base font-medium hover:bg-gray-50 hover:scale-[1.01] transition-all duration-300 tracking-[0.3px] flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Navigation size={20} className="fill-none stroke-current" strokeWidth={2} />
                        Get Directions
                    </a>
                </div>

                {/* Secondary Dual Actions - Synchronized Brand DNA */}
                <div className="flex items-center justify-center gap-x-4">
                    <button
                        onClick={handleCopyAddress}
                        className={cn(
                            "group flex h-11 items-center justify-center gap-2 rounded-xl border transition-all duration-300 active:scale-[0.97] px-4",
                            "font-medium text-[13px] tracking-tight",
                            copied
                                ? "bg-blue-50 border-blue-200 text-blue-600"
                                : "bg-transparent border-brand-navy/15 text-slate-600 hover:border-brand-navy/30 hover:text-[#2D50A0] hover:bg-slate-50/50"
                        )}
                    >
                        {copied ? (
                            <Check size={14} className="fill-none stroke-current" strokeWidth={2.5} />
                        ) : (
                            <Copy size={14} className="fill-none stroke-current" strokeWidth={2.5} />
                        )}
                        {copied ? "Copied!" : "Copy address"}
                    </button>
                    <button
                        onClick={onSeeOnMap ? () => onSeeOnMap(store) : () => { }}
                        className={cn(
                            "group flex h-11 items-center justify-center gap-2 rounded-xl border transition-all duration-300 active:scale-[0.97] px-4",
                            "font-medium text-[13px] tracking-tight",
                            "bg-transparent border-brand-navy/15 text-slate-600 hover:border-brand-navy/30 hover:text-[#2D50A0] hover:bg-slate-50/50"
                        )}
                    >
                        <Maximize2 size={14} className="fill-none stroke-current" strokeWidth={2.5} />
                        {onSeeOnMap ? "See on Map" : "Expand"}
                    </button>
                </div>
            </div>
        </div>
    );
}
