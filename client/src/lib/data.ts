import { MapPin, ShoppingBag, Coffee, Book, Shirt, Utensils } from "lucide-react";

export interface Store {
  id: string;
  name: string;
  description: string;
  products: string[];
  address: string;
  city: string;
  province: string;
  coordinates: [number, number];
  category: "food" | "clothes" | "other" | "retail";
  image?: string;
  images?: string[];
  email?: string;
  website?: string;
  status: "approved" | "pending" | "rejected";
  createdAt?: string;
  deletionRequestedAt?: string | null;
  deletionRequestEmail?: string | null;
}

// EGRESS OPTIMIZATION: Reduced image dimensions from w=800 to w=400 and quality from q=80 to q=60
// These thumbnails display at ~200-300px max — 800px was wasteful, saving ~60% per image
export const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=60&w=400", // Shoes (Index 0)
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=60&w=400", // Soccer ball (Index 1)
  "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=60&w=400", // Wine (Index 2)
  "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&q=60&w=400", // Sweets (Index 3)
  "https://images.unsplash.com/photo-1616687472097-47b744421689?auto=format&fit=crop&q=60&w=400", // Embroidery (Index 4)
  "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=60&w=400", // Bread (Index 5)
  "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=60&w=400", // Varenyky (Index 6)
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=60&w=400", // Food spread (Index 7)
];

// Helper to get a rotated placeholder image based on index
export const getPlaceholderImage = (index: number): string => {
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
};

export const INITIAL_STORES: Store[] = [];

export interface StoreCategory {
  id: string;
  label: string;
}

export const STORE_CATEGORIES: StoreCategory[] = [
  { id: "food", label: "Food" },
  { id: "clothes", label: "Clothes" },
  { id: "gifts", label: "Gifts" },
  { id: "toys", label: "Toys" },
  { id: "grocery", label: "Grocery" },
  { id: "books", label: "Books" },
  { id: "souvenirs", label: "Souvenirs" },
  { id: "beauty", label: "Beauty" },
  { id: "retail", label: "Retail" },
  { id: "other", label: "Other" },
];
