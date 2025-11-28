import { MapPin, ShoppingBag, Coffee, Book, Shirt, Utensils } from "lucide-react";

export interface Store {
  id: string;
  name: string;
  description: string;
  products: string[];
  address: string;
  coordinates: [number, number];
  category: "retail" | "food" | "services" | "other";
  image?: string;
}

export const INITIAL_STORES: Store[] = [
  {
    id: "1",
    name: "Kozak Ukrainian Bakery",
    description: "Authentic Ukrainian breads, pastries, and comfort foods made from scratch.",
    products: ["Borsch", "Varenyky", "Sourdough Bread", "Coffee"],
    address: "5077 Victoria Dr, Vancouver, BC V5P 3T9",
    coordinates: [49.2333, -123.0667],
    category: "food",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: "2",
    name: "Yummy Market",
    description: "European grocery store with a vast selection of Ukrainian imported goods.",
    products: ["Roshen Chocolates", "Kvas", "Buckwheat", "Preserves"],
    address: "1390 Major Mackenzie Dr W, Maple, ON L6A 4H6",
    coordinates: [43.8755, -79.4964], // Toronto area
    category: "retail",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: "3",
    name: "Future Bakery",
    description: "Family-owned bakery serving traditional Eastern European recipes since 1991.",
    products: ["Rye Bread", "Poppy Seed Roll", "Cakes"],
    address: "106 N Queen St, Etobicoke, ON M8Z 2E2",
    coordinates: [43.6156, -79.5572],
    category: "food",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: "4",
    name: "Ukrainian Credit Union",
    description: "Financial institution supporting the Ukrainian community across Canada.",
    products: ["Banking", "Mortgages", "Community Support"],
    address: "405 The West Mall, Etobicoke, ON M9C 5J1",
    coordinates: [43.6441, -79.5653],
    category: "services"
  },
  {
    id: "5",
    name: "Shumka Ukrainian Foods",
    description: "Edmonton staple for perogies and cabbage rolls.",
    products: ["Perogies", "Cabbage Rolls", "Nalysnyky"],
    address: "16520 95 St, Edmonton, AB T5Z 3L2",
    coordinates: [53.6284, -113.4909],
    category: "food"
  },
  {
    id: "6",
    name: "Saskatoon Co-op",
    description: "Local cooperative featuring local Ukrainian producers.",
    products: ["Sausage", "Perogies", "Local Crafts"],
    address: "201 33rd St W, Saskatoon, SK S7L 0V1",
    coordinates: [52.1465, -106.6735],
    category: "retail"
  }
];
