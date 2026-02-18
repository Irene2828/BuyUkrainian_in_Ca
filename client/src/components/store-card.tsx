import React, { useState, useEffect } from 'react';
import { X, Copy, MapPin, Check, Maximize2, Globe, Share2, CornerUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

    // Image logic
    const baseImage = store.image || (store.images && store.images.length > 0 ? store.images[0] : null);
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
                    "bg-white/95 backdrop-blur-xl rounded-[32px] flex flex-col w-[360px] transition-all duration-500 pointer-events-auto",
                    "border border-slate-200 ring-1 ring-inset ring-slate-200/50",
                    "shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(0,0,0,0.02)]",
                    "h-auto max-h-[85vh] overflow-hidden relative z-20",
                    className
                )}
            >
                {/* 1. Sticky Header Section */}
                <div className="p-5 pb-3 bg-white/50 backdrop-blur-lg border-b border-slate-100/50 sticky top-0 z-20 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-slate-100/90 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-ui">
                            {getCategoryLabel(store.category)}
                        </span>
                        <button
                            onClick={onClose}
                            className="bg-slate-100/80 hover:bg-slate-200 p-1.5 rounded-full text-slate-500 transition-colors active:scale-95"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight tracking-tight font-header truncate">
                        {store.name}
                    </h2>
                </div>

                {/* 2. Scrollable Content Body */}
                <div className="overflow-y-auto custom-scrollbar p-5 pt-4 flex flex-col gap-6">
                    {/* Store Image - The trigger for expansion */}
                    <div
                        className={cn(
                            "relative w-full h-[120px] rounded-2xl overflow-hidden ring-1 ring-inset ring-black/5 shadow-sm cursor-zoom-in group transition-all duration-300",
                            isImageExpanded && "ring-blue-500/30"
                        )}
                        onClick={() => setIsImageExpanded(!isImageExpanded)}
                    >
                        <img
                            src={uniqueImages[currentImageIndex]}
                            alt={store.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 size={24} className="text-white drop-shadow-lg" />
                        </div>
                    </div>

                    {/* Info Stack */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-slate-400 mt-1 flex-shrink-0" />
                                <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
                                    {store.address}
                                </p>
                            </div>
                            {store.website && (
                                <div className="flex items-center gap-3">
                                    <Globe size={16} className="text-[#2D50A0]/60 flex-shrink-0" />
                                    <a
                                        href={store.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[14px] font-semibold text-[#2D50A0]/60 hover:text-[#2D50A0] underline underline-offset-4 decoration-[#2D50A0]/20 hover:decoration-[#2D50A0]/40 truncate transition-all"
                                    >
                                        {store.website?.replace(/^https?:\/\/(www\.)?/, '')}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Horizontal Product Tags */}
                        <div className="flex flex-col gap-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5">
                                Products in store
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {(isProductsExpanded ? allProducts : allProducts.slice(0, maxVisibleTags)).map((product, idx) => (
                                    <div
                                        key={idx}
                                        className="px-3 py-1 bg-slate-100/90 border border-slate-200/50 rounded-full text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-200 cursor-default"
                                    >
                                        {product}
                                    </div>
                                ))}
                                {hasMoreProducts && (
                                    <button
                                        onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                                        className="px-3 py-1 rounded-full text-[12px] font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
                                    >
                                        {isProductsExpanded ? "Show less" : `+${allProducts.length - maxVisibleTags} more`}
                                    </button>
                                )}
                                {allProducts.length === 0 && (
                                    <span className="text-[13px] text-slate-400 italic font-ui">Check website for products</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Sticky Action Row */}
                <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20">
                    <div className="grid grid-cols-4 gap-1">
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                            <div className="w-9 h-9 rounded-full bg-slate-100/90 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                <CornerUpRight size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500/60 uppercase tracking-tight">Directions</span>
                        </a>

                        <button
                            onClick={handleCopyAddress}
                            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                            <div className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                                copied ? "bg-green-600 text-white" : "bg-slate-100/90 text-slate-600 group-hover:bg-slate-900 group-hover:text-white"
                            )}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </div>
                            <span className="text-[9px] font-bold text-slate-500/60 uppercase tracking-tight">{copied ? "Copied" : "Copy Address"}</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                            <div className="w-9 h-9 rounded-full bg-slate-100/90 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                <Share2 size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500/60 uppercase tracking-tight">Share Store</span>
                        </button>

                        <button
                            onClick={() => setIsImageExpanded(!isImageExpanded)}
                            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                            <div className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                                isImageExpanded ? "bg-slate-900 text-white" : "bg-slate-100/90 text-slate-600 group-hover:bg-slate-900 group-hover:text-white"
                            )}>
                                <Maximize2 size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500/60 uppercase tracking-tight">Zoom In</span>
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
                            "bg-white/80 backdrop-blur-xl rounded-[32px] overflow-hidden w-[500px] pointer-events-auto",
                            "border border-slate-200 ring-1 ring-inset ring-slate-200/50 shadow-[0_30px_60px_rgba(0,0,0,0.12)]",
                            "flex flex-col relative z-20"
                        )}
                        style={{ height: 'auto', minHeight: '320px', maxHeight: '85vh' }}
                    >
                        <button
                            onClick={() => setIsImageExpanded(false)}
                            className="absolute top-6 right-6 z-30 p-2 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 backdrop-blur-md transition-all active:scale-95"
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
