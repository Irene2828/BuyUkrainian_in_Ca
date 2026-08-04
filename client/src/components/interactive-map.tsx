import React, { useState, forwardRef, useImperativeHandle, useEffect, useMemo, useRef } from 'react';
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Map, Marker, useMap, MapCameraChangedEvent, useApiLoadingStatus, APILoadingStatus } from '@vis.gl/react-google-maps';
import { Store } from '@/lib/data';
import { Plus, Minus, Maximize2, Navigation, Info, RefreshCw, MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StoreCard } from '@/components/store-card';
import { getBrandedMapPinSize, getBrandedMapPinSvg, type BrandedMapPinVariant } from '@/lib/branded-map-pin';
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

const FULL_MAP_INITIAL_CENTER: [number, number] = [52.5, -95.0];
const INITIAL_MAP_STATE = { center: FULL_MAP_INITIAL_CENTER, zoom: 4.15 };
const HERO_INITIAL_MAP_STATE = {
  center: { lat: 51.5, lng: -123.0 },
  zoom: 4.4,
};
const MAX_CLUSTER_FOCUS_ZOOM = 18;
const CLUSTER_CLICK_ZOOM_STEP = 5;
const CLUSTER_TIGHT_SPAN = 0.08;
const UNRESOLVED_CANADA_CENTER = { lat: 56.1304, lng: -106.3468 };
const UNRESOLVED_COORD_TOLERANCE = 0.05;
const MAP_TOOLTIP_CONTENT_CLASSNAME = "border-0 bg-white/60 px-4 py-2 text-[12px] font-medium tracking-wide text-[#0A2540] shadow-[0_8px_32px_rgba(10,37,64,0.08)] backdrop-blur-md";
const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "").trim();

const PROVINCE_LABELS = [
  { name: "BC", lat: 53.7, lng: -125.0, top: "58%", left: "10%" },
  { name: "AB", lat: 52.3, lng: -114.5, top: "62%", left: "20%" },
  { name: "SK", lat: 51.8, lng: -105.8, top: "64%", left: "30%" },
  { name: "MB", lat: 51.0, lng: -97.0,  top: "66%", left: "40%" },
  { name: "ON", lat: 48.0, lng: -85.0,  top: "74%", left: "55%" },
  { name: "QC", lat: 51.5, lng: -71.5,  top: "64%", left: "70%" },
  { name: "NB", lat: 46.5, lng: -66.3,  top: "80%", left: "77%" },
  { name: "NS", lat: 45.0, lng: -63.0,  top: "84%", left: "81%" },
  { name: "NL", lat: 53.5, lng: -60.0,  top: "58%", left: "84%" },
  { name: "YT", lat: 63.5, lng: -135.0, top: "38%", left: "12%" },
  { name: "NT", lat: 64.0, lng: -119.0, top: "38%", left: "24%" },
  { name: "NU", lat: 64.0, lng: -95.0,  top: "36%", left: "46%" },
];

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

const getMapScreenPosition = (map: any, position: any) => {
  const projection = map?.getProjection?.();
  const bounds = map?.getBounds?.();
  const mapDiv = map?.getDiv?.();
  const zoom = map?.getZoom?.();

  if (!projection || !bounds || !mapDiv || typeof zoom !== "number" || !position) {
    return null;
  }

  const lat = typeof position.lat === "function" ? position.lat() : position.lat;
  const lng = typeof position.lng === "function" ? position.lng() : position.lng;

  if (!isValidCoord(lat, lng)) return null;

  const northEast = projection.fromLatLngToPoint(bounds.getNorthEast());
  const southWest = projection.fromLatLngToPoint(bounds.getSouthWest());
  const point = projection.fromLatLngToPoint(
    new (window as any).google.maps.LatLng(lat, lng)
  );
  const scale = 2 ** zoom;
  const rect = mapDiv.getBoundingClientRect();

  return {
    x: rect.left + (point.x - southWest.x) * scale,
    y: rect.top + (point.y - northEast.y) * scale,
  };
};

const getEventPosition = (event: any) => {
  const position = event?.latLng;
  if (!position) return null;

  const lat = typeof position.lat === "function" ? position.lat() : position.lat;
  const lng = typeof position.lng === "function" ? position.lng() : position.lng;

  return isValidCoord(lat, lng) ? { lat, lng } : null;
};

const buildMarkerIcon = (svg: string, variant: BrandedMapPinVariant, scale: number = 1) => {
  const { width, height } = getBrandedMapPinSize(variant);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  
  // Classic map pin coordinate tip is always anchored at y = 32 inside the 42x42 canvas
  const anchorY = 32 * scale;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
    scaledSize: new (window as any).google.maps.Size(scaledWidth, scaledHeight),
    anchor: new (window as any).google.maps.Point(scaledWidth / 2, anchorY),
  };
};

const focusClusterOnMarkers = (
  map: any, 
  cluster: any, 
  event: any, 
  setZoomState: (z: number) => void, 
  setCenterState: (c: {lat: number, lng: number}) => void
) => {
  const currentZoom = typeof map?.getZoom === "function" ? map.getZoom() ?? 4 : 4;
  let targetPosition = null;

  // Attempt 1: Use the cached cluster.position property provided natively by Google Maps V2+
  if (cluster && cluster.position) {
    targetPosition = {
      lat: typeof cluster.position.lat === "function" ? cluster.position.lat() : cluster.position.lat,
      lng: typeof cluster.position.lng === "function" ? cluster.position.lng() : cluster.position.lng
    };
  }
  // Attempt 2: Guaranteed fallback - lock onto the first raw marker actually assigned to this cluster
  else if (cluster && cluster.markers && cluster.markers.length > 0) {
    const firstMarker = cluster.markers[0];
    const pos = firstMarker.getPosition ? firstMarker.getPosition() : firstMarker.position;
    if (pos) {
      targetPosition = {
        lat: typeof pos.lat === "function" ? pos.lat() : pos.lat,
        lng: typeof pos.lng === "function" ? pos.lng() : pos.lng
      };
    }
  }

  // Update React state for internal logic
  if (targetPosition && isValidCoord(targetPosition.lat, targetPosition.lng)) {
    const targetZoom = Math.min(currentZoom + CLUSTER_CLICK_ZOOM_STEP, MAX_CLUSTER_FOCUS_ZOOM);
    setZoomState(targetZoom);
    setCenterState(targetPosition);
    
    // Also imperatively update the map since it uses defaultCenter/defaultZoom now
    if (map && typeof map.setZoom === 'function') map.setZoom(targetZoom);
    if (map && typeof map.panTo === 'function') map.panTo(targetPosition);
  }
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
          className="flex h-10 w-10 items-center justify-center text-slate-500 transition-all hover:bg-black/10 hover:text-slate-900 active:scale-95"
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

const FULL_MAP_BASE_STYLE: any[] = [
  { featureType: 'water', stylers: [{ color: '#c8dff0' }] },
  { featureType: 'landscape.natural', stylers: [{ color: '#ffffff' }] },
  { featureType: 'landscape.man_made', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#b0c4d8' }, { weight: 1 }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#c8d8e8' }, { weight: 0.5 }] },
  { featureType: 'administrative.province', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e8eff7' }] },
];

const FULL_MAP_NO_LABELS: any[] = [
  ...FULL_MAP_BASE_STYLE,
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const FULL_MAP_CITY_LABELS: any[] = [
  ...FULL_MAP_BASE_STYLE,
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 2 }] },
];

const FULL_MAP_STREET_LABELS: any[] = [
  ...FULL_MAP_BASE_STYLE,
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 3 }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 3 }] },
];

const HERO_MAP_STYLE = [
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', stylers: [{ color: '#c8dff0' }] },
  { featureType: 'landscape.natural', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#b0c4d8' }, { weight: 1 }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#c8d8e8' }, { weight: 0.5 }] },
];

function ProvinceLabelsOverlay({ isNationalZoom, variant }: { isNationalZoom: boolean; variant?: string }) {
  const map = useMap();
  const [positions, setPositions] = useState<{ [key: string]: { top: string; left: string } }>({});

  useEffect(() => {
    if (!map || variant === 'hero') return;

    const updatePositions = () => {
      const projection = map.getProjection();
      const bounds = map.getBounds();
      const mapDiv = map.getDiv();
      const currentZoom = map.getZoom();

      if (!projection || !bounds || !mapDiv || typeof currentZoom !== "number") return;

      const rect = mapDiv.getBoundingClientRect();
      const newPos: { [key: string]: { top: string; left: string } } = {};

      PROVINCE_LABELS.forEach((label) => {
        const point = projection.fromLatLngToPoint(
          new (window as any).google.maps.LatLng(label.lat, label.lng)
        );
        const centerPoint = projection.fromLatLngToPoint(map.getCenter()!);
        if (!point || !centerPoint) return;

        const scale = Math.pow(2, currentZoom);
        const x = (point.x - centerPoint.x) * scale + rect.width / 2;
        const y = (point.y - centerPoint.y) * scale + rect.height / 2;

        newPos[label.name] = {
          left: `${x}px`,
          top: `${y}px`,
        };
      });

      setPositions(newPos);
    };

    updatePositions();

    const listener = map.addListener("bounds_changed", updatePositions);
    return () => {
      listener.remove();
    };
  }, [map, variant]);

  if (variant === 'hero') return null;

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none z-[5] hidden md:block transition-opacity duration-700 ease-in-out",
        isNationalZoom ? "opacity-100" : "opacity-0"
      )}
    >
      {PROVINCE_LABELS.map((label) => {
        const pos = positions[label.name] || { top: label.top, left: label.left };
        return (
          <span
            key={label.name}
            className="absolute text-[12px] md:text-[14px] font-bold tracking-[0.4em] text-[#0057B7]/30 uppercase whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 font-sans antialiased transition-all duration-150"
            style={{ top: pos.top, left: pos.left }}
          >
            {label.name}
          </span>
        );
      })}
    </div>
  );
}

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
  const [center, setCenter] = useState(
    variant === 'hero'
      ? HERO_INITIAL_MAP_STATE.center
      : { lat: FULL_MAP_INITIAL_CENTER[0], lng: FULL_MAP_INITIAL_CENTER[1] }
  );
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

  // All hooks MUST be called before any early return (React Rules of Hooks)
  useEffect(() => {
    if (selectedStore) {
      setHoveredLabel(null);
    }
  }, [selectedStore]);

  useEffect(() => {
    if (!mapRef || variant === 'hero') return;

    const applyZoomStyle = () => {
      const currentZoom = mapRef.getZoom() ?? 4;
      let targetStyle = FULL_MAP_NO_LABELS;
      if (currentZoom >= 12) {
        targetStyle = FULL_MAP_STREET_LABELS;
      } else if (currentZoom > 5) {
        targetStyle = FULL_MAP_CITY_LABELS;
      }
      mapRef.setOptions({
        styles: targetStyle
      });
    };

    applyZoomStyle();

    const zoomChangedListener = mapRef.addListener('zoom_changed', applyZoomStyle);

    return () => {
      zoomChangedListener.remove();
    };
  }, [mapRef, variant, isMobile]);

  useEffect(() => {
    if (variant !== 'hero') return;

    setZoom(HERO_INITIAL_MAP_STATE.zoom);
    setCenter(HERO_INITIAL_MAP_STATE.center);
    if (mapRef) {
      mapRef.setZoom(HERO_INITIAL_MAP_STATE.zoom);
      mapRef.panTo(HERO_INITIAL_MAP_STATE.center);
    }
  }, [mapRef, variant]);

  useImperativeHandle(ref, () => ({
    focusOnStore: (store: Store) => {
      if (!store.coordinates || !canRenderStoreMarker(store)) return;
      const [lat, lng] = store.coordinates;
      if (!isValidCoord(lat, lng)) {
        console.warn('Store has invalid coordinates:', store.name);
        return;
      }
      setZoom(17);
      setCenter({ lat, lng });
      if (mapRef) {
        mapRef.setZoom(17);
        mapRef.panTo({ lat, lng });
        
        // Offset on mobile so marker isn't hidden under the bottom sheet
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
           setTimeout(() => {
               mapRef.panBy(0, 140);
           }, 100);
        }
      }
    },
    flyToProvince: (lat: number, lng: number, z: number) => {
      if (!isValidCoord(lat, lng)) return;
      setZoom(z);
      setCenter({ lat, lng });
      if (mapRef) {
        mapRef.setZoom(z);
        mapRef.panTo({ lat, lng });
      }
    },
    flyToLocation: (lat: number, lng: number, z: number = 16) => {
      if (!isValidCoord(lat, lng)) return;
      setZoom(z);
      setCenter({ lat, lng });
      if (mapRef) {
        mapRef.setZoom(z);
        mapRef.panTo({ lat, lng });
      }
    },
    resetView: () => {
      setZoom(INITIAL_MAP_STATE.zoom);
      setCenter({ lat: FULL_MAP_INITIAL_CENTER[0], lng: FULL_MAP_INITIAL_CENTER[1] });
      if (mapRef) {
        mapRef.setZoom(INITIAL_MAP_STATE.zoom);
        mapRef.panTo({ lat: FULL_MAP_INITIAL_CENTER[0], lng: FULL_MAP_INITIAL_CENTER[1] });
      }
    },
    zenView: () => {},
    zoomIn: () => {
      setZoom(prev => {
        const next = typeof prev === 'number' ? prev + 1 : prev;
        if (mapRef && typeof next === 'number') mapRef.setZoom(next);
        return next;
      });
    },
    zoomOut: () => {
      setZoom(prev => {
        const next = typeof prev === 'number' ? prev - 1 : prev;
        if (mapRef && typeof next === 'number') mapRef.setZoom(next);
        return next;
      });
    },
    invalidateSize: () => {
      if (mapRef) (window as any).google.maps.event.trigger(mapRef, 'resize');
    }
  }));

  // Early return AFTER all hooks have been called
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
    if (selectedStore) return;

    if (hoveredLabel) {
      setHoveredLabel(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    }
  };

  const handleCameraChange = (ev: MapCameraChangedEvent) => {
    setZoom(ev.detail.zoom);
    setCenter(ev.detail.center);
  };

  const isDimmed = (selected: boolean) => selectedStore !== null && !selected;
  const isNationalZoom = zoom <= 5.5;

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
          draggable: true,
          scrollwheel: false,
          gestureHandling: "cooperative",
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
           if ((window as any).__isMarkerClick) return;
           if (variant !== 'hero') {
             setHoveredLabel(null);
             onCloseStore();
           }
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
          setZoomState={setZoom}
          setCenterState={setCenter}
          zoom={zoom}
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
        <ProvinceLabelsOverlay isNationalZoom={isNationalZoom} variant={variant} />
      </Map>



      {variant !== "hero" && (
        <div className="absolute inset-0 z-[1000] pointer-events-none">
          <div className="boutique-width mx-auto h-full relative">
            <div className="absolute right-[clamp(1.5rem,5vw,4rem)] min-[1440px]:right-[2.5rem] top-4 pt-2 flex flex-col items-end pointer-events-none">
              <TooltipProvider delayDuration={120}>
                <div className="flex flex-col items-center bg-white shadow-xl rounded-none border border-slate-300 overflow-hidden pointer-events-auto w-[42px] min-[1441px]:w-[46px]">
                  <MapControlButton
                    label="Zoom in"
                    ariaLabel="Zoom in map"
                    onClick={() => {
                      setZoom(prev => {
                        const next = typeof prev === 'number' ? prev + 1 : prev;
                        if (mapRef && typeof next === 'number') mapRef.setZoom(next);
                        return next;
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5] text-[#00387b]" />
                  </MapControlButton>

                  <div className="w-full h-[1px] bg-[#0057B7]/20" />

                  <MapControlButton
                    label="Zoom out"
                    ariaLabel="Zoom out map"
                    onClick={() => {
                      setZoom(prev => {
                        const next = typeof prev === 'number' ? prev - 1 : prev;
                        if (mapRef && typeof next === 'number') mapRef.setZoom(next);
                        return next;
                      });
                    }}
                  >
                    <Minus className="w-4 h-4 stroke-[2.5] text-[#00387b]" />
                  </MapControlButton>

                  <div className="w-full h-[1px] bg-[#0057B7]/20" />

                  <MapControlButton
                    label="Zoom to all Canada"
                    ariaLabel="Reset to national view"
                    onClick={() => {
                      setZoom(INITIAL_MAP_STATE.zoom);
                      setCenter({ lat: FULL_MAP_INITIAL_CENTER[0], lng: FULL_MAP_INITIAL_CENTER[1] });
                      if (mapRef) {
                        mapRef.setZoom(INITIAL_MAP_STATE.zoom);
                        mapRef.panTo({ lat: FULL_MAP_INITIAL_CENTER[0], lng: FULL_MAP_INITIAL_CENTER[1] });
                      }
                    }}
                  >
                    <Maximize2 className="w-4 h-4 stroke-[2.5] text-[#00387b]" />
                  </MapControlButton>

                  <div className="w-full h-[1px] bg-[#0057B7]/20" />

                  <MapControlButton
                    label="Locate me"
                    ariaLabel="Center on my location"
                    onClick={() => window.dispatchEvent(new CustomEvent('locateMe'))}
                  >
                    <Navigation className="w-4 h-4 stroke-[2.5] fill-none text-[#00387b]" />
                  </MapControlButton>
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}

      {/* Premium Frosted Tooltip */}
      {!selectedStore && hoveredLabel && typeof document !== "undefined" && createPortal(
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="fixed z-[9999] pointer-events-none px-3 py-1.5 rounded-[12px] bg-white backdrop-blur-xl shadow-[0_8px_24px_rgba(10,37,64,0.12)]"
          style={{
            left: hoveredLabel.x,
            top: hoveredLabel.y - 50,
            transform: 'translateX(-50%)'
          }}
        >
          <span className="text-[12px] font-medium text-slate-500 tabular-nums font-sans whitespace-nowrap">
            {hoveredLabel.text}
          </span>
        </motion.div>,
        document.body
      )}
    </motion.div>
  );
});

// Custom Marker Clusterer Component
function MarkersClusterer({ stores, map, onSelectStore, selectedStore, setHoveredLabel, variant, setZoomState, setCenterState, zoom }: any) {
  const clusterer = useRef<any>(null);
  const markersMap = useRef<Map<string, any>>(new globalThis.Map());
  const hasAnimatedEntrance = useRef(false);
  const hasShownHeroHoverHint = useRef(false);

  // Keep refs for callbacks and selectedStore to avoid stale closures in event listeners
  const callbacks = useRef({ onSelectStore, setHoveredLabel, selectedStore, variant, scale: 1 });

  // 30% larger pins when zoomed out (zoom <= 5.5) on the main map page
  const isZoomedOut = variant !== 'hero' && zoom <= 5.5;
  const scale = isZoomedOut ? 1.3 : 1;

  useEffect(() => {
    callbacks.current = { onSelectStore, setHoveredLabel, selectedStore, variant, scale };
  }, [onSelectStore, setHoveredLabel, selectedStore, variant, scale]);

  // Custom Renderer for a premium, clean look
  const renderer = useMemo(() => ({
    render: ({ count, position }: any) => {
      const countLabel = "More than 1 store in the area";
      const defaultSvg = getBrandedMapPinSvg({ variant: "cluster", count });
      const hoverSvg = getBrandedMapPinSvg({ variant: "cluster", count, hovered: true });
      
      const marker = new (window as any).google.maps.Marker({
        position,
        icon: buildMarkerIcon(defaultSvg, "cluster", scale),
        label: "",
      });

      marker.addListener('mouseover', (e: any) => {
        (window as any).__hasInteractedWithMapPins = true;
        if (callbacks.current.selectedStore) return;
        callbacks.current.setHoveredLabel({ text: countLabel, x: e.domEvent.clientX, y: e.domEvent.clientY });
      });

      marker.addListener('mouseout', () => {
        callbacks.current.setHoveredLabel(null);
      });

      return marker;
    }
  }), [scale]);

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current && (window as any).markerClusterer) {
      clusterer.current = new (window as any).markerClusterer.MarkerClusterer({
        map,
        renderer,
        onClusterClick: (...args: any[]) => {
          if (callbacks.current.variant === 'hero') return false;
          
          // Detect if we're using v2+ (single object with {event, cluster, map}) or v1 (event, cluster, map)
          const isV2 = args[0] && !!args[0].cluster && !!args[0].map;
          
          const event = isV2 ? args[0].event : args[0];
          const cluster = isV2 ? args[0].cluster : args[1];
          const clusterMap = isV2 ? args[0].map : (args[2] || map);

          if (event) {
            if (typeof event.stop === 'function') event.stop();
            if (typeof event.stopPropagation === 'function') event.stopPropagation();
            if (typeof event.preventDefault === 'function') event.preventDefault();
            if (event.domEvent && typeof event.domEvent.stopPropagation === 'function') event.domEvent.stopPropagation();
            if (event.domEvent && typeof event.domEvent.preventDefault === 'function') event.domEvent.preventDefault();
          }

          focusClusterOnMarkers(clusterMap, cluster, event, setZoomState, setCenterState);
          return false; // Crucial for MarkerClusterer v2 to prevent its default fitBounds
        }
      });
    } else if (clusterer.current) {
      if (typeof clusterer.current.setRenderer === 'function') {
        clusterer.current.setRenderer(renderer);
      } else {
        clusterer.current.renderer = renderer;
      }
      
      if (typeof clusterer.current.render === 'function') {
        clusterer.current.render();
      } else if (typeof clusterer.current.repaint === 'function') {
        clusterer.current.repaint();
      }
    }
  }, [map, renderer, setZoomState, setCenterState]);

  // Handle marker creation based ONLY on stores array changing
  useEffect(() => {
    if (!clusterer.current || !map) return;

    // Remove old markers
    Array.from(markersMap.current.values()).forEach((m: any) => m.setMap(null));
    clusterer.current.clearMarkers();
    markersMap.current.clear();

    const newMarkers: any[] = [];
    
    stores
      .filter((store: Store) => canRenderStoreMarker(store))
      .forEach((store: Store) => {
        const { selectedStore, variant, scale } = callbacks.current;
        const isSelected = selectedStore?.id === store.id;
        const dimmed = selectedStore !== null && selectedStore.id !== store.id;
        const defaultVariant = isSelected ? "selected" : "default";
        
        const defaultSvg = getBrandedMapPinSvg({
          variant: defaultVariant,
          dimmed: dimmed && !isSelected,
        });
        const defaultIcon = buildMarkerIcon(defaultSvg, defaultVariant, scale);

        const marker = new (window as any).google.maps.Marker({
          position: { lat: store.coordinates![0], lng: store.coordinates![1] },
          icon: defaultIcon,
          zIndex: isSelected ? 1000 : dimmed ? 10 : 100,
          animation: null,
          opacity: (!hasAnimatedEntrance.current && variant === 'hero') ? 0 : 1,
        });

        marker.addListener('click', (e: any) => {
          (window as any).__isMarkerClick = true;
          setTimeout(() => { (window as any).__isMarkerClick = false; }, 300);
          
          if (e) {
            if (typeof e.stop === 'function') e.stop();
            if (e.domEvent && typeof e.domEvent.stopPropagation === 'function') e.domEvent.stopPropagation();
          }
          if (callbacks.current.variant === 'hero') return;
          callbacks.current.setHoveredLabel(null);
          callbacks.current.onSelectStore(store);
        });
        
         marker.addListener('mouseover', (e: any) => {
          (window as any).__hasInteractedWithMapPins = true;
          if (callbacks.current.selectedStore) return;
          callbacks.current.setHoveredLabel({ text: store.name, x: e.domEvent.clientX, y: e.domEvent.clientY });
        });

        marker.addListener('mouseout', () => {
          callbacks.current.setHoveredLabel(null);
        });

        markersMap.current.set(store.id, marker);
        newMarkers.push(marker);
      });

    // Staggered fade-in arrival for hero variant
    if (!hasAnimatedEntrance.current && callbacks.current.variant === 'hero') {
      const STAGGER_MS = 60;
      newMarkers.forEach((marker, i) => {
        const delay = i * STAGGER_MS;
        setTimeout(() => {
          requestAnimationFrame(() => {
            marker.setOpacity(1);
            clusterer.current?.addMarker(marker);
          });
        }, delay);
      });
      hasAnimatedEntrance.current = true;
    } else {
      clusterer.current.addMarkers(newMarkers);
    }

    return () => {
      if (clusterer.current) clusterer.current.clearMarkers();
      Array.from(markersMap.current.values()).forEach((m: any) => m.setMap(null));
      markersMap.current.clear();
    };
  }, [stores, map]);

  // Handle marker styling when selectedStore or scale changes without recreating markers
  useEffect(() => {
    if (markersMap.current.size === 0) return;
    
    markersMap.current.forEach((marker, storeId) => {
      const isSelected = selectedStore?.id === storeId;
      const dimmed = selectedStore !== null && selectedStore.id !== storeId;
      
      const defaultVariant = isSelected ? "selected" : "default";
      const defaultSvg = getBrandedMapPinSvg({
        variant: defaultVariant,
        dimmed: dimmed && !isSelected,
      });
      const defaultIcon = buildMarkerIcon(defaultSvg, defaultVariant, scale);
      
      marker.setIcon(defaultIcon);
      marker.setZIndex(isSelected ? 1000 : dimmed ? 10 : 100);
    });
  }, [selectedStore, scale]);

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

  if (isLoading) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-slate-50/50 backdrop-blur-[2px] transition-opacity duration-300">
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/95 shadow-[0_8px_30px_rgba(10,37,64,0.08)] border border-slate-200/80">
          <div className="w-4 h-4 border-2 border-[#0057B7]/25 border-t-[#0057B7] rounded-full animate-spin shrink-0" />
          <div className="flex items-center gap-1.5 px-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0057B7] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#0057B7] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#0057B7] animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

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
            "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#0057B7]/10 bg-[#EFF6FF] text-[#0057B7]"
          )}
        >
          <MapPin className="h-5 w-5" />
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
            "mt-3 font-sans text-slate-500",
            isHero ? "max-w-[28ch] text-[14px] leading-6" : "mx-auto max-w-[46ch] text-[15px] leading-7"
          )}
        >
          {description}
        </p>

        <p
          className={cn(
            "mt-4 font-sans text-slate-400",
            isHero ? "text-[12px] leading-5" : "text-[13px] leading-6"
          )}
        >
          Store listings are still available even when the map canvas is not.
        </p>
      </div>
    </div>
  );
}

InteractiveMap.displayName = "InteractiveMap";

export default InteractiveMap;
