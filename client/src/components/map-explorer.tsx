import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Plus, Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    ToyBrick, BookOpen, Bookmark, Sparkles, Navigation, ChevronDown,
    Eye, EyeOff, CheckCircle
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
import { motion } from "framer-motion";
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





            {/* Subline - Restored */}
            {!isZenMode && (
                <section className="w-full relative z-10 pt-[48px] pb-4">
                    <div className="boutique-width mx-auto flex flex-col items-center gap-8">

                        {/* Stats Heading - Restored */}
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 relative z-20">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-premium-pulse" />
                                <span className="text-[28px] md:text-[32px] font-semibold text-slate-600 opacity-70 tracking-tight tabular-nums">
                                    <AnimatedCounter end={stats.stores} />
                                </span>
                                <span className="text-[13px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">Stores</span>
                            </div>
                            <div className="h-8 w-[1px] bg-slate-200 rotate-12 mx-2" />
                            <div className="flex items-center gap-2">
                                <span className="text-[28px] md:text-[32px] font-semibold text-slate-600 opacity-70 tracking-tight tabular-nums">
                                    <AnimatedCounter end={stats.provinces} />
                                </span>
                                <span className="text-[13px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">Provinces</span>
                            </div>
                            <div className="h-8 w-[1px] bg-slate-200 rotate-12 mx-2" />
                            <div className="flex items-center gap-2">
                                <span className="text-[28px] md:text-[32px] font-semibold text-slate-600 opacity-70 tracking-tight tabular-nums">
                                    <AnimatedCounter end={stats.products} />
                                </span>
                                <span className="text-[13px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">Products</span>
                            </div>
                        </div>

                        {/* Unified Control Row: Text (Left) | Search (Center) | Filters (Right) */}
                        <div className="w-full relative h-[40px] mt-2">
                            {/* Left: Helper Text (Baseline Aligned) */}
                            <div className="absolute left-0 bottom-0 pb-2 pointer-events-none z-10 hidden xl:block">
                                <p className="text-[15px] text-[#1A1A19] font-medium leading-relaxed whitespace-nowrap">
                                    Find Ukrainian products near you, or help grow the map.
                                </p>
                            </div>

                            {/* Center: Search Field */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[240px] flex items-center gap-3 border-b border-slate-300 focus-within:border-[#2D50A0] transition-colors pb-2 group z-20">
                                <Search className="w-4 h-4 text-slate-400 shrink-0 group-focus-within:text-[#2D50A0] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by city..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        closeAllDropdowns();
                                    }}
                                    className="w-full bg-transparent border-none outline-none text-[15px] font-sans text-slate-900 placeholder:text-slate-400/80 p-0"
                                />
                            </div>

                            {/* Right: Filters (Baseline Aligned) */}
                            <div className="absolute right-0 bottom-0 flex items-center gap-6 pb-2 z-30">
                                {/* Location Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            const open = !isProvinceDropdownOpen;
                                            closeAllDropdowns();
                                            setIsProvinceDropdownOpen(open);
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 bg-transparent text-[13px] font-medium transition-colors duration-200 hover:text-slate-900",
                                            selectedProvince ? "text-[#2D50A0]" : "text-slate-600"
                                        )}
                                    >
                                        <span className="truncate max-w-[120px]">{selectedProvince || "All Provinces"}</span>
                                        <ChevronDown className={cn("w-3 h-3 transition-transform text-slate-400", isProvinceDropdownOpen && "rotate-180 text-slate-900")} strokeWidth={2} />
                                    </button>
                                    {isProvinceDropdownOpen && (
                                        <div className="absolute top-[calc(100%+8px)] right-0 w-[240px] bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                            <div className="p-2 border-b border-slate-50">
                                                <input
                                                    className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs border-none focus:ring-1 focus:ring-black/5 placeholder:text-slate-400"
                                                    placeholder="Filter provinces..."
                                                    autoFocus
                                                    value={provinceSearchQuery}
                                                    onChange={(e) => setProvinceSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto p-1">
                                                <button
                                                    onClick={() => { setSelectedProvince(null); setIsProvinceDropdownOpen(false); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors rounded-md font-medium"
                                                >
                                                    Everywhere
                                                </button>
                                                {provincesFiltered.map(p => p !== "All Provinces" && (
                                                    <button
                                                        key={p}
                                                        onClick={() => { setSelectedProvince(p); setIsProvinceDropdownOpen(false); }}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2 text-xs rounded-md transition-colors font-medium",
                                                            selectedProvince === p ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Category Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            const open = !isCategoryDropdownOpen;
                                            closeAllDropdowns();
                                            setIsCategoryDropdownOpen(open);
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 bg-transparent text-[13px] font-medium transition-colors duration-200 hover:text-slate-900",
                                            category ? "text-[#2D50A0]" : "text-slate-600"
                                        )}
                                    >
                                        <span className="truncate max-w-[120px]">{category ? allCategories.find(c => c.id === category)?.label : "All Products"}</span>
                                        <ChevronDown className={cn("w-3 h-3 transition-transform text-slate-400", isCategoryDropdownOpen && "rotate-180 text-slate-900")} strokeWidth={2} />
                                    </button>
                                    {isCategoryDropdownOpen && (
                                        <div className="absolute top-[calc(100%+8px)] right-0 w-[200px] bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                            <div className="p-1 max-h-[240px] overflow-y-auto">
                                                <button
                                                    onClick={() => { setCategory(null); setIsCategoryDropdownOpen(false); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors rounded-md font-medium"
                                                >
                                                    All Categories
                                                </button>
                                                {allCategories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => { setCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                                        className={cn(
                                                            "w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors font-medium",
                                                            category === cat.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Main Content Area - Wide Format */}
            <div className={cn(
                "boutique-width mx-auto transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col gap-0", // Gap 0 for seamless border alignment
                isZenMode ? "flex-1 pb-0 w-full max-w-none px-0" : "pt-0 pb-[10px]"
            )}>



                {/* Map/List Column - Full Width Main Stage */}
                <div className={cn(
                    "flex-1 min-w-0 flex flex-col relative transition-all duration-500 map-column-wrapper w-full",
                    isZenMode ? "h-[100vh] w-[100vw]" : "pt-0"
                )}>
                    <div className={cn(
                        "relative w-full overflow-hidden bg-white group/map isolate transition-all duration-500",
                        isZenMode ? "h-full rounded-0" : "h-[500px] rounded-[32px] border border-gray-200 shadow-sm", // Reduced height to crop empty space
                    )}>
                        {/* Add Store Button - Floating Layout (Left) */}
                        <div className={cn(
                            "absolute z-[500] transition-all duration-300 flex flex-col items-start gap-2",
                            isZenMode ? "top-6 left-6" : "top-6 left-6"
                        )}>
                            <span className="text-[11px] font-semibold text-slate-500 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-slate-100 pointer-events-none transition-opacity duration-300">
                                Know a store selling made in Ukraine? Add it
                            </span>
                            <button
                                onClick={() => setAddStoreDialogOpen(true)}
                                className="h-[44px] px-6 rounded-full bg-slate-900/80 text-white text-[14px] font-semibold hover:bg-slate-800/90 transition-all shadow-md hover:shadow-lg flex items-center gap-2 backdrop-blur-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add a Store</span>
                            </button>
                        </div>
                        {/* Map/List View Toggle - Premium Floating Control */}
                        <div className={cn(
                            "absolute z-[500] transition-all duration-300",
                            isZenMode ? "top-6 right-6" : "top-6 right-6"
                        )}>
                            <div className="flex items-center gap-3">
                                {/* Map/List Segmented Toggle */}
                                <div className="flex items-center p-1 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow">
                                    <button
                                        onClick={() => setViewMode("map")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-300 flex items-center gap-2",
                                            viewMode === "map"
                                                ? "bg-slate-100 text-slate-900 shadow-sm"
                                                : "text-slate-400 hover:text-slate-900 bg-transparent"
                                        )}
                                    >
                                        <MapIcon className="w-3.5 h-3.5" />
                                        Map
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-300 flex items-center gap-2",
                                            viewMode === "list"
                                                ? "bg-slate-100 text-slate-900 shadow-sm"
                                                : "text-slate-400 hover:text-slate-900 bg-transparent"
                                        )}
                                    >
                                        <List className="w-3.5 h-3.5" />
                                        List
                                    </button>
                                </div>

                                {/* Premium Locate Me Button */}
                                <button
                                    onClick={handleUseLocation}
                                    className="w-[42px] h-[42px] flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm hover:shadow-md text-slate-600 hover:text-[#2D50A0] hover:bg-white transition-all group active:scale-95"
                                    title="Locate Me"
                                >
                                    <Navigation className="w-5 h-5 fill-none stroke-[2px] -ml-[1px] group-hover:fill-current/20 transition-all" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="w-full h-full relative z-0">
                            <MapSection
                                ref={mapSectionRef}
                                mode="full"
                                className="w-full h-full absolute top-0 left-0" // Removed !h-[110%]
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
            </div>

            {/* Community Trust Bar - Integrated under map (HIDDEN IN ZEN MODE) - ALIGNMENT FIXED */}
            {
                !isZenMode && (
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 pb-[72px] w-full px-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-[#2D50A0]" strokeWidth={1.5} />
                            <span className="text-[11px] uppercase tracking-widest font-semibold text-zinc-400 font-sans">
                                Community-driven map
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-[#2D50A0]" strokeWidth={1.5} />
                            <span className="text-[11px] uppercase tracking-widest font-semibold text-zinc-400 font-sans">
                                Made in Ukraine only
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-[#2D50A0]" strokeWidth={1.5} />
                            <span className="text-[11px] uppercase tracking-widest font-semibold text-zinc-400 font-sans">
                                Every Store is Verified
                            </span>
                        </div>
                    </div>
                )
            }

            {/* Add Store Dialog */}
            <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                <DialogContent className="max-w-[600px] p-0 border-none bg-transparent shadow-none overflow-visible">
                    <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </div >
    );
}
