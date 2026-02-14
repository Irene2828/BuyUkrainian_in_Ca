import { Store } from "@/lib/data";
import { getAuthHeaders, clearAdminSession } from "@/lib/auth";

export interface ApiStore {
  id: string; // Updated to string (UUID)
  name: string;
  description: string;
  products: string[];
  address: string;
  city: string;
  province: string;
  latitude: string | number;
  longitude: string | number;
  category: "food" | "clothes" | "other" | "retail";
  website?: string | null;
  image?: string | null;
  images?: string[] | null;
  email?: string | null;
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
    city: apiStore.city,
    province: apiStore.province,
    coordinates: [lat, lng],
    category: apiStore.category,
    website: apiStore.website || undefined,
    image: apiStore.image || undefined,
    images: apiStore.images || (apiStore.image ? [apiStore.image] : []),
    status: apiStore.status,
    createdAt: createdAtString,
  };
}

export async function getApprovedStores(): Promise<Store[]> {
  // Updated endpoint to /api/index as requested by User to match their debug check
  console.log("Fetching stores from /api/index...");
  try {
    const response = await fetch(`/api/index?t=${Date.now()}`);
    console.log("Response status:", response.status);

    if (!response.ok) {
      const txt = await response.text();
      console.error("Fetch failed:", txt);
      throw new Error("Failed to fetch stores: " + response.statusText);
    }

    const json = await response.json();
    console.log("Raw JSON received:", json);

    // Handle both { data: [...] } (new format) and direct [...] (old format) for compatibility
    const data: ApiStore[] = json.data || (Array.isArray(json) ? json : []);
    console.log("Parsed data items:", data.length);

    return data.map(apiStoreToStore);
  } catch (error) {
    console.error("getApprovedStores Error:", error);
    return []; // Return empty array to prevent crash
  }
}

export async function getAllStores(): Promise<Store[]> {
  const response = await fetch(`/api/admin/stores?t=${Date.now()}`, {
    headers: getAuthHeaders(),
  });
  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) throw new Error("Failed to fetch all stores");
  const data: ApiStore[] = await response.json();
  return data.map(apiStoreToStore);
}

export async function createStore(store: {
  name: string;
  description: string;
  products: string[];
  address: string;
  city: string;
  province: string;
  latitude: number | string;
  longitude: number | string;
  category: "food" | "clothes" | "retail" | "other";
  website?: string;
  image?: string;
  images?: string[];
  email?: string;
}): Promise<Store> {
  // Updated endpoint to /api/locations as requested
  const response = await fetch("/api/locations", {
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

export async function deleteStore(id: string): Promise<boolean> {
  const response = await fetch(`/api/admin/stores/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete store");
  }

  return true;
}

export async function updateStoreStatus(id: string, status: "approved" | "rejected" | "pending"): Promise<Store> {
  const response = await fetch(`/api/admin/stores/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });

  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update store status");
  }

  const data: ApiStore = await response.json();
  return apiStoreToStore(data);
}

export async function updateStoreImages(id: string, images: string[]): Promise<Store> {
  const response = await fetch(`/api/admin/stores/${id}/images`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ images }),
  });

  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update store images");
  }

  const data: ApiStore = await response.json();
  return apiStoreToStore(data);
}

export async function updateStore(id: string, updates: {
  name?: string;
  address?: string;
  category?: string;
  website?: string;
  products?: string[];
  description?: string;
}): Promise<Store> {
  const response = await fetch(`/api/admin/stores/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });

  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update store");
  }

  const data: ApiStore = await response.json();
  return apiStoreToStore(data);
}

// Admin user types (kept ID as number as per storage.ts for now, assuming user only touches Location table)
export interface AdminUser {
  id: number;
  username: string;
  createdAt: string;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch("/api/admin/users", {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) throw new Error("Failed to fetch admin users");
  return response.json();
}

export async function createAdminUser(username: string, password: string): Promise<AdminUser> {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create admin user");
  }

  return response.json();
}

export async function updateAdminPassword(id: number, newPassword: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${id}/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ newPassword }),
  });

  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update password");
  }
}

export async function deleteAdminUser(id: number): Promise<void> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete admin user");
  }
}
