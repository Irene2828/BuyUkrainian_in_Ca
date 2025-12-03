import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Store } from '@/lib/data';

// Fix Leaflet icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Flag Icon using L.DivIcon
const createFlagIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div class="relative group transition-transform duration-300 ${isSelected ? 'scale-125 z-50' : 'scale-100 hover:scale-110 z-10'}">
        <div class="w-8 h-8 rounded-full shadow-lg border-2 border-white overflow-hidden relative transform transition-all duration-300">
          <div class="absolute top-0 left-0 w-full h-1/2 bg-[#1E90FF]"></div>
          <div class="absolute bottom-0 left-0 w-full h-1/2 bg-[#FFD700]"></div>
        </div>
        ${isSelected ? '<div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 shadow-sm"></div>' : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    // Only fly if coordinates are valid numbers
    if (Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      if (center[0] > 40 && center[0] < 85 && center[1] > -140 && center[1] < -50) {
        map.flyTo(center, 13, { duration: 2 });
      }
    }
  }, [center, map]);
  return null;
}

function CanadaBounds() {
  const map = useMap();
  useEffect(() => {
    const canadaBounds = L.latLngBounds(
      [41.7, -141.0],
      [84.0, -52.6]
    );
    map.setMaxBounds(canadaBounds);
    map.fitBounds(canadaBounds, { padding: [50, 50] });
  }, [map]);
  
  return null;
}

function MarkerClusterGroup({ stores, selectedStore, onSelectStore }: {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  const hasValidCoordinates = (coords: any) => {
    if (!Array.isArray(coords) || coords.length !== 2) return false;
    const lat = parseFloat(String(coords[0]));
    const lng = parseFloat(String(coords[1]));
    return !isNaN(lat) && !isNaN(lng) && lat > 40 && lat < 85 && lng > -140 && lng < -50;
  };

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-accent/80 border-3 border-yellow-accent text-white font-bold text-sm shadow-lg">${count}</div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(40, 40),
        });
      }
    });

    stores.forEach((store) => {
      if (hasValidCoordinates(store.coordinates)) {
        const marker = L.marker(store.coordinates as [number, number], {
          icon: createFlagIcon(selectedStore?.id === store.id)
        });
        marker.on('click', () => onSelectStore(store));
        cluster.addLayer(marker);
      }
    });

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
      }
    };
  }, [stores, selectedStore, map, onSelectStore]);

  return null;
}

function ResetViewButton({ onReset }: { onReset: () => void }) {
  const map = useMap();
  
  const handleReset = () => {
    const canadaBounds = L.latLngBounds(
      [41.7, -141.0],
      [84.0, -52.6]
    );
    map.fitBounds(canadaBounds, { padding: [20, 20] });
    onReset();
  };
  
  return (
    <button
      onClick={handleReset}
      className="absolute top-3 right-3 z-[1000] bg-white dark:bg-gray-800 shadow-lg rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center gap-2 transition-colors"
      data-testid="button-reset-canada-view"
      title="Show all of Canada"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
        <path d="M8 11h6"/>
      </svg>
      Full Canada
    </button>
  );
}

function FocusOnStore({ coordinates }: { coordinates: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates[0] && coordinates[1]) {
      map.flyTo(coordinates, 14, { duration: 1.5 });
    }
  }, [coordinates, map]);
  return null;
}

interface InteractiveMapProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
  userLocation?: [number, number] | null;
  focusStore?: Store | null;
  onResetView?: () => void;
}

export function InteractiveMap({ stores, selectedStore, onSelectStore, userLocation, focusStore, onResetView }: InteractiveMapProps) {
  const defaultCenter: [number, number] = [56.1304, -106.3468];
  const defaultZoom = 4;

  const hasValidCoordinates = (coords: any) => {
    if (!Array.isArray(coords) || coords.length !== 2) return false;
    const lat = parseFloat(String(coords[0]));
    const lng = parseFloat(String(coords[1]));
    return !isNaN(lat) && !isNaN(lng) && lat > 40 && lat < 85 && lng > -140 && lng < -50;
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true} 
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        className="w-full h-full"
        zoomControl={true}
        maxZoom={18}
        minZoom={3}
      >
        <CanadaBounds />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MarkerClusterGroup 
          stores={stores}
          selectedStore={selectedStore}
          onSelectStore={onSelectStore}
        />
        
        {userLocation && hasValidCoordinates(userLocation) && (
          <>
            <Circle
              center={userLocation}
              radius={1000}
              pathOptions={{
                color: '#1E90FF',
                fillColor: '#1E90FF',
                fillOpacity: 0.15,
                weight: 2
              }}
            />
            <Marker
              position={userLocation}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: `<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            />
          </>
        )}
        
        {selectedStore && hasValidCoordinates(selectedStore.coordinates) && (
          <MapController center={selectedStore.coordinates as [number, number]} />
        )}
        
        {focusStore && hasValidCoordinates(focusStore.coordinates) && (
          <FocusOnStore coordinates={focusStore.coordinates as [number, number]} />
        )}
        
        <ResetViewButton onReset={onResetView || (() => {})} />
      </MapContainer>
    </div>
  );
}
