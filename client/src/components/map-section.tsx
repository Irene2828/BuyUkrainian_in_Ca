import { useState, useRef, useEffect, forwardRef, useMemo, useImperativeHandle, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { InteractiveMap, InteractiveMapRef } from "@/components/interactive-map";
import { Search, MapPin, ArrowDown, X, RefreshCw, HelpCircle, Navigation, ChevronRight } from "lucide-react";


import { getApprovedStores } from "@/lib/api";
import { Store } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/error-boundary";
import { MapSkeleton, StoreListItemSkeleton } from "@/components/skeleton-loaders";
import { EmptyState } from "@/components/empty-state";
import { StoreCard } from "@/components/store-card";

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
  "All Provinces": { lat: 54.5, lng: -96.0, zoom: 4.7 } // Synced with new 4.7 zoom "Screenshot View" focus
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

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch = !searchQuery ||
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = !category || store.category === category;
      const storeProvinceFull = getFullProvince(store.province);
      const matchesProvince = !selectedProvince || storeProvinceFull === selectedProvince;
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
          mapRef.current?.flyToLocation(store.coordinates![0], store.coordinates![1], 14.5);
        }, 100);
      } else {
        mapRef.current?.flyToLocation(store.coordinates[0], store.coordinates[1], 14.5);
      }
    }
  };

  // Clear filters handler for empty state
  const handleClearFilters = () => {
    // Reset to default view - trigger a page reload to clear all filters
    window.dispatchEvent(new CustomEvent('clearFilters'));
  };

  if (isLoading && viewMode === "list") {
    return (
      <div className={`relative ${mode === "full" ? "h-full" : "h-[500px]"} w-full ${className} bg-[#fcfcfc]`}>
        <div className="w-full h-10 md:h-12 shrink-0" />
        <div className="flex flex-col w-full max-w-4xl mx-auto px-6 py-4 md:py-8">
          <div className="flex flex-col w-full">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full">
                <StoreListItemSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && viewMode === "map") {
    return (
      <div className={`relative ${mode === "full" ? "h-full" : "h-[600px]"} w-full ${className}`}>
        <MapSkeleton />
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col h-full bg-[#fcfcfc] relative overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
        {/* Top Spacer: Maintains visual baseline with map controls */}
        <div className="w-full h-10 md:h-12 shrink-0" />

        <div className="flex flex-col w-full max-w-4xl mx-auto px-6 py-4 md:py-8">
          {/* Index Row Layout Container */}
          <div className="flex flex-col w-full">
            {filteredStores.slice(0, visibleCount).map((store, index) => {
              const isActive = selectedStore?.id === store.id;

              // Resolve category/tags text
              const tagsText = store.products?.length > 0
                ? store.products.join(', ')
                : store.category.charAt(0).toUpperCase() + store.category.slice(1);

              // Resolve avatar logic
              let avatarSrc = store.image || (store.images && store.images.length > 0 ? store.images[0] : null);

              return (
                <div key={store.id} className="relative w-full">
                  <div
                    onClick={() => handleSelectStore(store)}
                    className={cn(
                      "flex items-center justify-between py-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors w-full animate-in fade-in slide-in-from-bottom-2 fill-mode-both",
                      isActive && "bg-slate-50"
                    )}
                    style={{ animationDelay: `${(index % 12) * 30}ms` }}
                  >
                    {/* LEFT SIDE (Store Info & Avatar) */}
                    <div className="flex items-center gap-4 min-w-0 pr-4">
                      {/* Avatar / Icon */}
                      <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center border border-slate-200/50">
                        {avatarSrc ? (
                          <img src={avatarSrc} alt={store.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 font-ui uppercase">
                            {store.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Store Text Block */}
                      <div className="flex flex-col min-w-0">
                        <span className="text-base font-semibold text-[#0A2540] truncate">{store.name}</span>
                        <span className="text-xs text-slate-500 truncate mt-0.5">{tagsText}</span>
                      </div>
                    </div>

                    {/* RIGHT SIDE (Location) */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-slate-600 font-medium text-right">{store.city}, {store.province}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>

                  {/* Inline Peek Card (Desktop) */}
                  <AnimatePresence>
                    {isActive && !isMobile && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 z-[100] w-[360px] pointer-events-auto",
                          "left-[calc(100%+32px)]"
                        )}
                      >
                        <StoreCard
                          store={selectedStore}
                          onClose={handleCloseStore}
                          onSeeOnMap={handleSeeOnMap}
                          variant="modal"
                          className="shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-200/60"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
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
            <div className="mt-20 flex justify-center pb-20">
              <button
                onClick={() => setVisibleCount(c => c + 12)}
                className="h-12 px-10 rounded-full border border-slate-900 bg-white text-slate-900 font-medium text-sm tracking-wide hover:bg-slate-900 hover:text-white transition-all duration-300 flex items-center gap-2 shadow-sm active:scale-95"
              >
                {t('map.seeMore') || 'See more stores'} <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal removed in favor of inline peek card within the grid loop above for desktop context */}
      </div>
    );
  }

  return (
    <div
      className={`relative ${mode === "full" ? "h-full" : "h-[600px]"} w-full ${className}`}
    >




      {/* Locate Me Button - Glassmorphism 44px square, 20px below Add a Store */}

      <ErrorBoundary fallbackType="map">
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
