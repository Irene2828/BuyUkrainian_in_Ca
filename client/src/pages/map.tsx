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
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function MapPage() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stores = [] } = useQuery({
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
        </div>

        {/* Map + Form Layout */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative">
            {/* Desktop Layout: Map (Left, Wider) + Form (Right) */}
            <div className="grid lg:grid-cols-3 gap-6 h-[500px] md:h-[600px]">
              
              {/* Map Container (Left - 2 columns) */}
              <div className="lg:col-span-2 relative rounded-xl overflow-hidden border shadow-sm">
                <InteractiveMap 
                  stores={stores} 
                  selectedStore={selectedStore} 
                  onSelectStore={(store) => {
                    setSelectedStore(store);
                    setIsAdding(false);
                  }} 
                />

                {/* Store Info Card Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <AnimatePresence>
                    {selectedStore && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-4 left-4 right-4 pointer-events-auto max-w-xs bg-white rounded-lg shadow-xl"
                      >
                        <StoreInfoCard store={selectedStore} onClose={() => setSelectedStore(null)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Form Container (Right - 1 column) */}
              <div className="hidden lg:flex flex-col">
                <AddStoreForm onAdd={handleAddStore} onClose={() => setIsAdding(false)} />
              </div>
            </div>

            {/* Mobile: Map and Form Stack */}
            <div className="lg:hidden space-y-6">
              {/* Mobile Map */}
              <div className="relative h-[400px] rounded-xl overflow-hidden border shadow-sm">
                <InteractiveMap 
                  stores={stores} 
                  selectedStore={selectedStore} 
                  onSelectStore={(store) => {
                    setSelectedStore(store);
                    setIsAdding(false);
                  }} 
                />

                {/* Store Info Card Overlay for Mobile */}
                <AnimatePresence>
                  {selectedStore && (
                    <motion.div 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl max-h-[70vh] overflow-hidden"
                    >
                      <div className="w-full flex justify-center pt-3 pb-1">
                        <div className="w-12 h-1.5 rounded-full bg-gray-300/50" />
                      </div>
                      <div className="overflow-y-auto max-h-[calc(70vh-20px)]">
                        <StoreInfoCard store={selectedStore} onClose={() => setSelectedStore(null)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Form Button */}
              {!selectedStore && (
                <Button 
                  className="w-full h-12 rounded-lg bg-black text-white hover:bg-black/80 text-base font-semibold"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              )}

              {/* Mobile Form Modal */}
              <AnimatePresence>
                {isAdding && (
                  <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
