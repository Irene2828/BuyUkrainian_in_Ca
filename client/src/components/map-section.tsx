import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InteractiveMap } from "@/components/interactive-map";
import { MapPin, ShoppingBag, Store as StoreIcon } from "lucide-react";
import { HomeAddForm } from "./home-add-form";
import { getApprovedStores } from "@/lib/api";
import { Store } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export function MapSection() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  
  const { data: stores = [], isLoading } = useQuery({
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
            <div className="relative w-full bg-white dark:bg-gray-900 rounded-[24px] overflow-hidden shadow-2xl shadow-black/20 h-full min-h-[450px] border border-border">
              {/* Map Container */}
              <div className="relative w-full h-full">
                {isLoading ? (
                  <div className="h-full w-full flex flex-col">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                        <Skeleton className="h-4 w-32 mx-auto" />
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 py-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-3 divide-x divide-gray-300 dark:divide-gray-600">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex flex-col items-center justify-center py-1">
                            <Skeleton className="w-5 h-5 rounded mb-1" />
                            <Skeleton className="w-8 h-5 mb-1" />
                            <Skeleton className="w-12 h-3" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <InteractiveMap 
                      stores={stores} 
                      selectedStore={selectedStore} 
                      onSelectStore={setSelectedStore}
                    />

                    {/* Stats Row Overlay */}
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-gray-100/90 via-gray-50/85 to-white/80 dark:from-gray-800/90 dark:via-gray-700/85 dark:to-gray-600/80 backdrop-blur-md border-t border-gray-200/60 dark:border-gray-600/60 pointer-events-none">
                      <div className="grid grid-cols-3 divide-x divide-gray-300/50 dark:divide-gray-600/50">
                        {stats.map((stat, i) => (
                          <div key={i} className="flex flex-col items-center justify-center py-2 md:py-3">
                            <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-black dark:text-white mb-1" />
                            <span className="text-base md:text-lg font-bold text-black dark:text-white">{stat.count}</span>
                            <span className="text-[10px] md:text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider font-medium">{stat.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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
