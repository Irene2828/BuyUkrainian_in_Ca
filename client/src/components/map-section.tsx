import { useState, useRef, useEffect, forwardRef, Suspense, lazy } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { InteractiveMap, InteractiveMapRef } from "@/components/interactive-map";
import { Search, MapPin, ArrowDown, X, RefreshCw, HelpCircle, Navigation } from "lucide-react";
import { ListingCard } from "./listing-card";

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
  "All Provinces": { lat: 50.0, lng: -95.0, zoom: 4.8 } // Victoria to Halifax corridor focus
};

import { useI18n } from "@/lib/i18n";

export function MapSection({
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
  userLocation
}: MapSectionProps) {
  const { t } = useI18n();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const mapRef = useRef<InteractiveMapRef>(null);


  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
    staleTime: Infinity,
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
      setSelectedStore(null);
      setIsModalOpen(false);
    }
  }, [viewMode]);

  // Handle Focus Store
  useEffect(() => {
    const handleFocus = (e: any) => {
      const store = e.detail as Store;
      setSelectedStore(store);
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

  const filteredStores = stores.filter((store) => {
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
    // Default to 'newest' (assuming higher ID = newer for now, or maintain API order if it's already sorted)
    // Ideally we'd use a createdAt field. For now, assuming API returns generally sorted or using ID if numeric.
    // If IDs are strings (UUID), this might not work well, so falling back to index/natural order is safer if date is missing.
    // But typically 'Recently Added' means reversing the natural order if natural is 'Oldest First'.
    // Let's implement a simple ID desc sort if IDs are numeric, otherwise trust API.
    return (Number(b.id) || 0) - (Number(a.id) || 0);
  });

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
    // Premium mode: No auto-zoom on pin click - map stays steady and calm
    // Camera only moves on explicit actions (province select, "See on Map", etc.)
  };

  const handleCloseStore = () => {
    setSelectedStore(null);
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
      <div className={`relative ${mode === "full" ? "h-full" : "h-[500px]"} w-full ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <StoreListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex flex-col gap-8 px-6 md:px-12 pt-0 pb-8 pr-0 overflow-y-auto flex-1 custom-scrollbar bg-white">
          {filteredStores.slice(0, visibleCount).map((store) => (
            <ListingCard
              key={store.id}
              store={store}
              variant="list"
              onClick={() => handleSelectStore(store)}
              className="bg-white hover:bg-white/50 hover:scale-[1.01] hover:shadow-sm transition-all duration-300 rounded-[20px] animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              style={{ animationFillMode: 'both' }}
            />
          ))}
          {filteredStores.length === 0 && (
            <div>
              <EmptyState
                type="no-results"
                searchQuery={searchQuery}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}
        </div>

        {viewMode === "list" && visibleCount < filteredStores.length && (
          <div className="py-10 border-t border-gray-50 flex justify-center bg-white shadow-none">
            <button
              onClick={() => setVisibleCount(c => c + 12)}
              className="text-[16px] font-bold text-slate-900/70 hover:text-slate-900 transition-colors flex items-center gap-2 font-ui no-underline outline-none border-none focus:outline-none focus:ring-0 active:outline-none hover:outline-none bg-transparent hover:bg-transparent"
            >
              {t('map.seeMore') || 'See more stores'} <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Custom Centered Modal Overlay - Identical to Recently Added */}
        {isModalOpen && selectedStore && (
          <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleCloseStore}
          >
            <div
              className="w-full max-w-[400px] mx-4 animate-in zoom-in-[0.98] duration-200"
              style={{ animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <StoreCard
                store={selectedStore}
                onClose={handleCloseStore}
                onSeeOnMap={handleSeeOnMap}
              />
            </div>
          </div>
        )}
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
        />
      </ErrorBoundary>
      {/* Empty state overlay when no stores match filters */}
      {filteredStores.length === 0 && stores.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[500] rounded-[24px]">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-[20px] font-bold text-gray-800 mb-2 font-header">
              {t('map.noStores') || 'No stores in this area'}
            </h3>
            <p className="text-[14px] text-gray-500 mb-4 max-w-xs font-ui">
              {t('map.adjustFilters') || 'Try adjusting your filters or searching a different location.'}
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 h-10 px-5 bg-black text-white rounded-full font-medium text-[14px] hover:bg-black/90 transition-all font-ui"
            >
              <X className="w-4 h-4" /> {t('map.clearFilters') || 'Clear filters'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
