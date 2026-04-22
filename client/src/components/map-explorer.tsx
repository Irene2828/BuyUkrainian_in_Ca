import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    ToyBrick, BookOpen, Bookmark,
    Eye, EyeOff, CheckCircle, HelpCircle,
    Plus, Minus, Home, Maximize2, X, MapPin, Copy, Mail, Facebook, Twitter, Instagram, Sparkles, ChevronDown, ChevronRight, Navigation, ExternalLink
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import { MapSection } from "@/components/map-section";
import { InteractiveMapRef } from "@/components/interactive-map";
import { StoreCard } from "@/components/store-card";
import { Store } from "@/lib/data";
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
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [addStoreDialogOpen, setAddStoreDialogOpen] = useState(false);
    const [isFlying, setIsFlying] = useState(false);
    const [sortMode, setSortMode] = useState<"newest" | "name">("newest");
    const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [provinceSearchQuery, setProvinceSearchQuery] = useState("");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [showLocateHint, setShowLocateHint] = useState(false);
    const [tipMinimized, setTipMinimized] = useState(false);

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
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
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
        const searchParams = new URLSearchParams(window.location.search);
        const provinceParam = searchParams.get('province');
        const cityParam = searchParams.get('city');

        if (provinceParam) {
            const decodedProvince = decodeURIComponent(provinceParam).trim();
            const normalizedProvince = PROVINCE_MAP[decodedProvince.toUpperCase()] || decodedProvince;

            if (PROVINCE_CENTERS[normalizedProvince]) {
                setSelectedProvince(normalizedProvince);
            }
        }

        if (cityParam) {
            setSelectedCity(decodeURIComponent(cityParam));
        }
    }, []);

    // Handle URL Query Params (Deep Linking to Store)
    useEffect(() => {
        if (stores.length === 0) return;

        const searchParams = new URLSearchParams(window.location.search);
        const storeNameParam = searchParams.get('store');

        if (storeNameParam) {
            const decodedParam = decodeURIComponent(storeNameParam);
            // Support both Name and ID lookup for robustness
            const matchedStore = stores.find(s => s.name === decodedParam || String(s.id) === decodedParam);

            if (matchedStore) {
                console.log("Deep linking to store:", matchedStore.name);
                setSelectedStore(matchedStore);

                // Teleport: Instantly focus the map camera
                if (mapSectionRef.current) {
                    mapSectionRef.current.focusOnStore(matchedStore);
                }

                // Optional: Clean up URL without reload
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, [stores]);

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
        <div className="w-full bg-white flex flex-col transition-[height] duration-300 ease-in-out font-sans">







            {/* 2. Immersive Map Canvas - Edge-to-Edge Workspace */}
            <div
                className={cn(
                    "w-full relative bg-white border-b border-slate-100",
                    viewMode === "map"
                        ? cn("overflow-hidden", isZenMode ? "h-screen" : "h-[85vh] max-h-[900px]")
                        : "h-auto overflow-visible"
                )}
                onWheel={(e) => e.stopPropagation()}
            >
                <div className={cn("w-full relative", viewMode === "map" ? "h-full" : "h-auto")}>

                    {/* Floating Overlay Islands - Aligned with Header via boutique-width */}
                    <div className="absolute inset-0 z-[600] pointer-events-none">
                        <div className={cn("boutique-width mx-auto relative", viewMode === "map" ? "h-full" : "h-auto")}>

                            {/* Pins now anchor cards directly via Leaflet Popups in InteractiveMap */}

                            {/* Top Row for Desktop Alignment */}
                            <div className="flex items-start justify-start mt-4 pt-2 pl-4 sm:pl-6 lg:pl-8 relative">
                                {/* 1. Action Island (Top-Left - now aligned with Logo) */}
                                {/* Action Island Removed - Components Relocated */}

                                {/* 2. Control Strip (Top-Right - Premium Integrated Design) */}
                                {!isZenMode && (
                                    <div className="flex flex-col items-start gap-3 pointer-events-none">

                                        {/* Control Strip - outer wrapper is position:relative + overflow:visible so dropdowns can escape */}
                                        <div ref={sidebarRef as React.RefObject<HTMLDivElement>} className="pointer-events-auto relative flex items-center min-[1441px]:h-[46px] max-[1440px]:h-[38px] h-[42px] w-fit max-w-[calc(100vw-32px)] md:max-w-[960px] bg-white/95 backdrop-blur-xl border border-[#0A2540]/15 shadow-[0_8px_30px_rgba(10,37,64,0.12)] rounded-full z-40 relative px-[8px] transition-all duration-500 animate-in fade-in slide-in-from-left-4">
                                            {/* Inner scrollable row - overflow-x-auto for mobile, but dropdowns live OUTSIDE this */}
                                            <div className="flex items-center h-full overflow-x-auto scrollbar-hide touch-pan-x">
                                                {/* Segment 1: Search */}
                                                <div className="flex items-center h-[34px] rounded-full px-3 min-w-[200px] group shrink-0 transition-all duration-200">
                                                    <Search className="w-3.5 h-3.5 text-slate-500 mr-2 flex-shrink-0" strokeWidth={2.5} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search product or town"
                                                        value={searchQuery}
                                                        onChange={(e) => {
                                                            setSearchQuery(e.target.value);
                                                            closeAllDropdowns();
                                                        }}
                                                        className="w-full bg-transparent border-none outline-none text-[14px] font-medium text-slate-700 focus:text-slate-900 placeholder:text-slate-400 transition-colors duration-200"
                                                        aria-label="Search stores"
                                                    />
                                                </div>

                                                <div className="w-[1px] h-4 bg-slate-200/60 shrink-0 mx-1" />

                                                {/* Segment 2: Province Button only */}
                                                <div className="h-[34px] flex items-center rounded-full shrink-0 transition-all duration-200">
                                                    <button
                                                        onClick={() => {
                                                            const open = !isProvinceDropdownOpen;
                                                            closeAllDropdowns();
                                                            setIsProvinceDropdownOpen(open);
                                                        }}
                                                        className={cn(
                                                            "h-full px-3 flex items-center gap-2 text-[14px] font-medium transition-colors hover:text-slate-900 outline-none",
                                                            selectedProvince ? "text-[#2D50A0]" : "text-slate-700"
                                                        )}
                                                        aria-label="Filter by province"
                                                    >
                                                        <span className="truncate max-w-[100px]">{selectedProvince || "Province"}</span>
                                                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform text-slate-400", isProvinceDropdownOpen && "rotate-180")} />
                                                    </button>
                                                </div>

                                                <div className="w-[1px] h-4 bg-slate-200/60 shrink-0 mx-1" />

                                                {/* Segment 3: Category Button only */}
                                                <div className="h-[34px] flex items-center rounded-full shrink-0 transition-all duration-200">
                                                    <button
                                                        onClick={() => {
                                                            const open = !isCategoryDropdownOpen;
                                                            closeAllDropdowns();
                                                            setIsCategoryDropdownOpen(open);
                                                        }}
                                                        className={cn(
                                                            "h-full px-3 flex items-center gap-2 text-[14px] font-medium transition-colors hover:text-slate-900 outline-none",
                                                            category ? "text-[#2D50A0]" : "text-slate-700"
                                                        )}
                                                        aria-label="Filter by category"
                                                    >
                                                        <span className="truncate max-w-[100px]">{category ? allCategories.find(c => c.id === category)?.label : "Category"}</span>
                                                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform text-slate-400", isCategoryDropdownOpen && "rotate-180")} />
                                                    </button>
                                                </div>

                                                <div className="w-1.5 shrink-0" />

                                                {/* Segment 4: Map/List Toggle (Simplified) */}
                                                <div className="relative flex items-center h-[34px] ml-1 mr-1 w-[240px] gap-2 shrink-0">
                                                    <button
                                                        onClick={() => setViewMode("map")}
                                                        className={cn(
                                                            "relative z-10 flex-1 flex items-center justify-center gap-1.5 h-full text-[14px] transition-colors duration-200",
                                                            viewMode === "map" ? "text-slate-700 font-semibold" : "text-slate-400 font-medium hover:text-slate-600"
                                                        )}
                                                    >
                                                        <MapIcon className="w-3.5 h-3.5" />
                                                        <span className="whitespace-nowrap">Map View</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setViewMode("list")}
                                                        className={cn(
                                                            "relative z-10 flex-1 flex items-center justify-center gap-1.5 h-full text-[14px] transition-colors duration-200",
                                                            viewMode === "list" ? "text-slate-700 font-semibold" : "text-slate-400 font-medium hover:text-slate-600"
                                                        )}
                                                    >
                                                        <List className="w-3.5 h-3.5" />
                                                        <span className="whitespace-nowrap">List View</span>
                                                    </button>
                                                </div>
                                            </div>{/* end inner scrollable div */}

                                            {/* Province Dropdown — rendered OUTSIDE the overflow-x-auto div, as a direct child of the position:relative outer strip */}
                                            {isProvinceDropdownOpen && (
                                                <div className="absolute top-[calc(100%+8px)] left-[310px] w-48 bg-white border border-slate-200 shadow-lg ring-1 ring-black/5 rounded-xl z-[700] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1.5 font-ui">
                                                        <button
                                                            onClick={() => { setSelectedProvince(null); setIsProvinceDropdownOpen(false); }}
                                                            className="w-full text-left px-3 py-2 text-[12px] font-medium text-slate-500 hover:bg-slate-200 rounded-lg"
                                                        >
                                                            Canada
                                                        </button>
                                                        {CANADIAN_PROVINCES.map(p => (
                                                            <button
                                                                key={p}
                                                                onClick={() => { setSelectedProvince(p); setIsProvinceDropdownOpen(false); }}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-2 text-[14px] font-medium rounded-lg transition-colors",
                                                                    selectedProvince === p ? "bg-slate-50 text-[#2D50A0]" : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                                                                )}
                                                            >
                                                                {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {/* Category Dropdown — rendered OUTSIDE the overflow-x-auto div */}
                                            {isCategoryDropdownOpen && (
                                                <div className="absolute top-[calc(100%+8px)] left-[430px] w-48 bg-white border border-slate-200 shadow-lg ring-1 ring-black/5 rounded-xl z-[700] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1.5 font-ui">
                                                        <button
                                                            onClick={() => { setCategory(null); setIsCategoryDropdownOpen(false); }}
                                                            className="w-full text-left px-3 py-2 text-[12px] font-medium text-slate-500 hover:bg-slate-200 rounded-lg"
                                                        >
                                                            All Categories
                                                        </button>
                                                        {allCategories.map(cat => (
                                                            <button
                                                                key={cat.id}
                                                                onClick={() => { setCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-2 text-[14px] font-medium rounded-lg transition-colors",
                                                                    category === cat.id ? "bg-slate-50 text-[#2D50A0]" : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                                                                )}
                                                            >
                                                                {cat.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>{/* end outer control strip */}

                                        {/* 3. Helper Micro-Pill - Persistent context below toolbar */}

                                    </div>
                                )}
                            </div>

                            {/* 3. Action Island (Bottom-Right FAB for Mobile) */}
                            {!isZenMode && (
                                <div className="md:hidden absolute bottom-24 right-4 pointer-events-auto transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                                    <button
                                        onClick={() => setAddStoreDialogOpen(true)}
                                        className={cn(
                                            "w-14 h-14 p-0 rounded-full flex items-center justify-center transition-all duration-300",
                                            "bg-slate-900/85 backdrop-blur-md text-white",
                                            "shadow-2xl shadow-slate-900/20 border border-brand-navy/15",
                                            "hover:scale-105 active:scale-95"
                                        )}
                                    >
                                        <Plus className="w-6 h-6" strokeWidth={2} />
                                    </button>
                                </div>
                            )}


                        </div>
                    </div>

                    {/* Main Content Stage (Map or List) */}
                    <div className={cn("w-full relative z-0", viewMode === "map" ? "h-full" : "h-auto")}>
                        <MapSection
                            ref={mapSectionRef}
                            mode="full"
                            className={cn(
                                "w-full",
                                viewMode === "map" ? "h-full absolute top-0 left-0" : "relative"
                            )}
                            searchQuery={searchQuery}
                            category={category}
                            viewMode={viewMode}
                            selectedProvince={selectedProvince}
                            selectedCity={selectedCity}
                            sortMode={sortMode}
                            onFlightChange={setIsFlying}
                            onViewChange={setViewMode}
                            selectedStore={selectedStore}
                            onStoreSelect={setSelectedStore}
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
