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

// Ukrainian food placeholder images - variety for realistic display
export const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800", // Fresh bread
  "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800", // Bakery items
  "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=800", // Dumplings/pierogies
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800", // Eastern European food
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=800", // Food spread
];

// Helper to get a rotated placeholder image based on index
export const getPlaceholderImage = (index: number): string => {
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
};

export const INITIAL_STORES: Store[] = [
  {
    id: "1",
    name: "Kozak Ukrainian Bakery",
    description: "Authentic Ukrainian breads, pastries, and comfort foods made from scratch.",
    products: ["Borsch", "Varenyky", "Sourdough Bread", "Coffee"],
    address: "5077 Victoria Dr, Vancouver, BC V5P 3T9",
    city: "Vancouver",
    province: "British Columbia",
    coordinates: [49.2333, -123.0667],
    category: "food",
    images: [PLACEHOLDER_IMAGES[0]],
    status: "approved",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Yummy Market",
    description: "European grocery store with a vast selection of Ukrainian imported goods.",
    products: ["Roshen Chocolates", "Kvas", "Buckwheat", "Preserves"],
    address: "1390 Major Mackenzie Dr W, Maple, ON L6A 4H6",
    city: "Maple",
    province: "Ontario",
    coordinates: [43.8755, -79.4964], // Toronto area
    category: "clothes",
    images: [PLACEHOLDER_IMAGES[1]],
    status: "approved",
    createdAt: "2024-02-20"
  },
  {
    id: "3",
    name: "Future Bakery",
    description: "Family-owned bakery serving traditional Eastern European recipes since 1991.",
    products: ["Rye Bread", "Poppy Seed Roll", "Cakes"],
    address: "106 N Queen St, Etobicoke, ON M8Z 2E2",
    city: "Etobicoke",
    province: "Ontario",
    coordinates: [43.6156, -79.5572],
    category: "food",
    images: [PLACEHOLDER_IMAGES[2]],
    status: "approved",
    createdAt: "2024-03-10"
  },
  {
    id: "4",
    name: "Ukrainian Gift Shop",
    description: "Traditional Ukrainian gifts, crafts, and cultural items.",
    products: ["Embroidery", "Pottery", "Folk Art"],
    address: "405 The West Mall, Etobicoke, ON M9C 5J1",
    city: "Etobicoke",
    province: "Ontario",
    coordinates: [43.6441, -79.5653],
    category: "other",
    images: [PLACEHOLDER_IMAGES[3]],
    status: "approved",
    createdAt: "2024-01-05"
  },
  {
    id: "5",
    name: "Shumka Ukrainian Foods",
    description: "Edmonton staple for perogies and cabbage rolls.",
    products: ["Perogies", "Cabbage Rolls", "Nalysnyky"],
    address: "16520 95 St, Edmonton, AB T5Z 3L2",
    city: "Edmonton",
    province: "Alberta",
    coordinates: [53.6284, -113.4909],
    category: "food",
    images: [PLACEHOLDER_IMAGES[4]],
    status: "approved",
    createdAt: "2024-04-12"
  },
  {
    id: "6",
    name: "Saskatoon Co-op",
    description: "Local cooperative featuring local Ukrainian producers.",
    products: ["Sausage", "Perogies", "Local Crafts"],
    address: "201 33rd St W, Saskatoon, SK S7L 0V1",
    city: "Saskatoon",
    province: "Saskatchewan",
    coordinates: [52.1465, -106.6735],
    category: "food",
    images: [PLACEHOLDER_IMAGES[0]],
    status: "approved",
    createdAt: "2024-05-01"
  },
  // Add some pending items for the admin dashboard demo
  {
    id: "7",
    name: "Kyiv Cafe (Pending)",
    description: "New cafe opening soon downtown.",
    products: ["Coffee", "Pastries"],
    address: "123 Queen St W, Toronto, ON",
    city: "Toronto",
    province: "Ontario",
    coordinates: [43.651070, -79.347015],
    category: "food",
    images: [PLACEHOLDER_IMAGES[1]],
    status: "pending",
    createdAt: "2024-05-28"
  }
];
