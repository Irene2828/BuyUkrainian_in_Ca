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
}

// Product placeholders - diverse variety
export const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800", // Shoes (Index 0)
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800", // Soccer ball (Index 1)
  "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800", // Wine (Index 2)
  "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&q=80&w=800", // Sweets (Index 3)
  "https://images.unsplash.com/photo-1616687472097-47b744421689?auto=format&fit=crop&q=80&w=800", // Embroidery (Index 4)
  "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800", // Bread (Index 5)
  "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=800", // Varenyky (Index 6)
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=800", // Food spread (Index 7)
];

// Helper to get a rotated placeholder image based on index
export const getPlaceholderImage = (index: number): string => {
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
};

// Mock data removed as we are now connecting to Supabase
export const INITIAL_STORES: Store[] = [];
