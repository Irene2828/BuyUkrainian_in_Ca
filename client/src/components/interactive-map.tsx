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
  return L.divIcon({
    className: 'unified-marker-icon',
    html: `
      <div style="position: relative; width: 28px; height: 28px;">
        ${isNewest ? `<div style="position: absolute; inset: 0; border-radius: 50%; border: 2px solid #3B82F6; opacity: 0;"></div>` : ''}
        <div class="marker-container ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}" style="width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); filter: saturate(1.2) drop-shadow(0 2px 5px rgba(0,0,0,0.1)); overflow: hidden; position: relative; background: #fff; z-index: 10;">
          <div style="width: 100%; height: 50%; background: #0057B8;"></div>
          <div style="width: 100%; height: 50%; background: #FFD700;"></div>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const isWithinCanada = (lat: number, lng: number) => {
  return lat >= 41.67 && lat <= 83.11 && lng >= -141.03 && lng <= -52.62;
};

// Scroll wheel zoom is permanently disabled - users can zoom using +/- buttons only

function MapController({
  focusCoordinates,
  flyConfig, // New prop for dynamic flight configuration
  provinceView,
  onFlightStart,
  onFlightEnd
}: {
  focusCoordinates: [number, number] | null;
  flyConfig?: { duration: number; padding?: [number, number]; zoom?: number } | null;
  provinceView: { lat: number, lng: number, zoom: number } | null;
  onFlightStart?: () => void;
  onFlightEnd?: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusCoordinates) {
      if (onFlightStart) onFlightStart();

      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isReducedMotion) {
        // Instant Jump for Accessibility
        map.setView(focusCoordinates, flyConfig?.zoom || 16);
        if (onFlightEnd) onFlightEnd();
        return;
      }

      // Default to Cinematic Glide (1.5s+)
      // User Rule: "Minimum 1.5s to 2.0s for long distances"
      const duration = Math.max(flyConfig?.duration || 2.0, 1.5);
      const targetZoom = flyConfig?.zoom || 16;

      // Use padding if provided for offset
      // Standard Leaflet flyTo option: paddingBottomRight (x, y)
      // This offsets the center point. If we have [400, 0], it means 400px of padding on right.
      const flyOptions: L.ZoomPanOptions = {
        duration: duration,
        easeLinearity: 0.1,
        animate: true,
        noMoveStart: true
      };

      if (flyConfig?.padding) {
        // If padding is [400, 0], we interpret it as left padding now
        // @ts-ignore
        flyOptions.paddingTopLeft = flyConfig.padding;
      }

      // The Glide & Curve (Obsidian Silk)
      // easeLinearity: 0.1 creates a more pronounced curve (arctangent-ish), 
      // feeling more "flight-like" than straight line.
      map.flyTo(focusCoordinates, targetZoom, flyOptions);

      const timer = setTimeout(() => {
        if (onFlightEnd) onFlightEnd();
      }, duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [focusCoordinates, map, flyConfig]);

  useEffect(() => {
    if (provinceView) {
      // Skip flight if we're already at the center of Canada at zoom 3
      const isCanadaReset = provinceView.lat === CANADA_CENTER[0] &&
        provinceView.lng === CANADA_CENTER[1] &&
        provinceView.zoom === 3;

      if (isCanadaReset && map.getZoom() === 3) return;

      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isReducedMotion) {
        map.setView([provinceView.lat, provinceView.lng], provinceView.zoom);
        return;
      }

      if (onFlightStart) onFlightStart();

      // The Reveal (Cinematic Zoom-Out)
      // Slower, majestic ease out
      map.flyTo([provinceView.lat, provinceView.lng], provinceView.zoom, {
        duration: 2.2, // Slightly longer for the "Reveal"
        easeLinearity: 0.1,
        animate: true
      });
      const timer = setTimeout(() => {
        if (onFlightEnd) onFlightEnd();
      }, 2400); // Buffer for animation finish
      return () => clearTimeout(timer);
    }
  }, [provinceView, map]);

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
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Initialize Cluster Group
  useEffect(() => {
    if (!groupRef.current) {
      groupRef.current = L.markerClusterGroup({
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

          // Exact replication of standard pin style (Circle split blue/yellow)
          return L.divIcon({
            html: `
              <div class="marker-container" style="width: 100%; height: 100%; border: 2px solid white; border-radius: 50%; overflow: hidden; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.2); filter: saturate(1.2) drop-shadow(0 2px 5px rgba(0,0,0,0.1)); background: white;">
                <div style="width: 100%; height: 50%; background: #1762C5; opacity: 1;"></div>
                <div style="width: 100%; height: 50%; background: #FFCF3E; opacity: 1;"></div>
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #FFFFFF; text-shadow: none; font-family: var(--font-ui); font-size: ${fontSize};">
                    ${childCount}
                </div>
              </div>
            `,
            className: 'custom-cluster-icon !bg-transparent !border-none', // Ensure leaflet default styles don't interfere
            iconSize: iconSize
          });
        }
      });

      // Show tooltip on cluster hover
      groupRef.current.on('clustermouseover', (a: any) => {
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

      map.addLayer(groupRef.current);
    }

    return () => {
      if (groupRef.current) {
        map.removeLayer(groupRef.current);
        groupRef.current = null;
      }
    };
  }, [map]);


  // Update Markers - Each Store ID Creates Unique Marker
  // CLUSTER LOGIC: If multiple stores share exact same coordinates, spiderfy will correctly
  // display each as a separate pin with its unique store object and ID.
  useEffect(() => {
    const group = groupRef.current;
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
      if (store.coordinates && isWithinCanada(store.coordinates[0], store.coordinates[1])) {
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

        // Click handler passes the specific, unique store object
        marker.on('click', () => {
          onSelectStore(store);
        });

        group.addLayer(marker);
      }
    });

  }, [stores, selectedStore, onSelectStore]); // Re-run when selection changes to update dimming states

  return null;
};

export const InteractiveMap = forwardRef<InteractiveMapRef, InteractiveMapProps>(function InteractiveMap({
  stores,
  selectedStore,
  onSelectStore,
  onCloseStore,
  userLocation,
  onFlightChange,
  extraControls
}, ref) {
  const [focusCoordinates, setFocusCoordinates] = useState<[number, number] | null>(null);
  const [flyConfig, setFlyConfig] = useState<{ duration: number; padding?: [number, number]; zoom?: number } | null>(null);
  const [provinceView, setProvinceView] = useState<{ lat: number, lng: number, zoom: number } | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Internal Flight Logic
  const triggerFlyToLocation = (lat: number, lng: number, zoom: number = 16) => {
    // Calmer, slower cinematic zoom
    const isDesktop = window.innerWidth >= 768;
    const padding: [number, number] = isDesktop ? [300, 0] : [0, 0];

    // Enforce 2.0s minimum for "No Teleport" rule
    setFlyConfig({ duration: 2.0, padding, zoom });
    setFocusCoordinates([lat, lng]);
    setProvinceView(null);
  };

  const internalZoomIn = () => {
    if (mapRef.current) {
      const currentCenter = mapRef.current.getCenter();
      const currentZoom = mapRef.current.getZoom();
      const isDesktop = window.innerWidth >= 768;
      const delta = isDesktop ? 0.4 : 0.7;
      mapRef.current.flyTo(currentCenter, Math.min(currentZoom + delta, 18), {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  };

  const internalZoomOut = () => {
    if (mapRef.current) {
      const currentCenter = mapRef.current.getCenter();
      const currentZoom = mapRef.current.getZoom();
      const isDesktop = window.innerWidth >= 768;
      const delta = isDesktop ? 0.4 : 0.7;
      mapRef.current.flyTo(currentCenter, Math.max(currentZoom - delta, 3.0), {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  };

  useImperativeHandle(ref, () => ({
    focusOnStore: (store: Store) => {
      // Mechanical Zoom (Pin Click) - Stabilized
      if (store.coordinates) {
        // Sidebar is 400px on desktop (left side)
        const isDesktop = window.innerWidth >= 768;
        const padding: [number, number] = isDesktop ? [400, 0] : [0, 0];

        // Increased from 1.2 to 1.8 for smoother approach
        setFlyConfig({ duration: 1.8, padding, zoom: 16 });
        setFocusCoordinates(store.coordinates as [number, number]);
        setProvinceView(null);
      }
    },
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
        center={CANADA_CENTER}
        zoom={INITIAL_MAP_STATE.zoom}
        minZoom={3.5}
        maxZoom={18}
        scrollWheelZoom={false}
        dragging={true}
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

        <div className="absolute bottom-0 right-0 z-[1000] text-[9px] text-slate-400 opacity-30 hover:opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-medium font-ui px-1.5 py-0.5 pointer-events-auto cursor-default">
          © CARTO, © OpenStreetMap contributors
        </div>

        <MapController
          focusCoordinates={focusCoordinates}
          flyConfig={flyConfig} // Pass fresh flyConfig
          provinceView={provinceView}
          onFlightStart={() => onFlightChange?.(true)}
          onFlightEnd={() => onFlightChange?.(false)}
        />

        <MapEvents onMapClick={onCloseStore} />

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



      {/* Glass Navigation Controls - Middle Right - ERGONOMIC CENTER */}
      {/* Glass Navigation Controls - Middle Right - ERGONOMIC CENTER */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center gap-6 pointer-events-none">

        {/* Main Control Group */}
        <div className="flex flex-col items-center bg-white/80 backdrop-blur-md border border-zinc-200 rounded-full shadow-lg overflow-hidden pointer-events-auto">
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
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-md border border-zinc-200 text-slate-500 hover:text-brand-navy hover:bg-slate-50 transition-all font-medium text-lg shadow-lg pointer-events-auto active:scale-95"
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
    </div>
  );
});
