import { Store } from "@/lib/data";

export interface ApiStore {
  id: number;
  name: string;
  description: string;
  products: string[];
  address: string;
  latitude: string | number;
  longitude: string | number;
  category: "retail" | "food" | "services" | "other";
  image?: string | null;
  status: "approved" | "pending" | "rejected";
  created_at?: string;
  createdAt?: string;
}

// Convert API store to frontend Store format
export function apiStoreToStore(apiStore: ApiStore): Store {
  const createdAtString = apiStore.created_at || apiStore.createdAt || new Date().toISOString();
  
  // Parse coordinates with validation
  let lat = parseFloat(String(apiStore.latitude));
  let lng = parseFloat(String(apiStore.longitude));
  
  // Validate coordinates are valid numbers and within reasonable range
  if (isNaN(lat) || isNaN(lng) || lat < 40 || lat > 85 || lng > -50 || lng < -140) {
    // Use Toronto as fallback if coordinates are invalid
    lat = 43.6532;
    lng = -79.3832;
  }
  
  return {
    id: apiStore.id.toString(),
    name: apiStore.name,
    description: apiStore.description,
    products: Array.isArray(apiStore.products) ? apiStore.products : [],
    address: apiStore.address,
    coordinates: [lat, lng],
    category: apiStore.category,
    image: apiStore.image || undefined,
    status: apiStore.status,
    createdAt: createdAtString,
  };
}

export async function getApprovedStores(): Promise<Store[]> {
  const response = await fetch("/api/stores");
  if (!response.ok) throw new Error("Failed to fetch stores");
  const data: ApiStore[] = await response.json();
  return data.map(apiStoreToStore);
}

export async function getAllStores(): Promise<Store[]> {
  const response = await fetch("/api/admin/stores");
  if (!response.ok) throw new Error("Failed to fetch all stores");
  const data: ApiStore[] = await response.json();
  return data.map(apiStoreToStore);
}

export async function createStore(store: {
  name: string;
  description: string;
  products: string[];
  address: string;
  latitude: number;
  longitude: number;
  category: "retail" | "food" | "services" | "other";
  image?: string;
}): Promise<Store> {
  const response = await fetch("/api/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...store,
      latitude: store.latitude.toString(),
      longitude: store.longitude.toString(),
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create store");
  }
  
  const data: ApiStore = await response.json();
  return apiStoreToStore(data);
}

export async function updateStoreStatus(id: number, status: "approved" | "rejected"): Promise<Store> {
  const response = await fetch(`/api/admin/stores/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update store status");
  }
  
  const data: ApiStore = await response.json();
  return apiStoreToStore(data);
}
