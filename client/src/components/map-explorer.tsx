import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Plus, Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    Clock, ArrowUpDown, ChevronDown, Check, Navigation, RefreshCw,
    ToyBrick, BookOpen, Bookmark, Sparkles, MapPin
} from "lucide-react";
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
    const [provinceSearch, setProvinceSearch] = useState("");
    const [citySearch, setCitySearch] = useState("");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
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

            {/* TASK 1: Dynamic Headline Section - Bold Editorial Dashboard Cluster */}
            <header
                className="pt-2 pb-10 md:pt-4 md:pb-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards"
                aria-label="Map Statistics"
            >
                <div className="w-full max-w-[1440px] px-6 lg:px-12 flex flex-wrap items-center justify-center gap-y-6 lg:scale-100 scale-90 origin-top transition-transform duration-500">

                    {/* Heading Group - Dynamic Guidance */}
                    <div className="flex flex-col items-center lg:items-start mr-12 shrink-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <h2 className="text-slate-400 text-[12px] md:text-[13px] font-semibold tracking-[0.2em] uppercase">
                                Currently on the map
                            </h2>
                            <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-500 uppercase tracking-wider">Growing across Canada</span>
                        </div>
                        <p className="text-[13px] text-slate-500 font-normal font-ui tracking-tight italic">
                            Find Ukrainian products near you, or help grow the map.
                        </p>
                    </div>

                    {/* Divider - Exact 40px Tall */}
                    <div className="hidden md:block w-[1px] h-[40px] bg-slate-200 mr-12 shrink-0" />

                    {/* Stats Group - The Numerical Heroes */}
                    <div className="flex items-center gap-12">
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
                        className="flex items-center justify-center bg-black text-white h-10 px-4 rounded-full text-[14px] font-medium whitespace-nowrap shadow-sm active:scale-95 transition-all font-ui"
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
                                    "h-10 px-4 rounded-full text-sm flex items-center gap-1.5 transition-all font-ui active:scale-95",
                                    viewMode === "map" ? "bg-white text-black shadow-sm font-medium" : "text-black hover:bg-white/50 font-normal"
                                )}
                            >
                                <MapIcon className="w-3.5 h-3.5" /> Map
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "h-10 px-4 rounded-full text-sm flex items-center gap-1.5 transition-all font-ui active:scale-95",
                                    viewMode === "list" ? "bg-white text-black shadow-sm font-medium" : "text-black hover:bg-white/50 font-normal"
                                )}
                            >
                                <List className="w-3.5 h-3.5" /> List
                            </button>
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-2 bg-[#D3E4FD] p-1 rounded-full">
                            {topCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(category === cat.id ? null : cat.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 h-10 px-4 rounded-full text-sm transition-all font-ui whitespace-nowrap active:scale-95",
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


            {/* Desktop: Header Controls (Search + Switcher + Add) */}
            <div className="hidden md:block w-full pt-0 pb-0 bg-white shadow-none">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                    <div className="relative flex items-center justify-between pt-0 pb-0 mb-6 w-full gap-4 z-20">
                        {/* LEFT: Top-Level Search (Command Header) - Aligned with Sidebar width (300px) */}
                        <div className="w-[300px] shrink-0">
                            <div className="relative group w-full flex items-center">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-black group-focus-within:animate-pulse transition-all duration-300 pointer-events-none" />
                                <Input
                                    placeholder={t('map.search.placeholder') || 'Search by city...'}
                                    className="pl-10 pr-10 h-[46px] bg-white border-[#3C3732]/15 rounded-[20px] text-sm shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_2px_10px_-2px_rgba(0,0,0,0.04)] focus-visible:ring-0 focus-visible:border-black focus-visible:bg-white focus-visible:shadow-md font-ui transition-all duration-300 placeholder:text-slate-400 !border-[0.5px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    onClick={handleUseLocation}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-black transition-colors !outline-none !border-none !ring-0 hover:bg-transparent"
                                    title="Use my location"
                                >
                                    <Navigation className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* CENTER: Map/List View Toggles */}
                        <div className="flex items-center justify-center pointer-events-auto z-20 flex-1">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode("map")}
                                    className={cn(
                                        "no-invert-hover group flex items-center gap-2 h-10 px-4 rounded-full text-sm transition-all duration-300 border font-ui !outline-none !ring-0",
                                        viewMode === "map"
                                            ? "bg-blue-50 border-blue-100 text-slate-900 font-semibold shadow-sm ring-1 ring-blue-500/10"
                                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
                                    )}
                                >
                                    <MapIcon className="w-4 h-4" />
                                    Map
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "no-invert-hover group flex items-center gap-2 h-10 px-4 rounded-full text-sm transition-all duration-300 border font-ui !outline-none !ring-0",
                                        viewMode === "list"
                                            ? "bg-blue-50 border-blue-100 text-slate-900 font-semibold shadow-sm ring-1 ring-blue-500/10"
                                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
                                    )}
                                >
                                    <List className="w-4 h-4" />
                                    List
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: Add Location Button */}
                        <div className="w-[300px] shrink-0 flex justify-end">
                            <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                                <DialogTrigger asChild>
                                    <button className="group btn-cta inline-flex items-center justify-center bg-black text-white rounded-full h-[46px] px-8 text-[15px] font-semibold gap-2 font-ui shadow-lg transition-all duration-300 ease-out hover:bg-[#1e293b] hover:-translate-y-[1px] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] active:scale-95">
                                        <Plus className="w-4.5 h-4.5 stroke-[2.5] transition-transform duration-300 group-hover:rotate-90" />
                                        Add a store
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl p-0 overflow-y-auto max-h-[90vh] flex flex-col border-none bg-transparent shadow-none" hideClose>
                                    <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar 'Command Center' Layout */}
            <div className={cn(
                "w-full flex-1 md:flex-none max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-3 mt-0 pt-0",
                viewMode === "map" ? "items-start h-auto" : "items-start h-auto"
            )}>

                <aside className="hidden md:flex w-[300px] flex-shrink-0 flex-col justify-start space-y-8 bg-white p-5 rounded-[24px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden h-[540px] overflow-y-auto custom-scrollbar">

                    {/* Geography Stack (Now top of sidebar) */}
                    <div className="flex flex-col gap-3">
                        {/* Province Selector Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProvinceDropdownOpen(!isProvinceDropdownOpen)}
                                className={cn(
                                    "no-invert-hover flex items-center justify-between w-full h-[46px] px-4 rounded-[20px] text-sm transition-all duration-300 border-[0.5px] font-ui !outline-none !ring-0 shadow-sm",
                                    selectedProvince
                                        ? "bg-blue-50 border-blue-100 text-slate-900 font-semibold ring-1 ring-blue-500/10"
                                        : "bg-white border-[#3C3732]/15 text-slate-600 hover:border-slate-300 hover:shadow-sm"
                                )}
                            >
                                <span className="truncate">{selectedProvince || "All Provinces"}</span>
                                <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", isProvinceDropdownOpen && "rotate-180")} />
                            </button>

                            {isProvinceDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-[20px] shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                                    <div className="p-3 border-b border-gray-50">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-0 font-ui placeholder:text-gray-400"
                                                placeholder="Search province..."
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
                                                className="w-full flex items-center justify-between pl-4 pr-4 py-2.5 text-sm font-medium tracking-tight text-gray-700 hover:text-black hover:bg-gray-50 transition-colors font-ui text-left truncate"
                                            >
                                                {p}
                                                {((!selectedProvince && p === "All Provinces") || selectedProvince === p) && <Check className="w-4 h-4 text-[#D3E4FD]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* City Selector Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                                className={cn(
                                    "no-invert-hover flex items-center justify-between w-full h-[46px] px-4 rounded-[20px] text-sm transition-all duration-300 border-[0.5px] font-ui !outline-none !ring-0 shadow-sm",
                                    selectedCity
                                        ? "bg-blue-50 border-blue-100 text-slate-900 font-semibold ring-1 ring-blue-500/10"
                                        : "bg-white border-[#3C3732]/15 text-slate-600 hover:border-slate-300 hover:shadow-sm"
                                )}
                            >
                                <span className="truncate">{selectedCity || "Select Town"}</span>
                                <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", isCityDropdownOpen && "rotate-180")} />
                            </button>

                            {isCityDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-[20px] shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                                    <div className="p-3 border-b border-gray-50">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-0 font-ui placeholder:text-gray-400"
                                                placeholder="Search town..."
                                                autoFocus
                                                value={citySearch}
                                                onChange={(e) => setCitySearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {availableCities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setSelectedCity(city);
                                                    setCitySearch("");
                                                    setIsCityDropdownOpen(false);
                                                }}
                                                className="w-full flex items-center justify-between pl-4 pr-4 py-2.5 text-sm font-medium tracking-tight text-gray-700 hover:text-black hover:bg-gray-50 transition-colors font-ui text-left truncate"
                                            >
                                                {city}
                                                {selectedCity === city && <Check className="w-4 h-4 text-[#D3E4FD]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Filter By Label & Category Chips (Bottom) */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-slate-500 font-ui antialiased">FILTER BY:</h3>

                            {(category || selectedProvince || selectedCity || searchQuery || sortMode !== "newest") && (
                                <button
                                    onClick={() => {
                                        setCategory(null);
                                        setSelectedProvince(null);
                                        setSelectedCity(null);
                                        setIsOpenOnly(false);
                                        setSortMode("newest");
                                        setSearchQuery("");
                                        setProvinceSearch("");
                                        setCitySearch("");
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-black transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Category Cloud */}
                        <div className="flex flex-wrap gap-4">
                            {allCategories.map((cat) => {
                                const isActive = category === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(isActive ? null : cat.id)}
                                        className={cn(
                                            "no-invert-hover group flex items-center gap-2 h-9 px-3.5 rounded-full text-sm transition-all duration-200 border font-ui shadow-sm",
                                            isActive
                                                ? "bg-blue-50 border-blue-100 text-slate-900 font-semibold shadow-sm ring-1 blue-500/10"
                                                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                                        )}
                                    >
                                        <cat.icon className="w-3.5 h-3.5" />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Reset All Filters Button (Bottom Sticky Style) */}
                    {(category || selectedProvince || selectedCity || searchQuery || sortMode !== "newest") && (
                        <div className="mt-auto pt-6 border-t border-slate-50">
                            <button
                                onClick={() => {
                                    setCategory(null);
                                    setSelectedProvince(null);
                                    setSelectedCity(null);
                                    setIsOpenOnly(false);
                                    setSortMode("newest");
                                    setSearchQuery("");
                                    setProvinceSearch("");
                                    setCitySearch("");
                                }}
                                className="w-full py-2.5 rounded-xl border border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-black hover:border-slate-200 transition-all font-ui"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    )}

                    {/* No stores feedback */}
                    {(selectedProvince || selectedCity || category) && filteredStoresCount === 0 && (
                        <div className="px-1 animate-in fade-in slide-in-from-top-1 duration-300">
                            <span className="text-[13px] text-slate-500 font-medium tracking-[-0.01em] font-ui">
                                No stores found
                            </span>
                        </div>
                    )}
                </aside>

                {/* Map Column Wrapper */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Map Area - Viewfinder Styling with Retina Shadows */}
                    <div className="relative h-[540px] w-full z-0 flex flex-col rounded-[20px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border-[0.5px] border-[#3C3732]/15 overflow-hidden bg-[#eff6ff] overscroll-none touch-none [contain:layout]">

                        {/* Inner Glass Glow - The 'Retina' Touch */}
                        <div className="absolute inset-0 pointer-events-none z-[50] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)] rounded-[20px]" />

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
                    </div>

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
        </div >
    );
}
