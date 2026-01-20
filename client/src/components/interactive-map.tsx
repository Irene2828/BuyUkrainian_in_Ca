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
// Full Canada View - Coast to Coast - SOVEREIGN VIEW LOCK
const INITIAL_MAP_STATE = {
  center: [56.13, -106.35] as [number, number],
  zoom: 3.5
} as const; /* DO NOT REMOVE: SOVEREIGN VIEW LOCK */

const CANADA_CENTER: [number, number] = INITIAL_MAP_STATE.center;

// Unified Blue/Yellow Pin Marker with Dimming Support
const createUnifiedMarker = (isSelected: boolean, isAnySelected: boolean) => {
  const isDimmed = isAnySelected && !isSelected;
  return L.divIcon({
    className: 'unified-marker-icon',
    html: `
      <div class="marker-container ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}">
        <div class="marker-pin-top"></div>
        <div class="marker-pin-bottom"></div>
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

      // Default to Mechanical Zoom (0.45s) if no config provided
      const duration = flyConfig?.duration || 0.45;
      const padding = flyConfig?.padding || [0, 0];

      const targetZoom = flyConfig?.zoom || 16;

      // The Glide & Curve (Obsidian Silk)
      // Note: Leaflet flyTo does not support custom easing functions directly.
      // We use easeLinearity: 0.25 to approximate the requested "Obsidian Curve" (Cubic ease-in-out).
      map.flyTo(focusCoordinates, targetZoom, {
        duration: duration,
        easeLinearity: 0.25, // Curve factor (lower is more curved)
        animate: true
        // padding options removed as they are not supported in flyTo ZoomPanOptions
      });

      const timer = setTimeout(() => {
        if (onFlightEnd) onFlightEnd();
      }, duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [focusCoordinates, map, flyConfig]);

  useEffect(() => {
    if (provinceView) {
      // Skip flight if we're already at the center of Canada at zoom 3 (initial load stability)
      const isCanadaReset = provinceView.lat === CANADA_CENTER[0] &&
        provinceView.lng === CANADA_CENTER[1] &&
        provinceView.zoom === 3;

      if (isCanadaReset && map.getZoom() === 3) return;

      if (onFlightStart) onFlightStart();

      // The Reveal (Cinematic Zoom-Out)
      // "Slow-Start" implied by the long duration and curve
      map.flyTo([provinceView.lat, provinceView.lng], provinceView.zoom, {
        duration: 2.2,
        easeLinearity: 0.25,
        animate: true
      });
      const timer = setTimeout(() => {
        if (onFlightEnd) onFlightEnd();
      }, 2200);
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
                <div style="width: 100%; height: 50%; background: #3C93EA;"></div>
                <div style="width: 100%; height: 50%; background: #F3FF0A;"></div>
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.4); font-family: var(--font-ui); font-size: ${fontSize};">
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

    // Duration 1.5s for a smoother, weighted feel as requested (Airbnb style)
    setFlyConfig({ duration: 1.5, padding, zoom });
    setFocusCoordinates([lat, lng]);
    setProvinceView(null);
  };

  useImperativeHandle(ref, () => ({
    focusOnStore: (store: Store) => {
      // Mechanical Zoom (Pin Click) - Stabilized
      if (store.coordinates) {
        setFlyConfig({ duration: 1.2, padding: [0, 0], zoom: 16 });
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
      // The Cinematic "Reveal" (Zoom-Out)
      // Center: [-98, 58], Zoom: 4.5, Duration: 2.2s
      setProvinceView({ lat: 58, lng: -98, zoom: 4.5 });
      setFocusCoordinates(null);
    },
    zoomIn: () => {
      if (mapRef.current) {
        mapRef.current.zoomIn();
      }
    },
    zoomOut: () => {
      if (mapRef.current) {
        mapRef.current.zoomOut();
      }
    }
  }), []);

  // Listen for "clearFilters" event to trigger the Reveal (Cinematic Zoom-Out)
  useEffect(() => {
    const handleClearFilters = () => {
      setProvinceView({ lat: 58, lng: -98, zoom: 4.5 });
      setFocusCoordinates(null);
    };

    window.addEventListener('clearFilters', handleClearFilters);
    return () => window.removeEventListener('clearFilters', handleClearFilters);
  }, []);

  return (
    <div
      className="w-full h-full relative z-0 overflow-hidden rounded-[var(--radius-brand)] bg-[#D4E7F5] passport-map-container animate-in fade-in duration-[1200ms] fill-mode-forwards"
    >
      <MapContainer
        center={CANADA_CENTER}
        zoom={INITIAL_MAP_STATE.zoom}
        minZoom={3.5}
        maxZoom={18}
        scrollWheelZoom={false}
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

        <div className="absolute bottom-1 right-2 z-[1000] text-[10px] text-gray-500 font-medium font-ui">
          © CARTO, © OpenStreetMap contributors
        </div>

        <MapController
          focusCoordinates={focusCoordinates}
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
              html: `<div class="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            })}
          />
        )}
      </MapContainer>

      {/* Side Panel Overlay - No more Dialog */}
      {selectedStore && (
        <div className="side-panel-container absolute bottom-4 left-4 right-4 md:top-[24px] md:bottom-auto md:left-auto md:right-[24px] md:w-[400px] z-[2000] animate-in fade-in slide-in-from-bottom-5 duration-500 delay-300 fill-mode-forwards shadow-[-10px_0_30px_rgba(0,0,0,0.05)] rounded-[32px] h-auto max-h-[85vh] md:max-h-[min(800px,calc(100vh-48px))] pointer-events-auto">
          <StoreCard
            store={selectedStore}
            onClose={() => {
              const panel = document.querySelector('.side-panel-container');
              if (panel) panel.classList.add('slide-out-to-right');
              setTimeout(() => {
                onCloseStore();
                // Trigger Cinematic Zoom-Out (The Reveal)
                setProvinceView({ lat: 58, lng: -98, zoom: 4.5 });
                setFocusCoordinates(null);
              }, 200); // Wait for anim
            }}
            onSeeOnMap={(s) => {
              // Zoom in effect
              triggerFlyToLocation(s.coordinates[0], s.coordinates[1], 14.5);
            }}
          />
        </div>
      )}

      {/* Airbnb-style Floating Navigation Controls - Right Side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => {
            mapRef.current?.zoomIn();
          }}
          className="w-8 h-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center text-black hover:scale-105 border border-gray-200"
          title="Zoom In"
        >
          <Plus className="w-4 h-4 !fill-none !stroke-current stroke-[2.5]" />
        </button>
        <button
          onClick={() => {
            mapRef.current?.zoomOut();
          }}
          className="w-8 h-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center text-black hover:scale-105 border border-gray-200"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4 !fill-none !stroke-current stroke-[2.5]" />
        </button>
        <button
          onClick={() => {
            setProvinceView({ lat: INITIAL_MAP_STATE.center[0], lng: INITIAL_MAP_STATE.center[1], zoom: INITIAL_MAP_STATE.zoom });
            setFocusCoordinates(null);
          }}
          className="w-8 h-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center text-black hover:scale-105 border border-gray-200"
          title="Reset to Full Canada"
        >
          <Maximize2 className="w-4 h-4 !fill-none !stroke-current stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
});
