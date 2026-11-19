import { fetchWithDeadline, RequestTimeoutError } from "./request-deadline";
import { Store } from "@/lib/data";
import { getAuthHeaders, clearAdminSession } from "@/lib/auth";

export interface ApiStore {
  id: string; // Updated to string (UUID)
  name: string;
  // EGRESS OPTIMIZATION: description may be absent in lean API responses
  description?: string;
  products: string[];
  address: string;
  city: string;
  province: string;
  latitude: string | number;
  longitude: string | number;
  category: "food" | "clothes" | "other" | "retail";
  website?: string | null;
  // EGRESS OPTIMIZATION: image/images/email may be absent in lean API responses
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
    // EGRESS OPTIMIZATION: Graceful defaults for fields absent in lean response
    description: apiStore.description || "",
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
  try {
    const response = await fetch(`/api/locations`);

    if (!response.ok) {
      throw new Error("Failed to fetch stores: " + response.statusText);
    }

    const json = await response.json();

    // Handle both { data: [...] } (new format) and direct [...] (old format) for compatibility
    const data: ApiStore[] = json.data || (Array.isArray(json) ? json : []);

    return data.map(apiStoreToStore);
  } catch (error) {
    console.error("getApprovedStores Error:", error);
    return []; // Return empty array to prevent crash
  }
}

export async function getStoreImages(id: string): Promise<{ image: string | null; images: string[] | null }> {
  try {
    const response = await fetch(`/api/locations/${id}/images`);
    if (!response.ok) {
      throw new Error(`Failed to fetch store images: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`getStoreImages Error for ${id}:`, error);
    return { image: null, images: null };
  }
}

export async function getAllStores(): Promise<Store[]> {
  const response = await fetch(`/api/admin/stores`, {
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

export class StoreSubmissionError extends Error {}

export async function createStore(store: {
  geocodingStatus?: "resolved" | "unresolved";
  x_k9m2?: string;
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
  try {
    return await fetchWithDeadline("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...store, latitude: String(store.latitude), longitude: String(store.longitude) }),
    }, 15000, async response => {
      // Empty, HTML and malformed JSON error bodies still get a useful status message.
      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { /* handled below */ }
      if (!response.ok) {
        let message = `We couldn't submit your store (HTTP ${response.status}). Your details are still here. Please try again later.`;
        if (response.status === 400) {
          const fields = data?.fields && typeof data.fields === "object"
            ? Object.values(data.fields).flat().filter(value => typeof value === "string").join(". ") : "";
          message = fields ? `Please check your details: ${fields}`
            : /spam/i.test(data?.error || "") ? "Your submission was flagged as spam. Please review the store details and remove promotional text."
            : "We couldn't accept these details. Please check the store information and products before submitting again.";
        } else if (response.status === 409) {
          message = "This store has already been submitted. It may be awaiting review; you don't need to submit it again.";
        } else if (response.status === 429) {
          message = "Too many submissions. Please wait a few minutes before trying again. Your details are still here.";
        } else if (response.status >= 500) {
          message = "The server couldn't complete your submission. Please try again later. Your details are still here.";
        }
        throw new StoreSubmissionError(message);
      }
      if (!data || typeof data.id !== "string" || !data.id) {
        throw new StoreSubmissionError("The server returned an unexpected response. We couldn't confirm whether your store was saved. Please check before submitting again.");
      }
      return apiStoreToStore(data);
    });
  } catch (error) {
    if (error instanceof StoreSubmissionError) throw error;
    if (error instanceof RequestTimeoutError) {
      throw new StoreSubmissionError("Your submission timed out. We couldn't confirm whether your store was saved. Please check before submitting again; your details are still here.");
    }
    throw new StoreSubmissionError("We couldn't reach the server or read its response. Check your connection or content blocker. We couldn't confirm whether your store was saved; please check before submitting again. Your details are still here.");
  }
}

export interface EditSuggestionChanges {
  name: string;
  description: string;
  products: string[];
  address: string;
  city: string;
  province: string;
  latitude: string;
  longitude: string;
  category: string;
  website?: string | null;
  email?: string | null;
}

export interface EditSuggestion {
  id: string;
  storeId: string;
  storeName: string;
  changes: EditSuggestionChanges;
  submitterEmail?: string | null;
  status: string;
  createdAt: string;
}

export async function suggestStoreEdit(storeId: string, store: {
  geocodingStatus?: "resolved" | "unresolved";
  x_k9m2?: string;
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
  email?: string;
}): Promise<void> {
  try {
    await fetchWithDeadline(`/api/stores/${storeId}/suggest-edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...store, latitude: String(store.latitude), longitude: String(store.longitude) }),
    }, 15000, async response => {
      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { /* handled below */ }
      if (!response.ok) {
        let message = `We couldn't submit your changes (HTTP ${response.status}). Your details are still here. Please try again later.`;
        if (response.status === 400) {
          const fields = data?.fields && typeof data.fields === "object"
            ? Object.values(data.fields).flat().filter(value => typeof value === "string").join(". ") : "";
          message = fields ? `Please check your details: ${fields}`
            : /spam/i.test(data?.error || "") ? "Your submission was flagged as spam. Please review the details and remove promotional text."
            : "We couldn't accept these details. Please check the information and products before submitting again.";
        } else if (response.status === 404) {
          message = "This store is no longer listed, so changes can't be suggested for it.";
        } else if (response.status === 429) {
          message = "Too many submissions. Please wait a few minutes before trying again. Your details are still here.";
        } else if (response.status >= 500) {
          message = "The server couldn't complete your submission. Please try again later. Your details are still here.";
        }
        throw new StoreSubmissionError(message);
      }
      if (!data || data.ok !== true) {
        throw new StoreSubmissionError("The server returned an unexpected response. We couldn't confirm whether your changes were saved. Please check before submitting again.");
      }
      return undefined;
    });
  } catch (error) {
    if (error instanceof StoreSubmissionError) throw error;
    if (error instanceof RequestTimeoutError) {
      throw new StoreSubmissionError("Your submission timed out. We couldn't confirm whether your changes were saved. Please check before submitting again; your details are still here.");
    }
    throw new StoreSubmissionError("We couldn't reach the server or read its response. Check your connection or content blocker. We couldn't confirm whether your changes were saved; please check before submitting again. Your details are still here.");
  }
}

export async function getEditSuggestions(): Promise<EditSuggestion[]> {
  const response = await fetch(`/api/admin/edit-suggestions`, {
    headers: getAuthHeaders(),
  });
  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) throw new Error("Failed to fetch edit suggestions");
  return response.json();
}

export async function approveEditSuggestion(id: string): Promise<Store> {
  const response = await fetch(`/api/admin/edit-suggestions/${id}/approve`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to approve edit suggestion");
  }
  const data: ApiStore = await response.json();
  return apiStoreToStore(data);
}

export async function rejectEditSuggestion(id: string): Promise<void> {
  const response = await fetch(`/api/admin/edit-suggestions/${id}/reject`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to reject edit suggestion");
  }
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
  city?: string;
  province?: string;
  latitude?: number | string;
  longitude?: number | string;
  deletionRequestedAt?: string | null;
  deletionRequestEmail?: string | null;
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
