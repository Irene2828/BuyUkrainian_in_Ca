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
                                {!isZenMode && (
                                    <div className="hidden md:block pointer-events-auto transition-all duration-500 animate-in fade-in slide-in-from-left-4">
                                        <button
                                            onClick={() => setAddStoreDialogOpen(true)}
                                            className="btn-premium-action gap-2 no-invert-hover shadow-xl shadow-slate-900/10"
                                        >
                                            <Plus className="w-5 h-5" strokeWidth={2.5} />
                                            <span>Add a Store</span>
                                        </button>
                                    </div>
                                )}

                                {/* 2. Mission Control Card (Top-Right - now aligned with Language Switcher) */}
                                {!isZenMode && (
                                    <div className="pointer-events-auto w-full max-w-sm bg-white/90 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-4 flex flex-col transition-all duration-500 animate-in fade-in slide-in-from-right-4">
                                        {/* Top: Search Input */}
                                        <div className="relative w-full group">
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" strokeWidth={1.5} />
                                            <input
                                                type="text"
                                                placeholder="Search by city, stores etc..."
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    closeAllDropdowns();
                                                }}
                                                className={cn(
                                                    "w-full h-[40px] pl-10 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl text-[13px] font-medium text-slate-900",
                                                    "transition-all duration-300 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2D50A0]/10"
                                                )}
                                            />
                                        </div>

                                        {/* Middle: Horizontal Filters */}
                                        <div className="flex items-center gap-2 mt-3">
                                            {/* Location Filter Pill */}
                                            <div className="relative flex-1">
                                                <button
                                                    onClick={() => {
                                                        const open = !isProvinceDropdownOpen;
                                                        closeAllDropdowns();
                                                        setIsProvinceDropdownOpen(open);
                                                    }}
                                                    className={cn(
                                                        "w-full h-[36px] px-3 rounded-xl border text-[12px] font-semibold flex items-center justify-between transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none",
                                                        selectedProvince
                                                            ? "bg-blue-50 border-blue-200 text-[#2D50A0]"
                                                            : "bg-white border-zinc-200 text-slate-600 hover:border-zinc-300"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                        <MapPin className={cn("w-3 h-3 flex-shrink-0", selectedProvince ? "text-[#2D50A0]" : "text-slate-400")} strokeWidth={2} />
                                                        <span className="truncate">{selectedProvince || "Province"}</span>
                                                    </div>
                                                    <ChevronDown className={cn("w-3 h-3 transition-transform text-slate-400 flex-shrink-0", isProvinceDropdownOpen && "rotate-180")} />
                                                </button>

                                                {isProvinceDropdownOpen && (
                                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-zinc-100 rounded-xl shadow-2xl z-[700] overflow-hidden animate-in fade-in zoom-in-95">
                                                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1.5">
                                                            <button
                                                                onClick={() => { setSelectedProvince(null); setIsProvinceDropdownOpen(false); }}
                                                                className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-50 rounded-lg"
                                                            >
                                                                Canada
                                                            </button>
                                                            {CANADIAN_PROVINCES.map(p => (
                                                                <button
                                                                    key={p}
                                                                    onClick={() => { setSelectedProvince(p); setIsProvinceDropdownOpen(false); }}
                                                                    className={cn(
                                                                        "w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors",
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
                                            <div className="relative flex-1">
                                                <button
                                                    onClick={() => {
                                                        const open = !isCategoryDropdownOpen;
                                                        closeAllDropdowns();
                                                        setIsCategoryDropdownOpen(open);
                                                    }}
                                                    className={cn(
                                                        "w-full h-[36px] px-3 rounded-xl border text-[12px] font-semibold flex items-center justify-between transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none",
                                                        category
                                                            ? "bg-blue-50 border-blue-200 text-[#2D50A0]"
                                                            : "bg-white border-zinc-200 text-slate-600 hover:border-zinc-300"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                        <ShoppingBag className={cn("w-3 h-3 flex-shrink-0", category ? "text-[#2D50A0]" : "text-slate-400")} strokeWidth={2} />
                                                        <span className="truncate">{category ? allCategories.find(c => c.id === category)?.label : "Category"}</span>
                                                    </div>
                                                    <ChevronDown className={cn("w-3 h-3 transition-transform text-slate-400 flex-shrink-0", isCategoryDropdownOpen && "rotate-180")} />
                                                </button>

                                                {isCategoryDropdownOpen && (
                                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-zinc-100 rounded-xl shadow-2xl z-[700] overflow-hidden animate-in fade-in zoom-in-95">
                                                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1.5">
                                                            <button
                                                                onClick={() => { setCategory(null); setIsCategoryDropdownOpen(false); }}
                                                                className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-50 rounded-lg"
                                                            >
                                                                All Categories
                                                            </button>
                                                            {allCategories.map(cat => (
                                                                <button
                                                                    key={cat.id}
                                                                    onClick={() => { setCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                                                    className={cn(
                                                                        "w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors",
                                                                        category === cat.id ? "bg-[#2D50A0] text-white" : "text-zinc-600 hover:bg-zinc-50"
                                                                    )}
                                                                >
                                                                    {cat.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-slate-200/60 my-3" />

                                        {/* Bottom: Segmented Control Toggle */}
                                        <div className="bg-slate-100 rounded-lg p-1 flex w-full">
                                            <button
                                                onClick={() => setViewMode("map")}
                                                aria-pressed={viewMode === "map"}
                                                className={cn(
                                                    "flex-1 text-center py-1.5 rounded-md text-[13px] font-medium transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                                                    viewMode === "map" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                                                )}
                                            >
                                                <MapIcon className="w-3.5 h-3.5" />
                                                Map
                                            </button>
                                            <button
                                                onClick={() => setViewMode("list")}
                                                aria-pressed={viewMode === "list"}
                                                className={cn(
                                                    "flex-1 text-center py-1.5 rounded-md text-[13px] font-medium transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                                                    viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                                                )}
                                            >
                                                <List className="w-3.5 h-3.5" />
                                                List
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. Action Island (Bottom-Right FAB for Mobile) */}
                            {!isZenMode && (
                                <div className="md:hidden absolute bottom-24 right-4 pointer-events-auto transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                                    <button
                                        onClick={() => setAddStoreDialogOpen(true)}
                                        className="btn-premium-action gap-2 shadow-2xl shadow-slate-900/20 w-14 h-14 p-0 rounded-full"
                                    >
                                        <Plus className="w-6 h-6" strokeWidth={2.5} />
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
        </div>
    );
}
