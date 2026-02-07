import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Plus, Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    ToyBrick, BookOpen, Bookmark, Sparkles, Navigation, ChevronDown,
    Eye, EyeOff
} from "lucide-react";
import { Link } from "wouter";
import { MapSection } from "@/components/map-section";
import { InteractiveMapRef } from "@/components/interactive-map";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
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
            "w-full bg-[#FAFAF9] border-t border-[rgba(0,0,0,0.03)] flex flex-col transition-[height] duration-300 ease-in-out font-sans",
            viewMode === "map" ? "h-auto" : "min-h-[400px]"
        )}>



            {/* 1. Stats Dashboard - HIDDEN IN ZEN MODE */}
            {!isZenMode && (
                <section className="w-full mx-auto lg:max-w-[95vw] min-[1537px]:max-w-[1440px] transition-[max-width] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] relative z-10 pt-[48px] pb-8 px-[clamp(1.5rem,5vw,4rem)]">
                    <div className="flex flex-col items-center justify-center gap-6">

                        {/* Top Row: Heading + Stats (Centered Together) */}
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            {/* Heading */}
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-premium-pulse" />
                                <p className="text-[13px] font-bold tracking-[0.08em] text-[#1A1A19] uppercase whitespace-nowrap m-0 font-ui">
                                    CURRENTLY ON THE MAP
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-[1px] h-6 bg-slate-300" />

                            {/* Stats */}
                            <div className="flex items-center gap-8 md:gap-12">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[22px] md:text-[25px] font-medium text-[#2D50A0] leading-none opacity-80">
                                        <AnimatedCounter end={stats.stores} />
                                    </span>
                                    <span className="text-[10px] md:text-[11px] font-medium text-slate-900 uppercase tracking-[0.15em]">Stores</span>
                                </div>
                                <div className="w-[1px] h-8 bg-slate-200" />
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[22px] md:text-[25px] font-medium text-[#2D50A0] leading-none opacity-80">
                                        <AnimatedCounter end={stats.provinces} />
                                    </span>
                                    <span className="text-[10px] md:text-[11px] font-medium text-slate-900 uppercase tracking-[0.15em]">Provinces</span>
                                </div>
                                <div className="w-[1px] h-8 bg-slate-200" />
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[22px] md:text-[25px] font-medium text-[#2D50A0] leading-none opacity-80">
                                        <AnimatedCounter end={stats.products} />
                                    </span>
                                    <span className="text-[10px] md:text-[11px] font-medium text-slate-900 uppercase tracking-[0.15em]">Products</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: Subline (Centered) */}
                        <div className="flex flex-col items-center">
                            <p className="text-base text-[#1A1A19] font-normal leading-relaxed text-center">
                                Find Ukrainian products near you, or help grow the map.
                            </p>
                        </div>

                    </div>
                </section>
            )}

            {/* 3. Main Content Area */}
            <div className={cn(
                "w-full mx-auto lg:max-w-[95vw] min-[1537px]:max-w-[1440px] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col md:flex-row md:items-start gap-8 px-[clamp(1.5rem,5vw,4rem)]",
                isZenMode ? "flex-1 pb-0 w-full max-w-none px-0" : "pt-0 pb-[10px]"
            )}>

                {/* Sidebar - Search & Filters (HIDDEN IN ZEN MODE) */}
                {!isZenMode && (
                    <aside ref={sidebarRef} className="w-full md:w-[280px] shrink-0 flex flex-col pt-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">

                        {/* Search Field - Aligned with Map Buttons */}
                        <div className="relative group border-b-[1.5px] border-[#E5E5E5] focus-within:border-[#2D50A0] transition-colors duration-300 mb-8 md:mt-[22px]">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 group-focus-within:text-[#2D50A0] transition-colors z-10" strokeWidth={1.5} />
                            <input
                                type="text"
                                placeholder="Search by city or store name..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    closeAllDropdowns();
                                }}
                                className="w-full h-12 pl-8 pr-4 bg-transparent border-none rounded-none focus:ring-0 text-[15px] font-normal leading-loose placeholder:text-slate-400 transition-all font-sans"
                                aria-label="Search stores"
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="text-[11px] font-medium text-[#424242] uppercase tracking-widest">Filter by:</div>

                            {/* Province Filter */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        const open = !isProvinceDropdownOpen;
                                        closeAllDropdowns();
                                        setIsProvinceDropdownOpen(open);
                                    }}
                                    className={cn(
                                        "flex items-center justify-between w-full h-[40px] px-0 bg-transparent text-[15px] font-medium transition-colors duration-200 border-b border-[#EAEAEA]",
                                        selectedProvince
                                            ? "text-[#2D50A0]"
                                            : "text-[#444444] hover:text-[#2D50A0]"
                                    )}
                                >
                                    <span className="truncate">{selectedProvince || "Location"}</span>
                                    <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-400", isProvinceDropdownOpen && "rotate-180 text-slate-900")} />
                                </button>
                                {isProvinceDropdownOpen && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-[24px] shadow-[0_4px_12px_rgba(45,80,160,0.05)] z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                        <div className="p-3 border-b border-slate-50">
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 rounded-full text-sm border-none focus:ring-1 focus:ring-black/5 placeholder:text-slate-400"
                                                placeholder="Search location..."
                                                autoFocus
                                                value={provinceSearchQuery}
                                                onChange={(e) => setProvinceSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="max-h-[280px] overflow-y-auto p-2">
                                            <button
                                                onClick={() => { setSelectedProvince(null); setIsProvinceDropdownOpen(false); }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:text-slate-900 transition-colors rounded-full"
                                            >
                                                Everywhere in Canada
                                            </button>
                                            {provincesFiltered.map(p => p !== "All Provinces" && (
                                                <button
                                                    key={p}
                                                    onClick={() => { setSelectedProvince(p); setIsProvinceDropdownOpen(false); }}
                                                    className={cn(
                                                        "w-full text-left px-4 py-2.5 text-sm rounded-full transition-colors",
                                                        selectedProvince === p ? "bg-slate-900 text-white font-semibold" : "text-slate-500 hover:text-slate-900"
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
                                        "flex items-center justify-between w-full h-[40px] px-0 bg-transparent text-[15px] font-medium transition-colors duration-200 border-b border-[#EAEAEA]",
                                        category
                                            ? "text-[#2D50A0]"
                                            : "text-[#444444] hover:text-[#2D50A0]"
                                    )}
                                >
                                    <span className="truncate">{category ? allCategories.find(c => c.id === category)?.label : "Category"}</span>
                                    <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-400", isCategoryDropdownOpen && "rotate-180 text-slate-900")} />
                                </button>
                                {isCategoryDropdownOpen && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-[24px] shadow-[0_4px_12px_rgba(45,80,160,0.05)] z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                        <div className="p-2 max-h-[320px] overflow-y-auto">
                                            <button
                                                onClick={() => { setCategory(null); setIsCategoryDropdownOpen(false); }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:text-slate-900 transition-colors rounded-full"
                                            >
                                                All Categories
                                            </button>
                                            {allCategories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => { setCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-full transition-colors",
                                                        category === cat.id ? "bg-slate-900 text-white font-semibold" : "text-slate-400 hover:text-slate-900 group"
                                                    )}
                                                >
                                                    <cat.icon className={cn("w-4 h-4 transition-colors", category === cat.id ? "text-white" : "text-slate-400 group-hover:text-slate-900")} strokeWidth={1.5} />
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                )}

                {/* Map/List Column */}
                <div className={cn(
                    "flex-1 min-w-0 flex flex-col relative transition-all duration-500 map-column-wrapper",
                    isZenMode ? "h-[100vh] w-[100vw]" : "pt-0 gap-4"
                )}>
                    <div className={cn(
                        "relative w-full overflow-hidden bg-white group/map isolate transition-all duration-500",
                        isZenMode ? "h-full rounded-0" : "h-[550px] rounded-[32px]",
                        viewMode === "map" ? "shadow-[0_20px_40px_rgba(45,80,160,0.05)] border border-[rgba(45,80,160,0.15)]" : ""
                    )}>
                        {/* View Switcher - Top Left of Map Frame (HIDDEN IN ZEN MODE) */}
                        {!isZenMode && (
                            <div className="absolute top-6 left-6 z-[500] inline-flex items-center p-1 bg-white backdrop-blur-[12px] rounded-full border border-[rgba(255,255,255,0.4)] shadow-[0_4px_12px_rgba(45,80,160,0.05)]">
                                <button
                                    onClick={() => setViewMode("map")}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 h-[38px] rounded-full text-[16px] transition-all duration-200",
                                        viewMode === "map" ? "text-slate-900 font-normal opacity-100" : "text-slate-500 font-normal opacity-80 hover:opacity-100"
                                    )}
                                >
                                    <MapIcon className="w-3.5 h-3.5" />
                                    Map
                                </button>
                                <span className="text-slate-300 mx-1">/</span>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 h-[38px] rounded-full text-[16px] transition-all duration-200",
                                        viewMode === "list" ? "text-slate-900 font-normal opacity-100" : "text-slate-500 font-normal opacity-80 hover:opacity-100"
                                    )}
                                >
                                    <List className="w-3.5 h-3.5" />
                                    List
                                </button>
                            </div>

                        )}

                        {/* Add Store Button - Top Right of Map Frame (HIDDEN IN ZEN MODE) */}
                        {!isZenMode && (
                            <div className="absolute top-6 right-6 z-[500]">
                                <button
                                    onClick={() => setAddStoreDialogOpen(true)}
                                    className="flex items-center gap-2 px-6 h-[46px] rounded-full bg-slate-900 text-white font-medium text-[14px] hover:bg-slate-800 border-none shadow-xl shadow-slate-900/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                                    <span>Add a Store</span>
                                </button>
                            </div>
                        )}

                        {/* ZEN MODE TOGGLE - Floating on the right edge */}
                        <div className={cn(
                            "absolute z-[500] transition-all duration-300",
                            isZenMode ? "top-6 right-6" : "top-1/2 -translate-y-1/2 right-4"
                        )}>
                            <button
                                onClick={onZenModeToggle}
                                className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md border transition-all duration-300 shadow-sm group/zen",
                                    isZenMode
                                        ? "bg-slate-900 text-white border-slate-800 hover:bg-slate-800"
                                        : "bg-white/60 text-slate-500 border-white/40 hover:bg-white hover:text-slate-900"
                                )}
                                title={isZenMode ? "Show Map UI" : "Hide Map UI"}
                            >
                                {isZenMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="w-full h-full relative z-0">
                            {/* Optical Glass Overlay - Removed in favor of InteractiveMap internal overlay for correct z-indexing */}
                            {/* <div className="absolute inset-0 pointer-events-none z-[100]" style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0) 60%, rgba(240,242,245,0.3) 100%)' }} /> */}

                            <MapSection
                                ref={mapSectionRef}
                                mode="full"
                                className="w-full !h-[110%] absolute top-0 left-0"
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

            {/* Community Trust Bar - Integrated under map (HIDDEN IN ZEN MODE) */}
            {
                !isZenMode && (
                    <div className="flex justify-center md:pl-[280px] mt-1.5 pb-[72px]">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-medium text-[#555555] font-sans uppercase tracking-[0.05em]">Community-driven</span>
                            <span className="text-[11px] text-slate-300">•</span>
                            <span className="text-[11px] font-medium text-[#555555] font-sans uppercase tracking-[0.05em]">Verified</span>
                            <span className="text-[11px] text-slate-300">•</span>
                            <Link href="/about" className="text-[11px] font-medium text-slate-700/60 hover:text-slate-700 font-sans uppercase tracking-[0.05em] cursor-pointer transition-colors hover:underline decoration-slate-300 underline-offset-4 flex items-center">
                                Become a volunteer
                            </Link>
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
