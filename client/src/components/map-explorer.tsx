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
    const [provinceSearch, setProvinceSearch] = useState("");
    const [citySearch, setCitySearch] = useState("");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    // Ref for sidebar to detect clicks outside dropdowns
    const sidebarRef = useRef<HTMLElement>(null);

    // Helper function to close all dropdowns
    const closeAllDropdowns = () => {
        setIsProvinceDropdownOpen(false);
        setIsCityDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
        setIsSortDropdownOpen(false);
    };

    // Click outside handler to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // If clicking outside sidebar, close all dropdowns
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                closeAllDropdowns();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { data: allStores = [], isLoading } = useQuery({
        queryKey: ["stores"],
        queryFn: async () => {
            console.log("MapExplorer: Starting store fetch...");
            const data = await getApprovedStores();
            console.log("MapExplorer: Stores fetched:", data.length);
            return data;
        },
        staleTime: Infinity,
    });

    // Handle 'Clear Filters' event from MapSection (Empty State)
    useEffect(() => {
        const handleClearFilters = () => {
            setSearchQuery("");
            setCategory(null);
            setSelectedProvince(null);
            setSelectedCity(null);
            setIsOpenOnly(false);
            setSortMode("newest");
            // toast({ description: t('map.filtersCleared') || "Filters cleared" }); // Removed per 13.58.03
        };

        window.addEventListener('clearFilters', handleClearFilters);
        return () => window.removeEventListener('clearFilters', handleClearFilters);
    }, [toast, t]);

    // Smart Sidebar Sync: Reverse geocoding when user location is found
    useEffect(() => {
        const handleUserLocationFound = async (evt: Event) => {
            const event = evt as CustomEvent<{ latitude: number; longitude: number }>;
            const { latitude, longitude } = event.detail;

            try {
                // Use Nominatim API for free reverse geocoding
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
                    {
                        headers: {
                            'User-Agent': 'BuyUkrainian.ca/1.0'
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const address = data.address;

                    // Extract city (try multiple fields as Nominatim varies)
                    const city = address.city || address.town || address.village || address.municipality;
                    const province = address.state || address.province;

                    // Auto-update sidebar filters
                    if (province) {
                        // Match against our province list
                        const matchedProvince = Object.keys(PROVINCE_CENTERS).find(
                            p => p.toLowerCase() === province.toLowerCase() ||
                                province.toLowerCase().includes(p.toLowerCase())
                        );
                        if (matchedProvince) {
                            setSelectedProvince(matchedProvince);
                        }
                    }

                    if (city) {
                        // Set city filter (the dropdown will show available cities from stores)
                        setSelectedCity(city);
                    }

                    // Update user location state
                    setUserLocation([latitude, longitude]);
                }
            } catch (error) {
                console.log('Reverse geocoding failed:', error);
                // Still update user location even if geocoding fails
                setUserLocation([latitude, longitude]);
            }
        };

        window.addEventListener('userLocationFound', handleUserLocationFound);
        return () => window.removeEventListener('userLocationFound', handleUserLocationFound);
    }, []);

    // Listen for openAddStoreDialog event from map button
    useEffect(() => {
        const handleOpenDialog = () => setAddStoreDialogOpen(true);
        window.addEventListener('openAddStoreDialog', handleOpenDialog);
        return () => window.removeEventListener('openAddStoreDialog', handleOpenDialog);
    }, []);

    // Deep Linking: Handle ?store=Name param
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const storeName = params.get('store');
        if (storeName && allStores.length > 0) {
            const decodedName = decodeURIComponent(storeName);
            const store = allStores.find(s => s.name === decodedName);
            if (store) {
                console.log("Deep Linking: Found store", store.name);
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('focusStore', { detail: store }));
                }, 800);
            }
        }
    }, [allStores]);

    // Non-blocking loading state - we render the structure and let MapSection show its skeleton
    // and the Sidebar shows empty/loading states if needed.
    // This avoids the full-screen "Fetching..." message which users found intrusive.

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            toast({
                title: "Error",
                description: "Geolocation is not supported by your browser",
                variant: "destructive"
            });
            return;
        }

        toast({ description: "Locating..." });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Force update even if location is roughly same to trigger flyTo
                setUserLocation([latitude, longitude]);
            },
            (error) => {
                toast({
                    title: "Location Error",
                    description: "Unable to retrieve your location",
                    variant: "destructive"
                });
            }
        );
    };

    const filteredStores = allStores.filter(store => {
        const matchesSearch = !searchQuery ||
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = !category || store.category === category;
        const storeProvinceFull = PROVINCE_MAP[store.province] || store.province;
        const matchesProvince = !selectedProvince || selectedProvince === "All Canada" || storeProvinceFull === selectedProvince;
        const matchesCity = !selectedCity || store.city === selectedCity;

        return matchesSearch && matchesCategory && matchesProvince && matchesCity;
    });

    const filteredStoresCount = filteredStores.length;
    const provincesCount = new Set(filteredStores.map(s => s.province)).size;
    const productsCount = filteredStores.reduce((acc, s) => acc + (s.products?.length || 0), 0);

    const provincesFiltered = ["All Provinces", ...CANADIAN_PROVINCES].filter(p =>
        p.toLowerCase().includes(provinceSearch.toLowerCase())
    );

    const availableCities = Array.from(new Set(
        allStores
            .filter(s => {
                if (!selectedProvince) return true;
                const provinceFull = PROVINCE_MAP[s.province] || s.province;
                return provinceFull === selectedProvince;
            })
            .map(s => s.city)
            .filter(Boolean)
    )).sort();

    // Calculate Category Counts (Global Scope)
    const getCategoryCount = (catId: string) => {
        return allStores.filter(s => s.category === catId).length;
    };

    // UI State for Filters Sidebar
    // (State variables moved to top-level)

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

    const topCategories = allCategories.filter(cat => ["food", "clothes", "gifts"].includes(cat.id));

    return (
        <div className={cn(
            "w-full bg-white flex flex-col md:block transition-[height] duration-300 ease-in-out",
            viewMode === "map" ? "h-auto md:h-auto" : "min-h-[400px] h-auto"
        )}>

            {/* Stats Section with Heading */}
            <header
                className="pt-2 pb-11 md:pt-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards"
                aria-label="Map Statistics"
            >
                <div className="w-full max-w-[1440px] px-6 lg:px-12 flex items-end justify-center gap-12 lg:scale-100 scale-90 origin-top transition-transform duration-500">

                    {/* Descriptive Text - Left aligned */}
                    <div className="flex flex-col gap-2 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-premium-pulse shrink-0" />
                            <h2 className="text-[12px] md:text-[13px] font-semibold uppercase tracking-widest text-black whitespace-nowrap m-0">
                                Currently on the map
                            </h2>
                        </div>
                        <p className="text-[14px] text-slate-500 font-ui whitespace-nowrap">
                            Find Ukrainian products near you, or help grow the map.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-[1px] h-[40px] bg-slate-200 shrink-0" />

                    {/* Stats Group - Centered */}
                    <div className="flex items-center justify-center gap-12">

                        {/* Stores */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-4xl font-medium tabular-nums text-slate-900 leading-none">
                                <AnimatedCounter end={filteredStoresCount} duration={1500} />
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748b]">stores</span>
                        </div>

                        {/* Provinces */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-4xl font-medium tabular-nums text-slate-900 leading-none">
                                <AnimatedCounter end={provincesCount} duration={1600} />
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748b]">provinces</span>
                        </div>

                        {/* Products */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-4xl font-medium tabular-nums text-slate-900 leading-none">
                                <AnimatedCounter end={productsCount} duration={1700} />
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748b]">products</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile: Horizontal scrolling filter bar */}
            {/* Mobile: Map Controls Refactored - 2 Rows */}
            <div className="md:hidden w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-[80px] z-[45]">
                {/* Row 1: Search + Add Store (Black CTA) */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-50/50">
                    <div className="relative group flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                            placeholder="Search by city or name..."
                            className="pl-9 pr-9 h-10 bg-white border-[#2D2A27]/12 rounded-full text-sm shadow-[0_2px_12px_-3px_rgba(0,0,0,0.06),0_4px_6px_-2px_rgba(0,0,0,0.04)] focus-visible:ring-1 focus-visible:ring-[#D3E4FD]/40 font-ui transition-all duration-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            onClick={handleUseLocation}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black transition-colors"
                        >
                            <Navigation className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setAddStoreDialogOpen(true)}
                        className="btn-premium-action bg-black text-white hover:bg-slate-900 group shadow-none active:scale-95"
                    >
                        <Plus className="w-4 h-4 mr-1.5" /> Add a store
                    </button>
                </div>

                {/* Row 2: Horizontal Scroll Filters */}
                <div className="overflow-x-auto scrollbar-hide relative">
                    {/* Feed Signal */}
                    <div className="fixed right-0 top-[140px] h-[50px] w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-50"></div>
                    <div className="flex flex-row items-center gap-3 px-6 py-3 min-w-max">
                        {/* View Toggle - Map/List */}
                        <div className="flex items-center p-1 bg-[#D3E4FD] rounded-full">
                            <button
                                onClick={() => setViewMode("map")}
                                className={cn(
                                    "h-[46px] px-4 rounded-full text-sm flex items-center gap-1.5 transition-all font-ui active:scale-95",
                                    viewMode === "map" ? "bg-white text-black shadow-sm font-medium" : "text-black hover:bg-white/50 font-normal"
                                )}
                            >
                                <MapIcon className="w-3.5 h-3.5" /> Map View
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "h-[46px] px-4 rounded-full text-sm flex items-center gap-1.5 transition-all font-ui active:scale-95",
                                    viewMode === "list" ? "bg-white text-black shadow-sm font-medium" : "text-black hover:bg-white/50 font-normal"
                                )}
                            >
                                <List className="w-3.5 h-3.5" /> List View
                            </button>
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-2 bg-[#D3E4FD] p-1 rounded-full">
                            {topCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(category === cat.id ? null : cat.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 h-[46px] px-4 rounded-full text-sm transition-all font-ui whitespace-nowrap active:scale-95",
                                        category === cat.id
                                            ? "bg-white text-black shadow-sm font-medium"
                                            : "text-black hover:bg-white/50 font-normal"
                                    )}
                                >
                                    <cat.icon className="w-3.5 h-3.5" />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>




            {/* Desktop Toolbar - Search and CTA - Centered Row */}
            <div className="hidden md:flex w-full max-w-[1440px] mx-auto px-6 lg:px-12 justify-center items-center gap-4 mb-8">
                {/* Search Field (Fixed Width 480px) */}
                <div className="relative group w-[480px] flex items-center">
                    <Search
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6] group-focus-within:text-[#A5D8FF] transition-all duration-300 pointer-events-none"
                        strokeWidth={2}
                    />
                    <Input
                        placeholder={t('map.search.placeholder') || 'Search by city or store name...'}
                        className="no-ring-force w-full h-[44px] pl-10 pr-10 bg-white border-[0.5px] border-[#D2D2D7] rounded-full text-sm font-ui transition-all duration-200 placeholder:text-[#737373] focus-visible:border-[#A5D8FF] focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(165,216,255,0.4)] focus-visible:outline-none hover:border-[#C0C0C5] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        onClick={handleUseLocation}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#A1A1A6] hover:bg-[#E5E5E7] rounded-full transition-all focus-visible:outline-2 focus-visible:outline-[#A5D8FF] focus-visible:outline-offset-2"
                        title="Use my location"
                    >
                        <Navigation className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                </div>

                {/* Add a Store Button */}
                <button
                    onClick={() => setAddStoreDialogOpen(true)}
                    className="btn-premium-action bg-black text-white hover:bg-slate-900 group shadow-none"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    <span>Add a store</span>
                </button>
            </div>

            {/* Sidebar 'Command Center' Layout - Clean Borderless Alignment */}
            <div className={cn(
                "w-full flex-1 md:flex-none max-w-[1440px] mx-auto pl-[68px] pr-6 md:pr-12 flex flex-col md:flex-row gap-6 mt-0 pt-0",
                viewMode === "map" ? "items-start h-auto" : "items-start h-auto"
            )}>

                <aside
                    ref={sidebarRef}
                    className="hidden md:flex w-[300px] flex-shrink-0 flex-col justify-start h-auto"
                >
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[14px] font-semibold text-black font-ui tracking-tight mb-0.5">
                            Filter by:
                        </h3>

                        {/* Dropdown 1: Location (Province) */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    const willOpen = !isProvinceDropdownOpen;
                                    closeAllDropdowns();
                                    setIsProvinceDropdownOpen(willOpen);
                                }}
                                className={cn(
                                    "province-dropdown-option no-ring-force no-invert-hover flex items-center justify-between w-full h-[44px] px-4 rounded-xl text-sm transition-all duration-300 border shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] font-ui !outline-none !ring-0 hover:shadow-sm",
                                    selectedProvince
                                        ? "bg-[#A5D8FF]/50 border-[#A5D8FF]/50 text-[#1A1A1A] font-semibold"
                                        : "bg-white border-[#E5E5E5] text-slate-600 hover:border-[#D4D4D4]"
                                )}
                            >
                                <span className="truncate">{selectedProvince || "Location"}</span>
                                <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", isProvinceDropdownOpen && "rotate-180")} />
                            </button>

                            {isProvinceDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-[20px] shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                                    <div className="p-3 border-b border-gray-50">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                className="no-ring-force w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-0 font-ui placeholder:text-gray-400"
                                                placeholder="Search location..."
                                                autoFocus
                                                value={provinceSearch}
                                                onChange={(e) => setProvinceSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {provincesFiltered.map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => {
                                                    setSelectedProvince(p === "All Provinces" ? null : p);
                                                    setSelectedCity(null);
                                                    setProvinceSearch("");
                                                    setIsProvinceDropdownOpen(false);
                                                }}
                                                className="province-dropdown-option w-full flex items-center justify-between pl-4 pr-4 py-2.5 text-sm font-medium tracking-tight text-gray-600 hover:text-gray-900 hover:font-semibold hover:bg-[#F5F5F7] transition-all duration-150 font-ui text-left truncate border-none outline-none focus:outline-none focus:ring-0"
                                            >
                                                {p === "All Provinces" ? "All Locations" : p}
                                                {((!selectedProvince && p === "All Provinces") || selectedProvince === p) && <Check className="w-4 h-4 text-[#D3E4FD]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dropdown 2: Category */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    const willOpen = !isCategoryDropdownOpen;
                                    closeAllDropdowns();
                                    setIsCategoryDropdownOpen(willOpen);
                                }}
                                className={cn(
                                    "province-dropdown-option no-ring-force no-invert-hover flex items-center justify-between w-full h-[44px] px-4 rounded-xl text-sm transition-all duration-300 border font-ui !outline-none !ring-0 hover:shadow-sm",
                                    category
                                        ? "bg-[#A5D8FF]/50 border-[#A5D8FF]/50 text-[#1A1A1A] font-semibold"
                                        : "bg-white border-[#E5E5E5] text-slate-600 hover:border-[#D4D4D4]"
                                )}
                            >
                                <span className="truncate">{category ? allCategories.find(c => c.id === category)?.label : "Category"}</span>
                                <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", isCategoryDropdownOpen && "rotate-180")} />
                            </button>

                            {isCategoryDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-[20px] shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
                                        {allCategories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    setCategory(category === cat.id ? null : cat.id);
                                                    setIsCategoryDropdownOpen(false);
                                                }}
                                                className="province-dropdown-option w-full flex items-center justify-between pl-4 pr-4 py-2.5 text-sm font-medium tracking-tight text-gray-600 hover:text-gray-900 hover:font-semibold hover:bg-[#F5F5F7] transition-all duration-150 font-ui text-left truncate border-none outline-none focus:outline-none focus:ring-0"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <cat.icon className="w-4 h-4 text-[#A1A1A6]" strokeWidth={1.5} />
                                                    {cat.label}
                                                </div>
                                                {category === cat.id && <Check className="w-4 h-4 text-[#D3E4FD]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Map Column Wrapper */}
                < div className="flex-1 flex flex-col min-w-0" >



                    {/* Map Area - Viewfinder Styling with Retina Shadows */}
                    < div className="relative h-[540px] w-full z-0 flex flex-col rounded-[20px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border-[0.5px] border-[#3C3732]/15 overflow-hidden bg-[#eff6ff] [contain:layout]" >

                        {/* Floating Toggle Control - 44px Height + Glassmorphism for WCAG contrast */}
                        <div className="absolute top-[20px] right-[20px] z-[100] flex items-center p-1 bg-white/90 backdrop-blur-md rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-[#D2D2D7] h-[44px]">
                            <button
                                onClick={() => setViewMode("map")}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 h-[36px] rounded-full text-[12px] font-bold uppercase tracking-wider transition-all duration-300 ease-in-out focus-visible:outline-2 focus-visible:outline-[#A5D8FF] focus-visible:outline-offset-1",
                                    viewMode === "map"
                                        ? "bg-[#A5D8FF]/50 text-[#1A1A1A] shadow-sm"
                                        : "text-slate-500 hover:bg-[#E5E5E7] hover:text-slate-900"
                                )}
                            >
                                <MapIcon className="w-3.5 h-3.5" />
                                Map
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 h-[36px] rounded-full text-[12px] font-bold uppercase tracking-wider transition-all duration-300 ease-in-out focus-visible:outline-2 focus-visible:outline-[#A5D8FF] focus-visible:outline-offset-1",
                                    viewMode === "list"
                                        ? "bg-[#A5D8FF]/50 text-[#1A1A1A] shadow-sm"
                                        : "text-slate-500 hover:bg-[#E5E5E7] hover:text-slate-900"
                                )}
                            >
                                <List className="w-3.5 h-3.5" />
                                List
                            </button>
                        </div>

                        {/* Add a Store Button - Moved Above Map */}

                        {/* Inner Glass Glow - The 'Retina' Touch */}
                        < div className="absolute inset-0 pointer-events-none z-[50] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)] rounded-[20px]" />

                        <MapSection
                            mode="full"
                            className="flex-1 w-full h-full"
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
                    </div >

                    {/* Map Info Footer - Precision Microcopy */}
                    <div className="w-full text-center mt-5">
                        <p className="inline-flex items-center text-[10.5px] font-semibold text-slate-400 font-ui antialiased tracking-[0.15em] uppercase">
                            Community-driven <span className="mx-3 text-slate-300">·</span> Every location is verified <span className="mx-3 text-slate-300">·</span>
                            <a
                                href="/about"
                                className="border-b-[0.5px] border-slate-300 pb-[2px] hover:border-slate-900 transition-all duration-300 hover:text-slate-900 cursor-pointer no-underline ml-1"
                            >
                                Become a moderator
                            </a>
                        </p>
                    </div>
                </div>
            </div >

            {/* Add Store Dialog */}
            <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                <DialogContent className="max-w-[600px] p-0 border-none bg-transparent shadow-none">
                    <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
