import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Plus, Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    ToyBrick, BookOpen, Bookmark, Sparkles, Navigation, ChevronDown
} from "lucide-react";
import { Link } from "wouter";
import { MapSection } from "@/components/map-section";
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
    const [sortMode, setSortMode] = useState<"newest" | "name">("newest");
    const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [provinceSearchQuery, setProvinceSearchQuery] = useState("");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    const sidebarRef = useRef<HTMLElement>(null);

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

            {/* 1. Stats Dashboard */}
            <section className="w-full max-w-[var(--container-standard)] map-focus-zone mx-auto px-6 lg:px-16 pt-9 pb-4">
                <div className="flex flex-col items-center justify-center gap-6">

                    {/* Top Row: Heading + Stats (Centered Together) */}
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {/* Heading */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-premium-pulse" />
                            <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase text-slate-900/70 whitespace-nowrap">
                                CURRENTLY ON THE MAP
                            </h2>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-[1px] h-6 bg-slate-300" />

                        {/* Stats */}
                        <div className="flex items-center gap-8 md:gap-12">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[22px] font-medium text-slate-900 leading-none">
                                    <AnimatedCounter end={stats.stores} />
                                </span>
                                <span className="text-[10px] font-medium text-slate-900 uppercase tracking-[0.15em]">Stores</span>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-200" />
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[22px] font-medium text-slate-900 leading-none">
                                    <AnimatedCounter end={stats.provinces} />
                                </span>
                                <span className="text-[10px] font-medium text-slate-900 uppercase tracking-[0.15em]">Provinces</span>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-200" />
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[22px] font-medium text-slate-900 leading-none">
                                    <AnimatedCounter end={stats.products} />
                                </span>
                                <span className="text-[10px] font-medium text-slate-900 uppercase tracking-[0.15em]">Products</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Subline (Centered) */}
                    <p className="text-base text-slate-600 font-normal leading-relaxed text-center">
                        Find Ukrainian products near you, or help grow the map.
                    </p>

                </div>
            </section>

            {/* 3. Main Content Area */}
            <div className="w-full max-w-[var(--container-standard)] map-focus-zone mx-auto px-6 lg:px-16 flex flex-col md:flex-row md:items-start gap-8 pb-20">

                {/* Sidebar - Search & Filters */}
                <aside ref={sidebarRef} className="w-full md:w-[280px] shrink-0 flex flex-col pt-6">

                    {/* Search Field - Aligned with Map Buttons */}
                    <div className="relative group border-b border-slate-200 focus-within:border-slate-900 transition-colors mb-8 md:mt-[22px]">
                        <Search className="absolute left-0 bottom-4 w-[18px] h-[18px] text-slate-400 group-focus-within:text-slate-900 transition-colors" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Search by city or store name..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                closeAllDropdowns();
                            }}
                            className="w-full h-12 pl-8 pr-4 bg-transparent border-none focus:ring-0 text-[15px] font-normal leading-loose placeholder:text-slate-400 transition-all"
                            aria-label="Search stores"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Filter by:</div>

                        {/* Province Filter */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    const open = !isProvinceDropdownOpen;
                                    closeAllDropdowns();
                                    setIsProvinceDropdownOpen(open);
                                }}
                                className={cn(
                                    "flex items-center justify-between w-full h-[52px] px-6 rounded-full text-[15px] font-normal border transition-all duration-200 bg-white",
                                    selectedProvince
                                        ? "border-black text-slate-900"
                                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                                )}
                            >
                                <span className="truncate">{selectedProvince || "Location"}</span>
                                <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-400", isProvinceDropdownOpen && "rotate-180 text-slate-900")} />
                            </button>
                            {isProvinceDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-[24px] shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
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
                                    "flex items-center justify-between w-full h-[52px] px-6 rounded-full text-[15px] font-normal border transition-all duration-200 bg-white",
                                    category
                                        ? "border-black text-slate-900"
                                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                                )}
                            >
                                <span className="truncate">{category ? allCategories.find(c => c.id === category)?.label : "Category"}</span>
                                <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-400", isCategoryDropdownOpen && "rotate-180 text-slate-900")} />
                            </button>
                            {isCategoryDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-[24px] shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
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

                {/* Map/List Column */}
                <div className="flex-1 min-w-0 md:pt-6 flex flex-col gap-4 relative">
                    <div className={cn(
                        "relative h-[550px] w-full rounded-[32px] overflow-hidden bg-white group/map isolate",
                        viewMode === "map" ? "shadow-sm border border-slate-200" : ""
                    )}>
                        {/* View Switcher - Top Left of Map Frame */}
                        <div className="absolute top-6 left-6 z-[500] inline-flex items-center p-1 bg-white/40 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
                            <button
                                onClick={() => setViewMode("map")}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 h-[38px] rounded-full text-[16px] transition-all duration-200",
                                    viewMode === "map" ? "text-slate-900 font-normal opacity-100" : "text-slate-500 font-normal opacity-50 hover:opacity-80"
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
                                    viewMode === "list" ? "text-slate-900 font-normal opacity-100" : "text-slate-500 font-normal opacity-50 hover:opacity-80"
                                )}
                            >
                                <List className="w-3.5 h-3.5" />
                                List
                            </button>
                        </div>

                        {/* Add Store Button - Top Right of Map Frame */}
                        <div className="absolute top-6 right-6 z-[500]">
                            <button
                                onClick={() => setAddStoreDialogOpen(true)}
                                className="btn-premium-action no-invert-hover gap-2"
                            >
                                <Plus className="w-5 h-5" strokeWidth={2.5} />
                                <span>Add New</span>
                            </button>
                        </div>

                        {/* Content */}
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

                    {/* Community Trust Bar - Integrated under map */}
                    <div className="flex justify-center mt-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-medium text-slate-700/60 font-sans uppercase tracking-[0.05em]">Community-driven</span>
                            <span className="text-[11px] text-slate-300">•</span>
                            <span className="text-[11px] font-medium text-slate-700/60 font-sans uppercase tracking-[0.05em]">Verified</span>
                            <span className="text-[11px] text-slate-300">•</span>
                            <Link href="/about" className="text-[11px] font-medium text-slate-700/60 hover:text-slate-700 font-sans uppercase tracking-[0.05em] cursor-pointer transition-colors hover:underline decoration-slate-300 underline-offset-4 flex items-center">
                                Become a volunteer
                            </Link>
                        </div>
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
