import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Plus, Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    Clock, ArrowUpDown, ChevronDown, Check, Navigation, RefreshCw,
    ToyBrick, BookOpen, Bookmark, Sparkles, MapPin, ChevronLeft, X
} from "lucide-react";
import { Link } from "wouter";
import { MapSection } from "@/components/map-section";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const PROVINCE_MAP: Record<string, string> = {
    "AB": "Alberta", "BC": "British Columbia", "MB": "Manitoba", "NB": "New Brunswick",
    "NL": "Newfoundland and Labrador", "NS": "Nova Scotia", "ON": "Ontario",
    "PE": "Prince Edward Island", "QC": "Quebec", "SK": "Saskatchewan",
    "NT": "Northwest Territories", "NU": "Nunavut", "YT": "Yukon"
};

const CANADIAN_PROVINCES = Object.values(PROVINCE_MAP).sort();

// Province center coordinates for Smart Sidebar Sync
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

import { useI18n } from "@/lib/i18n";

export function MapExplorer() {
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
    const [isOpenOnly, setIsOpenOnly] = useState(false);
    const [sortMode, setSortMode] = useState<"newest" | "name">("newest");
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [provinceSearchQuery, setProvinceSearchQuery] = useState("");
    const [citySearch, setCitySearch] = useState("");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    const sidebarRef = useRef<HTMLElement>(null);

    const closeAllDropdowns = () => {
        setIsProvinceDropdownOpen(false);
        setIsCityDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
        setIsSortDropdownOpen(false);
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

    const { data: stores = [], isLoading } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: Infinity,
    });

    useEffect(() => {
        const handleClearFilters = () => {
            setSearchQuery("");
            setCategory(null);
            setSelectedProvince(null);
            setSelectedCity(null);
            setIsOpenOnly(false);
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

    const filteredStores = stores.filter(store => {
        const matchesSearch = !searchQuery || store.name.toLowerCase().includes(searchQuery.toLowerCase()) || store.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = !category || store.category === category;
        const storeProvinceFull = PROVINCE_MAP[store.province] || store.province;
        const matchesProvince = !selectedProvince || selectedProvince === "All Canada" || storeProvinceFull === selectedProvince;
        const matchesCity = !selectedCity || store.city === selectedCity;
        return matchesSearch && matchesCategory && matchesProvince && matchesCity;
    });

    const filteredStoresCount = filteredStores.length;
    const provincesCount = new Set(filteredStores.map(s => s.province)).size;
    const productsCount = filteredStores.reduce((acc, s) => acc + (s.products?.length || 0), 0);

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

    const CATEGORIES = allCategories;

    return (
        <div className={cn(
            "w-full bg-white flex flex-col transition-[height] duration-300 ease-in-out",
            viewMode === "map" ? "h-auto" : "min-h-[400px]"
        )}>

            {/* Dashboard Header - Centered Mission Hierarchy */}
            {/* Dashboard Header - Centered Mission Hierarchy */}
            {/* Dashboard Header - Centered Mission Hierarchy */}
            <header className="pt-3 pb-3 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards text-center">
                <div className="flex flex-col items-center w-full max-w-[500px] px-6 mb-2 mx-auto">
                    <h2 className="text-[32px] md:text-[36px] font-normal tracking-[-0.01em] text-slate-900/90 leading-[1.2] font-sans">
                        Find new places to <span className="font-medium border-b-[1px] border-[#FFE800]/80 pb-1">shop</span> or <span className="font-medium border-b-[1px] border-[#0057B8]/20 pb-1">grow the map</span> by adding new ones.
                    </h2>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="w-full max-w-7xl mx-auto px-6 lg:px-16 flex flex-col md:flex-row gap-8 pb-20">

                {/* Sidebar - Strictly aligned with map top */}
                <aside ref={sidebarRef} className="w-full md:w-[250px] shrink-0 pt-3 flex flex-col gap-6">

                    {/* Search Field - Moved to Sidebar Top */}
                    <div className="relative group w-full flex items-center">
                        <Input
                            placeholder={t('map.search.placeholder') || 'Search...'}
                            className="no-ring-force w-full h-[48px] pl-0 pr-20 bg-transparent border-b border-t-0 border-l-0 border-r-0 border-slate-200 rounded-none text-[15px] font-sans tracking-tight transition-all duration-200 placeholder:text-slate-900/50 focus-visible:border-black focus-visible:ring-0 focus-visible:shadow-none hover:border-slate-300 shadow-none px-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                        <Search className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 stroke-[1.5px] opacity-100 pointer-events-none" />
                        <button
                            onClick={handleUseLocation}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-black transition-all"
                            title="Use my location"
                        >
                            <Navigation className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h3 className="text-[12px] font-semibold text-slate-400 font-sans uppercase tracking-[0.03em] hidden md:block pl-0">
                            FILTER BY:
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
                            {/* Province Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        const open = !isProvinceDropdownOpen;
                                        closeAllDropdowns();
                                        setIsProvinceDropdownOpen(open);
                                    }}
                                    className={cn(
                                        "flex items-center justify-between w-full h-[48px] px-4 rounded-xl text-[16px] font-medium border transition-all duration-300 shadow-sm hover:shadow-md hover:border-black/[0.12]",
                                        selectedProvince ? "bg-[#A5D8FF]/20 border-[#A5D8FF] text-black" : "bg-white border-black/[0.08] text-slate-500"
                                    )}
                                >
                                    <span className="truncate">{selectedProvince || "Location"}</span>
                                    <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-600", isProvinceDropdownOpen && "rotate-180")} strokeWidth={1} />
                                </button>
                                {isProvinceDropdownOpen && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#E2E8F0] rounded-2xl shadow-premium z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                        <div className="p-2 border-b border-slate-50">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-[#A5D8FF]/50"
                                                    placeholder="Find location..."
                                                    autoFocus
                                                    value={provinceSearchQuery}
                                                    onChange={(e) => setProvinceSearchQuery(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto p-1">
                                            <button
                                                onClick={() => { setSelectedProvince(null); setIsProvinceDropdownOpen(false); }}
                                                className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:bg-[#A5D8FF]/10 hover:text-black rounded-lg transition-colors"
                                            >
                                                Everywhere in Canada
                                            </button>
                                            {provincesFiltered.map(p => p !== "All Provinces" && (
                                                <button
                                                    key={p}
                                                    onClick={() => { setSelectedProvince(p); setIsProvinceDropdownOpen(false); }}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                                                        selectedProvince === p ? "bg-[#A5D8FF]/20 text-black font-semibold" : "text-slate-600 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Category Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        const open = !isCategoryDropdownOpen;
                                        closeAllDropdowns();
                                        setIsCategoryDropdownOpen(open);
                                    }}
                                    className={cn(
                                        "flex items-center justify-between w-full h-[48px] px-4 rounded-xl text-[16px] font-medium border transition-all duration-300 shadow-sm hover:shadow-md hover:border-black/[0.12]",
                                        category ? "bg-[#A5D8FF]/20 border-[#A5D8FF] text-black" : "bg-white border-black/[0.08] text-slate-500"
                                    )}
                                >
                                    <span className="truncate">{category ? allCategories.find(c => c.id === category)?.label : "Category"}</span>
                                    <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-600", isCategoryDropdownOpen && "rotate-180")} strokeWidth={1} />
                                </button>
                                {isCategoryDropdownOpen && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#E2E8F0] rounded-2xl shadow-premium z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                        <div className="p-1 max-h-60 overflow-y-auto">
                                            <button
                                                onClick={() => { setCategory(null); setIsCategoryDropdownOpen(false); }}
                                                className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:bg-[#A5D8FF]/10 hover:text-black rounded-lg transition-colors"
                                            >
                                                All Categories
                                            </button>
                                            {allCategories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => { setCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                                                        category === cat.id ? "bg-[#A5D8FF]/20 text-black font-semibold" : "text-slate-600 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <cat.icon className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Map/List Column Wrapper */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    <div className="relative h-[500px] md:h-[580px] w-full rounded-[20px] shadow-[0_0_40px_rgba(0,0,0,0.03)] border border-black/[0.04] overflow-hidden bg-white group/map">

                        {/* Search Focus Dimming Overlay */}
                        <div
                            className={cn(
                                "absolute inset-0 bg-black/[0.02] z-[450] pointer-events-none transition-opacity duration-500 will-change-opacity",
                                isSearchFocused ? "opacity-100" : "opacity-0"
                            )}
                        />

                        {/* Map/List Toggle - Floating Top Left - Minimalist & Premium */}
                        <div className="absolute top-6 left-6 z-[500] inline-flex items-center p-0.5 bg-white/90 backdrop-blur-md rounded-full h-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04] border-[0.5px] border-[#E2E8F0]">
                            <button
                                onClick={() => setViewMode("map")}
                                className={cn(
                                    "relative flex items-center gap-1.5 px-3 h-[32px] rounded-full text-[11px] font-semibold transition-all duration-300 z-10",
                                    viewMode === "map" ? "text-black" : "text-slate-500 hover:text-black"
                                )}
                            >
                                {viewMode === "map" && (
                                    <motion.span
                                        layoutId="toggle-pill"
                                        className="absolute inset-0 bg-white shadow-sm rounded-full border border-black/5"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <MapIcon className="w-3.5 h-3.5" />
                                    Map
                                </span>
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "relative flex items-center gap-1.5 px-3 h-[32px] rounded-full text-[11px] font-semibold transition-all duration-300 z-10",
                                    viewMode === "list" ? "text-black" : "text-slate-500 hover:text-black"
                                )}
                            >
                                {viewMode === "list" && (
                                    <motion.span
                                        layoutId="toggle-pill"
                                        className="absolute inset-0 bg-white shadow-sm rounded-full border border-black/5"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <List className="w-3.5 h-3.5" />
                                    List
                                </span>
                            </button>
                        </div>

                        {/* Add a Store CTA - Floating Top Right - Replaces Locate Me */}
                        <button
                            onClick={() => setAddStoreDialogOpen(true)}
                            className="absolute top-6 right-6 z-[500] group inline-flex items-center justify-center bg-[#1A1A1B] text-white rounded-full h-[40px] px-8 text-[13px] font-semibold tracking-wide gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 border-[0.5px] border-white/20"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            Add a Store
                        </button>

                        {/* Map or List Render */}
                        <div className="w-full h-full relative z-0">
                            <MapSection
                                mode="full"
                                className="w-full h-full"
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

                    {/* Verified/Community Micro-Copy - Centered and Styled Unified */}
                    <div className="mt-4 flex justify-center">
                        <div className="flex items-center justify-center gap-4 md:gap-6">
                            <span className="text-[14px] font-normal leading-normal font-ui text-slate-400 tracking-normal">Community Driven</span>
                            <span className="text-[14px] font-normal leading-normal font-ui text-slate-300 tracking-normal">/</span>
                            <span className="text-[14px] font-normal leading-normal font-ui text-slate-400 tracking-normal">Moderator Verified</span>
                            <span className="text-[14px] font-normal leading-normal font-ui text-slate-300 tracking-normal">/</span>
                            <Link href="/about" className="text-[14px] font-normal leading-normal font-ui text-slate-400 tracking-normal hover:text-black transition-colors cursor-pointer select-none no-underline">
                                Transparency
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Store Dialog Overlay */}
            <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                <DialogContent className="max-w-[600px] p-0 border-none bg-transparent shadow-none overflow-visible">
                    <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}

