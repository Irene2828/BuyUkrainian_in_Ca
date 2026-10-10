import { db } from "./index";
import { stores } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const initialStores = [

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
      name: "Ukrainian Credit Union",
      description: "Financial institution supporting the Ukrainian community across Canada.",
      products: ["Banking", "Mortgages", "Community Support"],
      address: "405 The West Mall, Etobicoke, ON M9C 5J1",
      latitude: "43.6441",
      longitude: "-79.5653",
      category: "services",
      status: "approved"
    },
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
