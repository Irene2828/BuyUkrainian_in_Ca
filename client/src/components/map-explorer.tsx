import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    ToyBrick, BookOpen, Bookmark,
    Eye, EyeOff, CheckCircle,
    Plus, Minus, Home, Maximize2, X, MapPin, Copy, Mail, Facebook, Twitter, Instagram, Sparkles, ChevronDown, ChevronRight, Navigation, ExternalLink
} from "lucide-react";
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







            {/* 2. Map Workspace - Professional Off-White Container */}
            <div className={cn(
                "w-full transition-all duration-500 relative",
                isZenMode ? "px-0" : "bg-[#F9F9F8]/60 pt-6 md:pt-10 pb-6 md:pb-10"
            )}>
                <div className={cn(
                    "boutique-width mx-auto relative",
                    isZenMode && "max-w-none"
                )}>
                    {!isZenMode && (
                        <div className="w-full flex flex-col items-center mb-10">
                            {/* Premium Stats Line */}
                            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 mb-4 w-full max-w-[55rem]">
                                {/* Status Indicator */}
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]" />
                                    <span className="text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">CURRENTLY ON THE MAP</span>
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block w-[1px] h-8 bg-zinc-200" />

                                {/* Store Count */}
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-semibold text-[#2D50A0]/80 leading-none mb-1">
                                        <AnimatedCounter end={stats.stores} />
                                    </span>
                                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">STORES</span>
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block w-[1px] h-8 bg-zinc-200" />

                                {/* Province Count */}
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-semibold text-[#2D50A0]/80 leading-none mb-1">
                                        <AnimatedCounter end={stats.provinces} />
                                    </span>
                                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">PROVINCES</span>
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block w-[1px] h-8 bg-zinc-200" />

                                {/* Product Count */}
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-semibold text-[#2D50A0]/80 leading-none mb-1">
                                        <AnimatedCounter end={stats.products} />
                                    </span>
                                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">PRODUCTS</span>
                                </div>
                            </div>

                            {/* Subheader Message */}
                            <div className="text-[16px] text-slate-600 font-medium tracking-normal text-center max-w-[45rem]">
                                <p>Find Ukrainian products near you, or help grow the map.</p>
                            </div>
                        </div>
                    )}

                    {!isZenMode && (
                        <div className="w-full flex items-center justify-between mb-3 px-2 gap-6">
                            <div className="flex items-center gap-3">
                                {/* Location Filter Pill */}
                                <div className="relative">
                                    <button
                                        aria-label="Filter by Location"
                                        onClick={() => {
                                            const open = !isProvinceDropdownOpen;
                                            closeAllDropdowns();
                                            setIsProvinceDropdownOpen(open);
                                        }}
                                        className={cn(
                                            "h-[34px] px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-2 transition-all duration-200 backdrop-blur-md active:scale-95",
                                            selectedProvince
                                                ? "bg-blue-50/50 border-blue-200 text-slate-900"
                                                : "bg-white/70 border-zinc-200/80 text-slate-600 hover:bg-slate-50 hover:border-zinc-300"
                                        )}
                                    >
                                        <MapPin
                                            className={cn("w-4 h-4 transition-colors duration-200", isProvinceDropdownOpen ? "text-blue-600" : "text-slate-400")}
                                            strokeWidth={1.2}
                                            aria-hidden="true"
                                        />
                                        <span className="truncate max-w-[120px] tracking-tight">{selectedProvince || "Location"}</span>
                                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 text-slate-400", isProvinceDropdownOpen && "rotate-180")} strokeWidth={2} />
                                    </button>
                                    {isProvinceDropdownOpen && (
                                        <div className="absolute top-[calc(100%+8px)] left-0 w-[240px] bg-white border border-zinc-200 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                            <div className="p-2 border-b border-zinc-100">
                                                <input
                                                    className="w-full px-4 py-2 bg-zinc-50 rounded-full text-xs border-none focus:ring-0 placeholder:text-zinc-400"
                                                    placeholder="Search province..."
                                                    autoFocus
                                                    value={provinceSearchQuery}
                                                    onChange={(e) => setProvinceSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto p-1.5 custom-scrollbar">
                                                <button
                                                    onClick={() => { setSelectedProvince(null); setIsProvinceDropdownOpen(false); }}
                                                    className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-colors rounded-lg"
                                                >
                                                    Everywhere
                                                </button>
                                                {provincesFiltered.map(p => p !== "All Provinces" && (
                                                    <button
                                                        key={p}
                                                        onClick={() => { setSelectedProvince(p); setIsProvinceDropdownOpen(false); }}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors",
                                                            selectedProvince === p ? "bg-[#2D50A0] text-white" : "text-zinc-600 hover:bg-zinc-50"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Category Filter Pill */}
                                <div className="relative">
                                    <button
                                        aria-label="Filter by Category"
                                        onClick={() => {
                                            const open = !isCategoryDropdownOpen;
                                            closeAllDropdowns();
                                            setIsCategoryDropdownOpen(open);
                                        }}
                                        className={cn(
                                            "h-[34px] px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-2 transition-all duration-200 backdrop-blur-md active:scale-95",
                                            category
                                                ? "bg-blue-50/50 border-blue-200 text-slate-900"
                                                : "bg-white/70 border-zinc-200/80 text-slate-600 hover:bg-slate-50 hover:border-zinc-300"
                                        )}
                                    >
                                        <ShoppingBag
                                            className={cn("w-4 h-4 transition-colors duration-200", isCategoryDropdownOpen ? "text-blue-600" : "text-slate-400")}
                                            strokeWidth={1.2}
                                            aria-hidden="true"
                                        />
                                        <span className="truncate max-w-[120px] tracking-tight">{category ? allCategories.find(c => c.id === category)?.label : "Category"}</span>
                                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 text-slate-400", isCategoryDropdownOpen && "rotate-180")} strokeWidth={2} />
                                    </button>
                                    {isCategoryDropdownOpen && (
                                        <div className="absolute top-[calc(100%+8px)] left-0 w-[200px] bg-white border border-zinc-200 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                            <div className="p-1.5 max-h-[240px] overflow-y-auto custom-scrollbar">
                                                <button
                                                    onClick={() => { setCategory(null); setIsCategoryDropdownOpen(false); }}
                                                    className="w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-colors rounded-lg"
                                                >
                                                    All Categories
                                                </button>
                                                {allCategories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => { setCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                                        className={cn(
                                                            "w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors",
                                                            category === cat.id ? "bg-[#2D50A0] text-white" : "text-zinc-600 hover:bg-zinc-50"
                                                        )}
                                                    >
                                                        <span>{cat.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Control Deck: Search - NOW ON RIGHT */}
                            <div className="relative w-[380px] group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" strokeWidth={1.2} />
                                <input
                                    type="text"
                                    placeholder="Try searching by city, product name etc..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        closeAllDropdowns();
                                    }}
                                    className={cn(
                                        "w-full h-[46px] pl-11 pr-4 bg-transparent border-b border-zinc-200 rounded-none text-[14px] font-medium text-slate-900",
                                        "transition-all duration-300 placeholder:text-slate-400",
                                        "focus:outline-none focus:border-[#2D50A0] focus:bg-white/10"
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {/* Map/List Column - Full Width Main Stage */}
                    <div className={cn(
                        "flex-1 min-w-0 flex flex-col relative transition-all duration-500 map-column-wrapper w-full",
                        isZenMode ? "h-[100vh] w-[100vw]" : "pt-0"
                    )}>
                        <div className={cn(
                            "relative w-full overflow-hidden bg-white group/map isolate transition-all duration-500",
                            isZenMode ? "h-full rounded-0" : "h-[525px] rounded-3xl milled-edge shadow-levitation",
                        )}>


                            {/* Map Workspace Overlays (Top Bar) */}
                            <div className="absolute top-6 left-6 right-6 z-[500] flex justify-between items-center pointer-events-none transition-all duration-300">
                                {/* Map/List View Toggle (Left) */}
                                {/* Apple-style Segmented Control */}
                                <div className="relative flex items-center p-1 bg-white/40 backdrop-blur-xl border border-white/20 rounded-full shadow-sm pointer-events-auto overflow-hidden min-w-[180px]">
                                    {/* Sliding Pill Background */}
                                    <div
                                        className={cn(
                                            "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                                            viewMode === "map" ? "translate-x-0" : "translate-x-[calc(100%+0px)]"
                                        )}
                                    />

                                    <button
                                        onClick={() => setViewMode("map")}
                                        className={cn(
                                            "relative z-10 flex-1 py-1.5 rounded-full text-[13px] font-semibold transition-colors duration-300 flex items-center justify-center gap-2",
                                            viewMode === "map" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        <MapIcon className="w-3.5 h-3.5" />
                                        Map
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={cn(
                                            "relative z-10 flex-1 py-1.5 rounded-full text-[13px] font-semibold transition-colors duration-300 flex items-center justify-center gap-2",
                                            viewMode === "list" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        <List className="w-3.5 h-3.5" />
                                        List
                                    </button>
                                </div>
                                {/* Add a Store CTA Overlay (Right) */}
                                <div className="pointer-events-auto">
                                    <button
                                        onClick={() => setAddStoreDialogOpen(true)}
                                        className="h-[42px] px-6 bg-slate-900/90 text-white rounded-full font-bold text-[13px] tracking-wide hover:bg-black transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" strokeWidth={3} />
                                        <span>ADD A STORE</span>
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
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

                    {/* Verification Microcopy - Centered within map section */}
                    {!isZenMode && (
                        <div className="flex flex-col items-center justify-center max-w-[600px] mx-auto text-center mt-6 mb-12">
                            <p className="text-[13px] leading-relaxed text-[#2D50A0]/60 font-medium">
                                All stores are verified by the community volunteers to keep the information trustworthy.
                                <br className="hidden sm:block" />
                                Add new pins anytime
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Store Dialog */}
            <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                <DialogContent className="max-w-[600px] p-0 border-none bg-transparent shadow-none overflow-visible">
                    <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
