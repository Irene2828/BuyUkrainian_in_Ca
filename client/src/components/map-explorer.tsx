import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    ToyBrick, BookOpen, Bookmark,
    Eye, EyeOff, CheckCircle, HelpCircle,
    Plus, Minus, Home, Maximize2, X, MapPin, Copy, Mail, Facebook, Twitter, Instagram, Sparkles, ChevronDown, ChevronRight, Navigation, ExternalLink
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import { MapSection } from "@/components/map-section";
import { InteractiveMapRef } from "@/components/interactive-map";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const PROVINCE_MAP: Record<string, string> = {
    "AB": "Alberta", "BC": "British Columbia", "MB": "Manitoba", "NB": "New Brunswick",
    "NL": "Newfoundland and Labrador", "NS": "Nova Scotia", "ON": "Ontario",
    "PE": "Prince Edward Island", "QC": "Quebec", "SK": "Saskatchewan",
    "NT": "Northwest Territories", "NU": "Nunavut", "YT": "Yukon"
};

const CANADIAN_PROVINCES = Object.values(PROVINCE_MAP).sort();

const PROVINCE_CENTERS: Record<string, { lat: number, lng: number, zoom: number }> = {
    "Quebec": { lat: 52.0, lng: -71.0, zoom: 5 },
    "Ontario": { lat: 50.0, lng: -85.0, zoom: 5 },
    "Alberta": { lat: 55.0, lng: -115.0, zoom: 6 },
    "British Columbia": { lat: 54.0, lng: -125.0, zoom: 6 },
    "Manitoba": { lat: 55.0, lng: -97.0, zoom: 6 },
    "Saskatchewan": { lat: 53.0, lng: -106.0, zoom: 6 },
    "New Brunswick": { lat: 46.5, lng: -66.5, zoom: 7 },
    "Nova Scotia": { lat: 45.0, lng: -63.0, zoom: 7 },
    "Prince Edward Island": { lat: 46.5, lng: -63.0, zoom: 8.5 },
    "Newfoundland and Labrador": { lat: 53.0, lng: -57.0, zoom: 5.5 },
    "Yukon": { lat: 64.0, lng: -135.0, zoom: 5 },
    "Northwest Territories": { lat: 65.0, lng: -125.0, zoom: 5 },
    "Nunavut": { lat: 70.0, lng: -90.0, zoom: 4 },
};

interface MapExplorerProps {
    isZenMode?: boolean;
    onZenModeToggle?: () => void;
}

export function MapExplorer({ isZenMode = false, onZenModeToggle }: MapExplorerProps) {
    const { t } = useI18n();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [category, setCategory] = useState<string | null>(null);
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"map" | "list">("map");
    const [addStoreDialogOpen, setAddStoreDialogOpen] = useState(false);
    const [isFlying, setIsFlying] = useState(false);
    const [sortMode, setSortMode] = useState<"newest" | "name">("newest");
    const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [provinceSearchQuery, setProvinceSearchQuery] = useState("");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [showLocateHint, setShowLocateHint] = useState(false);

    const sidebarRef = useRef<HTMLElement>(null);
    const mapSectionRef = useRef<InteractiveMapRef>(null);

    const closeAllDropdowns = () => {
        setIsProvinceDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                closeAllDropdowns();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle Zen Mode Map Transitions & Layout Stability
    useEffect(() => {
        // Sequential invalidation to track the 500ms CSS transition
        const intervals = [50, 150, 300, 500, 800];
        const timers = intervals.map(ms =>
            setTimeout(() => {
                mapSectionRef.current?.invalidateSize();
                if (isZenMode && ms === 300) {
                    mapSectionRef.current?.zenView();
                }
            }, ms)
        );

        // Robust ResizeObserver: Detects ANY change in the map column height/width
        // This is the definitive fix for Leaflet cutting off during CSS transitions
        const observer = new ResizeObserver(() => {
            mapSectionRef.current?.invalidateSize();
        });

        const mapColumn = document.querySelector('.map-column-wrapper');
        if (mapColumn) observer.observe(mapColumn);

        return () => {
            timers.forEach(t => clearTimeout(t));
            observer.disconnect();
        };
    }, [isZenMode]);

    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: Infinity,
    });

    // Stats Calculation (Total)
    const stats = {
        stores: stores.length,
        provinces: new Set(stores.map(s => s.province)).size,
        products: stores.reduce((acc, s) => acc + (s.products?.length || 0), 0)
    };

    useEffect(() => {
        const handleClearFilters = () => {
            setSearchQuery("");
            setCategory(null);
            setSelectedProvince(null);
            setSelectedCity(null);
            setSortMode("newest");
        };
        window.addEventListener('clearFilters', handleClearFilters);
        return () => window.removeEventListener('clearFilters', handleClearFilters);
    }, []);

    useEffect(() => {
        const handleUserLocationFound = async (evt: Event) => {
            const event = evt as CustomEvent<{ latitude: number; longitude: number }>;
            const { latitude, longitude } = event.detail;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`, {
                    headers: { 'User-Agent': 'BuyUkrainian.ca/1.0' }
                });
                if (response.ok) {
                    const data = await response.json();
                    const province = data.address.state || data.address.province;
                    const city = data.address.city || data.address.town || data.address.village;
                    if (province) {
                        const matched = Object.keys(PROVINCE_CENTERS).find(p => p.toLowerCase().includes(province.toLowerCase()));
                        if (matched) setSelectedProvince(matched);
                    }
                    if (city) setSelectedCity(city);
                    setUserLocation([latitude, longitude]);
                }
            } catch (error) {
                setUserLocation([latitude, longitude]);
            }
        };
        window.addEventListener('userLocationFound', handleUserLocationFound);
        return () => window.removeEventListener('userLocationFound', handleUserLocationFound);
    }, []);

    const handleUseLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
            () => toast({ title: "Error", description: "Location access denied", variant: "destructive" })
        );
    };

    const provincesFiltered = ["All Provinces", ...CANADIAN_PROVINCES].filter(p => p.toLowerCase().includes(provinceSearchQuery.toLowerCase()));

    const allCategories = [
        { id: "food", label: "Food", icon: UtensilsCrossed },
        { id: "clothes", label: "Clothes", icon: ShoppingBag },
        { id: "gifts", label: "Gifts", icon: Gift },
        { id: "toys", label: "Toys", icon: ToyBrick },
        { id: "grocery", label: "Grocery", icon: StoreIcon },
        { id: "books", label: "Books", icon: BookOpen },
        { id: "souvenirs", label: "Souvenirs", icon: Bookmark },
        { id: "beauty", label: "Beauty", icon: Sparkles },
        { id: "retail", label: "Retail", icon: StoreIcon },
        { id: "other", label: "Other", icon: StoreIcon },
    ];

    return (
        <div className={cn(
            "w-full bg-white flex flex-col transition-[height] duration-300 ease-in-out font-sans",
            viewMode === "map" ? "h-auto" : "min-h-[400px]"
        )}>







            {/* 2. Immersive Map Canvas - Edge-to-Edge Workspace */}
            <div className={cn(
                "w-full relative overflow-hidden bg-white",
                isZenMode ? "h-screen" : "h-[calc(100vh-80px)]"
            )}>
                <div className="w-full h-full relative">

                    {/* Floating Overlay Islands - Aligned with Header via boutique-width */}
                    <div className="absolute inset-0 z-[600] pointer-events-none">
                        <div className="boutique-width mx-auto h-full relative">
                            {/* Top Row for Desktop Alignment */}
                            <div className="flex items-start justify-between pt-6">
                                {/* 1. Action Island (Top-Left - now aligned with Logo) */}
                                {/* Action Island Removed - Components Relocated */}

                                {/* 2. Control Strip (Top-Right - Premium Integrated Design) */}
                                {!isZenMode && (
                                    <div ref={sidebarRef as React.RefObject<HTMLDivElement>} className="pointer-events-auto flex items-center h-[56px] max-w-[960px] bg-slate-100/90 backdrop-blur-md border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-full px-[8px] transition-all duration-500 animate-in fade-in slide-in-from-left-4">

                                        {/* Segment 1: Search */}
                                        <div className="flex items-center px-[16px] min-w-[260px] h-full group">
                                            <Search className="w-4 h-4 text-gray-900 mr-2 flex-shrink-0" strokeWidth={2} />
                                            <input
                                                type="text"
                                                placeholder="Search stores..."
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    closeAllDropdowns();
                                                }}
                                                className="w-full bg-transparent border-none outline-none text-[16px] font-medium text-gray-900 placeholder:text-gray-500"
                                                aria-label="Search stores"
                                            />
                                        </div>

                                        {/* Divider */}
                                        <div className="w-[1px] h-6 bg-brand-navy/10 mx-1" />

                                        {/* Segment 2: Province Dropdown */}
                                        <div className="relative h-full flex items-center">
                                            <button
                                                onClick={() => {
                                                    const open = !isProvinceDropdownOpen;
                                                    closeAllDropdowns();
                                                    setIsProvinceDropdownOpen(open);
                                                }}
                                                className={cn(
                                                    "h-full px-[16px] flex items-center gap-[8px] text-[16px] font-medium leading-normal transition-colors hover:text-black outline-none",
                                                    selectedProvince ? "text-[#2D50A0]" : "text-slate-600"
                                                )}
                                                aria-label="Filter by province"
                                            >
                                                <span className="truncate max-w-[100px]">{selectedProvince || "Province"}</span>
                                                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isProvinceDropdownOpen && "rotate-180")} />
                                            </button>

                                            {isProvinceDropdownOpen && (
                                                <div className="absolute top-[calc(100%+8px)] right-0 w-48 bg-white border border-slate-200 shadow-lg ring-1 ring-black/5 rounded-xl z-[700] overflow-hidden transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2">
                                                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1.5 font-ui">
                                                        <button
                                                            onClick={() => { setSelectedProvince(null); setIsProvinceDropdownOpen(false); }}
                                                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-200 rounded-lg"
                                                        >
                                                            Canada
                                                        </button>
                                                        {CANADIAN_PROVINCES.map(p => (
                                                            <button
                                                                key={p}
                                                                onClick={() => { setSelectedProvince(p); setIsProvinceDropdownOpen(false); }}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                                                    selectedProvince === p ? "bg-slate-50 text-[#2D50A0]" : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                                                                )}
                                                            >
                                                                {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="w-[1px] h-6 bg-brand-navy/10 mx-1" />

                                        {/* Segment 3: Category Dropdown */}
                                        <div className="relative h-full flex items-center">
                                            <button
                                                onClick={() => {
                                                    const open = !isCategoryDropdownOpen;
                                                    closeAllDropdowns();
                                                    setIsCategoryDropdownOpen(open);
                                                }}
                                                className={cn(
                                                    "h-full px-[16px] flex items-center gap-[8px] text-[16px] font-medium leading-normal transition-colors hover:text-black outline-none",
                                                    category ? "text-[#2D50A0]" : "text-slate-600"
                                                )}
                                                aria-label="Filter by category"
                                            >
                                                <span className="truncate max-w-[100px]">{category ? allCategories.find(c => c.id === category)?.label : "Category"}</span>
                                                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isCategoryDropdownOpen && "rotate-180")} />
                                            </button>

                                            {isCategoryDropdownOpen && (
                                                <div className="absolute top-[calc(100%+8px)] right-0 w-48 bg-white border border-slate-200 shadow-lg ring-1 ring-black/5 rounded-xl z-[700] overflow-hidden transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2">
                                                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1.5 font-ui">
                                                        <button
                                                            onClick={() => { setCategory(null); setIsCategoryDropdownOpen(false); }}
                                                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-200 rounded-lg"
                                                        >
                                                            All Categories
                                                        </button>
                                                        {allCategories.map(cat => (
                                                            <button
                                                                key={cat.id}
                                                                onClick={() => { setCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                                                    category === cat.id ? "bg-slate-50 text-[#2D50A0]" : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                                                                )}
                                                            >
                                                                {cat.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="w-[1px] h-6 bg-brand-navy/10 mx-2" />

                                        {/* Segment 4: Map/List Toggle (Pill style inside) */}
                                        <div className="flex items-center h-[36px] bg-gray-100/80 backdrop-blur-sm border border-brand-navy/10 rounded-full p-1 ml-1 mr-1">
                                            <TooltipProvider delayDuration={200}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() => setViewMode("map")}
                                                            aria-pressed={viewMode === "map"}
                                                            aria-label="Switch to Map View"
                                                            className={cn(
                                                                "px-[16px] h-full rounded-full text-[13px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 outline-none focus-visible:ring-1 focus-visible:ring-blue-500/20",
                                                                viewMode === "map"
                                                                    ? "bg-white shadow-sm text-gray-900"
                                                                    : "text-gray-500 hover:text-gray-700 bg-transparent"
                                                            )}
                                                        >
                                                            Map
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg border-none shadow-xl hidden md:block">
                                                        Browse via Map
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <TooltipProvider delayDuration={200}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() => setViewMode("list")}
                                                            aria-pressed={viewMode === "list"}
                                                            aria-label="Switch to List View"
                                                            className={cn(
                                                                "px-[16px] h-full rounded-full text-[13px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 outline-none focus-visible:ring-1 focus-visible:ring-blue-500/20",
                                                                viewMode === "list"
                                                                    ? "bg-white shadow-sm text-gray-900"
                                                                    : "text-gray-500 hover:text-gray-700 bg-transparent"
                                                            )}
                                                        >
                                                            List
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg border-none shadow-xl hidden md:block">
                                                        Browse Directory list
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        {/* Segment 5: Add Store Button */}
                                        <div className="w-[1px] h-6 bg-slate-200 mx-1" />
                                        <button
                                            onClick={() => setAddStoreDialogOpen(true)}
                                            className={cn(
                                                "h-[42px] px-[16px] ml-[4px] flex items-center justify-center gap-2 font-medium text-[14px] transition-all duration-300",
                                                "bg-slate-900/85 backdrop-blur-md text-white rounded-full",
                                                "hover:bg-slate-900 active:scale-95 shadow-sm"
                                            )}
                                        >
                                            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                                            <span>{t('nav.addStore') || 'Pin Store'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Map Legend Pill - Bottom Center */}
                            {!isZenMode && viewMode === "map" && (
                                <div className="absolute bottom-8 left-[clamp(1.5rem,5vw,4rem)] pointer-events-auto transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 z-[700]">
                                    <div className="flex items-center gap-3 px-4 h-8 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-full shadow-sm">
                                        <div className="flex -space-x-1.5 items-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#0047FF] border border-white shadow-sm" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#F2D36B] border border-white shadow-sm" />
                                        </div>
                                        <span className="text-[12px] font-medium tracking-tight text-slate-600 whitespace-nowrap">
                                            Pins show local stores carrying Ukrainian-made products
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* 3. Action Island (Bottom-Right FAB for Mobile) */}
                            {!isZenMode && (
                                <div className="md:hidden absolute bottom-24 right-4 pointer-events-auto transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                                    <button
                                        onClick={() => setAddStoreDialogOpen(true)}
                                        className={cn(
                                            "w-14 h-14 p-0 rounded-full flex items-center justify-center transition-all duration-300",
                                            "bg-slate-900/85 backdrop-blur-md text-white",
                                            "shadow-2xl shadow-slate-900/20 border border-brand-navy/15",
                                            "hover:scale-105 active:scale-95"
                                        )}
                                    >
                                        <Plus className="w-6 h-6" strokeWidth={2} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Stage (Map or List) */}
                    <div className="w-full h-full relative z-0">
                        <MapSection
                            ref={mapSectionRef}
                            mode="full"
                            className="w-full h-full absolute top-0 left-0"
                            searchQuery={searchQuery}
                            category={category}
                            viewMode={viewMode}
                            selectedProvince={selectedProvince}
                            selectedCity={selectedCity}
                            sortMode={sortMode}
                            onFlightChange={setIsFlying}
                            onViewChange={setViewMode}
                            userLocation={userLocation}
                        />
                    </div>
                </div>
            </div>

            {/* Add Store Dialog */}
            <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                <DialogContent className="max-w-[600px] p-0 border-none bg-transparent shadow-none overflow-visible">
                    <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </div >
    );
}
