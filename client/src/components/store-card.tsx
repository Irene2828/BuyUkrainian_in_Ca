import React, { useState, useEffect } from 'react';
import { X, Copy, MapPin, Check, Maximize2, Globe, Share2, CornerUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Store } from '@/lib/data';
import { getStoreImages } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from "@/lib/i18n";
import { cn } from '@/lib/utils';

interface StoreCardProps {
    store: Store;
    onClose: () => void;
    onSeeOnMap?: (store: Store) => void;
    actionSlot?: React.ReactNode;
    searchQuery?: string;
    className?: string;
    variant?: 'map' | 'modal';
    defaultExpanded?: boolean;
}

export function StoreCard({ store, onClose, onSeeOnMap, searchQuery, className, variant = 'map', defaultExpanded = false }: StoreCardProps) {
    const { t } = useI18n();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [isProductsExpanded, setIsProductsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Image lazy loading logic
    const { data: storeImages, isLoading: isImagesLoading } = useQuery({
        queryKey: ["store-images", store.id],
        queryFn: () => getStoreImages(store.id),
        staleTime: 1000 * 60 * 60, // Cache for 1 hour to avoid repeated egress
    });

    const baseImage = storeImages?.image || (storeImages?.images?.[0]) || store.image || (store.images?.[0]);
    const images = baseImage ? [baseImage] : ["/assets/kyivcake.jpeg"];
    const displayImages = images.length === 1 && baseImage ? [images[0], "/assets/kyivcake.jpeg", "/assets/hero-bg.jpg"] : images;
    const uniqueImages = Array.from(new Set(displayImages)).filter(Boolean);
    const [currentImageIndex] = useState(0);

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(store.address);
        setCopied(true);
        if (navigator.vibrate) navigator.vibrate(50);
        toast({
            title: "Address Copied",
            description: "The address has been copied to your clipboard."
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/map?store=${encodeURIComponent(String(store.id))}`;
        const shareData = {
            title: store.name,
            text: `Check out ${store.name} on BuyUkrainian.ca!`,
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            toast({ title: "Link Copied", description: "Store map link copied to clipboard." });
        } catch (err) {
            console.error('Error copying share link:', err);
            toast({ title: "Share Link", description: shareUrl });
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            food: 'Food & Grocery',
            clothes: 'Clothing',
            retail: 'Retail & Gifts',
            other: 'Gifts'
        };
        return labels[category] || category;
    };

    const allProducts = store.products?.flatMap(p => p.split(',')).map(p => p.trim()).filter(Boolean) || [];
    const maxVisibleTags = 8;
    const hasMoreProducts = allProducts.length > maxVisibleTags;

    return (
        <div className="flex w-full items-start gap-4 pointer-events-none">
            {/* Primary Data Card */}
            <div
                className={cn(
                    "bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(10,37,64,0.12)] rounded-[20px] border border-white/50 flex flex-col w-full transition-all duration-500 pointer-events-auto",
                    "h-auto max-h-[90vh] overflow-hidden relative z-20",
                    variant === 'map' && "md:w-[90%] md:mx-auto",
                    className
                )}
            >
                {/* 1. Sticky Header Section */}
                <div className="relative shrink-0 overflow-hidden p-4 pb-3 min-[1670px]:p-5 min-[1670px]:pb-4 bg-white/[0.82] backdrop-blur-xl border-b border-[#0057B7]/20 sticky top-0 z-20 flex flex-col gap-1.5">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-[#0057B7]/0 via-[#0057B7]/[0.055] to-[#0057B7]/[0.16]"
                    />
                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <h2 
                            className="text-[16px] xl:text-[17px] min-[1670px]:text-[19px] font-semibold tracking-tight leading-tight antialiased font-header line-clamp-2 text-slate-900"
                        >
                            {store.name}
                            {store.website && (
                                <a 
                                    href={store.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center ml-2 group/web align-middle"
                                    title="Visit Website"
                                >
                                    <Globe size={18} className="text-[#0057B7] drop-shadow-sm transition-transform group-hover/web:scale-110 active:scale-90" strokeWidth={2.5} />
                                </a>
                            )}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-[#0057B7] hover:bg-[#0057B7]/10 p-1.5 rounded-none transition-colors active:scale-95 shrink-0"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="relative z-10 flex items-center gap-2.5">
                        <div className="h-[2px] w-6 bg-[#0057B7] rounded-none shrink-0" />
                        <span className="text-[#0057B7]/80 text-[10px] xl:text-[10px] min-[1670px]:text-[11px] font-bold uppercase tracking-[0.2em] font-ui leading-none pt-[1px]">
                            {getCategoryLabel(store.category)}
                        </span>
                    </div>
                </div>

                {/* 2. Content Body (Dynamic & Fit) */}
                <div className="shrink-0 p-4 pt-3 min-[1670px]:p-5 min-[1670px]:pt-4 flex flex-col gap-4">
                    {/* Compact Image & Info Grid */}
                    <div className="grid grid-cols-[84px_1fr] min-[1670px]:grid-cols-[96px_1fr] gap-4 items-start">
                        {/* Left Column: Store Image */}
                        <div
                            className={cn(
                                "relative w-[84px] h-[84px] min-[1670px]:w-[96px] min-[1670px]:h-[96px] rounded-none overflow-hidden ring-1 ring-inset ring-black/5 shadow-sm shrink-0",
                                !isImagesLoading && "group transition-all duration-300"
                            )}
                        >
                            {isImagesLoading ? (
                                <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                                </div>
                            ) : (
                                <img
                                    src={uniqueImages[currentImageIndex]}
                                    alt={store.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            )}
                        </div>

                        {/* Right Column: Address & Website */}
                        <div className="flex flex-col gap-2 pt-0.5 min-w-0">
                            <div className="flex flex-col gap-3">
                                {/* Address Row */}
                                <div className="flex items-center gap-3">
                                    <div className="w-5 flex justify-center shrink-0">
                                        <MapPin size={14} className="text-slate-400" />
                                    </div>
                                    <div className="flex items-center justify-between flex-1 gap-2">
                                        <p className="text-[13px] xl:text-[13px] min-[1670px]:text-[14.5px] text-slate-600 font-medium leading-relaxed line-clamp-3">
                                            {store.address}
                                        </p>
                                        <button
                                            onClick={handleCopyAddress}
                                            className={cn(
                                                "p-1 rounded-none transition-colors flex items-center justify-center shrink-0",
                                                copied
                                                    ? "text-green-600 bg-green-50"
                                                    : "text-slate-400 hover:text-blue-600 hover:bg-slate-50"
                                            )}
                                            title={copied ? "Copied" : "Copy Address"}
                                        >
                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Product Tags */}
                    <div className="flex flex-col mt-0.5">
                        <div className="flex flex-row items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 pt-1 custom-scrollbar">
                            {allProducts.map((product, idx) => (
                                <div
                                    key={idx}
                                    className="shrink-0 bg-transparent border border-slate-300 text-slate-500 px-2.5 py-1 rounded-full text-[11.5px] xl:text-[11.5px] min-[1670px]:text-[12.5px] font-medium cursor-default"
                                >
                                    {product}
                                </div>
                            ))}
                            {allProducts.length === 0 && (
                                <span className="text-[11.5px] text-slate-400 italic font-ui shrink-0">Check website for products</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Action Row (Natural Fit) */}
                <div className="shrink-0 mt-auto px-4 pb-4 pt-3 min-[1670px]:p-5 bg-transparent border-t border-slate-200/60 z-20 flex flex-col gap-3">
                    <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`, '_blank')}
                        data-testid="get-directions-btn"
                        className="group relative inline-flex items-center justify-center h-[42px] min-[1670px]:h-[46px] shrink-0 px-6 text-[15px] font-medium tracking-normal rounded-none bg-transparent text-[#0057B7] border border-[#0057B7] transition-all duration-300 hover:bg-[#0057B7] hover:border-[#0057B7] hover:text-white hover:scale-[1.02] active:scale-[0.98] shadow-none hover:shadow-none focus:shadow-none focus:outline-none focus:ring-2 focus:ring-[#0057B7]/30 font-['Inter'] antialiased pointer-events-auto w-full"
                    >
                        <span>Get Directions</span>
                        <CornerUpRight size={16} className="text-current ml-2.5 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>

                    {/* Secondary Actions Row */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-none bg-transparent text-[12.5px] xl:text-[12.5px] min-[1670px]:text-[13.5px] font-medium tracking-normal text-[#0057B7] transition-transform duration-300 hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0057B7]/30 group"
                        >
                            <Share2 size={13} className="opacity-80" />
                            <span>Share Store</span>
                        </button>
                        
                        <button
                            onClick={() => onSeeOnMap?.(store)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-none bg-transparent text-[12.5px] xl:text-[12.5px] min-[1670px]:text-[13.5px] font-medium tracking-normal text-[#0057B7] transition-transform duration-300 hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0057B7]/30 group"
                        >
                            <MapPin size={13} className="opacity-80" />
                            <span>Zoom In Map</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
