import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InteractiveMap } from "@/components/interactive-map";
import { MapPin, ShoppingBag, Store as StoreIcon } from "lucide-react";
import { HomeAddForm } from "./home-add-form";
import { getApprovedStores } from "@/lib/api";
import { Store } from "@/lib/data";

export function MapSection() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  
  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
    staleTime: 0,
  });

  // Calculate stats
  const uniqueProducts = new Set(stores.flatMap(s => s.products));
  const stats = [
    { icon: MapPin, count: stores.length, label: "Locations" },
    { icon: ShoppingBag, count: uniqueProducts.size, label: "Products" },
    { icon: StoreIcon, count: stores.length, label: "Stores" },
  ];

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8 md:mb-12 space-y-2">
          <h2 className="text-xl md:text-2xl font-bold">Discover & Share</h2>
          <p className="text-muted-foreground text-[15px]">Browse the interactive map or add your favorite locations</p>
        </div>

        {/* Two-Column Layout: Map Preview (Left, Wider) + Form (Right) */}
        <div className="grid lg:grid-cols-5 gap-6 items-stretch">
          
          {/* Left: Interactive Map (3 columns on lg) */}
          <div className="lg:col-span-3">
            <div className="relative w-full bg-white rounded-[24px] overflow-hidden shadow-2xl shadow-black/20 h-full min-h-[450px] border border-border">
              {/* Map Container */}
              <div className="relative w-full h-full">
                <InteractiveMap 
                  stores={stores} 
                  selectedStore={selectedStore} 
                  onSelectStore={setSelectedStore}
                />

                {/* Stats Row Overlay */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-50 backdrop-blur-md border-t border-yellow-300 pointer-events-none">
                  <div className="grid grid-cols-3 divide-x divide-yellow-300">
                    {stats.map((stat, i) => (
                      <div key={i} className="flex flex-col items-center justify-center py-4 md:py-6">
                        <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-black mb-1 md:mb-2" />
                        <span className="text-lg md:text-2xl font-bold text-black">{stat.count}</span>
                        <span className="text-[11px] md:text-sm text-gray-700 uppercase tracking-wider font-medium">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Add Form (2 columns on lg) */}
          <div className="lg:col-span-2">
            <HomeAddForm />
          </div>
        </div>
      </div>
    </section>
  );
}
