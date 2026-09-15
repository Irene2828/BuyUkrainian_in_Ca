import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    ToyBrick, BookOpen, Bookmark,
    Eye, EyeOff, CheckCircle, HelpCircle,
    Plus, Minus, Home, Maximize2, X, MapPin, Copy, Mail, Facebook, Twitter, Instagram, Sparkles, ChevronDown, ChevronUp, ChevronRight, Navigation, ExternalLink
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import { MapSection } from "@/components/map-section";
import { InteractiveMapRef } from "@/components/interactive-map";
import { StoreCard } from "@/components/store-card";
import { Store } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { HomeAddForm } from "@/components/home-add-form";
import { GoogleMapsProvider } from "@/components/google-maps-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { LocationPermissionModal } from "./location-permission-modal";

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
    const [isFlying, setIsFlying] = useState(false);
    const [sortMode, setSortMode] = useState<"newest" | "name">("newest");
    const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [provinceSearchQuery, setProvinceSearchQuery] = useState("");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [hasPromptedLocation, setHasPromptedLocation] = useState(false);
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showLocateHint, setShowLocateHint] = useState(false);
    const [tipMinimized, setTipMinimized] = useState(false);

    const sidebarRef = useRef<HTMLElement>(null);
    const mapSectionRef = useRef<InteractiveMapRef>(null);

    const closeAllDropdowns = () => {
        setIsProvinceDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
    };

    const handleSeeOnMap = (store: Store) => {
        setSelectedStore(store);
        setViewMode("map");

        const nextUrl = new URL(window.location.href);
        nextUrl.pathname = "/map";
        nextUrl.searchParams.set("store", String(store.id));
        window.history.replaceState({}, "", nextUrl.toString());

        window.setTimeout(() => {
            mapSectionRef.current?.invalidateSize();
            mapSectionRef.current?.focusOnStore(store);
        }, 350);
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
        const handleLocateMe = () => {
            if (!navigator.geolocation) {
                toast({ title: "Geolocation error", description: "Your browser does not support location access", variant: "destructive" });
                return;
            }
            if (!hasPromptedLocation) {
                setShowLocationPrompt(true);
                return;
            }
            executeLocateMe();
        };

        window.addEventListener('locateMe', handleLocateMe);
        window.addEventListener('userLocationFound', handleUserLocationFound);
        return () => {
            window.removeEventListener('locateMe', handleLocateMe);
            window.removeEventListener('userLocationFound', handleUserLocationFound);
        };
    }, [hasPromptedLocation]);

    const executeLocateMe = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
            () => toast({ title: "Location denied", description: "Please enable location permissions in your browser.", variant: "destructive" })
        );
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) return;
        if (!hasPromptedLocation) {
            setShowLocationPrompt(true);
            return;
        }
        executeLocateMe();
    };

    const handleLocationPromptContinue = () => {
        setHasPromptedLocation(true);
        executeLocateMe();
    };

    const handleLocationPromptCancel = () => {
        setHasPromptedLocation(true); // Don't ask again this session
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







            <div
                className={cn(
                    "map-explorer-frame w-full relative bg-white border-y border-slate-200",
                    isZenMode
                        ? "h-screen overflow-hidden"
                        : "h-[calc(100vh-96px)] min-h-[540px] max-h-[760px] overflow-hidden md:h-[85vh] md:max-h-[900px]"
                )}
                onWheel={(e) => e.stopPropagation()}
            >
                <div className="w-full h-full relative flex flex-col md:flex-row">

                    {/* NEW: Unified Blue Gradient Panel (Left Side) */}
                    {!isZenMode && (viewMode === "map" || viewMode === "list") && (
                        <div className="w-full md:w-[420px] min-[1440px]:w-[calc(420px+max(0px,calc((100vw-var(--boutique-max-width,1540px))/2)))] min-[1670px]:w-[calc(546px+max(0px,calc((100vw-var(--boutique-max-width,1540px))/2)))] bg-[#0057B7] bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,rgba(0,87,183,0.96)_42%,rgba(0,87,183,1)_100%)] backdrop-blur-xl flex flex-col z-[500] shrink-0 border-r border-[#0057B7]/60 pointer-events-auto h-auto md:h-full shadow-2xl pl-0 min-[1440px]:pl-[max(0px,calc((100vw-var(--boutique-max-width,1540px))/2+clamp(0.75rem,2.5vw,2rem)))] min-[1670px]:pl-[max(0px,calc((100vw-var(--boutique-max-width,1540px))/2+clamp(0.75rem,2.5vw,2rem)-126px))]">
                            
                            {/* Inner Content Box */}
                            <div className="w-full flex flex-col flex-1 h-full pr-0 min-[1670px]:pr-1.5">
                                {/* Geometric Toolbar */}
                                <div className="p-4 pl-0 min-[1670px]:pr-1 border-b border-white/15" ref={sidebarRef as React.RefObject<HTMLDivElement>}>
                                <div className="flex flex-col gap-3">
                                    {/* Search */}
                                    <div className="flex items-center h-[44px] bg-white/10 border border-white/25 px-3 group transition-all duration-200 rounded-none">
                                        <Search className="w-4 h-4 text-[#FFD700] mr-2 shrink-0" strokeWidth={2.5} />
                                        <input
                                            type="text"
                                            placeholder="Search product or town"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                closeAllDropdowns();
                                            }}
                                            className="w-full bg-transparent border-none outline-none text-[14px] font-medium text-white placeholder:text-white/60 transition-colors duration-200"
                                        />
                                    </div>

                                    {/* Filters Row */}
                                    <div className="flex items-center gap-3">
                                        {/* Province */}
                                        <div className="relative flex-1">
                                            <button
                                                onClick={() => {
                                                    const open = !isProvinceDropdownOpen;
                                                    closeAllDropdowns();
                                                    setIsProvinceDropdownOpen(open);
                                                }}
                                                className="w-full h-[44px] bg-white/10 border border-white/25 px-3.5 flex items-center justify-between text-[13px] tracking-normal font-medium text-white hover:bg-white/20 transition-colors rounded-none"
                                            >
                                                <span className="truncate pr-2">{selectedProvince || "Province"}</span>
                                                <ChevronDown className={cn("w-4 h-4 text-[#FFD700] transition-transform", isProvinceDropdownOpen && "rotate-180")} />
                                            </button>
                                            {isProvinceDropdownOpen && (
                                                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 shadow-xl z-[700] rounded-none">
                                                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                                        <button
                                                            onClick={() => { setSelectedProvince(null); setIsProvinceDropdownOpen(false); }}
                                                            className="w-full text-left px-3 py-2 text-[12px] font-medium text-slate-500 hover:bg-slate-100 rounded-none"
                                                        >
                                                            All Provinces
                                                        </button>
                                                        {CANADIAN_PROVINCES.map(p => (
                                                            <button
                                                                key={p}
                                                                onClick={() => { setSelectedProvince(p); setIsProvinceDropdownOpen(false); }}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-2 text-[13px] font-medium rounded-none transition-colors",
                                                                    selectedProvince === p ? "bg-[#0057B7]/10 text-[#0057B7]" : "text-slate-700 hover:bg-slate-100"
                                                                )}
                                                            >
                                                                {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Category */}
                                        <div className="relative flex-1">
                                            <button
                                                onClick={() => {
                                                    const open = !isCategoryDropdownOpen;
                                                    closeAllDropdowns();
                                                    setIsCategoryDropdownOpen(open);
                                                }}
                                                className="w-full h-[44px] bg-white/10 border border-white/25 px-3.5 flex items-center justify-between text-[13px] tracking-normal font-medium text-white hover:bg-white/20 transition-colors rounded-none"
                                            >
                                                <span className="truncate pr-2">{category ? allCategories.find(c => c.id === category)?.label : "Category"}</span>
                                                <ChevronDown className={cn("w-4 h-4 text-[#FFD700] transition-transform", isCategoryDropdownOpen && "rotate-180")} />
                                            </button>
                                            {isCategoryDropdownOpen && (
                                                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 shadow-xl z-[700] rounded-none">
                                                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                                        <button
                                                            onClick={() => { setCategory(null); setIsCategoryDropdownOpen(false); }}
                                                            className="w-full text-left px-3 py-2 text-[12px] font-medium text-slate-500 hover:bg-slate-100 rounded-none"
                                                        >
                                                            All Categories
                                                        </button>
                                                        {allCategories.map(cat => (
                                                            <button
                                                                key={cat.id}
                                                                onClick={() => { setCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-2 text-[13px] font-medium rounded-none transition-colors",
                                                                    category === cat.id ? "bg-[#0057B7]/10 text-[#0057B7]" : "text-slate-700 hover:bg-slate-100"
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

                                </div>
                            </div>

                            {/* Active Store Details Container */}
                            <div className="hidden md:flex flex-1 overflow-y-auto custom-scrollbar relative py-4 px-4 pl-0 min-[1670px]:pl-0 min-[1670px]:pr-0 flex-col gap-4">
                                {selectedStore ? (
                                    <StoreCard 
                                        store={selectedStore} 
                                        onClose={() => setSelectedStore(null)} 
                                        onSeeOnMap={handleSeeOnMap}
                                        variant="map"
                                        userLocation={userLocation} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-60">
                                        <MapPin className="w-12 h-12 text-[#FFD700] mb-4 opacity-50" strokeWidth={1} />
                                        <p className="text-white text-[15px] font-medium tracking-wide">Select a store on the map<br/>to see details here.</p>
                                    </div>
                                )}
                            </div>
                            </div>
                        </div>
                    )}

                    {/* Add Store FAB */}
                    {!isZenMode && viewMode === "map" && (
                        <div className="absolute bottom-6 right-4 md:right-6 z-[600] pointer-events-auto">
                            <button
                                aria-label="Add a new store"
                                onClick={() => window.dispatchEvent(new CustomEvent('openAddStoreModal'))}
                                className="h-[56px] w-[56px] p-0 bg-[#FFD700] text-[#0057B7] rounded-[32px] flex items-center justify-center shadow-xl border border-[#FFD700] hover:bg-[#0057B7] hover:border-[#0057B7] hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-300"
                            >
                                <Plus className="w-6 h-6" strokeWidth={2.5} />
                            </button>
                        </div>
                    )}

                    {/* Main Content Stage (Map or List) */}
                    <div className={cn("map-column-wrapper flex-1 relative z-0 h-full overflow-hidden", viewMode === "list" && "overflow-y-auto custom-scrollbar")}>
                        {/* Map/List View Toggle (Floating on Map) */}
                        <div className="absolute top-4 left-4 z-[1000] pointer-events-auto">
                            <div className="flex items-center h-[42px] bg-white border border-slate-300 p-1 rounded-none shadow-xl w-[212px]">
                                <button
                                    onClick={() => setViewMode("map")}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-3 h-full text-[13.5px] tracking-normal transition-colors rounded-none bg-transparent",
                                        viewMode === "map" ? "text-[#0057B7] font-semibold ring-1 ring-inset ring-[#0057B7]" : "text-slate-600 hover:text-[#0057B7] hover:bg-slate-50"
                                    )}
                                >
                                    <MapIcon className="w-4 h-4" /> Map
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-3 h-full text-[13.5px] tracking-normal transition-colors rounded-none bg-transparent",
                                        viewMode === "list" ? "text-[#0057B7] font-semibold ring-1 ring-inset ring-[#0057B7]" : "text-slate-600 hover:text-[#0057B7] hover:bg-slate-50"
                                    )}
                                >
                                    <List className="w-4 h-4" /> List
                                </button>
                            </div>
                        </div>
                        <MapSection
                            ref={mapSectionRef}
                            mode="full"
                            className={cn(
                                viewMode === "map" ? "absolute inset-0" : "relative"
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

            {/* Dialog removed in favor of GlobalAddStoreModal */}

            <LocationPermissionModal 
                open={showLocationPrompt} 
                onOpenChange={setShowLocationPrompt} 
                onContinue={handleLocationPromptContinue} 
                onCancel={handleLocationPromptCancel} 
            />
        </div>
    );
}
