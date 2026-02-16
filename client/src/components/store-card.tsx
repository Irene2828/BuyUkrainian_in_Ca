import React, { useState, useEffect, useCallback } from 'react';
import { X, Copy, Navigation, MapPin, Check, Maximize2, ZoomIn, ChevronLeft, ChevronRight, ArrowUpRight, Globe, Share2, Target, Route, ExternalLink, CornerUpRight } from 'lucide-react';
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
    className?: string; // Allow overrides
}

export function StoreCard({ store, onClose, onSeeOnMap, actionSlot, searchQuery, className }: StoreCardProps) {
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

    const handleShare = async () => {
        const shareData = {
            title: store.name,
            text: `Check out ${store.name} on BuyUkrainian.ca!`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link Copied",
                description: "Map link copied to clipboard for sharing."
            });
        }
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

    const [leaveTimeout, setLeaveTimeout] = useState<any>(null);

    const handleMouseEnter = () => {
        if (leaveTimeout) {
            clearTimeout(leaveTimeout);
            setLeaveTimeout(null);
        }
    };

    const handleMouseLeave = () => {
        const timeout = setTimeout(() => {
            onClose();
        }, 200);
        setLeaveTimeout(timeout);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (leaveTimeout) clearTimeout(leaveTimeout);
        };
    }, [leaveTimeout]);

    const allProducts = store.products?.flatMap(p => p.split(',')).map(p => p.trim()).filter(Boolean) || [];
    const visibleProducts = allProducts.slice(0, 4);
    const hiddenCount = allProducts.length - visibleProducts.length;

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "bg-white/95 backdrop-blur-xl rounded-[28px] overflow-hidden flex flex-col w-[360px] transition-all duration-300",
                // "Technical Double" Border System: Outer Slate-200, Inner White/40 Inset Ring
                "border border-slate-200 ring-1 ring-white/40 ring-inset",
                "shadow-[0_20px_50px_rgba(0,0,0,0.12)]",
                "max-h-[85vh] p-5 gap-5",
                className
            )}
        >
            {/* Lightbox Overlay */}
            {isLightboxOpen && createPortal(
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[3000] flex items-center justify-center p-4"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div
                        className="relative max-w-2xl w-full bg-slate-900 rounded-[24px] border border-white/20 overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-sm"
                        >
                            <X className="w-5 h-5" strokeWidth={2} />
                        </button>
                        <div className="relative aspect-video">
                            <img
                                src={uniqueImages[currentImageIndex]}
                                alt={store.name}
                                className="w-full h-full object-cover"
                            />
                            {uniqueImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 1. Brand Header Section */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-[20px] font-bold text-slate-900 leading-tight tracking-tight truncate font-header">
                        {store.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="bg-slate-100/80 hover:bg-slate-200 p-1.5 rounded-full text-slate-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 bg-slate-900/5 text-slate-600 rounded-lg uppercase tracking-wider border border-slate-900/5">
                        {getCategoryLabel(store.category)}
                    </span>
                    {matchedProduct && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                            Matches: {matchedProduct}
                        </span>
                    )}
                </div>
            </div>

            {/* 2. Middle Row: Image (Left) & Products (Right) */}
            <div className="flex gap-4 items-stretch min-h-[112px]">
                {/* Image (Left) */}
                {uniqueImages.length > 0 && (
                    <div className="relative group w-28 h-28 flex-shrink-0">
                        <div
                            className="w-full h-full rounded-2xl overflow-hidden border border-slate-100/80 cursor-zoom-in hover:opacity-95 transition-opacity shadow-sm"
                            onClick={() => setIsLightboxOpen(true)}
                        >
                            <img
                                src={uniqueImages[currentImageIndex]}
                                alt={`${store.name} preview`}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Pagination Arrows */}
                        {uniqueImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/95 border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                >
                                    <ChevronLeft size={12} className="text-slate-700" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/95 border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                >
                                    <ChevronRight size={12} className="text-slate-700" />
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Product Tags (Right - Scrollable) */}
                <div className="flex-1 bg-slate-50/50 rounded-2xl p-2.5 border border-slate-100/50">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 px-0.5">Products in Store</p>
                    <div className="max-h-[72px] overflow-y-auto pr-1 flex flex-wrap gap-1.5 custom-scrollbar">
                        {allProducts.length > 0 ? (
                            allProducts.map((product, idx) => (
                                <div
                                    key={idx}
                                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200/60 rounded-lg text-slate-600 shadow-sm cursor-default hover:border-blue-200 transition-colors"
                                >
                                    {product}
                                </div>
                            ))
                        ) : (
                            <span className="text-[12px] text-slate-400 italic px-1">Check website for products</span>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Detailed Info: Address & Website */}
            <div className="flex flex-col gap-2.5 px-0.5">
                <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-slate-100 rounded-lg flex-shrink-0 mt-0.5">
                        <MapPin size={14} className="text-slate-500" />
                    </div>
                    <p className="text-[14px] text-slate-700 font-medium leading-[1.5]">
                        {store.address}
                    </p>
                </div>

                {store.website && (
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
                            <Globe size={14} className="text-blue-500" />
                        </div>
                        <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors underline underline-offset-4 decoration-blue-100 hover:decoration-blue-400 truncate"
                        >
                            {store.website?.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                    </div>
                )}
            </div>

            {/* 4. Mathematically Perfect Action Grid */}
            <div className="grid grid-cols-4 gap-2 w-full pt-1 border-t border-slate-100 mt-1">
                {/* Directions */}
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 group py-2"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-100 ring-1 ring-inset ring-slate-900/5 group-hover:ring-blue-400/30 flex items-center justify-center transition-all duration-300">
                        <CornerUpRight size={20} className="text-slate-700" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold text-center">Directions</span>
                </a>

                {/* Copy Address */}
                <button
                    onClick={handleCopyAddress}
                    className="flex flex-col items-center justify-center gap-2 group py-2"
                >
                    <div className={cn(
                        "w-12 h-12 rounded-full ring-1 ring-inset flex items-center justify-center transition-all duration-300",
                        copied
                            ? "bg-blue-50 ring-blue-200 text-blue-700"
                            : "bg-slate-50 ring-slate-900/5 hover:bg-slate-100 group-hover:ring-blue-400/30 text-slate-700"
                    )}>
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold text-center">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Share */}
                <button
                    onClick={handleShare}
                    className="flex flex-col items-center justify-center gap-2 group py-2"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-100 ring-1 ring-inset ring-slate-900/5 group-hover:ring-blue-400/30 flex items-center justify-center transition-all duration-300">
                        <Share2 size={20} className="text-slate-700" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold text-center">Share</span>
                </button>

                {/* Zoom */}
                <button
                    onClick={onSeeOnMap ? () => onSeeOnMap(store) : () => { }}
                    className="flex flex-col items-center justify-center gap-2 group py-2"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-100 ring-1 ring-inset ring-slate-900/5 group-hover:ring-blue-400/30 flex items-center justify-center transition-all duration-300">
                        <Maximize2 size={20} className="text-slate-700" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold text-center">Zoom</span>
                </button>
            </div>
        </div>
    );
}
