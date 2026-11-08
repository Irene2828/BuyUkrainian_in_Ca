import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    X, Copy, MapPin, Check, Globe, Share2, CornerUpRight, 
    Facebook, Instagram, Navigation, ShoppingBag, Utensils, 
    Shirt, Store as StoreIcon, Gift 
} from 'lucide-react';
import { Store } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getCategoryLabel as getLocalizedCategoryLabel, useI18n } from '@/lib/i18n';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AnchoredStoreCardProps {
    store: Store;
    map: any; // google.maps.Map
    onClose: () => void;
    userLocation?: [number, number] | null;
    onZoom?: (store: Store) => void;
}

type Placement = 'right' | 'left' | 'above' | 'below';

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const CARD_WIDTH = 310;
const ESTIMATED_CARD_HEIGHT = 340;
const PIN_HALF_WIDTH = 21;
const PIN_HEIGHT = 36;
const GAP_FROM_PIN = 14;

// Safe margins from viewport edges:
const PADDING_TOP = 20;
const PADDING_LEFT = 20;
const PADDING_RIGHT = 20;
const PADDING_BOTTOM = 72; // 34px marquee ticker bar + 38px clearance

export function AnchoredStoreCard({
    store,
    map,
    onClose,
    userLocation,
    onZoom
}: AnchoredStoreCardProps) {
    const { t } = useI18n();
    const { toast } = useToast();
    const cardRef = useRef<HTMLDivElement>(null);
    const lastPannedStoreIdRef = useRef<string | number | null>(null);

    const [pixelPos, setPixelPos] = useState<{ x: number, y: number } | null>(null);
    const [containerSize, setContainerSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
    const [copied, setCopied] = useState(false);

    const coordinates = store.coordinates;
    const lat = coordinates?.[0];
    const lng = coordinates?.[1];

    // Compute pixel position using Google Maps OverlayView
    useEffect(() => {
        if (!map || typeof lat !== 'number' || typeof lng !== 'number') return;
        if (typeof window === 'undefined' || !(window as any).google?.maps?.OverlayView) return;

        let isSubscribed = true;
        const overlay = new (window as any).google.maps.OverlayView();

        const updatePosition = () => {
            if (!isSubscribed) return;
            const mapDiv = map.getDiv?.();
            if (!mapDiv) return;

            const rect = mapDiv.getBoundingClientRect();
            setContainerSize({ width: rect.width, height: rect.height });

            const projection = overlay.getProjection?.();
            if (!projection) return;

            const latLng = new (window as any).google.maps.LatLng(lat, lng);
            const point = projection.fromLatLngToContainerPixel(latLng);
            if (!point) return;

            // "If the pin moves out of the viewport, close the card"
            const outOfBounds = 
                point.x < -15 || 
                point.x > rect.width + 15 || 
                point.y < -15 || 
                point.y > rect.height + 15;

            if (outOfBounds) {
                onClose();
                return;
            }

            setPixelPos({ x: point.x, y: point.y });
        };

        overlay.onAdd = () => {};
        overlay.draw = updatePosition;
        overlay.onRemove = () => {};
        overlay.setMap(map);

        const listeners = [
            map.addListener('center_changed', updatePosition),
            map.addListener('bounds_changed', updatePosition),
            map.addListener('zoom_changed', updatePosition),
            map.addListener('drag', updatePosition),
            map.addListener('idle', updatePosition),
        ];

        const mapDiv = map.getDiv?.();
        let resizeObserver: ResizeObserver | null = null;
        if (mapDiv && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => updatePosition());
            resizeObserver.observe(mapDiv);
        }

        return () => {
            isSubscribed = false;
            listeners.forEach(l => l.remove());
            if (resizeObserver) resizeObserver.disconnect();
            overlay.setMap(null);
        };
    }, [map, lat, lng, onClose]);

    // Handle Escape key to close card
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Distance calculation
    const distanceFormatted = useMemo(() => {
        if (!userLocation || !coordinates || typeof lat !== 'number' || typeof lng !== 'number') return null;
        const [userLat, userLng] = userLocation;
        const km = calculateDistanceKm(userLat, userLng, lat, lng);
        if (km < 1) return `${Math.round(km * 1000)} m`;
        return `${km.toFixed(1)} km`;
    }, [userLocation, coordinates, lat, lng]);

    // Category label
    const getCategoryLabel = (category: string) => {
        return getLocalizedCategoryLabel(category, t);
    };

    const handleCopyAddress = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(store.address);
        setCopied(true);
        toast({ title: "Address Copied", description: "The address has been copied to your clipboard." });
        setTimeout(() => setCopied(false), 2000);
    };

    const shareUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/map?store=${encodeURIComponent(String(store.id))}`
        : '';
    const shareText = `Check out ${store.name} on BuyUkrainian.ca!`;

    const handleShareFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleShareX = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleShareInstagram = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast({
                title: "Link Copied for Instagram",
                description: "Link copied to clipboard to paste in your posts or stories!"
            });
        } catch (err) {
            console.error('Error copying to Instagram:', err);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast({ title: "Link Copied", description: "Store map link copied to clipboard." });
        } catch (err) {
            console.error('Error copying link:', err);
        }
    };

    // Calculate placement and coordinates
    const placementCalc = useMemo(() => {
        if (!pixelPos || containerSize.width === 0 || containerSize.height === 0) return null;

        const W = containerSize.width;
        const H = containerSize.height;
        const pinX = pixelPos.x;
        const pinY = pixelPos.y;

        const cardH = cardRef.current?.offsetHeight || ESTIMATED_CARD_HEIGHT;
        const cardW = CARD_WIDTH;

        const spaceRight = W - (pinX + PIN_HALF_WIDTH + GAP_FROM_PIN) - PADDING_RIGHT;
        const spaceLeft = (pinX - PIN_HALF_WIDTH - GAP_FROM_PIN) - PADDING_LEFT;
        const spaceAbove = (pinY - PIN_HEIGHT - GAP_FROM_PIN) - PADDING_TOP;
        const spaceBelow = H - (pinY + 4 + GAP_FROM_PIN) - PADDING_BOTTOM;

        const spaces: Record<Placement, number> = {
            right: spaceRight,
            left: spaceLeft,
            above: spaceAbove,
            below: spaceBelow,
        };

        const fits: Record<Placement, boolean> = {
            right: spaceRight >= cardW,
            left: spaceLeft >= cardW,
            above: spaceAbove >= cardH,
            below: spaceBelow >= cardH,
        };

        // Determine best placement preferring sides that fit and have the most room
        const fittingPlacements = (['right', 'left', 'above', 'below'] as Placement[]).filter(p => fits[p]);

        let placement: Placement;
        // If the pin is in the lower part of the map, prefer 'above' if it fits to avoid bottom clipping
        if (pinY > H * 0.48 && fits.above) {
            placement = 'above';
        } else if (fittingPlacements.length > 0) {
            fittingPlacements.sort((a, b) => spaces[b] - spaces[a]);
            placement = fittingPlacements[0];
        } else {
            // Pick side with maximum room overall
            const all: Placement[] = ['above', 'right', 'left', 'below'];
            all.sort((a, b) => spaces[b] - spaces[a]);
            placement = all[0];
        }

        let left = 0;
        let top = 0;
        let arrowOffset = 0;

        if (placement === 'right') {
            left = pinX + PIN_HALF_WIDTH + GAP_FROM_PIN;
            top = Math.max(PADDING_TOP, Math.min(pinY - 18 - cardH / 2, H - cardH - PADDING_BOTTOM));
            arrowOffset = Math.max(26, Math.min(pinY - 18 - top, cardH - 28));
        } else if (placement === 'left') {
            left = pinX - PIN_HALF_WIDTH - GAP_FROM_PIN - cardW;
            top = Math.max(PADDING_TOP, Math.min(pinY - 18 - cardH / 2, H - cardH - PADDING_BOTTOM));
            arrowOffset = Math.max(26, Math.min(pinY - 18 - top, cardH - 28));
        } else if (placement === 'above') {
            top = pinY - PIN_HEIGHT - GAP_FROM_PIN - cardH;
            left = Math.max(PADDING_LEFT, Math.min(pinX - cardW / 2, W - cardW - PADDING_RIGHT));
            arrowOffset = Math.max(26, Math.min(pinX - left, cardW - 28));
        } else {
            // below
            top = pinY + 4 + GAP_FROM_PIN;
            left = Math.max(PADDING_LEFT, Math.min(pinX - cardW / 2, W - cardW - PADDING_RIGHT));
            arrowOffset = Math.max(26, Math.min(pinX - left, cardW - 28));
        }

        return {
            placement,
            left,
            top,
            arrowOffset,
            cardW,
            cardH,
            W,
            H,
            pinX,
            pinY
        };
    }, [pixelPos, containerSize]);

    // "If the card would still be clipped, pan the map slightly to bring it fully into view"
    useEffect(() => {
        if (!placementCalc || !map || lastPannedStoreIdRef.current === store.id) return;

        const { placement, left, top, cardW, cardH, W, H, pinY } = placementCalc;
        let panX = 0;
        let panY = 0;

        // Vertical clearance: lift map up if pin/card is low, or down if pin/card is high
        if (placement === 'above' && top < PADDING_TOP) {
            panY = top - PADDING_TOP - 24;
        } else if (placement === 'below' && top + cardH > H - PADDING_BOTTOM) {
            panY = (top + cardH) - (H - PADDING_BOTTOM) + 28;
        } else if (placement === 'left' || placement === 'right') {
            const idealTop = pinY - 18 - cardH / 2;
            if (idealTop + cardH > H - PADDING_BOTTOM) {
                panY = Math.round((idealTop + cardH) - (H - PADDING_BOTTOM) + 32);
            } else if (idealTop < PADDING_TOP) {
                panY = Math.round(idealTop - PADDING_TOP - 24);
            }
        }

        // Ensure the pin itself has comfortable clearance above bottom marquee ticker
        if (pinY > H - PADDING_BOTTOM) {
            const pinPanY = Math.round(pinY - (H - PADDING_BOTTOM) + 36);
            if (pinPanY > panY) {
                panY = pinPanY;
            }
        }

        // Horizontal clearance
        if (left < PADDING_LEFT) {
            panX = left - PADDING_LEFT - 20;
        } else if (left + cardW > W - PADDING_RIGHT) {
            panX = (left + cardW) - (W - PADDING_RIGHT) + 20;
        }

        if (panX !== 0 || panY !== 0) {
            lastPannedStoreIdRef.current = store.id;
            map.panBy?.(panX, panY);
        }
    }, [placementCalc, map, store.id]);

    if (!placementCalc) return null;

    const { placement, left, top, arrowOffset, cardW } = placementCalc;
    const allProducts = store.products?.flatMap(p => p.split(',')).map(p => p.trim()).filter(Boolean) || [];

    return (
        <div 
            className="absolute z-[2500] pointer-events-auto filter drop-shadow-[0_16px_36px_rgba(0,35,85,0.22)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            style={{ 
                left: `${left}px`, 
                top: `${top}px`, 
                width: `${cardW}px` 
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Directional Pointer Tail */}
            {placement === 'right' && (
                <div 
                    className="absolute -left-[10px] w-0 h-0 pointer-events-none z-30"
                    style={{ 
                        top: `${arrowOffset}px`,
                        transform: 'translateY(-50%)',
                        borderTop: '9px solid transparent',
                        borderBottom: '9px solid transparent',
                        borderRight: '10px solid #ffffff'
                    }}
                />
            )}
            {placement === 'left' && (
                <div 
                    className="absolute -right-[10px] w-0 h-0 pointer-events-none z-30"
                    style={{ 
                        top: `${arrowOffset}px`,
                        transform: 'translateY(-50%)',
                        borderTop: '9px solid transparent',
                        borderBottom: '9px solid transparent',
                        borderLeft: '10px solid #ffffff'
                    }}
                />
            )}
            {placement === 'above' && (
                <div 
                    className="absolute -bottom-[10px] w-0 h-0 pointer-events-none z-30"
                    style={{ 
                        left: `${arrowOffset}px`,
                        transform: 'translateX(-50%)',
                        borderLeft: '9px solid transparent',
                        borderRight: '9px solid transparent',
                        borderTop: '10px solid #ffffff'
                    }}
                />
            )}
            {placement === 'below' && (
                <div 
                    className="absolute -top-[10px] w-0 h-0 pointer-events-none z-30"
                    style={{ 
                        left: `${arrowOffset}px`,
                        transform: 'translateX(-50%)',
                        borderLeft: '9px solid transparent',
                        borderRight: '9px solid transparent',
                        borderBottom: '10px solid #ffffff'
                    }}
                />
            )}

            {/* Compact Main Card Container */}
            <div 
                ref={cardRef}
                className="bg-white/98 backdrop-blur-xl rounded-[18px] border border-slate-200/90 overflow-hidden flex flex-col w-full text-slate-800"
            >
                {/* 1. Header with Name & Close */}
                <div className="relative shrink-0 p-3.5 pb-2.5 bg-white border-b border-[#0057B7]/15 flex flex-col gap-1">
                    <div className="relative z-10 flex items-start justify-between gap-3">
                        <h2 className="text-[15px] font-semibold tracking-normal leading-tight text-slate-900 font-sans line-clamp-2">
                            {store.name}
                            {store.website && (
                                <a 
                                    href={store.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center ml-2 group/web align-middle"
                                    title="Visit Website"
                                >
                                    <Globe size={15} className="text-[#0057B7] drop-shadow-sm transition-transform group-hover/web:scale-110 active:scale-90" strokeWidth={2.5} />
                                </a>
                            )}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-[#0057B7] hover:bg-[#0057B7]/10 p-1 rounded-full transition-colors active:scale-95 shrink-0"
                            aria-label="Close"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="h-[2px] w-5 bg-[#FFD700] shrink-0" />
                        <span className="text-[#0057B7] text-[10px] font-bold uppercase tracking-[0.16em] leading-none">
                            {getCategoryLabel(store.category)}
                        </span>
                    </div>
                </div>

                {/* 2. Content Body: Icon + Address + Products */}
                <div className="p-3.5 pt-2.5 flex flex-col gap-3">
                    <div className="grid grid-cols-[64px_1fr] gap-3 items-start">
                        {/* Store Category Icon */}
                        <div className="relative w-[64px] h-[64px] rounded-[14px] overflow-hidden bg-slate-50 flex items-center justify-center ring-1 ring-inset ring-slate-100 shadow-sm shrink-0">
                            {(() => {
                                switch(store.category) {
                                    case 'food':
                                        return <Utensils className="w-6 h-6 text-[#0057B7]/70" strokeWidth={1.75} />;
                                    case 'clothes':
                                        return <Shirt className="w-6 h-6 text-[#0057B7]/70" strokeWidth={1.75} />;
                                    case 'other':
                                        return <Gift className="w-6 h-6 text-[#0057B7]/70" strokeWidth={1.75} />;
                                    case 'retail':
                                    default:
                                        return <StoreIcon className="w-6 h-6 text-[#0057B7]/70" strokeWidth={1.75} />;
                                }
                            })()}
                        </div>

                        {/* Address & Distance */}
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-start justify-between gap-1.5">
                                <p className="text-[12.5px] text-slate-600 font-medium leading-snug line-clamp-2">
                                    {store.address}
                                </p>
                                <button
                                    onClick={handleCopyAddress}
                                    className={cn(
                                        "p-1 rounded transition-colors shrink-0",
                                        copied ? "text-green-600 bg-green-50" : "text-slate-400 hover:text-blue-600 hover:bg-slate-50"
                                    )}
                                    title={copied ? "Copied" : "Copy Address"}
                                    aria-label="Copy Address"
                                >
                                    {copied ? <Check size={13} /> : <Copy size={13} />}
                                </button>
                            </div>

                            {distanceFormatted && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-blue-700 bg-blue-50/90 px-1.5 py-0.5 rounded-full border border-blue-200/60 w-fit mt-1">
                                    <Navigation size={9} className="fill-blue-600 text-blue-600" />
                                    {distanceFormatted} away
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Products tags */}
                    {allProducts.length > 0 && (
                        <div className="flex flex-row items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 pt-0.5 custom-scrollbar w-full">
                            {allProducts.slice(0, 6).map((product, idx) => (
                                <div
                                    key={idx}
                                    className="shrink-0 bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10.5px] font-medium"
                                >
                                    {product}
                                </div>
                            ))}
                            {allProducts.length > 6 && (
                                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                    +{allProducts.length - 6} more
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. Action Buttons */}
                <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 flex flex-col gap-2">
                    {/* Get Directions Primary CTA */}
                    <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`, '_blank')}
                        className="group inline-flex items-center justify-center gap-1.5 h-[38px] w-full px-4 rounded-full border border-slate-300 hover:border-[#0057B7]/70 bg-transparent text-[#0057B7] text-[13.5px] font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(0,87,183,0.18)] active:scale-[0.98] cursor-pointer outline-none font-sans"
                    >
                        <span>Get Directions</span>
                        <CornerUpRight size={14} className="stroke-[2.5] text-[#0057B7] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>

                    {/* Secondary Actions Row: Share, Edit, Zoom */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100/80">
                        {/* Share Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1 text-[12px] font-medium text-[#0057B7] hover:bg-[#0057B7]/8 rounded transition-colors outline-none cursor-pointer"
                                    aria-label="Share store"
                                >
                                    <Share2 size={13} className="opacity-80" />
                                    <span>Share</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[170px] p-1 font-sans border border-slate-200 shadow-xl bg-white z-[9999]">
                                <DropdownMenuItem onClick={handleShareFacebook} className="cursor-pointer text-[12.5px] py-1.5 px-2.5 rounded hover:bg-[#0057B7] hover:text-white flex items-center gap-2">
                                    <Facebook size={13} className="text-[#1877F2]" />
                                    <span>Facebook</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleShareX} className="cursor-pointer text-[12.5px] py-1.5 px-2.5 rounded hover:bg-[#0057B7] hover:text-white flex items-center gap-2">
                                    <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    <span>X (Twitter)</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleShareInstagram} className="cursor-pointer text-[12.5px] py-1.5 px-2.5 rounded hover:bg-[#0057B7] hover:text-white flex items-center gap-2">
                                    <Instagram size={13} className="text-[#E1306C]" />
                                    <span>Instagram</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer text-[12.5px] py-1.5 px-2.5 rounded hover:bg-[#0057B7] hover:text-white flex items-center gap-2">
                                    <Copy size={13} className="text-slate-500" />
                                    <span>Copy Link</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Edit Button */}
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('openAddStoreModal', { detail: { store } }))}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1 text-[12px] font-medium text-[#0057B7] hover:bg-[#0057B7]/8 rounded transition-colors outline-none cursor-pointer"
                            aria-label="Edit store"
                        >
                            <StoreIcon size={13} className="opacity-80" />
                            <span>Edit</span>
                        </button>

                        {/* Zoom Button */}
                        <button
                            type="button"
                            onClick={() => onZoom?.(store)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1 text-[12px] font-medium text-[#0057B7] hover:bg-[#0057B7]/8 rounded transition-colors outline-none cursor-pointer"
                            aria-label="Zoom to store"
                        >
                            <MapPin size={13} className="opacity-80" />
                            <span>Zoom</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
