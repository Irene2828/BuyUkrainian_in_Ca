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
            toast({ title: "Link Copied", description: "Map link copied to clipboard." });
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
        <div className="flex items-start gap-4 pointer-events-none">
            {/* Primary Data Card */}
            <div
                className={cn(
                    "bg-white/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(10,37,64,0.12)] rounded-3xl border-0 flex flex-col w-[360px] transition-all duration-500 pointer-events-auto",
                    "h-[560px] max-h-[85vh] overflow-hidden relative z-20",
                    className
                )}
            >
                {/* 1. Sticky Header Section */}
                <div className="shrink-0 p-5 pb-4 bg-white border-b border-slate-100/50 sticky top-0 z-20 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-4">
                        <h2 
                            className="text-[15px] font-semibold tracking-tight leading-tight antialiased font-header line-clamp-2"
                            style={{ color: '#0057B7' }}
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
                                    <Globe size={18} className="text-[#FFD700] drop-shadow-sm transition-transform group-hover/web:scale-110 active:scale-90" strokeWidth={2.5} />
                                </a>
                            )}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors active:scale-95 shrink-0"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Brand Divider */}
                    <div className="h-[2px] w-12 bg-[#FFD700] rounded-full shrink-0" />

                    <div className="flex items-center">
                        <span className="text-[#2D50A0]/70 text-[10px] font-bold uppercase tracking-[0.2em] font-ui">
                            {getCategoryLabel(store.category)}
                        </span>
                    </div>
                </div>

                {/* 2. Scrollable Content Body */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 pt-4 flex flex-col gap-5">
                    {/* Compact Image & Info Grid */}
                    <div className="grid grid-cols-[110px_1fr] gap-4 items-start">
                        {/* Left Column: Store Image */}
                        <div
                            className={cn(
                                "relative w-[110px] h-[110px] rounded-2xl overflow-hidden ring-1 ring-inset ring-black/5 shadow-sm shrink-0",
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
                                        <p className="text-[13px] text-slate-600 font-medium leading-relaxed line-clamp-3">
                                            {store.address}
                                        </p>
                                        <button
                                            onClick={handleCopyAddress}
                                            className={cn(
                                                "p-1 rounded-full transition-colors flex items-center justify-center shrink-0",
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

                                {/* Website Row */}
                                {store.website && (
                                    <a
                                        href={store.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-[13px] font-medium text-blue-600 hover:text-blue-800 transition-colors w-fit group"
                                    >
                                        <div className="w-5 flex justify-center shrink-0">
                                            <Globe size={14} className="opacity-80 group-hover:opacity-100" />
                                        </div>
                                        <span>Visit website</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Product Tags */}
                    <div className="flex flex-col gap-2.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5">
                            Products in store
                        </p>
                        <div className="flex flex-row items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 pt-1 custom-scrollbar">
                            {allProducts.map((product, idx) => (
                                <div
                                    key={idx}
                                    className="shrink-0 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[12px] font-medium cursor-default"
                                >
                                    {product}
                                </div>
                            ))}
                            {allProducts.length === 0 && (
                                <span className="text-[12px] text-slate-400 italic font-ui shrink-0">Check website for products</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Sticky Action Row */}
                <div className="shrink-0 mt-auto p-4 bg-white border-t border-slate-100 z-20 flex flex-col gap-3 min-h-[128px]">
                    <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`, '_blank')}
                        data-testid="get-directions-btn"
                        className="bg-[#0057B7] !flex text-white hover:bg-[#0047A0] transition-all duration-300 w-full min-h-[46px] shrink-0 rounded-full text-[16px] font-medium items-center justify-center gap-2 border-0 tracking-tight shadow-[0_4px_12px_0_rgba(0,87,183,0.18)] hover:shadow-[0_6px_16px_rgba(0,87,183,0.28)] hover:scale-[1.02] active:scale-[0.98] group"
                    >
                        <CornerUpRight size={18} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        <span>Get Directions</span>
                    </button>

                    {/* Secondary Actions Row */}
                    <div className="grid grid-cols-2 gap-3 shrink-0">
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-transparent rounded-lg text-[12px] font-medium text-slate-700 transition-colors duration-200 hover:text-blue-600 hover:bg-slate-50 active:scale-95 group"
                        >
                            <Share2 size={13} />
                            <span>Share Store</span>
                        </button>

                        <button
                            onClick={() => onSeeOnMap?.(store)}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium transition-colors duration-200 active:scale-95 group bg-transparent text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                        >
                            <MapPin size={13} />
                            <span>Zoom In Map</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
