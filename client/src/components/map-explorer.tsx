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
            <section className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 pt-12 pb-6">
                <div className="flex flex-col items-center justify-center gap-6">

                    {/* Top Row: Heading + Stats (Centered Together) */}
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {/* Heading */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 bg-[#0047FF] rounded-full animate-premium-pulse shrink-0" />
                            <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase text-slate-900 whitespace-nowrap">
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
            <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 flex flex-col md:flex-row md:items-start gap-8 pb-20">

                {/* Sidebar - Search & Filters */}
                <aside ref={sidebarRef} className="w-full md:w-[280px] md:mt-[62px] shrink-0 flex flex-col">

                    {/* Search Field - Ghost Style */}
                    <div className="relative group">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-slate-400 group-focus-within:text-slate-900 transition-colors" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Search by city or store name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-[40px] pl-8 pr-0 bg-transparent border-b border-slate-200 text-[15px] font-medium leading-normal placeholder:text-slate-500/90 focus:outline-none focus:border-black focus:ring-0 rounded-none transition-all duration-200 ease-in-out"
                            aria-label="Search stores"
                        />
                    </div>

                    <div className="flex flex-col gap-4 mt-8">
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
                                    "flex items-center justify-between w-full h-[52px] px-4 rounded-xl text-[15px] font-medium border transition-all duration-200 bg-white",
                                    selectedProvince
                                        ? "border-[#A5D8FF] ring-1 ring-[#A5D8FF] text-slate-900"
                                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                                )}
                            >
                                <span className="truncate">{selectedProvince || "Location"}</span>
                                <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-400", isProvinceDropdownOpen && "rotate-180 text-slate-900")} />
                            </button>
                            {isProvinceDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                    <div className="p-3 border-b border-slate-50">
                                        <input
                                            className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-black/10 placeholder:text-slate-400"
                                            placeholder="Search location..."
                                            autoFocus
                                            value={provinceSearchQuery}
                                            onChange={(e) => setProvinceSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-[280px] overflow-y-auto p-1">
                                        <button
                                            onClick={() => { setSelectedProvince(null); setIsProvinceDropdownOpen(false); }}
                                            className="w-full text-left px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                                        >
                                            Everywhere in Canada
                                        </button>
                                        {provincesFiltered.map(p => p !== "All Provinces" && (
                                            <button
                                                key={p}
                                                onClick={() => { setSelectedProvince(p); setIsProvinceDropdownOpen(false); }}
                                                className={cn(
                                                    "w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors",
                                                    selectedProvince === p ? "bg-[#A5D8FF]/10 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
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
                                    "flex items-center justify-between w-full h-[52px] px-4 rounded-xl text-[15px] font-medium border transition-all duration-200 bg-white",
                                    category
                                        ? "border-[#A5D8FF] ring-1 ring-[#A5D8FF] text-slate-900"
                                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                                )}
                            >
                                <span className="truncate">{category ? allCategories.find(c => c.id === category)?.label : "Category"}</span>
                                <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-400", isCategoryDropdownOpen && "rotate-180 text-slate-900")} />
                            </button>
                            {isCategoryDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                    <div className="p-1 max-h-[320px] overflow-y-auto">
                                        <button
                                            onClick={() => { setCategory(null); setIsCategoryDropdownOpen(false); }}
                                            className="w-full text-left px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                                        >
                                            All Categories
                                        </button>
                                        {allCategories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                                                    category === cat.id ? "bg-[#A5D8FF]/10 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
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
                </aside>

                {/* Map/List Column */}
                <div className="flex-1 min-w-0 flex flex-col gap-4 md:mt-[38px] relative">
                    {/* Map/List Toggle - Top Left - Glassmorphic */}
                    <div className="absolute top-6 left-6 z-[500]">
                        <div className="inline-flex items-center p-1 bg-white/70 backdrop-blur-md rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-white/10">
                            <button
                                onClick={() => setViewMode("map")}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 h-[36px] rounded-full text-[12px] font-bold uppercase tracking-wide transition-all duration-200 ease-out",
                                    viewMode === "map" ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                <MapIcon className="w-3.5 h-3.5" />
                                Map
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 h-[36px] rounded-full text-[12px] font-bold uppercase tracking-wide transition-all duration-200 ease-out",
                                    viewMode === "list" ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                <List className="w-3.5 h-3.5" />
                                List
                            </button>
                        </div>
                    </div>

                    {/* Add Store Button - Primary Action Token */}
                    <div className="absolute top-6 right-6 z-[500]">
                        {/* Microcopy - Absolute positioned above the button */}
                        <div className="absolute bottom-full right-0 mb-2 flex flex-col md:flex-row items-end md:items-center gap-0.5 md:gap-1 whitespace-nowrap">
                            <span className="text-[11px] font-medium text-gray-500 leading-tight">Know more stores?</span>
                            <span className="text-[11px] font-medium text-gray-500 leading-tight">Add them to the map!</span>
                        </div>
                        <button
                            onClick={() => setAddStoreDialogOpen(true)}
                            className="no-invert-hover bg-slate-900 text-white rounded-full px-8 h-[46px] text-base font-medium hover:bg-slate-800 hover:scale-[1.02] transition-all duration-300 tracking-[0.3px] flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            Add a store
                        </button>
                    </div>
                    <div className={cn(
                        "relative h-[550px] w-full rounded-[32px] overflow-hidden bg-white group/map isolate",
                        viewMode === "map" ? "shadow-sm border border-slate-200" : ""
                    )}>



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
