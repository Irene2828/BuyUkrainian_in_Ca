import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InteractiveMap } from "@/components/interactive-map";
import { StoreInfoCard } from "@/components/store-info-card";
import { AddStoreForm } from "@/components/add-store-form";
import { Store } from "@/lib/data";
import { getApprovedStores, createStore as apiCreateStore } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

export default function MapPage() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Fetch approved stores from API
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
  });

  // Mutation for creating new store
  const createStoreMutation = useMutation({
    mutationFn: apiCreateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });

  // Filter stores based on search query
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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Minimal Header for Map View */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="relative w-4 h-4 rounded-full bg-blue-accent flex items-center justify-center overflow-hidden">
            <div className="absolute bottom-0 w-full h-1/2 bg-yellow-accent"></div>
          </div>
          <span className="font-semibold hidden md:inline">Explore Map</span>
        </div>
        
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search stores or products..." 
              className="pl-9 h-9 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-accent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Button 
          className="rounded-full bg-black text-white hover:bg-black/80"
          size="sm"
          onClick={() => {
            setIsAdding(true);
            setSelectedStore(null);
          }}
        >
          <Plus className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Add Place</span>
        </Button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Sidebar (Desktop) */}
        <div className="hidden md:flex w-[400px] flex-col border-r bg-white shrink-0 h-full relative z-10 shadow-xl">
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
                    {filteredStores.length} Locations Found
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading...</div>
                  ) : filteredStores.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <p>No locations found.</p>
                      <Button 
                        variant="link" 
                        className="text-blue-accent" 
                        onClick={() => {
                          setIsAdding(true);
                          setSelectedStore(null);
                        }}
                      >
                        Add a missing place
                      </Button>
                    </div>
                  ) : (
                    filteredStores.map(store => (
                      <div 
                        key={store.id}
                        onClick={() => setSelectedStore(store)}
                        className="p-4 rounded-xl border hover:border-blue-accent hover:bg-blue-50/50 cursor-pointer transition-all group"
                      >
                        <h3 className="font-bold text-foreground group-hover:text-blue-700">{store.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{store.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">{store.category}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative h-full w-full">
          <InteractiveMap 
            stores={filteredStores} 
            selectedStore={selectedStore} 
            onSelectStore={(store) => {
              setSelectedStore(store);
              setIsAdding(false);
            }} 
          />
          
          {/* Mobile View Toggles & Overlays */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 z-[1000] pointer-events-none flex flex-col justify-end h-full">
            {/* Mobile Card/Form Overlay */}
            <AnimatePresence>
              {(selectedStore || isAdding) && (
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="pointer-events-auto bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[85vh] overflow-hidden flex flex-col"
                >
                  {/* Drag Handle Area */}
                  <div className="w-full flex justify-center pt-3 pb-1 bg-transparent">
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
    </div>
  );
}
