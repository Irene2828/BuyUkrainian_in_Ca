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
                "bg-white/95 backdrop-blur-xl rounded-[28px] overflow-hidden flex flex-col w-[320px] transition-all duration-300",
                "shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-slate-900/5 border border-slate-900/10",
                "max-h-[85vh] p-5 gap-5"
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
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-900 leading-tight tracking-tight truncate">
                        {store.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full text-slate-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">
                        {getCategoryLabel(store.category)}
                    </span>
                    {matchedProduct && (
                        <span className="text-[12px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                            Matches: {matchedProduct}
                        </span>
                    )}
                </div>
            </div>

            {/* 2. Interactive Gallery (Full Width in Ticket Layout) */}
            {uniqueImages.length > 0 && (
                <div className="relative group w-full flex-shrink-0">
                    <div
                        className="h-40 w-full rounded-2xl overflow-hidden border border-slate-100 cursor-zoom-in hover:opacity-95 transition-opacity"
                        onClick={() => setIsLightboxOpen(true)}
                    >
                        <img
                            src={uniqueImages[currentImageIndex]}
                            alt={`${store.name} preview`}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* In-Card Navigation Arrows */}
                    {uniqueImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            >
                                <ChevronLeft size={14} className="text-slate-700" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            >
                                <ChevronRight size={14} className="text-slate-700" />
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Scrollable Content Container */}
            <div className="flex flex-col gap-5 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {/* 3. Information Section: Address & Website Stacked */}
                <div className="flex flex-col gap-1.5 min-w-0">
                    <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                        {store.address}
                    </p>
                    {store.website && (
                        <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
                        >
                            <Globe size={11} className="stroke-[2.5px]" />
                            <span className="truncate underline underline-offset-2 decoration-blue-100">
                                {store.website?.replace(/^https?:\/\/(www\.)?/, '')}
                            </span>
                        </a>
                    )}
                </div>

                {/* 4. Mathematically Perfect Action Grid */}
                <div className="grid grid-cols-4 gap-2 w-full pt-1">
                    {/* Directions */}
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-100 ring-1 ring-inset ring-slate-900/5 group-hover:ring-blue-400/30 flex items-center justify-center transition-all duration-300">
                            <CornerUpRight size={20} className="text-slate-700" />
                        </div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold text-center">Directions</span>
                    </a>

                    {/* Copy Address */}
                    <button
                        onClick={handleCopyAddress}
                        className="flex flex-col items-center justify-center gap-2 group"
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-full ring-1 ring-inset flex items-center justify-center transition-all duration-300",
                            copied
                                ? "bg-blue-50 ring-blue-200 text-blue-700"
                                : "bg-slate-50 ring-slate-900/5 hover:bg-slate-100 group-hover:ring-blue-400/30 text-slate-700"
                        )}>
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                        </div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold text-center">{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    {/* Share */}
                    <button
                        onClick={handleShare}
                        className="flex flex-col items-center justify-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-100 ring-1 ring-inset ring-slate-900/5 group-hover:ring-blue-400/30 flex items-center justify-center transition-all duration-300">
                            <Share2 size={20} className="text-slate-700" />
                        </div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold text-center">Share</span>
                    </button>

                    {/* Zoom */}
                    <button
                        onClick={onSeeOnMap ? () => onSeeOnMap(store) : () => { }}
                        className="flex flex-col items-center justify-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-100 ring-1 ring-inset ring-slate-900/5 group-hover:ring-blue-400/30 flex items-center justify-center transition-all duration-300">
                            <Maximize2 size={20} className="text-slate-700" />
                        </div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold text-center">Zoom</span>
                    </button>
                </div>

                {/* 5. Products Tag Cloud (Capped to 2 lines) */}
                {allProducts.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2 max-h-[82px] overflow-hidden relative">
                            {allProducts.map((product, idx) => (
                                <div
                                    key={idx}
                                    className="px-3 py-1.5 text-[12px] font-semibold bg-white border border-slate-200 rounded-full whitespace-nowrap text-slate-600 shadow-sm"
                                >
                                    {product}
                                </div>
                            ))}
                        </div>
                        {allProducts.length > 4 && (
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                +{allProducts.length - 4} more products
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
