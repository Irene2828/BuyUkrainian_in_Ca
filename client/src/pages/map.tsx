import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InteractiveMap } from "@/components/interactive-map";
import { StoreInfoCard } from "@/components/store-info-card";
import { AddStoreForm } from "@/components/add-store-form";
import { HowItWorks } from "@/components/how-it-works";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Store } from "@/lib/data";
import { getApprovedStores, createStore as apiCreateStore } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function MapPage() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
  });

  const createStoreMutation = useMutation({
    mutationFn: apiCreateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({
        title: "Store Submitted",
        description: "Your submission will be reviewed and appear on the map once approved.",
      });
    },
  });

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          
          {/* Search and Add Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search stores or products..." 
                className="pl-9 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              className="rounded-lg bg-black text-white hover:bg-black/80 px-6"
              onClick={() => {
                setIsAdding(true);
                setSelectedStore(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative">
            {/* Desktop Sidebar + Map Layout */}
            <div className="flex gap-4 h-[500px] md:h-[600px]">
              
              {/* Sidebar (Desktop) */}
              <div className="hidden md:flex w-[350px] flex-col border rounded-xl bg-white shrink-0 shadow-sm overflow-hidden">
                <AnimatePresence mode="wait">
                  {isAdding ? (
                    <motion.div 
                      key="add-form"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="h-full"
                    >
                      <AddStoreForm onAdd={handleAddStore} onClose={() => setIsAdding(false)} />
                    </motion.div>
                  ) : selectedStore ? (
                    <motion.div 
                      key="info-card"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="h-full"
                    >
                      <StoreInfoCard store={selectedStore} onClose={() => setSelectedStore(null)} />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col h-full"
                    >
                      <div className="p-4 border-b bg-gray-50">
                        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                          {filteredStores.length} Locations
                        </h2>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {isLoading ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                        ) : filteredStores.length === 0 ? (
                          <div className="p-4 text-center text-xs text-muted-foreground">
                            No locations found
                          </div>
                        ) : (
                          filteredStores.map(store => (
                            <div 
                              key={store.id}
                              onClick={() => setSelectedStore(store)}
                              className="p-3 rounded-lg border hover:border-blue-accent hover:bg-blue-50/50 cursor-pointer transition-all group"
                            >
                              <h3 className="font-bold text-sm text-foreground group-hover:text-blue-700 line-clamp-1">{store.name}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{store.description}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Map */}
              <div className="flex-1 relative rounded-xl overflow-hidden border shadow-sm">
                <InteractiveMap 
                  stores={filteredStores} 
                  selectedStore={selectedStore} 
                  onSelectStore={(store) => {
                    setSelectedStore(store);
                    setIsAdding(false);
                  }} 
                />
              </div>
            </div>

            {/* Mobile Sheet Overlay */}
            <div className="md:hidden">
              <AnimatePresence>
                {(selectedStore || isAdding) && (
                  <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[85vh] overflow-hidden flex flex-col"
                  >
                    <div className="w-full flex justify-center pt-3 pb-1">
                      <div className="w-12 h-1.5 rounded-full bg-gray-300/50" />
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {isAdding ? (
                        <AddStoreForm onAdd={handleAddStore} onClose={() => setIsAdding(false)} />
                      ) : selectedStore && (
                        <StoreInfoCard store={selectedStore} onClose={() => setSelectedStore(null)} />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Footer */}
      <Footer />
    </div>
  );
}
