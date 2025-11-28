import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';

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
    map.flyTo(center, 13, { duration: 2 });
  }, [center, map]);
  return null;
}

interface InteractiveMapProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
}

export function InteractiveMap({ stores, selectedStore, onSelectStore }: InteractiveMapProps) {
  // Default center: Canada (roughly)
  const defaultCenter: [number, number] = [56.1304, -106.3468];
  const defaultZoom = 4;

  return (
    <div className="w-full h-full bg-slate-100 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {stores.map((store) => (
          <Marker 
            key={store.id} 
            position={store.coordinates}
            icon={createFlagIcon(selectedStore?.id === store.id)}
            eventHandlers={{
              click: () => onSelectStore(store),
            }}
          />
        ))}
        
        {selectedStore && (
          <MapController center={selectedStore.coordinates} />
        )}
      </MapContainer>

      {/* Mobile Overlay Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/10 to-transparent pointer-events-none md:hidden" />
    </div>
  );
}
