import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { InteractiveMap, InteractiveMapRef } from "@/components/interactive-map";
import { Search, UtensilsCrossed, ShoppingBag, Store as StoreIcon, Sparkles, MapPin } from "lucide-react";
import { HomeAddForm } from "./home-add-form";
import { StoreModal } from "./store-modal";
import { getApprovedStores } from "@/lib/api";
import { Store } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";

export function MapSection() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const mapRef = useRef<InteractiveMapRef>(null);
  const { t } = useI18n();

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
    staleTime: 0,
  });

  const filteredStores = selectedCategory 
    ? stores.filter(s => {
        if (selectedCategory === "clothes") {
          return s.category === "clothes" || s.category === "retail";
        }
        return s.category === selectedCategory;
      })
    : stores;

  const categories = [
    { id: null, icon: Sparkles, label: "All" },
    { id: "food", icon: UtensilsCrossed, label: "Food" },
    { id: "clothes", icon: ShoppingBag, label: "Shopping" },
    { id: "other", icon: StoreIcon, label: "Other" },
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
                      ref={mapRef}
                      stores={filteredStores} 
                      selectedStore={selectedStore} 
                      onSelectStore={handleSelectStore}
                    />

                    {/* Category Filter Bar - Airbnb Style */}
                    <div className="absolute bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/60 dark:border-gray-700/60 px-3 py-2">
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        <button
                          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
                          data-testid="button-search-map"
                        >
                          <Search className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        
                        <div className="flex items-center gap-1.5">
                          {categories.map((category) => (
                            <button
                              key={category.label}
                              onClick={() => setSelectedCategory(category.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                selectedCategory === category.id
                                  ? 'bg-black text-white dark:bg-white dark:text-black'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                              data-testid={`button-category-${category.label.toLowerCase()}`}
                            >
                              <category.icon className="w-3.5 h-3.5" />
                              <span>{category.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Store count badge */}
                        <div className="ml-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                          <MapPin className="w-3 h-3" />
                          <span>{filteredStores.length}</span>
                        </div>
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

      {/* Store Modal */}
      <StoreModal 
        store={selectedStore}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
}
