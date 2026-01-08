import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import {
    Plus, Search, List, Map as MapIcon,
    UtensilsCrossed, ShoppingBag, Gift, Store as StoreIcon,
    Clock, ArrowUpDown, ChevronDown, Check
} from "lucide-react";
import { MapSection } from "@/components/map-section";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
import { cn } from "@/lib/utils";

const PROVINCE_MAP: Record<string, string> = {
    "AB": "Alberta", "BC": "British Columbia", "MB": "Manitoba", "NB": "New Brunswick",
    "NL": "Newfoundland and Labrador", "NS": "Nova Scotia", "ON": "Ontario",
    "PE": "Prince Edward Island", "QC": "Quebec", "SK": "Saskatchewan",
    "NT": "Northwest Territories", "NU": "Nunavut", "YT": "Yukon"
};

const CANADIAN_PROVINCES = Object.values(PROVINCE_MAP).sort();

export function MapExplorer() {
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

    const { data: allStores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: Infinity,
    });

    const provincesFiltered = ["All Canada", ...CANADIAN_PROVINCES].filter(p =>
        p.toLowerCase().includes(provinceSearch.toLowerCase())
    );

    const categories = [
        { id: "food", label: "Food", icon: UtensilsCrossed },
        { id: "clothes", label: "Clothing", icon: ShoppingBag },
        { id: "retail", label: "Retail", icon: StoreIcon },
        { id: "other", label: "Gifts", icon: Gift },
    ];

    return (
        <div className="w-full bg-white">

            {/* Filter Section */}
            <div className="w-full pt-0 pb-0 bg-white">
                <div className="container mx-auto px-[64px] max-w-[1440px]">
                    {/* Filter Line - CATEGORY + VIEW (Left) | SEARCH + CTA (Right) */}
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-[#D3E4FD] p-1 rounded-full shadow-sm">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(category === cat.id ? null : cat.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 font-ui",
                                            category === cat.id
                                                ? "bg-white text-black shadow-lg font-medium"
                                                : "text-black hover:bg-white font-normal"
                                        )}
                                    >
                                        <cat.icon className="w-4 h-4" />
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center p-1 bg-[#D3E4FD] rounded-full">
                                <button
                                    onClick={() => setViewMode("map")}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all font-ui",
                                        viewMode === "map" ? "bg-white text-black shadow-sm font-medium" : "text-black hover:bg-white font-normal"
                                    )}
                                >
                                    <MapIcon className="w-4 h-4" /> Map
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all font-ui",
                                        viewMode === "list" ? "bg-white text-black shadow-sm font-medium" : "text-black hover:bg-white font-normal"
                                    )}
                                >
                                    <List className="w-4 h-4" /> List
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                <Input
                                    placeholder="Search products or stores..."
                                    className="pl-12 h-12 bg-gray-50 border-transparent rounded-full focus-visible:ring-2 focus-visible:ring-[#D3E4FD]/20 font-ui"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                                <DialogTrigger asChild>
                                    <button className="flex items-center justify-center gap-2 bg-black text-white px-8 h-12 rounded-full font-bold text-[16px] shadow-sm hover:bg-black/90 transition-all font-ui whitespace-nowrap border border-transparent hover:border-black/10">
                                        <Plus className="w-5 h-5 stroke-[2.5]" />
                                        Add a New Location
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

            {/* Map Area - Clamped height for stable, premium framing */}
            <div className="container mx-auto px-[64px] max-w-[1440px] flex gap-8 pt-8 h-[clamp(520px,65vh,760px)]">
                {/* Left Sidebar - Province Filtering only (+ Status) */}
                <aside className="w-[300px] flex-shrink-0 flex flex-col gap-8 map-sidebar-white p-8 rounded-[var(--radius-brand)]">
                    <div className="relative">
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block mb-2 font-ui">
                            Select Province
                        </span>
                        <button
                            onClick={() => setIsProvinceDropdownOpen(!isProvinceDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 h-14 bg-white border border-gray-100 rounded-[var(--radius-brand)] text-sm font-medium hover:border-gray-300 transition-all font-ui"
                        >
                            <span className={cn(selectedProvince ? "text-black" : "text-gray-400")}>
                                {selectedProvince || "All provinces"}
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
                                    {provincesFiltered.map((p) => (
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
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block font-ui">
                            Status
                        </span>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setIsOpenOnly(!isOpenOnly)}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-medium border transition-all font-ui",
                                    isOpenOnly ? "border-[#D3E4FD] text-[#D3E4FD] bg-blue-50/50" : "border-gray-100 text-gray-500 hover:border-gray-300 bg-white"
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
                                className="flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-medium border border-gray-100 text-gray-500 hover:border-gray-300 transition-all bg-white font-ui"
                            >
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="w-4 h-4" />
                                    Sort: {sortMode === "newest" ? "Newest" : "A-Z"}
                                </div>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Map Area */}
                <div className="flex-1 relative">
                    <MapSection
                        mode="full"
                        className="h-full w-full"
                        searchQuery={searchQuery}
                        category={category}
                        viewMode={viewMode}
                        selectedProvince={selectedProvince}
                        onFlightChange={setIsFlying}
                        onViewChange={setViewMode}
                    />
                </div>
            </div>
        </div>
    );
}
