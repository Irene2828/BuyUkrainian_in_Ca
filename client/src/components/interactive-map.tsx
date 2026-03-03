import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, useMap, GeoJSON, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Store } from '@/lib/data';
import { Plus, Minus, Home, Maximize2, X, MapPin, Copy, Mail, Facebook, Twitter, Instagram, Sparkles, ChevronDown, ChevronRight, Map, ExternalLink, Navigation, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StoreCard } from '@/components/store-card';

export interface InteractiveMapRef {
  focusOnStore: (store: Store) => void;
  flyToProvince: (lat: number, lng: number, zoom: number) => void;
  flyToLocation: (lat: number, lng: number, zoom?: number) => void;
  resetView: () => void;
  zenView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  invalidateSize: () => void;
}

const CANADA_BOUNDS: L.LatLngBoundsExpression = [
  [41.00, -141.00],
  [83.00, -52.00]
];

// INITIAL_MAP_STATE - CANADA CENTERED (Southern population corridor)
const INITIAL_MAP_STATE = {
  center: [52.0000, -96.0000] as [number, number],
  zoom: 4.2
} as const;

const CANADA_POPULATION_BOUNDS: L.LatLngBoundsExpression = [
  [44.00, -128.00], // Balanced South-West: High enough to hide US text
  [59.00, -52.00]   // North East
];

const CANADA_CENTER: [number, number] = INITIAL_MAP_STATE.center;

// Unified Blue/Yellow Pin Marker with Dimming Support
// Unified Blue/Yellow Pin Marker with Dimming Support - Stabilized (No Shaky Ping)
const createUnifiedMarker = (isSelected: boolean, isAnySelected: boolean, isNewest: boolean) => {
  const isDimmed = isAnySelected && !isSelected;
  // Box-shadow matches tailwind shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
  // Border 2px white matches ring-2 ring-white
  return L.divIcon({
    className: 'unified-marker-icon',
    html: `
      <div style="position: relative; width: 32px; height: 32px; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
        ${isNewest ? `<div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #3B82F6; opacity: 0.6; animation: pulse 2s infinite;"></div>` : ''}
        <div class="marker-container ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); overflow: hidden; position: relative; background: #fff; z-index: 10;">
          <div style="width: 100%; height: 50%; background: #0057B8;"></div>
          <div style="width: 100%; height: 50%; background: #FFD700;"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const isWithinCanada = (lat: number, lng: number) => {
  // Relaxed bounds for debugging/edge cases
  const valid = lat >= 40.00 && lat <= 85.00 && lng >= -145.00 && lng <= -50.00;
  if (!valid) console.log(`Store outside Canada bounds during check: ${lat}, ${lng}`);
  return valid;
};

// Scroll wheel zoom is permanently disabled - users can zoom using +/- buttons only

// Controller to capture the map instance for imperative usage
function MapController({
  mapRef
}: {
  mapRef: React.MutableRefObject<L.Map | null>;
}) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);

  return null;
}

function MapEvents({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
}

interface InteractiveMapProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
  onCloseStore: () => void;
  userLocation?: [number, number] | null;
  onFlightChange?: (isFlying: boolean) => void;
  extraControls?: React.ReactNode;
  isMobile?: boolean;
  variant?: "default" | "hero";
}

const MarkerClusterGroup = ({
  stores,
  selectedStore,
  onSelectStore,
  userLocation
}: {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
  userLocation?: [number, number] | null;
}) => {
  const map = useMap();
  const [group, setGroup] = useState<L.MarkerClusterGroup | null>(null);

  // Initialize Cluster Group
  useEffect(() => {
    if (!group) {
      const newGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        maxClusterRadius: 50, // Tight clusters
        iconCreateFunction: (cluster) => {
          const childCount = cluster.getChildCount();

          // Dynamic sizing based on density
          // Base size matches standard pin (28px) but slightly larger for visibility
          let sizeClass = 'w-9 h-9'; // 36px
          let iconSize = [36, 36] as [number, number];
          let fontSize = '13px';

          if (childCount >= 10) {
            sizeClass = 'w-11 h-11'; // 44px
            iconSize = [44, 44];
            fontSize = '14px';
          }
          if (childCount >= 50) {
            sizeClass = 'w-12 h-12'; // 48px
            iconSize = [48, 48];
            fontSize = '15px';
          }

          // Exact replication of standard pin style (Circle split blue/yellow) with Refined Shoulder Badge
          return L.divIcon({
            html: `
              <div class="cluster-badge-wrapper" style="position: relative; width: 100%; height: 100%;">
                <div class="marker-container" style="width: 100%; height: 100%; border: 2px solid white; border-radius: 50%; overflow: hidden; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.2); filter: saturate(1.2) drop-shadow(0 2px 5px rgba(0,0,0,0.1)); background: white; z-index: 1;">
                  <div style="width: 100%; height: 50%; background: #1762C5; opacity: 1;"></div>
                  <div style="width: 100%; height: 50%; background: #FFCF3E; opacity: 1;"></div>
                </div>
                <!-- Shoulder Badge: Refined Technical Grey -->
                <div class="cluster-badge" style="position: absolute; top: -4px; right: -4px; width: ${childCount > 9 ? '18px' : '16px'}; height: ${childCount > 9 ? '18px' : '16px'}; background: #475569; color: #FFFFFF; border: 2px solid #FFFFFF; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; letter-spacing: -0.025em; line-height: 1; box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 1000; font-family: var(--font-ui); pointer-events: none;">
                    ${childCount}
                </div>
              </div>
            `,
            className: 'custom-cluster-icon !bg-transparent !border-none !overflow-visible', // Force overflow visible to show the badge
            iconSize: iconSize
          });
        }
      });

      // Show tooltip on cluster hover
      newGroup.on('clustermouseover', (a: any) => {
        const cluster = a.layer;
        const count = cluster.getChildCount();
        if (count > 1) {
          cluster.bindTooltip("More than one store in the area", {
            direction: 'top',
            offset: [0, -20],
            className: 'premium-map-tooltip',
            permanent: false,
            sticky: false
          }).openTooltip();
        }
      });

      map.addLayer(newGroup);
      setGroup(newGroup);
    }

    return () => {
      if (group) {
        map.removeLayer(group);
      }
    };
  }, [map, group]);


  // Update Markers - Each Store ID Creates Unique Marker
  // CLUSTER LOGIC: If multiple stores share exact same coordinates, spiderfy will correctly
  // display each as a separate pin with its unique store object and ID.
  useEffect(() => {
    if (!group) return;

    group.clearLayers();

    // Determine newest store based on createdAt timestamp
    const newestStoreId = stores.length > 0
      ? stores.reduce((latest, store) => {
        const current = new Date(store.createdAt || 0).getTime();
        const latestTime = new Date(latest.createdAt || 0).getTime();
        return current > latestTime ? store : latest;
      }, stores[0]).id
      : null;

    stores.forEach(store => {
      if (store.coordinates) {
        if (isWithinCanada(store.coordinates[0], store.coordinates[1])) {
          const isSelected = selectedStore?.id === store.id;
          const isAnySelected = !!selectedStore;
          const isNewest = store.id === newestStoreId;

          const marker = L.marker(store.coordinates as [number, number], {
            icon: createUnifiedMarker(isSelected, isAnySelected, isNewest)
          });

          // Hover effect: Show store name
          marker.bindTooltip(store.name, {
            direction: 'top',
            offset: [0, -15],
            opacity: 1,
            className: 'premium-map-tooltip',
            permanent: false,
            sticky: false
          });

          // Check handler passes the specific, unique store object
          marker.on('click', (e) => {
            console.log("Marker clicked:", store.name, store.id);
            L.DomEvent.stopPropagation(e); // Prevent map click from firing
            onSelectStore(store);
          });

          group.addLayer(marker);
        } else {
          console.warn("Store filtered out by bounds:", store.name, store.coordinates);
        }
      }
    });

  }, [stores, selectedStore, onSelectStore, group]); // Re-run when selection or group changes

  return null;
};

export const InteractiveMap = forwardRef<InteractiveMapRef, InteractiveMapProps>(function InteractiveMap({
  stores,
  selectedStore,
  onSelectStore,
  onCloseStore,
  userLocation,
  onFlightChange,
  extraControls,
  isMobile = false,
  variant = "default"
}, ref) {
  const [focusCoordinates, setFocusCoordinates] = useState<[number, number] | null>(null);
  const [flyConfig, setFlyConfig] = useState<{ duration: number; padding?: [number, number]; zoom?: number } | null>(null);
  const [provinceView, setProvinceView] = useState<{ lat: number, lng: number, zoom: number } | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Internal Flight Logic
  const triggerFlyToLocation = (lat: number, lng: number, zoom: number = 16) => {
    if (!mapRef.current) return;

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) {
      mapRef.current.setView([lat, lng], zoom);
      return;
    }

    const currentCenter = mapRef.current.getCenter();
    const dist = mapRef.current.distance(currentCenter, [lat, lng]);

    // Dynamic duration based on distance: short hops are fast, long hauls are cinematic
    // Base 1.5s + scalable component, capped at 3s
    const duration = Math.min(Math.max(1.5, dist / 2000), 3.0);

    mapRef.current.flyTo([lat, lng], zoom, {
      duration: duration,
      easeLinearity: 0.5, // Smoother arc
      noMoveStart: true // Prevents initial jump
    });

    setFocusCoordinates([lat, lng]);
    setProvinceView(null);
  };

  const internalZoomIn = () => {
    if (mapRef.current) {
      const currentCenter = mapRef.current.getCenter();
      const currentZoom = mapRef.current.getZoom();
      // Increased zoom step for faster navigation
      const delta = 2.0;
      mapRef.current.flyTo(currentCenter, Math.min(currentZoom + delta, 18), {
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  };

  const internalZoomOut = () => {
    if (mapRef.current) {
      const currentCenter = mapRef.current.getCenter();
      const currentZoom = mapRef.current.getZoom();
      // Increased zoom step for faster navigation
      const delta = 2.0;
      mapRef.current.flyTo(currentCenter, Math.max(currentZoom - delta, 3.0), {
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  };

  const internalFocusOnStore = (store: Store) => {
    if (store.coordinates && mapRef.current) {
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const map = mapRef.current;
      // Reduced zoom level to show more map context (Airbnb-style)
      const targetZoom = 14;

      const point = map.project(store.coordinates as [number, number], targetZoom);

      // Manual Offset Calculation:
      // We want the Pin to be in the Bottom-Right quadrant.
      // So the Map Center must be Top-Left relative to the Pin.
      // NewCenter = PinPixel - [ShiftX, ShiftY]
      // 25% Width Right, 20% Height Down
      const offsetX = map.getSize().x * 0.25;
      const offsetY = map.getSize().y * 0.20;

      const targetPoint = point.subtract([offsetX, offsetY]);
      const targetLatLng = map.unproject(targetPoint, targetZoom);

      if (isReducedMotion) {
        map.setView(targetLatLng, targetZoom);
        return;
      }

      map.flyTo(targetLatLng, targetZoom, {
        duration: 1.5,
        easeLinearity: 0.5,
        noMoveStart: true
      });

      setFocusCoordinates(store.coordinates as [number, number]);
      setProvinceView(null);
    }
  };

  // Automatically focus REMOVED as per user request (Step 1766) - user zooms manually
  // useEffect(() => {
  //   if (selectedStore && !isMobile) {
  //     internalFocusOnStore(selectedStore);
  //   }
  // }, [selectedStore?.id, isMobile]);

  useImperativeHandle(ref, () => ({
    focusOnStore: internalFocusOnStore,
    flyToProvince: (lat: number, lng: number, zoom: number) => {
      setProvinceView({ lat, lng, zoom });
      setFocusCoordinates(null);
    },
    flyToLocation: (lat: number, lng: number, zoom: number = 16) => {
      triggerFlyToLocation(lat, lng, zoom);
    },
    resetView: () => {
      // The Cinematic "Reveal" (Zoom-Out) - Returns to INITIAL_MAP_STATE
      setProvinceView({ lat: INITIAL_MAP_STATE.center[0], lng: INITIAL_MAP_STATE.center[1], zoom: INITIAL_MAP_STATE.zoom });
      setFocusCoordinates(null);
    },
    zenView: () => {
      // Specialized "Southern Canada" focus for Zen Mode - Shifted North to match main view
      setProvinceView({ lat: 51.5, lng: -96.0, zoom: 5.2 });
      setFocusCoordinates(null);
    },
    zoomIn: internalZoomIn,
    zoomOut: internalZoomOut,
    invalidateSize: () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }
  }), []);

  // Listen for "clearFilters" event to trigger the Reveal (Cinematic Zoom-Out)
  useEffect(() => {
    const handleClearFilters = () => {
      setProvinceView({ lat: INITIAL_MAP_STATE.center[0], lng: INITIAL_MAP_STATE.center[1], zoom: INITIAL_MAP_STATE.zoom });
      setFocusCoordinates(null);
    };

    window.addEventListener('clearFilters', handleClearFilters);
    return () => window.removeEventListener('clearFilters', handleClearFilters);
  }, []);

  // Removed automatic fitBounds on mount to strictly respect INITIAL_MAP_STATE calibrabion.
  // This ensures the map doesn't zoom out to show USA labels on load.

  return (
    <div
      className="w-full h-full relative z-0 overflow-hidden bg-[#F9FAFB] passport-map-container animate-in fade-in duration-[1000ms] delay-100 fill-mode-forwards antialiased"
    >
      {/* Deep Sea Overlay & Eye-Care Filter */}
      <div className="absolute inset-0 z-[400] pointer-events-none" style={{ borderRadius: 'inherit' }}>
        {/* 1. Deep Sea Gradient */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0) 30%, rgba(45, 80, 160, 0.06) 100%)' }} />
        {/* 2. Eye-Care Multiply Layer */}
        <div className="absolute inset-0 bg-[#F5F5F3] opacity-5 mix-blend-multiply" />
      </div>
      <MapContainer
        center={variant === 'hero' ? [48.0000, -88.0000] : CANADA_CENTER}
        zoom={variant === 'hero' ? 4.0 : INITIAL_MAP_STATE.zoom}
        minZoom={3.5}
        maxZoom={18}
        scrollWheelZoom={false}
        dragging={variant !== 'hero'}
        doubleClickZoom={variant !== 'hero'}
        touchZoom={variant !== 'hero'}
        boxZoom={variant !== 'hero'}
        keyboard={variant !== 'hero'}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        bounceAtZoomLimits={false}
        maxBounds={CANADA_BOUNDS}
        maxBoundsViscosity={1.0}
        zoomSnap={0}
        zoomDelta={0.4}
        markerZoomAnimation={true}
        zoomAnimation={true}
        fadeAnimation={true}
        ref={(m) => { if (m) mapRef.current = m; }}
      >
        {/* CartoDB Voyager - The Aesthetic North Star */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={20}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          className="map-tile-pane-sovereign"
          updateWhenIdle={false}
          updateWhenZooming={false}
          keepBuffer={2}
        />

        {variant !== "hero" && (
          <div className="absolute bottom-0 right-0 z-[1000] text-[9px] text-slate-400 opacity-30 hover:opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-medium font-ui px-1.5 py-0.5 pointer-events-auto cursor-default">
            © CARTO, © OpenStreetMap contributors
          </div>
        )}

        {variant !== "hero" && <MapEvents onMapClick={onCloseStore} />}


        {/* CLUSTERING IMPLEMENTATION: Replaced direct Marker loop with MarkerClusterGroup */}
        <MarkerClusterGroup
          stores={stores}
          selectedStore={selectedStore}
          onSelectStore={onSelectStore}
        />

        {userLocation && isWithinCanada(userLocation[0], userLocation[1]) && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="location-pulse-ring"></div>
                  <div class="w-3 h-3 rounded-full bg-[#A5D8FF] border-2 border-white shadow-[0_2px_8px_rgba(165,216,255,0.6)] relative z-10"></div>
                </div>
              `,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            })}
          />
        )}
      </MapContainer>



      {/* Fixed Store Card Overlay - Replaces Leaflet Popup for Desktop */}
      {selectedStore && !isMobile && variant !== "hero" && (
        <div
          className="absolute left-6 top-[88px] bottom-8 z-[1000] w-auto flex items-center animate-in slide-in-from-left-4 fade-in duration-300 pointer-events-none"
        >
          <div className="pointer-events-auto">
            <StoreCard
              store={selectedStore}
              onClose={onCloseStore}
              onSeeOnMap={(s) => {
                if (mapRef.current && s.coordinates) {
                  internalFocusOnStore(s);
                }
              }}
              variant="map"
            />
          </div>
        </div>
      )}

      {/* Glass Navigation Controls - Middle Right - ERGONOMIC CENTER */}
      {/* Glass Navigation Controls - Middle Right - ERGONOMIC CENTER */}
      {variant !== "hero" && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center gap-6 pointer-events-none">

          {/* Main Control Group */}
          <div className="flex flex-col items-center bg-slate-50/90 backdrop-blur-md border border-slate-200/50 ring-1 ring-white/40 ring-inset rounded-full shadow-lg overflow-hidden pointer-events-auto">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('locateMe'))}
                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
                    aria-label="Center on my location"
                  >
                    <Navigation className="w-4 h-4 stroke-[2.5] fill-none" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg border-none shadow-xl hidden md:block">
                  Center on my location
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-6 h-[1px] bg-zinc-100" />

            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={internalZoomIn}
                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
                    aria-label="Zoom in map"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg border-none shadow-xl hidden md:block">
                  Zoom in map
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-6 h-[1px] bg-zinc-100" />

            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={internalZoomOut}
                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
                    aria-label="Zoom out map"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg border-none shadow-xl hidden md:block">
                  Zoom out map
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-6 h-[1px] bg-zinc-100" />

            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (mapRef.current) {
                        const valid = stores.filter(s => s.coordinates && isWithinCanada(s.coordinates[0], s.coordinates[1]));
                        if (valid.length > 0) {
                          const bounds = L.latLngBounds(valid.map(s => s.coordinates as [number, number]));
                          mapRef.current.flyToBounds(bounds, { padding: [40, 40], duration: 1.5 });
                        } else {
                          setProvinceView({ lat: INITIAL_MAP_STATE.center[0], lng: INITIAL_MAP_STATE.center[1], zoom: INITIAL_MAP_STATE.zoom });
                        }
                        setFocusCoordinates(null);
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
                    aria-label="Reset to full Canada view"
                  >
                    <Maximize2 className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg border-none shadow-xl hidden md:block">
                  Reset to national view
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Separated Help Button (32px lower approx via gap-6/8) */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-200/60 backdrop-blur-md border border-slate-300 ring-1 ring-white/40 ring-inset text-slate-500 hover:text-brand-navy hover:bg-slate-50 transition-all font-medium text-lg shadow-lg pointer-events-auto active:scale-95"
                  aria-label="How to use the map"
                >
                  <Info className="w-5 h-5 stroke-[2.5]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg border-none shadow-xl hidden md:block">
                How it works
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
});
