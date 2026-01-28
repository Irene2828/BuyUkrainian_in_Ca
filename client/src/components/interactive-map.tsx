import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, useMap, GeoJSON, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Store } from '@/lib/data';
import { Plus, Minus, Home, Maximize2, X, MapPin, Copy, Mail, Facebook, Twitter, Instagram, Sparkles, ChevronDown, ChevronRight, Map, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StoreCard } from "./store-card";

export interface InteractiveMapRef {
  focusOnStore: (store: Store) => void;
  flyToProvince: (lat: number, lng: number, zoom: number) => void;
  flyToLocation: (lat: number, lng: number, zoom?: number) => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const CANADA_BOUNDS: L.LatLngBoundsExpression = [
  [41.67, -141.03],
  [83.11, -52.62]
];

// INITIAL MAP STATE - FROZEN (Do not modify without design approval)
// Centered on Southern Canada - Optimized to show Toronto-Montreal corridor
const INITIAL_MAP_STATE = {
  center: [52.0, -91.0] as [number, number],  // Panoramic Canada (Included East Coast)
  zoom: 3.8
} as const; /* DO NOT REMOVE: SOVEREIGN VIEW LOCK */

const CANADA_CENTER: [number, number] = INITIAL_MAP_STATE.center;

// Unified Blue/Yellow Pin Marker with Dimming Support
const createUnifiedMarker = (isSelected: boolean, isAnySelected: boolean) => {
  const isDimmed = isAnySelected && !isSelected;
  return L.divIcon({
    className: 'unified-marker-icon', // Transitions handled via GlobalStyles.css to prevent jitter
    html: `
      <div class="marker-container ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}">
        <div class="marker-pin-top"></div>
        <div class="marker-pin-bottom"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14], // Mathematically centered to prevent zoom jumping
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
        // @ts-ignore - Leaflet types might be missing paddingBottomRight on FlyTo options in some versions
        flyOptions.paddingBottomRight = flyConfig.padding;
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
              <div class="marker-container" style="width: 100%; height: 100%; border: 2px solid white; border-radius: 50%; overflow: hidden; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.2); background: white;">
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

    stores.forEach(store => {
      if (store.coordinates && isWithinCanada(store.coordinates[0], store.coordinates[1])) {
        const isSelected = selectedStore?.id === store.id;
        const isAnySelected = !!selectedStore;

        const marker = L.marker(store.coordinates as [number, number], {
          icon: createUnifiedMarker(isSelected, isAnySelected)
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

  useImperativeHandle(ref, () => ({
    focusOnStore: (store: Store) => {
      // Mechanical Zoom (Pin Click) - Stabilized
      if (store.coordinates) {
        // Calculate dynamic padding based on sidebar presence
        // Sidebar is 400px on desktop (right side)
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
    zoomIn: () => {
      if (mapRef.current) {
        const currentCenter = mapRef.current.getCenter();
        const currentZoom = mapRef.current.getZoom();
        // Smooth zoom in with flyTo - Premium Airbnb feel
        mapRef.current.flyTo(currentCenter, Math.min(currentZoom + 1, 18), {
          duration: 2.0,
          easeLinearity: 0.8
        });
      }
    },
    zoomOut: () => {
      if (mapRef.current) {
        const currentCenter = mapRef.current.getCenter();
        const currentZoom = mapRef.current.getZoom();
        // Smooth zoom out with flyTo - Premium Airbnb feel
        mapRef.current.flyTo(currentCenter, Math.max(currentZoom - 1, 3.5), {
          duration: 2.0,
          easeLinearity: 0.8
        });
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

  return (
    <div
      className="w-full h-full relative z-0 overflow-hidden rounded-[var(--radius-brand)] bg-[#FAFAFA] passport-map-container animate-in fade-in zoom-in-[0.99] duration-[1000ms] delay-100 fill-mode-forwards"
    >
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
        markerZoomAnimation={true}
        zoomAnimation={true}
        fadeAnimation={true}
        ref={(m) => { if (m) mapRef.current = m; }}
      >
        {/* Base Map Tiles - No Labels - Instant load, no fade */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          maxZoom={20}
          attribution='© CARTO © OpenStreetMap contributors'
          subdomains='abcd'
          updateWhenIdle={false}
          updateWhenZooming={false}
          keepBuffer={2}
          className="map-tiles-filtered"
        />

        {/* Canadian City Labels Only - CARTO Labels Layer - Instant load */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          maxZoom={20}
          subdomains='abcd'
          bounds={CANADA_BOUNDS}
          className="city-labels-layer"
          updateWhenIdle={false}
          updateWhenZooming={false}
          keepBuffer={2}
        />


        <div className="absolute bottom-0 right-0 z-[1000] text-[9px] text-slate-400 opacity-30 hover:opacity-100 transition-opacity duration-300 font-medium font-ui px-1.5 py-0.5 pointer-events-auto cursor-default">
          © CARTO, © OpenStreetMap contributors
        </div>

        <MapController
          focusCoordinates={focusCoordinates}
          flyConfig={flyConfig} // Pass fresh flyConfig
          provinceView={provinceView}
          onFlightStart={() => onFlightChange?.(true)}
          onFlightEnd={() => onFlightChange?.(false)}
        />

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

      {/* Side Panel Overlay - No more Dialog */}
      {selectedStore && (
        <div className="side-panel-container absolute bottom-4 left-4 right-4 md:top-[24px] md:bottom-auto md:left-auto md:right-[24px] md:w-[400px] z-[2000] animate-in fade-in slide-in-from-bottom-5 duration-500 delay-300 fill-mode-forwards shadow-[-10px_0_30px_rgba(0,0,0,0.05)] rounded-[20px] h-auto max-h-[85vh] md:max-h-[min(800px,calc(100vh-48px))] pointer-events-auto">
          <StoreCard
            store={selectedStore}
            onClose={() => {
              const panel = document.querySelector('.side-panel-container');
              if (panel) panel.classList.add('slide-out-to-right');
              setTimeout(() => {
                onCloseStore();
                // NO ZOOM REVEAL - User Requirement: "DO NOT trigger a zoom-out or fitBounds reset"
              }, 200); // Wait for anim
            }}
            onSeeOnMap={(s) => {
              // Zoom in effect
              triggerFlyToLocation(s.coordinates[0], s.coordinates[1], 14.5);
            }}
          />
        </div>
      )}

      {/* Airbnb-style Floating Navigation Controls - Right Side - WCAG Accessible */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => {
            mapRef.current?.zoomIn();
          }}
          className="w-8 h-8 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-[#F5F5F7] transition-all flex items-center justify-center text-black hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#A5D8FF] focus-visible:outline-offset-2"
          title="Zoom In"
        >
          <Plus className="w-4 h-4 !fill-none !stroke-current stroke-[2.5]" />
        </button>
        <button
          onClick={() => {
            mapRef.current?.zoomOut();
          }}
          className="w-8 h-8 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-[#F5F5F7] transition-all flex items-center justify-center text-black hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#A5D8FF] focus-visible:outline-offset-2"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4 !fill-none !stroke-current stroke-[2.5]" />
        </button>
        <button
          onClick={() => {
            setProvinceView({ lat: INITIAL_MAP_STATE.center[0], lng: INITIAL_MAP_STATE.center[1], zoom: INITIAL_MAP_STATE.zoom });
            setFocusCoordinates(null);
          }}
          className="w-8 h-8 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-[#F5F5F7] transition-all flex items-center justify-center text-black hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#A5D8FF] focus-visible:outline-offset-2"
          title="Reset to Full Canada"
        >
          <Maximize2 className="w-4 h-4 !fill-none !stroke-current stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
});
