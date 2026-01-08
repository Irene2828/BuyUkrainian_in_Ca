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
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const CANADA_BOUNDS: L.LatLngBoundsExpression = [
  [41.67, -141.03],
  [83.11, -52.62]
];

const CANADA_CENTER: [number, number] = [56.1304, -106.3468];

// Unified Blue/Yellow Pin Marker
const createUnifiedMarker = (isSelected: boolean) => {
  return L.divIcon({
    className: 'unified-marker-icon',
    html: `
      <div class="marker-container ${isSelected ? 'selected' : ''}">
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

// ScrollWheelZoomController: Enables zoom only after user clicks on map
function ScrollWheelZoomController({ isMapFocused }: { isMapFocused: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (isMapFocused) {
      map.scrollWheelZoom.enable();
    } else {
      map.scrollWheelZoom.disable();
    }
  }, [isMapFocused, map]);

  return null;
}

function MapController({
  focusCoordinates,
  provinceView,
  onFlightStart,
  onFlightEnd
}: {
  focusCoordinates: [number, number] | null;
  provinceView: { lat: number, lng: number, zoom: number } | null;
  onFlightStart?: () => void;
  onFlightEnd?: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusCoordinates) {
      if (onFlightStart) onFlightStart();
      map.flyTo(focusCoordinates, 15, {
        duration: 2.2,
        easeLinearity: 0.25,
        animate: true
      });
      const timer = setTimeout(() => {
        if (onFlightEnd) onFlightEnd();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [focusCoordinates, map]);

  useEffect(() => {
    if (provinceView) {
      // Skip flight if we're already at the center of Canada at zoom 4 (initial load stability)
      const isCanadaReset = provinceView.lat === CANADA_CENTER[0] &&
        provinceView.lng === CANADA_CENTER[1] &&
        provinceView.zoom === 4;

      if (isCanadaReset && map.getZoom() === 4) return;

      if (onFlightStart) onFlightStart();
      map.flyTo([provinceView.lat, provinceView.lng], provinceView.zoom, {
        duration: 2.2,
        easeLinearity: 0.25,
        animate: true,
        padding: [50, 50]
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
  const [provinceView, setProvinceView] = useState<{ lat: number, lng: number, zoom: number } | null>(null);
  const [isMapFocused, setIsMapFocused] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useImperativeHandle(ref, () => ({
    focusOnStore: (store: Store) => {
      if (store.coordinates) {
        setFocusCoordinates(store.coordinates as [number, number]);
        setProvinceView(null);
        setIsMapFocused(true); // Enable zoom when programmatically focusing
      }
    },
    flyToProvince: (lat: number, lng: number, zoom: number) => {
      setProvinceView({ lat, lng, zoom });
      setFocusCoordinates(null);
      setIsMapFocused(true); // Enable zoom when programmatically flying
    },
    resetView: () => {
      setProvinceView({ lat: CANADA_CENTER[0], lng: CANADA_CENTER[1], zoom: 4 });
      setFocusCoordinates(null);
      setIsMapFocused(true); // Enable zoom when resetting view
    },
    zoomIn: () => {
      if (mapRef.current) {
        setIsMapFocused(true); // Enable zoom when using controls
        mapRef.current.zoomIn();
      }
    },
    zoomOut: () => {
      if (mapRef.current) {
        setIsMapFocused(true); // Enable zoom when using controls
        mapRef.current.zoomOut();
      }
    }
  }), []);



  return (
    <div
      className="w-full h-full relative z-0 overflow-hidden rounded-[var(--radius-brand)] bg-[#D4E7F5] passport-map-container"
    >
      <MapContainer
        center={CANADA_CENTER}
        zoom={4}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom={false}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        bounceAtZoomLimits={true}
        maxBounds={CANADA_BOUNDS}
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

        {/* Scroll Wheel Zoom Controller */}
        <ScrollWheelZoomController isMapFocused={isMapFocused} />

        <MapController
          focusCoordinates={focusCoordinates}
          provinceView={provinceView}
          onFlightStart={() => onFlightChange?.(true)}
          onFlightEnd={() => onFlightChange?.(false)}
        />

        {/* Click handler to enable scroll wheel zoom - DISABLED pointer-events to allow marker clicks */}
        <div
          onClick={() => setIsMapFocused(true)}
          className="absolute inset-0 z-[400] pointer-events-none"
          style={{ background: 'transparent' }}
        />

        {stores.map((store) => (
          store.coordinates && isWithinCanada(store.coordinates[0], store.coordinates[1]) && (
            <Marker
              key={store.id}
              position={store.coordinates as [number, number]}
              icon={createUnifiedMarker(selectedStore?.id === store.id)}
              eventHandlers={{
                click: () => {
                  onSelectStore(store);
                  setIsMapFocused(true);
                }
              }}
            />
          )
        ))}

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

      {/* Centered Store Card Popup via Dialog */}
      <Dialog open={!!selectedStore} onOpenChange={(open) => !open && onCloseStore()}>
        <DialogContent className="max-w-[400px] p-0 border-none bg-transparent shadow-none" hideClose>
          {selectedStore && (
            <StoreCard
              store={selectedStore}
              onClose={onCloseStore}
              onSeeOnMap={(s) => {
                onCloseStore();
                mapRef.current?.flyTo(s.coordinates as [number, number], 15);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Airbnb-style Floating Navigation Controls - Right Side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => {
            setIsMapFocused(true);
            mapRef.current?.zoomIn();
          }}
          className="w-8 h-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center text-black hover:scale-105 border border-gray-200"
          title="Zoom In"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={() => {
            setIsMapFocused(true);
            mapRef.current?.zoomOut();
          }}
          className="w-8 h-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center text-black hover:scale-105 border border-gray-200"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={() => {
            setIsMapFocused(true);
            setProvinceView({ lat: CANADA_CENTER[0], lng: CANADA_CENTER[1], zoom: 4 });
            setFocusCoordinates(null);
          }}
          className="w-8 h-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center text-black hover:scale-105 border border-gray-200"
          title="Reset to Full Canada"
        >
          <Maximize2 className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
});
