import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InteractiveMap } from "@/components/interactive-map";
import { StoreModal } from "@/components/store-modal";
import { StoreList } from "@/components/store-list";
import { AddStoreForm } from "@/components/add-store-form";
import { HowItWorks } from "@/components/how-it-works";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Store } from "@/lib/data";
import { getApprovedStores, createStore as apiCreateStore } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, Map, List, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function MapPage() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const createStoreMutation = useMutation({
    mutationFn: apiCreateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({
        title: "Store Submitted",
        description: "Once approved, you will see your product pin on the map. Thanks for supporting #madeinUkraine 🇺🇦",
      });
    },
  });

  const handleAddStore = async (newStore: Store) => {
    try {
      await createStoreMutation.mutateAsync({
        name: newStore.name,
        description: newStore.description,
        products: newStore.products,
        address: newStore.address,
        latitude: newStore.coordinates[0],
        longitude: newStore.coordinates[1],
        category: newStore.category,
        image: newStore.image,
      });
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to create store:", error);
    }
  };

  // Filter stores based on search and categories
  const filteredStores = stores.filter((store) => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(store.category);
    return matchesSearch && matchesCategory;
  });

  // Get recently added stores (last 3, sorted by date)
  const recentStores = [...stores]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  // Get unique categories (exclude services - only goods made in Ukraine)
  const categories = Array.from(new Set(stores.map(s => s.category))).filter(c => c !== 'services');

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header />

      {/* Map Section */}
      <section className="w-full py-8 md:py-12 bg-white border-b">
        <div className="container mx-auto px-4 max-w-7xl space-y-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">Explore the Map</h1>
          <p className="text-muted-foreground max-w-2xl">
            Find Ukrainian products and businesses across Canada. Click on any pin to see details, or add a new location to help grow our community.
          </p>
        </div>

        {/* Filter Section */}
        <div className="container mx-auto px-4 max-w-7xl mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search stores, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2"
              data-testid="input-search-stores"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                className="capitalize"
                size="sm"
                data-testid={`filter-category-${category}`}
              >
                {category}
              </Button>
            ))}
            {selectedCategories.length > 0 && (
              <Button
                onClick={() => setSelectedCategories([])}
                variant="ghost"
                size="sm"
                className="text-xs"
                data-testid="button-clear-filters"
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode("map")}
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              data-testid="button-view-map"
            >
              <Map className="w-4 h-4 mr-2" />
              Map View
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              data-testid="button-view-list"
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </Button>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            {filteredStores.length === 0 
              ? "No results found. Try adjusting your filters or search terms."
              : `Showing ${filteredStores.length} ${filteredStores.length === 1 ? "store" : "stores"}`}
          </p>
        </div>

        {/* Map/List + Form Layout */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* View Container */}
            <div className="lg:col-span-2 relative rounded-xl overflow-hidden border shadow-sm h-[400px] md:h-[600px] bg-white">
              {viewMode === "map" ? (
                <InteractiveMap 
                  stores={filteredStores} 
                  selectedStore={selectedStore} 
                  onSelectStore={(store) => {
                    setSelectedStore(store);
                    setIsModalOpen(true);
                    setIsAdding(false);
                  }} 
                />
              ) : (
                <div className="overflow-y-auto h-full p-4">
                  <StoreList
                    stores={filteredStores}
                    onSelectStore={(store) => {
                      setSelectedStore(store);
                      setIsModalOpen(true);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Form Container */}
            <div className="hidden lg:flex flex-col">
              <AddStoreForm onAdd={handleAddStore} onClose={() => setIsAdding(false)} />
            </div>

            {/* Mobile Add Button */}
            <div className="lg:hidden">
              {!selectedStore && (
                <Button 
                  className="w-full h-12 rounded-lg bg-black text-white hover:bg-black/80 text-base font-semibold"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Form Modal */}
          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl max-h-[85vh] overflow-hidden z-[1000]"
              >
                <div className="w-full flex justify-center pt-3 pb-1">
                  <div className="w-12 h-1.5 rounded-full bg-gray-300/50" />
                </div>
                <div className="overflow-y-auto max-h-[calc(85vh-20px)]">
                  <AddStoreForm onAdd={handleAddStore} onClose={() => setIsAdding(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recently Added Section - Show last 3 items */}
        {recentStores.length > 0 && (
          <div className="container mx-auto px-4 max-w-7xl mt-12 pt-8 border-t">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Recently Added</h2>
              <p className="text-muted-foreground text-sm">Click on any product to see location details on the map</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {recentStores.map((store) => (
                <motion.button
                  key={store.id}
                  onClick={() => {
                    if (store.coordinates && store.coordinates[0] && store.coordinates[1]) {
                      setSelectedStore(store);
                      setIsModalOpen(true);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-accent hover:bg-blue-50/50 transition-all group"
                  data-testid={`card-recent-store-${store.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <MapPin className="w-4 h-4 text-blue-accent shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground group-hover:text-blue-700 line-clamp-2">{store.products[0] || store.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{store.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{store.address.split(",")[0]}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Store Details Modal */}
      <StoreModal 
        store={selectedStore} 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStore(null);
        }} 
      />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Footer */}
      <Footer />
    </div>
  );
}
