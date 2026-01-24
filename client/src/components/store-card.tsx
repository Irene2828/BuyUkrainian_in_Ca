import React, { useState, useEffect, useCallback } from 'react';
import { X, Copy, Navigation, MapPin, Check, Maximize2, ZoomIn, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
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
        <div className="bg-white rounded-[20px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col w-full max-w-sm animate-in fade-in zoom-in duration-300">
            {/* Lightbox Overlay - Boutique Gallery Preview */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[2001] flex items-center justify-center p-4"
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
                </div>
            )}

            {/* 1. Header Section: Brand & Navigation */}
            <div className="px-6 pt-7 pb-4 flex justify-between items-start">
                <div className="space-y-1.5 flex-1 pr-2">
                    <h2 className="text-[17px] font-bold text-gray-900 leading-tight tracking-tight line-clamp-2">
                        {store.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#D3E4FD] text-slate-900 rounded-md uppercase tracking-wider">
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
                    <X size={20} className="fill-none stroke-current" strokeWidth={2} />
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

            <div className="p-3">
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
                        {store.website && (
                            <a
                                href={store.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 mt-1 block hover:underline truncate"
                            >
                                {store.website.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Action Section: Primary & Secondary */}
            <div className="px-6 pb-4 mt-6 space-y-3">
                {/* Primary Actions Grid */}
                <div className={cn("grid gap-3", store.website ? "grid-cols-2" : "grid-cols-1")}>
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-[52px] bg-black text-white font-bold rounded-[32px] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-xl shadow-gray-200 hover:bg-slate-900 hover:shadow-md hover:-translate-y-[0.5px] active:scale-[0.98] text-[15px]"
                    >
                        <Navigation size={20} className="fill-none stroke-current" strokeWidth={2.5} />
                        Directions
                    </a>

                    {store.website && (
                        <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-[52px] bg-blue-50 text-blue-700 font-bold rounded-[32px] flex items-center justify-center gap-2.5 transition-all duration-300 hover:bg-blue-100 hover:shadow-sm hover:-translate-y-[0.5px] active:scale-[0.98] text-[15px]"
                        >
                            <span>Website</span>
                            <ArrowUpRight size={20} className="fill-none stroke-current" strokeWidth={2.5} />
                        </a>
                    )}
                </div>

                {/* Secondary Dual Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleCopyAddress}
                        className={cn(
                            "group flex h-[52px] items-center justify-center gap-2 rounded-lg !border-none !border-transparent !bg-transparent text-slate-600 font-medium font-ui !transition-all !duration-300 hover:bg-slate-50 hover:scale-[1.01] hover:-translate-y-px text-xs sm:text-sm active:scale-[0.97]",
                            copied ? "text-blue-600 bg-blue-50/50" : ""
                        )}
                    >
                        {copied ? <Check size={16} className="fill-none stroke-current" strokeWidth={2} /> : <Copy size={16} className="fill-none stroke-current" strokeWidth={2} />}
                        {copied ? "Copied!" : "Copy address"}
                    </button>
                    <button
                        onClick={onSeeOnMap ? () => onSeeOnMap(store) : () => { }}
                        className="group flex h-[52px] items-center justify-center gap-2 rounded-lg !border-none !border-transparent !bg-transparent text-slate-600 font-medium font-ui !transition-all !duration-300 hover:bg-slate-50 hover:scale-[1.01] hover:-translate-y-px text-xs sm:text-sm active:scale-[0.97]"
                    >
                        <Maximize2 size={16} className="fill-none stroke-current" strokeWidth={2} />
                        {onSeeOnMap ? "See on Map" : "Expand"}
                    </button>
                </div>
            </div>
        </div>
    );
}
