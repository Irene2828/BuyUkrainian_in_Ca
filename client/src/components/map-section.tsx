import { useState, useRef, useEffect, forwardRef, useMemo, useImperativeHandle, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { InteractiveMap, InteractiveMapRef } from "@/components/interactive-map";
import { Search, MapPin, ArrowDown, X, RefreshCw, HelpCircle, Navigation, ChevronRight, Globe, ArrowUpRight } from "lucide-react";


import { getApprovedStores } from "@/lib/api";
import { Store } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/error-boundary";
import { MapSkeleton, StoreListItemSkeleton } from "@/components/skeleton-loaders";
import { EmptyState } from "@/components/empty-state";
import { StoreCard } from "@/components/store-card";
import { UkrainianPinIcon } from "@/components/ui/ukrainian-pin-icon";
import { GoogleMapsProvider } from "@/components/google-maps-provider";

interface MapSectionProps {
  mode?: "section" | "full";
  className?: string;
  searchQuery?: string;
  category?: string | null;
  viewMode?: "map" | "list";
  selectedProvince?: string | null;
  selectedCity?: string | null;
  sortMode?: "newest" | "name";
  initialStoreId?: string | null;
  onViewChange?: (mode: "map" | "list") => void;
  onFlightChange?: (isFlying: boolean) => void;
  extraControls?: React.ReactNode;
  userLocation?: [number, number] | null;
  selectedStore: Store | null;
  onStoreSelect: (store: Store | null) => void;
}

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
  "Northwest Territories": { lat: 65.0, lng: -120.0, zoom: 5 },
  "Nunavut": { lat: 70.0, lng: -90.0, zoom: 4 },
  "All Provinces": { lat: 54.0, lng: -90.5, zoom: 4.15 }
};

import { useI18n } from "@/lib/i18n";

import { OpportunityCard } from "@/components/opportunity-card";
import { StoreBottomSheet } from "@/components/store-bottom-sheet";

export const MapSection = forwardRef<InteractiveMapRef, MapSectionProps>((
  {
    mode = "section",
    className = "",
    searchQuery = "",
    category = null,
    viewMode = "map",
    selectedProvince = null,
    selectedCity = null,
    sortMode = "newest",
    initialStoreId = null,
    onViewChange,
    onFlightChange,
    extraControls,
    userLocation,
    selectedStore,
    onStoreSelect
  },
  ref
) => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isMobile, setIsMobile] = useState(false);
  const mapRef = useRef<InteractiveMapRef>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useImperativeHandle(ref, () => ({
    focusOnStore: (store: Store) => mapRef.current?.focusOnStore(store),
    flyToProvince: (lat: number, lng: number, zoom: number) => mapRef.current?.flyToProvince(lat, lng, zoom),
    flyToLocation: (lat: number, lng: number, zoom?: number) => mapRef.current?.flyToLocation(lat, lng, zoom),
    resetView: () => mapRef.current?.resetView(),
    zenView: () => mapRef.current?.zenView(),
    zoomIn: () => mapRef.current?.zoomIn(),
    zoomOut: () => mapRef.current?.zoomOut(),
    invalidateSize: () => mapRef.current?.invalidateSize(),
  }));


  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Track if province has ever been set (to distinguish initial mount from clearing)
  const hasProvinceBeenSet = useRef(false);

  // Handle Province Flight - SOVEREIGN VIEW LOCK: Only fly when user explicitly selects province
  useEffect(() => {
    if (selectedProvince && PROVINCE_CENTERS[selectedProvince]) {
      hasProvinceBeenSet.current = true;
      const { lat, lng, zoom } = PROVINCE_CENTERS[selectedProvince];
      mapRef.current?.flyToProvince(lat, lng, zoom);
    } else if (!selectedProvince && hasProvinceBeenSet.current && mode === "full") {
      // Only reset view when user CLEARS a previously selected province, not on initial mount
      mapRef.current?.resetView();
    }
  }, [selectedProvince, mode]);

  // Handle User Location Flight
  useEffect(() => {
    if (userLocation) {
      mapRef.current?.flyToLocation(userLocation[0], userLocation[1], 13);
    }
  }, [userLocation]);

  // Reset selected store when switching to map view
  useEffect(() => {
    if (viewMode === "map") {
      // Keep selection for "See on Map" flow - just close the list modal
      setIsModalOpen(false);
    }
  }, [viewMode]);

  // Handle Focus Store
  useEffect(() => {
    const handleFocus = (e: any) => {
      const store = e.detail as Store;
      onStoreSelect(store);
      if (viewMode === "map") {
        mapRef.current?.focusOnStore(store);
      } else {
        setIsModalOpen(true);
      }
    };
    window.addEventListener('focusStore', handleFocus);
    return () => window.removeEventListener('focusStore', handleFocus);
  }, [viewMode]);

  // Focus Management: Return focus to pin when sidebar closes
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (selectedStore) {
      // Capture focus BEFORE it moves to the modal/card
      if (document.activeElement instanceof HTMLElement) {
        lastFocusedElement.current = document.activeElement;
      }
    } else {
      // Restore focus when selectedStore becomes null
      if (lastFocusedElement.current) {
        // Small timeout to ensure DOM is ready and modal is gone
        setTimeout(() => {
          lastFocusedElement.current?.focus();
        }, 50);
      }
    }
  }, [selectedStore]);

  const getFullProvince = (p: string) => {
    const map: Record<string, string> = {
      "AB": "Alberta", "BC": "British Columbia", "MB": "Manitoba", "NB": "New Brunswick",
      "NL": "Newfoundland and Labrador", "NS": "Nova Scotia", "ON": "Ontario",
      "PE": "Prince Edward Island", "QC": "Quebec", "SK": "Saskatchewan",
      "NT": "Northwest Territories", "NU": "Nunavut", "YT": "Yukon"
    };
    return map[p] || p;
  };

  const getShortProvince = (p: string) => {
    const map: Record<string, string> = {
      "Alberta": "AB", "British Columbia": "BC", "Manitoba": "MB", "New Brunswick": "NB",
      "Newfoundland and Labrador": "NL", "Nova Scotia": "NS", "Ontario": "ON",
      "Prince Edward Island": "PE", "Quebec": "QC", "Saskatchewan": "SK",
      "Northwest Territories": "NT", "Nunavut": "NU", "Yukon": "YT"
    };
    return map[p] || p;
  };

  const normalizeSearchText = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const filteredStores = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    return stores.filter((store) => {
      const storeProvinceFull = getFullProvince(store.province);
      const storeProvinceShort = getShortProvince(storeProvinceFull);
      const searchableText = [
        store.name,
        store.city,
        store.address,
        storeProvinceFull,
        storeProvinceShort,
        ...store.products,
      ]
        .map(normalizeSearchText)
        .join(" ");

      const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesCategory = !category || store.category === category;
      const matchesProvince = !selectedProvince || storeProvinceFull.toLowerCase().trim() === selectedProvince.toLowerCase().trim();
      const matchesCity = !selectedCity || store.city === selectedCity;

      return matchesSearch && matchesCategory && matchesProvince && matchesCity;
    }).sort((a, b) => {
      if (sortMode === "name") {
        return a.name.localeCompare(b.name);
      }
      // Sort by createdAt descending (newest first)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [stores, searchQuery, category, selectedProvince, selectedCity, sortMode]);

  const handleSelectStore = (store: Store) => {
    onStoreSelect(store);
    // Only open the modal in List View.
    // In Map View, the InteractiveMap handles the floating card/popup internally.
    if (viewMode === "list") {
      setIsModalOpen(true);
    }
  };

  const handleCloseStore = () => {
    onStoreSelect(null);
    setIsModalOpen(false);
  };

  const handleSeeOnMap = (store: Store) => {
    setIsModalOpen(false);
    console.log("See on Map clicked. Coordinates:", store.coordinates);

    if (store.coordinates) {
      if (viewMode === "list" && onViewChange) {
        onViewChange("map");
        // Slight delay to allow view transition to complete
        setTimeout(() => {
          mapRef.current?.flyToLocation(store.coordinates![0], store.coordinates![1], 16);
        }, 100);
      } else {
        mapRef.current?.flyToLocation(store.coordinates[0], store.coordinates[1], 16);
      }
    }
  };

  // Clear filters handler for empty state
  const handleClearFilters = () => {
    // Reset to default view - trigger a page reload to clear all filters
    window.dispatchEvent(new CustomEvent('clearFilters'));
  };

  const mapFrameClassName = cn(
    mode === "full" ? "h-full" : "h-[600px]",
    "w-full",
    !className.includes("absolute") && "relative",
    className
  );

  if (isLoading && viewMode === "list") {
    return (
      <div className={`relative w-full ${className} bg-white`}>
        <div className="w-full h-10 md:h-12 shrink-0" />
        <div className="boutique-width">
          <div className="min-[1280px]:max-[1669px]:px-[clamp(72px,5vw,92px)] min-[1670px]:px-[clamp(52px,3.6vw,72px)] w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-8 gap-y-10 pt-16 pb-[40px] md:pb-[60px] items-start ml-[1.3px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <StoreListItemSkeleton key={i} />
            ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && viewMode === "map") {
    return (
      <div className={mapFrameClassName}>
        <MapSkeleton />
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col bg-white relative animate-in fade-in duration-500">
        {/* Top Spacer: Maintains visual baseline with map controls */}
        <div className="w-full h-10 md:h-12 shrink-0" />

        <div className="boutique-width">
          <div className="min-[1280px]:max-[1669px]:px-[clamp(72px,5vw,92px)] min-[1670px]:px-[clamp(52px,3.6vw,72px)] w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-8 gap-y-10 pt-16 pb-[40px] md:pb-[60px] items-start ml-[1.3px]">
            {filteredStores.slice(0, visibleCount).map((store, index) => {
              const isActive = selectedStore?.id === store.id;

              return (
                <div
                  key={store.id}
                    className="pt-2 pb-2 cursor-pointer transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                    style={{ animationDelay: `${(index % 12) * 30}ms` }}
                    onClick={() => handleSelectStore(store)}
                  >
                  <div className="flex flex-col justify-center">
                    <div className="flex flex-col items-start gap-1 group/title">
                      <h3 className="text-slate-900 font-semibold text-[15px] tracking-tight leading-tight antialiased line-clamp-2">
                        {store.name}
                      </h3>
                      {/* Short horizontal blue line under the name */}
                      <div className="h-[2px] w-6 bg-[#0057B7] mt-1" />
                    </div>
                    <p className="text-slate-600 text-[13px] mt-1.5">
                      {store.city}, {store.province}
                    </p>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Empty State Presentation */}
        {filteredStores.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
            <EmptyState
              type="no-results"
              searchQuery={searchQuery}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        {/* See More Actions: Centered Premium Button */}
        {visibleCount < filteredStores.length && (
          <div className="mt-8 mb-20 flex justify-center">
            <button
              onClick={() => setVisibleCount(c => c + 12)}
              className="inline-flex items-center justify-center gap-2 bg-transparent border-0 p-0 text-[16px] 2xl:text-[17px] font-medium tracking-normal text-[#0057B7] shadow-none transition-all duration-300 hover:text-[#0047A0] hover:scale-[1.02] active:scale-95"
            >
              Show more stores <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal removed in favor of inline peek card within the grid loop above for desktop context */}
      </div>
    );
  }

  return (
    <div
      className={mapFrameClassName}
    >




      {/* Locate Me Button - Glassmorphism 44px square, 20px below Add a Store */}

      <ErrorBoundary fallbackType="map">
        <GoogleMapsProvider>
          <InteractiveMap
            ref={mapRef}
            stores={filteredStores}
            selectedStore={selectedStore}
            onSelectStore={handleSelectStore}
            onCloseStore={handleCloseStore}
            onFlightChange={onFlightChange}
            extraControls={extraControls}
            userLocation={userLocation}
            isMobile={isMobile}
          />
        </GoogleMapsProvider>
      </ErrorBoundary>

      {/* Mobile Bottom Sheet - Replaces Popup on Small Screens */}
      {isMobile && selectedStore && (
        <StoreBottomSheet
          store={selectedStore}
          onClose={handleCloseStore}
          onSeeOnMap={handleSeeOnMap}
        />
      )}
      {/* Premium Empty State Overlay */}
      <OpportunityCard
        isVisible={viewMode === "map" && filteredStores.length === 0 && stores.length > 0}
        onClear={handleClearFilters}
        onAddStore={() => window.dispatchEvent(new CustomEvent('openAddStoreModal'))}
      />
    </div>
  );
});
