import { db } from "./index";
import { stores } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const initialStores = [
    {
      name: "Kozak Ukrainian Bakery",
      description: "Authentic Ukrainian breads, pastries, and comfort foods made from scratch.",
      products: ["Borsch", "Varenyky", "Sourdough Bread", "Coffee"],
      address: "5077 Victoria Dr, Vancouver, BC V5P 3T9",
      latitude: "49.2333",
      longitude: "-123.0667",
      category: "food",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1000",
      status: "approved"
    },
    {
      name: "Yummy Market",
      description: "European grocery store with a vast selection of Ukrainian imported goods.",
      products: ["Roshen Chocolates", "Kvas", "Buckwheat", "Preserves"],
      address: "1390 Major Mackenzie Dr W, Maple, ON L6A 4H6",
      latitude: "43.8755",
      longitude: "-79.4964",
      category: "retail",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000",
      status: "approved"
    },
    {
      name: "Future Bakery",
      description: "Family-owned bakery serving traditional Eastern European recipes since 1991.",
      products: ["Rye Bread", "Poppy Seed Roll", "Cakes"],
      address: "106 N Queen St, Etobicoke, ON M8Z 2E2",
      latitude: "43.6156",
      longitude: "-79.5572",
      category: "food",
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1000",
      status: "approved"
    },
    {
      name: "Ukrainian Credit Union",
      description: "Financial institution supporting the Ukrainian community across Canada.",
      products: ["Banking", "Mortgages", "Community Support"],
      address: "405 The West Mall, Etobicoke, ON M9C 5J1",
      latitude: "43.6441",
      longitude: "-79.5653",
      category: "services",
      status: "approved"
    },
    {
      name: "Shumka Ukrainian Foods",
      description: "Edmonton staple for perogies and cabbage rolls.",
      products: ["Perogies", "Cabbage Rolls", "Nalysnyky"],
      address: "16520 95 St, Edmonton, AB T5Z 3L2",
      latitude: "53.6284",
      longitude: "-113.4909",
      category: "food",
      status: "approved"
    },
    {
      name: "Saskatoon Co-op",
      description: "Local cooperative featuring local Ukrainian producers.",
      products: ["Sausage", "Perogies", "Local Crafts"],
      address: "201 33rd St W, Saskatoon, SK S7L 0V1",
      latitude: "52.1465",
      longitude: "-106.6735",
      category: "retail",
      status: "approved"
    }
  ];

  for (const store of initialStores) {
    await db.insert(stores).values(store).onConflictDoNothing();
  }

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
