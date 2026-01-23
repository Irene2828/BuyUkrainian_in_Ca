import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Plus, Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    Clock, ArrowUpDown, ChevronDown, Check, Navigation, RefreshCw
} from "lucide-react";
import { MapSection } from "@/components/map-section";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

    const provincesFiltered = ["All Canada", ...CANADIAN_PROVINCES].filter(p =>
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

    const categories = [
        { id: "food", label: "Food", icon: UtensilsCrossed, count: getCategoryCount("food") },
        { id: "clothes", label: "Clothing", icon: ShoppingBag, count: getCategoryCount("clothes") },
        { id: "retail", label: "Gifts", icon: Gift, count: getCategoryCount("retail") }, // Mapped 'Retail' key to 'Gifts' label per request
    ];

    return (
        <div className={cn(
            "w-full bg-white flex flex-col md:block transition-[height] duration-300 ease-in-out",
            viewMode === "map" ? "h-auto md:h-auto" : "min-h-[400px] h-auto"
        )}>

            {/* TASK 1: Dynamic Headline Section */}
            <section className="bg-white px-6 md:px-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards">
                <div className="container mx-auto max-w-[1440px] pt-8 pb-8 md:pt-12 md:pb-6 flex flex-col items-center justify-center">
                    <div className="flex flex-col gap-6 text-center items-center">
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-black">
                            {/* Stores Count */}
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[32px] md:text-[40px] font-bold leading-none tracking-tight">
                                    <AnimatedCounter end={filteredStoresCount} duration={1500} />
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-1">Stores</span>
                            </div>

                            {/* Separator */}
                            <div className="hidden md:block w-px h-12 bg-slate-200/60 rotate-12"></div>

                            {/* Provinces Count */}
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[32px] md:text-[40px] font-bold leading-none tracking-tight">
                                    <AnimatedCounter end={provincesCount} duration={1600} />
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-1">Provinces</span>
                            </div>

                            {/* Separator */}
                            <div className="hidden md:block w-px h-12 bg-slate-200/60 rotate-12"></div>

                            {/* Products (estimated) */}
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[32px] md:text-[40px] font-bold leading-none tracking-tight">
                                    <AnimatedCounter end={productsCount} duration={1700} />
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-1">Products</span>
                            </div>
                        </div>

                        <p className="text-[16px] text-slate-600 max-w-3xl font-ui leading-[26px] tracking-[-0.3px] mb-0 mt-2">
                            Explore the map, find addresses, and support Ukraine through your purchases. <br className="hidden md:inline" />
                            <span className="font-semibold">Know other stores</span> selling made-in-Ukraine? <span className="font-semibold">Add them!</span>
                        </p>

                    </div>
                </div>
            </section>

            {/* Mobile: Horizontal scrolling filter bar */}
            {/* Mobile: Map Controls Refactored - 2 Rows */}
            <div className="md:hidden w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-[80px] z-[45]">
                {/* Row 1: Search + Add Store (Black CTA) */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-50/50">
                    <div className="relative group flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                            placeholder="Search by city or name..."
                            className="pl-9 pr-9 h-10 bg-gray-50 border-transparent rounded-full text-sm focus-visible:ring-1 focus-visible:ring-[#D3E4FD]/40 font-ui"
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
                        <Plus className="w-4 h-4 mr-1.5" /> Add New
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
                                    "h-10 px-4 rounded-full text-xs flex items-center gap-1.5 transition-all font-ui active:scale-95",
                                    viewMode === "map" ? "bg-white text-black shadow-sm font-medium" : "text-black hover:bg-white/50 font-normal"
                                )}
                            >
                                <MapIcon className="w-3.5 h-3.5" /> Map
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "h-10 px-4 rounded-full text-xs flex items-center gap-1.5 transition-all font-ui active:scale-95",
                                    viewMode === "list" ? "bg-white text-black shadow-sm font-medium" : "text-black hover:bg-white/50 font-normal"
                                )}
                            >
                                <List className="w-3.5 h-3.5" /> List
                            </button>
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-2 bg-[#D3E4FD] p-1 rounded-full">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(category === cat.id ? null : cat.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 h-10 px-4 rounded-full text-xs transition-all font-ui whitespace-nowrap active:scale-95",
                                        category === cat.id
                                            ? "bg-white text-black shadow-sm font-medium"
                                            : "text-black hover:bg-white/50 font-normal"
                                    )}
                                >
                                    <cat.icon className="w-3.5 h-3.5" />
                                    {cat.label} <span className="opacity-60 text-[10px] ml-0.5">({cat.count})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {/* Desktop: Original Filter Section */}
            <div className="hidden md:block w-full pt-0 pb-0 bg-white shadow-none">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                    {/* Filter Line: Categories (Left) | Map/List (Center) | Search+CTA (Right) */}
                    <div className="flex items-center justify-between pt-0 pb-0 mb-6 w-full gap-4">

                        {/* LEFT: Categories */}
                        <div className="flex items-center gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(category === cat.id ? null : cat.id)}
                                    className={cn(
                                        "no-invert-hover flex items-center justify-center gap-2 h-[42px] px-5 rounded-full text-sm transition-all duration-300 font-ui",
                                        category === cat.id
                                            ? "bg-[#D3E4FD] text-black shadow-[0_4px_12px_rgba(0,87,183,0.15)] font-medium"
                                            : "bg-slate-50 text-slate-500 hover:bg-slate-100 font-normal"
                                    )}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    {cat.label} <span className="text-xs opacity-60 font-semibold">({cat.count})</span>
                                </button>
                            ))}

                            {/* Other Dropdown */}
                            <div className="relative group">
                                <button
                                    className={cn(
                                        "no-invert-hover flex items-center justify-center gap-2 h-[42px] px-5 rounded-full text-sm transition-all duration-300 font-ui",
                                        ["books", "toys", "other"].includes(category || "")
                                            ? "bg-[#D3E4FD] text-black shadow-[0_4px_12px_rgba(0,87,183,0.15)] font-medium"
                                            : "bg-slate-50 text-slate-500 hover:bg-slate-100 font-normal"
                                    )}
                                >
                                    <span>Other</span>
                                    <ChevronDown className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" />
                                </button>

                                <div className="absolute top-[90%] left-0 pt-2 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="bg-white border text-left border-gray-100 rounded-xl shadow-xl flex flex-col p-1">
                                        {['books', 'toys'].map((subCat) => (
                                            <button
                                                key={subCat}
                                                onClick={() => setCategory(category === subCat ? null : subCat)}
                                                className={cn(
                                                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors font-ui text-left !outline-none !ring-0 !border-none focus:!outline-none focus-visible:!outline-none focus:!ring-0",
                                                    category === subCat ? "bg-blue-50 text-black" : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                                )}
                                            >
                                                {subCat.charAt(0).toUpperCase() + subCat.slice(1)}
                                                <span className="text-xs opacity-50 ml-auto">
                                                    ({getCategoryCount(subCat)})
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CENTER: Map/List View Toggles */}
                        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                            <button
                                onClick={() => setViewMode("map")}
                                className={cn(
                                    "no-invert-hover h-[42px] px-5 rounded-full text-sm flex items-center justify-center gap-2 transition-all font-ui",
                                    viewMode === "map" ? "bg-[#D3E4FD] text-black shadow-[0_4px_12px_rgba(0,87,183,0.15)] font-medium" : "bg-slate-50 text-slate-500 hover:bg-slate-100 font-normal"
                                )}
                            >
                                <MapIcon className="w-4 h-4" /> {t('map.viewMap') || 'Map'}
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "no-invert-hover h-[42px] px-5 rounded-full text-sm flex items-center justify-center gap-2 transition-all font-ui",
                                    viewMode === "list" ? "bg-[#D3E4FD] text-black shadow-[0_4px_12px_rgba(0,87,183,0.15)] font-medium" : "bg-slate-50 text-slate-500 hover:bg-slate-100 font-normal"
                                )}
                            >
                                <List className="w-4 h-4" /> {t('map.viewList') || 'List'}
                            </button>
                        </div>

                        {/* RIGHT: Search + Add */}
                        <div className="flex items-center gap-4">
                            <div className="relative group w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                <Input
                                    placeholder={t('map.search.placeholder') || 'Search by city or store name...'}
                                    className="pl-12 pr-12 h-11 border-none bg-white/80 ring-1 ring-inset ring-black/5 backdrop-blur-md shadow-sm rounded-xl focus-visible:ring-2 focus-visible:ring-[#D3E4FD]/50 font-ui tracking-tight placeholder:text-slate-400 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    onClick={handleUseLocation}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black transition-colors"
                                    title="Use my location"
                                >
                                    <Navigation className="w-4 h-4" />
                                </button>
                            </div>

                            <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                                <DialogTrigger asChild>
                                    <button className="btn-cta inline-flex items-center justify-center bg-black text-white rounded-full h-[46px] md:h-[52px] py-3 px-7 text-[16px] font-semibold gap-1.5 font-ui shadow-none transition-all duration-300 hover:bg-slate-900 hover:shadow-md hover:-translate-y-[0.5px] active:scale-[0.98]">
                                        <Plus className="w-5 h-5 stroke-[2.5]" />
                                        {t('map.addLocation') || 'Add Location'}
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

            <div className={cn(
                "w-full flex-1 md:flex-none max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-4 md:gap-8 mt-0 pt-0",
                // Parent wrapper height control
                viewMode === "map" ? "items-stretch h-auto md:h-[480px]" : "items-start h-auto"
            )}>

                {/* Left Sidebar - Desktop only, full height synchronized with map */}
                <aside className="hidden md:flex w-[300px] flex-shrink-0 flex-col justify-start gap-0 map-sidebar-white p-6 rounded-[var(--radius-brand)] shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">

                    {/* Header: Filter Results + Clear */}
                    <div className="flex items-center justify-between pb-6">
                        <h3 className="text-sm font-semibold text-slate-900 font-ui">Search by</h3>

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
                                className="text-[12px] font-medium text-slate-400 hover:text-black transition-colors bg-transparent border-none p-0 focus:outline-none"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Filters Container with consistent spacing */}
                    <div className="flex flex-col gap-6">

                        {/* Province & Town Filters */}
                        <div className="flex flex-col gap-4">
                            {/* Province Select */}
                            <div className="relative">
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2 font-ui">
                                    Location
                                </span>
                                <button
                                    onClick={() => setIsProvinceDropdownOpen(!isProvinceDropdownOpen)}
                                    className="province-select-trigger no-ring-force w-full flex items-center justify-between px-4 h-11 bg-white border border-gray-100 rounded-xl text-sm font-normal text-slate-500 hover:text-black hover:!bg-[#0047FF]/5 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200 transition-all duration-300 font-ui"
                                >
                                    <span className={cn("text-sm font-normal truncate", selectedProvince && "text-slate-900 group-hover:text-black")}>
                                        {selectedProvince || "All provinces"}
                                    </span>
                                    <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-400 group-hover:text-black flex-shrink-0", isProvinceDropdownOpen && "rotate-180")} />
                                </button>

                                {isProvinceDropdownOpen && (
                                    <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                                                        setSelectedProvince(p === "All Canada" ? null : p);
                                                        setSelectedCity(null); // Reset city on province change
                                                        setProvinceSearch("");
                                                        setIsProvinceDropdownOpen(false);
                                                    }}
                                                    className="w-full flex items-center justify-between pl-4 pr-4 py-2.5 text-sm font-medium tracking-tight text-gray-700 hover:text-black hover:bg-gray-50 transition-colors font-ui text-left !outline-none !ring-0 !border-none focus:!outline-none focus-visible:!outline-none focus:!ring-0"
                                                >
                                                    {p}
                                                    {((!selectedProvince && p === "All Canada") || selectedProvince === p) && <Check className="w-4 h-4 text-[#D3E4FD]" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Town Select */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                                    className={cn(
                                        "city-select-trigger no-ring-force w-full flex items-center justify-between px-4 h-11 border rounded-xl text-sm font-normal text-slate-500 hover:text-black transition-all duration-300 font-ui",
                                        !selectedProvince || selectedProvince === "All Canada"
                                            ? "bg-white border-gray-100 hover:!bg-[#0047FF]/5"
                                            : "bg-white border-gray-100 hover:!bg-[#0047FF]/5 focus:ring-1 focus:ring-gray-200 focus:border-gray-200"
                                    )}
                                >
                                    <span className={cn("text-sm font-normal truncate", selectedCity && "text-slate-900 group-hover:text-black")}>
                                        {selectedCity || "Select Town"}
                                    </span>
                                    <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-400 group-hover:text-black flex-shrink-0", isCityDropdownOpen && "rotate-180")} />
                                </button>

                                {isCityDropdownOpen && (
                                    <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                                            {availableCities
                                                .filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
                                                .length > 0 ? (
                                                availableCities
                                                    .filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
                                                    .map((city) => (
                                                        <button
                                                            key={city}
                                                            onClick={() => {
                                                                setSelectedCity(city);
                                                                setCitySearch("");
                                                                setIsCityDropdownOpen(false);
                                                            }}
                                                            className="w-full flex items-center justify-between pl-4 pr-4 py-2.5 text-sm font-medium tracking-tight text-gray-700 hover:text-black hover:bg-gray-50 transition-colors font-ui text-left !outline-none !ring-0 !border-none focus:!outline-none focus-visible:!outline-none focus:!ring-0"
                                                        >
                                                            {city}
                                                            {selectedCity === city && <Check className="w-4 h-4 text-[#D3E4FD]" />}
                                                        </button>
                                                    ))
                                            ) : (
                                                <div className="px-4 py-3 text-xs text-gray-400 text-center">No towns found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* No stores feedback - updated logic to account for city */}
                        {(selectedProvince || selectedCity) && filteredStoresCount === 0 && (
                            <div className="px-1 mt-[-8px] animate-in fade-in slide-in-from-top-1 duration-300">
                                <span className="text-[13px] text-slate-500 font-medium tracking-[-0.01em] font-ui">
                                    No stores found
                                </span>
                            </div>
                        )}


                    </div>
                </aside>

                {/* Map Area */}
                <div className="flex-1 relative h-full md:h-auto md:min-h-0 w-full z-0 flex flex-col">
                    <MapSection
                        mode="full"
                        className="flex-1 w-full"
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

                    {/* Map Info Footer */}
                    <p className="mt-2.5 text-[11px] text-slate-500 font-ui antialiased">
                        Community-driven. Every location is verified by our volunteer team to ensure accuracy.{" "}
                        <a href="/about" className="font-medium hover:text-slate-700 underline transition-colors">
                            Become a moderator →
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
