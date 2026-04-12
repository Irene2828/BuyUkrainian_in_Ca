import React, { useState, forwardRef, useImperativeHandle, useEffect, useMemo, useRef } from 'react';
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Map, Marker, useMap, MapCameraChangedEvent, useApiLoadingStatus, APILoadingStatus } from '@vis.gl/react-google-maps';
import { Store } from '@/lib/data';
import { Plus, Minus, Maximize2, Navigation, Info, RefreshCw, MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StoreCard } from '@/components/store-card';
import { getBrandedMapPinSize, getBrandedMapPinSvg } from '@/lib/branded-map-pin';
import { cn } from '@/lib/utils';

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

const CANADA_CENTER: [number, number] = [52.0, -94.0];
const INITIAL_MAP_STATE = { center: CANADA_CENTER, zoom: 4.2 };
const HERO_INITIAL_MAP_STATE = {
  center: { lat: 48.7, lng: -84.0 },
  zoom: 3.9,
};
const MAX_CLUSTER_FOCUS_ZOOM = 12;
const CLUSTER_CLICK_ZOOM_STEP = 5;
const CLUSTER_TIGHT_SPAN = 0.08;
const UNRESOLVED_CANADA_CENTER = { lat: 56.1304, lng: -106.3468 };
const UNRESOLVED_COORD_TOLERANCE = 0.05;
const MAP_TOOLTIP_CONTENT_CLASSNAME = "border-0 bg-white/60 px-4 py-2 text-[12px] font-medium tracking-wide text-[#0A2540] shadow-[0_8px_32px_rgba(10,37,64,0.08)] backdrop-blur-md";
const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "").trim();

const isValidCoord = (lat: number | null, lng: number | null) =>
  lat !== null && lng !== null &&
  lat !== 0 && lng !== 0 &&
  lat >= 42 && lat <= 84 &&   // Canada latitude bounds
  lng >= -141 && lng <= -52;  // Canada longitude bounds

const isLikelyFallbackStoreLocation = (store: Store) => {
  if (!store.coordinates) return false;

  const [lat, lng] = store.coordinates;
  const city = store.city.trim().toLowerCase();
  const province = store.province.trim().toLowerCase();

  return (
    (city === "unknown" || province === "unknown") &&
    Math.abs(lat - UNRESOLVED_CANADA_CENTER.lat) <= UNRESOLVED_COORD_TOLERANCE &&
    Math.abs(lng - UNRESOLVED_CANADA_CENTER.lng) <= UNRESOLVED_COORD_TOLERANCE
  );
};

const canRenderStoreMarker = (store: Store) => {
  if (!store.coordinates) return false;

  const [lat, lng] = store.coordinates;
  return isValidCoord(lat, lng) && !isLikelyFallbackStoreLocation(store);
};

const getMarkerPosition = (marker: any) => {
  const position = marker.getPosition();
  if (!position) return null;

  const lat = position.lat();
  const lng = position.lng();

  return isValidCoord(lat, lng) ? { lat, lng } : null;
};

const getClusterPosition = (cluster: any) => {
  const position = cluster?.position;
  if (!position) return null;

  const lat = typeof position.lat === "function" ? position.lat() : position.lat;
  const lng = typeof position.lng === "function" ? position.lng() : position.lng;

  return isValidCoord(lat, lng) ? { lat, lng } : null;
};

const getEventPosition = (event: any) => {
  const position = event?.latLng;
  if (!position) return null;

  const lat = typeof position.lat === "function" ? position.lat() : position.lat;
  const lng = typeof position.lng === "function" ? position.lng() : position.lng;

  return isValidCoord(lat, lng) ? { lat, lng } : null;
};

const buildMarkerIcon = (svg: string, variant: "default" | "active" | "cluster") => {
  const { width, height } = getBrandedMapPinSize(variant);

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
    scaledSize: new (window as any).google.maps.Size(width, height),
    anchor: new (window as any).google.maps.Point(width / 2, height),
  };
};

const focusClusterOnMarkers = (map: any, cluster: any, event?: any) => {
  const clickedPosition = getEventPosition(event);
  const currentZoom = typeof map.getZoom === "function" ? map.getZoom() ?? 4 : 4;

  // Always trust the point the user actually clicked first.
  // This keeps Calgary clicks centered on Calgary even if the cluster
  // contains a stray marker farther away.
  if (clickedPosition) {
    map.panTo(clickedPosition);
    map.setZoom(Math.min(currentZoom + CLUSTER_CLICK_ZOOM_STEP, MAX_CLUSTER_FOCUS_ZOOM));
    return;
  }

  const clusterMarkers = Array.isArray(cluster?.markers) ? cluster.markers : [];
  const positions: Array<{ lat: number; lng: number }> = clusterMarkers
    .map((marker: any) => getMarkerPosition(marker))
    .filter((position: { lat: number; lng: number } | null): position is { lat: number; lng: number } => position !== null);

  if (positions.length === 0) {
    const clusterPosition = getClusterPosition(cluster);

    if (!clusterPosition) return;

    map.panTo(clusterPosition);
    map.setZoom(Math.min(currentZoom + CLUSTER_CLICK_ZOOM_STEP, MAX_CLUSTER_FOCUS_ZOOM));
    return;
  }

  if (positions.length === 1) {
    map.panTo(positions[0]);
    map.setZoom(MAX_CLUSTER_FOCUS_ZOOM);
    return;
  }

  const bounds = new (window as any).google.maps.LatLngBounds();
  let minLat = positions[0].lat;
  let maxLat = positions[0].lat;
  let minLng = positions[0].lng;
  let maxLng = positions[0].lng;

  positions.forEach((position: { lat: number; lng: number }) => {
    bounds.extend(position);
    minLat = Math.min(minLat, position.lat);
    maxLat = Math.max(maxLat, position.lat);
    minLng = Math.min(minLng, position.lng);
    maxLng = Math.max(maxLng, position.lng);
  });

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;

  if (latSpan < CLUSTER_TIGHT_SPAN && lngSpan < CLUSTER_TIGHT_SPAN) {
    map.panTo(bounds.getCenter());
    map.setZoom(MAX_CLUSTER_FOCUS_ZOOM);
    return;
  }

  (window as any).google.maps.event.addListenerOnce(map, "idle", () => {
    const nextZoom = map.getZoom();
    if (typeof nextZoom === "number" && nextZoom > MAX_CLUSTER_FOCUS_ZOOM) {
      map.setZoom(MAX_CLUSTER_FOCUS_ZOOM);
    }
  });

  map.fitBounds(bounds, 72);
};

interface MapControlButtonProps {
  label: string;
  ariaLabel: string;
  onClick?: () => void;
  children: React.ReactNode;
}

function MapControlButton({ label, ariaLabel, onClick, children }: MapControlButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className="flex h-10 w-10 items-center justify-center text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          aria-label={ariaLabel}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="left"
        sideOffset={16}
        className={MAP_TOOLTIP_CONTENT_CLASSNAME}
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
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
  variant?: "default" | "full" | "hero";
}

const FULL_MAP_BASE_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: 'water', stylers: [{ color: '#c8dff0' }] },
  { featureType: 'landscape.natural', stylers: [{ color: '#ffffff' }] },
  { featureType: 'landscape.man_made', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#b0c4d8' }, { weight: 1 }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#c8d8e8' }, { weight: 0.5 }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f0f4f8' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const FULL_MAP_NO_LABELS: google.maps.MapTypeStyle[] = [
  ...FULL_MAP_BASE_STYLE,
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const FULL_MAP_WITH_LABELS: google.maps.MapTypeStyle[] = [
  ...FULL_MAP_BASE_STYLE,
];

const HERO_MAP_STYLE = [
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', stylers: [{ color: '#c8dff0' }] },
  { featureType: 'landscape.natural', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#b0c4d8' }, { weight: 1 }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#c8d8e8' }, { weight: 0.5 }] },
];

export const InteractiveMap = forwardRef<InteractiveMapRef, InteractiveMapProps>(({
  stores,
  selectedStore,
  onSelectStore,
  onCloseStore,
  userLocation,
  isMobile,
  variant = "default"
}, ref) => {
  const apiLoadingStatus = useApiLoadingStatus();
  const mapRef = useMap("main-map");
  const [zoom, setZoom] = useState(variant === 'hero' ? HERO_INITIAL_MAP_STATE.zoom : INITIAL_MAP_STATE.zoom);
  const [center, setCenter] = useState(variant === 'hero' ? HERO_INITIAL_MAP_STATE.center : { lat: CANADA_CENTER[0], lng: CANADA_CENTER[1] });
  const [hoveredLabel, setHoveredLabel] = useState<{ text: string, x: number, y: number } | null>(null);
  const mapSurfaceState = useMemo(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      return {
        kind: "unavailable" as const,
        title: variant === "hero" ? "Map preview unavailable" : "Map unavailable right now",
        description: variant === "hero"
          ? "This page was built without the Google Maps connection for the preview."
          : "This deployment is missing the Google Maps connection, so the store map cannot render yet.",
      };
    }

    if (apiLoadingStatus === APILoadingStatus.AUTH_FAILURE) {
      return {
        kind: "unavailable" as const,
        title: variant === "hero" ? "Map preview blocked" : "Map blocked for this site address",
        description: variant === "hero"
          ? "Google Maps rejected the current site address for this preview."
          : "Google Maps rejected this deployment URL. The API key likely needs this domain added to its allowed referrers.",
      };
    }

    if (apiLoadingStatus === APILoadingStatus.FAILED) {
      return {
        kind: "unavailable" as const,
        title: variant === "hero" ? "Map preview unavailable" : "Map couldn't load",
        description: variant === "hero"
          ? "The preview couldn't finish loading the Google map."
          : "Google Maps did not finish loading for this page. Store data is still available, but the map canvas couldn't start.",
      };
    }

    if (
      apiLoadingStatus === APILoadingStatus.NOT_LOADED ||
      apiLoadingStatus === APILoadingStatus.LOADING
    ) {
      return {
        kind: "loading" as const,
        title: variant === "hero" ? "Loading map preview" : "Loading map",
        description: variant === "hero"
          ? "Bringing the store map into view."
          : "Fetching the Google Maps layer for the latest store view.",
      };
    }

    return { kind: "ready" as const };
  }, [apiLoadingStatus, variant]);

  if (mapSurfaceState.kind !== "ready") {
    return (
      <MapSurfaceState
        variant={variant}
        title={mapSurfaceState.title}
        description={mapSurfaceState.description}
        isLoading={mapSurfaceState.kind === "loading"}
      />
    );
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredLabel) {
      setHoveredLabel(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    }
  };

  useEffect(() => {
    if (!mapRef || variant === 'hero') return;

    const applyZoomStyle = () => {
      const currentZoom = mapRef.getZoom() ?? 4;
      mapRef.setOptions({
        styles: currentZoom <= 5 ? FULL_MAP_NO_LABELS : FULL_MAP_WITH_LABELS
      });
    };

    applyZoomStyle();

    const zoomChangedListener = mapRef.addListener('zoom_changed', applyZoomStyle);

    return () => {
      zoomChangedListener.remove();
    };
  }, [mapRef, variant]);

  useEffect(() => {
    if (variant !== 'hero') return;

    setZoom(HERO_INITIAL_MAP_STATE.zoom);
    setCenter(HERO_INITIAL_MAP_STATE.center);
  }, [variant]);

  useImperativeHandle(ref, () => ({
    focusOnStore: (store: Store) => {
      if (!mapRef || !store.coordinates || !canRenderStoreMarker(store)) return;
      const [lat, lng] = store.coordinates;
      if (!isValidCoord(lat, lng)) {
        console.warn('Store has invalid coordinates:', store.name);
        return;
      }
      mapRef.panTo({ lat, lng });
      mapRef.setZoom(14);
    },
    flyToProvince: (lat: number, lng: number, z: number) => {
      if (!mapRef || !isValidCoord(lat, lng)) return;
      mapRef.panTo({ lat, lng });
      mapRef.setZoom(z);
    },
    flyToLocation: (lat: number, lng: number, z: number = 16) => {
      if (!mapRef || !isValidCoord(lat, lng)) return;
      mapRef.panTo({ lat, lng });
      mapRef.setZoom(z);
    },
    resetView: () => {
      if (!mapRef) return;
      mapRef.panTo({ lat: CANADA_CENTER[0], lng: CANADA_CENTER[1] });
      mapRef.setZoom(INITIAL_MAP_STATE.zoom);
    },
    zenView: () => {},
    zoomIn: () => {
      if (mapRef) mapRef.setZoom(mapRef.getZoom()! + 1);
    },
    zoomOut: () => {
      if (mapRef) mapRef.setZoom(mapRef.getZoom()! - 1);
    },
    invalidateSize: () => {
      if (mapRef) (window as any).google.maps.event.trigger(mapRef, 'resize');
    }
  }));

  const handleCameraChange = (ev: MapCameraChangedEvent) => {
    setZoom(ev.detail.zoom);
    setCenter(ev.detail.center);
  };

  const isDimmed = (selected: boolean) => selectedStore !== null && !selected;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8, ease: "easeInOut" }} 
      className="w-full h-full relative z-0 overflow-hidden bg-white passport-map-container antialiased border-none outline-none"
      onMouseMove={handleMouseMove}
    >

      <Map
        id="main-map"
        defaultCenter={center}
        defaultZoom={zoom}
        disableDefaultUI={true}
        gestureHandling="cooperative"
        minZoom={variant === 'hero' ? 3.5 : 4}
        restriction={variant === 'hero' ? {
          latLngBounds: {
            north: 84.0,
            south: 41.5,
            east: -50.0,
            west: -145.0
          },
          strictBounds: true
        } : {
          latLngBounds: {
            north: 83.5, // Top of Canada
            south: 41.5, // US Border
            east: -50.0, // East Coast
            west: -142.0 // West Coast
          },
          strictBounds: true
        }}
        options={{
          maxZoom: variant === 'hero' ? zoom : 18,
          minZoom: variant === 'hero' ? zoom : 4,
          draggable: variant !== 'hero',
          scrollwheel: false,
          gestureHandling: 'cooperative',
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          disableDoubleClickZoom: variant === 'hero',
          clickableIcons: false,
          styles: variant === 'hero' ? HERO_MAP_STYLE : FULL_MAP_NO_LABELS,
        }}
        onCameraChanged={handleCameraChange}
        onClick={() => {
           if (variant !== 'hero') onCloseStore();
        }}
      >
        {(() => {
          // Grouping logic for markers to be clustered
          // We'll use a useEffect below to manage the actual clustering
          return null;
        })()}

        <MarkersClusterer 
          stores={stores} 
          map={mapRef} 
          onSelectStore={onSelectStore} 
          selectedStore={selectedStore} 
          setHoveredLabel={setHoveredLabel}
          variant={variant}
        />

        {userLocation && (
          <Marker 
            position={{ lat: userLocation[0], lng: userLocation[1] }} 
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='6' fill='%233b82f6' stroke='white' stroke-width='2'/%3E%3C/svg%3E`,
              scaledSize: new (window as any).google.maps.Size(16, 16),
              anchor: new (window as any).google.maps.Point(8, 8),
            }}
          />
        )}
      </Map>

      {/* Floating UI Elements */}
      {selectedStore && !isMobile && variant !== "hero" && (
        <div className="absolute left-6 top-[88px] bottom-8 z-[1000] w-auto flex items-center animate-in slide-in-from-left-4 fade-in duration-300 pointer-events-none">
          <div className="pointer-events-auto">
            <StoreCard
              store={selectedStore}
              onClose={onCloseStore}
              onSeeOnMap={(s) => {
                if (mapRef && s.coordinates) {
                  const [lat, lng] = s.coordinates;
                  if (isValidCoord(lat, lng)) {
                    mapRef.panTo({ lat, lng });
                    mapRef.setZoom(14);
                  } else {
                    console.warn('Store has invalid coordinates:', s.name);
                  }
                }
              }}
              variant="map"
            />
          </div>
        </div>
      )}

      {variant !== "hero" && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center gap-6 pointer-events-none">
          <TooltipProvider delayDuration={120}>
            <div className="flex flex-col items-center bg-white/85 backdrop-blur-2xl shadow-[0_8px_30px_rgba(10,37,64,0.08)] rounded-full border-0 overflow-hidden pointer-events-auto">
              <MapControlButton
                label="Locate me"
                ariaLabel="Center on my location"
                onClick={() => window.dispatchEvent(new CustomEvent('locateMe'))}
              >
                <Navigation className="w-4 h-4 stroke-[2.5] fill-none" />
              </MapControlButton>

              <div className="w-6 h-[1px] bg-zinc-100" />

              <MapControlButton
                label="Zoom in"
                ariaLabel="Zoom in map"
                onClick={() => {
                  if (mapRef) mapRef.setZoom(mapRef.getZoom()! + 1);
                }}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </MapControlButton>

              <div className="w-6 h-[1px] bg-zinc-100" />

              <MapControlButton
                label="Zoom out"
                ariaLabel="Zoom out map"
                onClick={() => {
                  if (mapRef) mapRef.setZoom(mapRef.getZoom()! - 1);
                }}
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </MapControlButton>

              <div className="w-6 h-[1px] bg-zinc-100" />

              <MapControlButton
                label="Zoom to all Canada"
                ariaLabel="Reset to national view"
                onClick={() => {
                  if (mapRef) {
                    mapRef.panTo({ lat: CANADA_CENTER[0], lng: CANADA_CENTER[1] });
                    mapRef.setZoom(INITIAL_MAP_STATE.zoom);
                  }
                }}
              >
                <Maximize2 className="w-4 h-4 stroke-[2.5]" />
              </MapControlButton>
            </div>
          </TooltipProvider>

        </div>
      )}

      {/* Premium Frosted Tooltip */}
      {hoveredLabel && typeof document !== "undefined" && createPortal(
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="fixed z-[9999] pointer-events-none px-4 py-2 rounded-lg bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
          style={{
            left: hoveredLabel.x,
            top: hoveredLabel.y - 50,
            transform: 'translateX(-50%)'
          }}
        >
          <span className="text-[14px] font-semibold text-[#0057B7] whitespace-nowrap tracking-tight">
            {hoveredLabel.text}
          </span>
        </motion.div>,
        document.body
      )}
    </motion.div>
  );
});

// Custom Marker Clusterer Component
function MarkersClusterer({ stores, map, onSelectStore, selectedStore, setHoveredLabel, variant }: any) {
  const clusterer = useRef<any>(null);
  const markers = useRef<any[]>([]);

  const isDimmed = (id: string) => selectedStore !== null && selectedStore.id !== id;

  // Custom Renderer for a premium, clean look
  const renderer = useMemo(() => ({
    render: ({ count, position }: any) => {
      const svg = getBrandedMapPinSvg({ variant: "cluster", count });
      const countLabel = "More than 1 store in the area";
      
      const marker = new (window as any).google.maps.Marker({
        position,
        icon: buildMarkerIcon(svg, "cluster"),
        label: "",
      });

      marker.addListener('mouseover', (e: any) => {
        setHoveredLabel({ text: countLabel, x: e.domEvent.clientX, y: e.domEvent.clientY });
      });

      marker.addListener('mouseout', () => {
        setHoveredLabel(null);
      });

      return marker;
    }
  }), [setHoveredLabel, variant]);

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current && (window as any).markerClusterer) {
      clusterer.current = new (window as any).markerClusterer.MarkerClusterer({
        map,
        renderer,
        onClusterClick: (event: any, cluster: any, map: any) => {
          event?.stop?.();
          event?.domEvent?.stopPropagation?.();
          focusClusterOnMarkers(map, cluster, event);
        }
      });
    }
  }, [map, renderer]);

  useEffect(() => {
    if (!clusterer.current || !map) return;

    // Remove old markers
    markers.current.forEach(m => m.setMap(null));
    clusterer.current.clearMarkers();

    // Create new markers
    markers.current = stores
      .filter((store: Store) => canRenderStoreMarker(store))
      .map((store: Store) => {
      const isSelected = selectedStore?.id === store.id;
      const dimmed = isDimmed(store.id);
      const defaultVariant: "default" | "active" = isSelected ? "active" : "default";
      const defaultSvg = getBrandedMapPinSvg({
        variant: defaultVariant,
        dimmed: dimmed && !isSelected,
      });
      const hoverSvg = getBrandedMapPinSvg({
        variant: "active",
        dimmed: false,
      });
      const defaultIcon = buildMarkerIcon(defaultSvg, defaultVariant);
      const hoverIcon = buildMarkerIcon(hoverSvg, "active");

      const marker = new (window as any).google.maps.Marker({
        position: { lat: store.coordinates[0], lng: store.coordinates[1] },
        icon: defaultIcon,
        zIndex: isSelected ? 1000 : dimmed ? 10 : 100,
      });

      marker.addListener('click', () => onSelectStore(store));
      
      marker.addListener('mouseover', (e: any) => {
        marker.setIcon(hoverIcon);
        marker.setZIndex(1000);
        setHoveredLabel({ text: store.name, x: e.domEvent.clientX, y: e.domEvent.clientY });
      });

      marker.addListener('mouseout', () => {
        marker.setIcon(defaultIcon);
        marker.setZIndex(isSelected ? 1000 : dimmed ? 10 : 100);
        setHoveredLabel(null);
      });

      return marker;
    });

    clusterer.current.addMarkers(markers.current);

    return () => {
      if (clusterer.current) clusterer.current.clearMarkers();
      markers.current.forEach(m => m.setMap(null));
    };
  }, [stores, map, selectedStore, onSelectStore, setHoveredLabel, variant]);

  return null;
}

interface MapSurfaceStateProps {
  variant: "default" | "full" | "hero";
  title: string;
  description: string;
  isLoading?: boolean;
}

function MapSurfaceState({
  variant,
  title,
  description,
  isLoading = false,
}: MapSurfaceStateProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "relative flex h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.55),_transparent_44%),linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)]",
        isHero ? "items-end justify-end" : "items-center justify-center"
      )}
    >
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(135deg,rgba(0,87,183,0.08),transparent_40%,rgba(255,215,0,0.18)_100%)]" />
      <div
        className={cn(
          "relative z-10 pointer-events-auto rounded-[28px] border border-white/80 bg-white/88 shadow-[0_24px_80px_rgba(10,37,64,0.12)] backdrop-blur-xl",
          isHero ? "m-8 max-w-[360px] p-6" : "mx-6 max-w-[560px] p-8 text-center"
        )}
      >
        <div
          className={cn(
            "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#0057B7]/10 bg-[#EFF6FF] text-[#0057B7]",
            isLoading && "bg-white"
          )}
        >
          {isLoading ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
        </div>

        <h3
          className={cn(
            "font-['Lora'] tracking-[-0.01em] text-[#0A2540]",
            isHero ? "text-[1.55rem] leading-tight" : "text-[1.8rem] leading-tight"
          )}
        >
          {title}
        </h3>

        <p
          className={cn(
            "mt-3 font-['Inter'] text-slate-500",
            isHero ? "max-w-[28ch] text-[14px] leading-6" : "mx-auto max-w-[46ch] text-[15px] leading-7"
          )}
        >
          {description}
        </p>

        {!isLoading && (
          <p
            className={cn(
              "mt-4 font-['Inter'] text-slate-400",
              isHero ? "text-[12px] leading-5" : "text-[13px] leading-6"
            )}
          >
            Store listings are still available even when the map canvas is not.
          </p>
        )}
      </div>
    </div>
  );
}

InteractiveMap.displayName = "InteractiveMap";

export default InteractiveMap;
