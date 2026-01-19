import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Plus, Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    Clock, ArrowUpDown, ChevronDown, Check, Navigation
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
    const [viewMode, setViewMode] = useState<"map" | "list">("map");
    const [addStoreDialogOpen, setAddStoreDialogOpen] = useState(false);
    const [isFlying, setIsFlying] = useState(false);
    const [isOpenOnly, setIsOpenOnly] = useState(false);
    const [sortMode, setSortMode] = useState<"newest" | "name">("newest");
    const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
    const [provinceSearch, setProvinceSearch] = useState("");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    const { data: allStores = [], isLoading } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: Infinity,
    });

    // Handle 'Clear Filters' event from MapSection (Empty State)
    useEffect(() => {
        const handleClearFilters = () => {
            setSearchQuery("");
            setCategory(null);
            setSelectedProvince(null);
            setIsOpenOnly(false);
            setSortMode("newest");
            // toast({ description: t('map.filtersCleared') || "Filters cleared" }); // Removed per 13.58.03
        };

        window.addEventListener('clearFilters', handleClearFilters);
        return () => window.removeEventListener('clearFilters', handleClearFilters);
    }, [toast, t]);

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

    const filteredStoresCount = allStores.filter(store => {
        const matchesSearch = !searchQuery ||
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = !category || store.category === category;
        const storeProvinceFull = PROVINCE_MAP[store.province] || store.province;
        const matchesProvince = !selectedProvince || selectedProvince === "All Canada" || storeProvinceFull === selectedProvince;

        return matchesSearch && matchesCategory && matchesProvince;
    }).length;

    const provincesFiltered = ["All Canada", ...CANADIAN_PROVINCES].filter(p =>
        p.toLowerCase().includes(provinceSearch.toLowerCase())
    );

    // Calculate Category Counts (Global Scope)
    const getCategoryCount = (catId: string) => {
        return allStores.filter(s => s.category === catId).length;
    };

    const categories = [
        { id: "food", label: "Food", icon: UtensilsCrossed, count: getCategoryCount("food") },
        { id: "clothes", label: "Clothing", icon: ShoppingBag, count: getCategoryCount("clothes") },
        { id: "retail", label: "Gifts", icon: Gift, count: getCategoryCount("retail") }, // Mapped 'Retail' key to 'Gifts' label per request
        { id: "other", label: "Other", icon: StoreIcon, count: getCategoryCount("other") },
    ];

    return (
        <div className={cn(
            "w-full bg-white flex flex-col md:block transition-[height] duration-300 ease-in-out",
            viewMode === "map" ? "h-auto md:h-[600px]" : "min-h-[400px] h-auto"
        )}>

            {/* TASK 1: Dynamic Headline Section */}
            <section className="bg-white px-6 md:px-16 section-reveal">
                <div className="container mx-auto max-w-[1440px] pt-8 pb-8 md:pt-12 md:pb-8 flex flex-col items-center justify-center">
                    <div className="flex flex-col gap-3 text-center items-center">
                        <h2 className="text-[28px] md:text-[24px] font-medium tracking-tight md:tracking-[-0.05em] leading-tight md:leading-[52.5px] font-gelasio section-headline-reveal text-slate-900">
                            Showing {isLoading ? '...' : filteredStoresCount} local stores selling Ukrainian products
                        </h2>
                        <p className="text-[16px] md:text-[18px] text-slate-600 max-w-2xl font-ui md:leading-[29.3px] md:tracking-[-0.44px]">
                            Filter by category, province, or open status
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
                    {/* Filter Line - CATEGORY + VIEW (Left) | SEARCH + CTA (Right) - pb-6 for 50% more gap */}
                    <div className="flex items-center justify-between pt-0 pb-0 mb-8 gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
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
                                            {/* TASK 2: Count Badges */}
                                            {cat.label} <span className="text-xs opacity-60 font-semibold">({cat.count})</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2">
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
                            </div>
                            {/* Filter Count Feedback */}
                            {/* Removed redundant feedback as it is now in the headline */}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                <Input
                                    placeholder={t('map.search.placeholder') || 'Search by city or store name...'}
                                    className="pl-12 pr-12 h-[46px] border-none bg-white/80 ring-1 ring-inset ring-black/5 backdrop-blur-md shadow-sm rounded-full focus-visible:ring-2 focus-visible:ring-[#D3E4FD]/50 font-ui tracking-tight placeholder:text-slate-400"
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
                                    <button className="btn-cta inline-flex items-center justify-center gap-2 !bg-black text-white hover:!text-white px-8 h-[46px] rounded-full font-medium text-[16px] shadow-sm font-ui whitespace-nowrap transition-colors duration-200 hover:!bg-slate-800">
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
                viewMode === "map" ? "items-stretch h-auto md:h-[450px]" : "items-start h-auto"
            )}>

                {/* Left Sidebar - Desktop only, full height synchronized with map */}
                <aside className="hidden md:flex w-[300px] flex-shrink-0 flex-col justify-start gap-6 map-sidebar-white p-6 rounded-[var(--radius-brand)] shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
                    <div className="relative">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2 font-ui">
                            Select Province
                        </span>
                        <button
                            onClick={() => setIsProvinceDropdownOpen(!isProvinceDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 h-14 bg-white border border-gray-100 rounded-[var(--radius-brand)] text-sm font-medium hover:bg-slate-50 transition-all font-ui"
                        >
                            <span className={cn(selectedProvince ? "text-black" : "text-gray-400")}>
                                {selectedProvince || `All provinces (${allStores.length} locations)`}
                            </span>
                            <ChevronDown className={cn("w-4 h-4 transition-transform", isProvinceDropdownOpen && "rotate-180")} />
                        </button>

                        {isProvinceDropdownOpen && (
                            <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[var(--radius-brand)] shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-3 border-b border-gray-50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-0 font-ui"
                                            placeholder="Type to search..."
                                            autoFocus
                                            value={provinceSearch}
                                            onChange={(e) => setProvinceSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {provincesFiltered.map((p) => {
                                        // TASK 3: Count per province inside select? User didn't ask explicitly inside list, but why not.
                                        // Just keeping standard for now as "All provinces (N) placeholder" was the key request.
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => {
                                                    setSelectedProvince(p === "All Canada" ? null : p);
                                                    setProvinceSearch("");
                                                    setIsProvinceDropdownOpen(false);
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-gray-50 border-b border-gray-50 font-ui"
                                            >
                                                {p}
                                                {((!selectedProvince && p === "All Canada") || selectedProvince === p) && <Check className="w-4 h-4 text-[#D3E4FD]" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>


                    {/* No stores in province feedback */}
                    {selectedProvince && filteredStoresCount === 0 && (
                        <div className="px-1 mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                            <span className="text-[13px] text-slate-500 font-medium tracking-[-0.01em] font-ui">
                                No stores found
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 block font-ui">
                            Status
                        </span>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setIsOpenOnly(!isOpenOnly)}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-medium border transition-all font-ui",
                                    isOpenOnly ? "border-[#D3E4FD] text-[#D3E4FD] bg-blue-50/50" : "border-gray-100 text-gray-500 hover:bg-slate-50 bg-white"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Open Now
                                </div>
                                {isOpenOnly && <Check className="w-3 h-3" />}
                            </button>
                            <div className="h-px bg-gray-50 my-1"></div>
                            <button
                                onClick={() => setSortMode(sortMode === "newest" ? "name" : "newest")}
                                className="flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-medium border border-gray-100 text-gray-500 hover:bg-slate-50 transition-all bg-white font-ui"
                            >
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="w-4 h-4" />
                                    Sort: {sortMode === "newest" ? "Newest" : "A-Z"}
                                </div>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Map Area - flex-1 fills remaining space */}
                {/* Map Area - Force explicit height on mobile to guarantee Leaflet rendering */}
                <div className="flex-1 relative h-full md:h-auto md:min-h-0 w-full z-0">
                    <MapSection
                        mode="full"
                        className="h-full w-full"
                        searchQuery={searchQuery}
                        category={category}
                        viewMode={viewMode}
                        selectedProvince={selectedProvince}
                        onFlightChange={setIsFlying}
                        onViewChange={setViewMode}
                        userLocation={userLocation}
                    />
                </div>
            </div>

        </div >
    );
}
