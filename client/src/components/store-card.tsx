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
    const [isImageExpanded, setIsImageExpanded] = useState(defaultExpanded);
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
                    "h-auto max-h-[85vh] overflow-hidden relative z-20",
                    className
                )}
            >
                {/* 1. Sticky Header Section */}
                <div className="p-5 pb-3 bg-white border-b border-slate-100/50 sticky top-0 z-20 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 min-w-0">
                            <h2 className="text-[1.15rem] font-bold text-[#0A2540] leading-tight tracking-tight font-header line-clamp-2 mr-2">
                                {store.name}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors active:scale-95 shrink-0"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex items-center">
                        <span className="text-[#2D50A0]/70 text-[10px] font-bold uppercase tracking-[0.2em] font-ui">
                            {getCategoryLabel(store.category)}
                        </span>
                    </div>
                </div>

                {/* 2. Scrollable Content Body */}
                <div className="overflow-y-auto custom-scrollbar p-5 pt-4 flex flex-col gap-5">
                    {/* Compact Image & Info Grid */}
                    <div className="grid grid-cols-[110px_1fr] gap-4 items-start">
                        {/* Left Column: Store Image */}
                        <div
                            className={cn(
                                "relative w-[110px] h-[110px] rounded-2xl overflow-hidden ring-1 ring-inset ring-black/5 shadow-sm shrink-0",
                                !isImagesLoading && "cursor-zoom-in group transition-all duration-300",
                                isImageExpanded && "ring-blue-500/30"
                            )}
                            onClick={() => !isImagesLoading && setIsImageExpanded(!isImageExpanded)}
                        >
                            {isImagesLoading ? (
                                <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                                </div>
                            ) : (
                                <>
                                    <img
                                        src={uniqueImages[currentImageIndex]}
                                        alt={store.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <Maximize2 size={20} className="text-white drop-shadow-lg" />
                                    </div>
                                </>
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
                                    className="shrink-0 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-xs font-medium cursor-default"
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
                <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20 flex flex-col gap-3">
                    {/* Primary Button: Get Directions */}
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="bg-[#0057B7] text-white hover:bg-[#0047A0] transition-colors w-full h-[46px] rounded-full font-medium flex items-center justify-center gap-2 border-0 tracking-tight antialiased shadow-sm active:scale-[0.98] group"
                    >
                        <CornerUpRight size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
                        <span>Get Directions</span>
                    </a>

                    {/* Secondary Actions Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-transparent rounded-lg text-[12px] font-medium text-slate-700 transition-colors duration-200 hover:text-blue-600 hover:bg-slate-50 active:scale-95 group"
                        >
                            <Share2 size={13} />
                            <span>Share Store</span>
                        </button>

                        <button
                            onClick={() => setIsImageExpanded(!isImageExpanded)}
                            className={cn(
                                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium transition-colors duration-200 active:scale-95 group",
                                isImageExpanded
                                    ? "bg-slate-900 text-white hover:bg-slate-800"
                                    : "bg-transparent text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                            )}
                        >
                            <Maximize2 size={13} />
                            <span>{isImageExpanded ? "Collapse" : "Zoom In"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Expansion (Desktop) */}
            <AnimatePresence>
                {isImageExpanded && !isMobile && (
                    <motion.div
                        initial={{ opacity: 0, x: -40, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -40, scale: 0.95 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                            "bg-white rounded-[32px] overflow-hidden w-[500px] pointer-events-auto",
                            "ring-1 ring-inset ring-slate-200/50 shadow-[0_30px_60px_rgba(0,0,0,0.12)]",
                            "flex flex-col relative z-20"
                        )}
                        style={{ height: 'auto', minHeight: '320px', maxHeight: '85vh' }}
                    >
                        <button
                            onClick={() => setIsImageExpanded(false)}
                            className="absolute top-6 right-6 z-30 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all active:scale-95"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-full h-full relative group bg-black/5">
                            <img
                                src={uniqueImages[currentImageIndex]}
                                alt={store.name}
                                className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-[1.02]"
                            />
                            {/* Gradient Overlay for the Close Button legibility */}
                            <div className="absolute top-0 right-0 left-0 h-24 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* In-Card Expansion (Mobile Fallback) */}
            <AnimatePresence>
                {isImageExpanded && isMobile && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
                        onClick={() => setIsImageExpanded(false)}
                    >
                        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative max-w-sm w-full outline-none ring-1 ring-black/5">
                            <img src={uniqueImages[currentImageIndex]} className="w-full h-auto object-contain max-h-[70vh]" />
                            <div className="p-4 flex justify-between items-center bg-white border-t border-slate-100">
                                <span className="text-sm font-bold text-slate-900">{store.name}</span>
                                <button className="text-blue-600 font-bold text-sm">Close</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
