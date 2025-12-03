import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InteractiveMap } from "@/components/interactive-map";
import { StoreModal } from "@/components/store-modal";
import { AddStoreForm } from "@/components/add-store-form";
import { HowItWorks } from "@/components/how-it-works";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Store } from "@/lib/data";
import { getApprovedStores } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin, Map, List, X, Search, Navigation, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

const suggestedSearchesEN = ["Honey", "Candies", "Shoes", "Food", "Ceramics"];
const suggestedSearchesUA = ["Мед", "Цукерки", "Взуття", "Їжа", "Кераміка"];

export default function MapPage() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [focusStore, setFocusStore] = useState<Store | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, language } = useI18n();
  
  const suggestedSearches = language === 'ua' ? suggestedSearchesUA : suggestedSearchesEN;

  const handleSeeOnMap = (store: Store) => {
    setIsModalOpen(false);
    setViewMode("map");
    setFocusStore(store);
  };

  const handleResetView = () => {
    setFocusStore(null);
  };

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const handleAddStore = async () => {
    queryClient.invalidateQueries({ queryKey: ["stores"] });
    setIsAdding(false);
  };

  const filteredStores = stores.filter((store) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      store.name.toLowerCase().includes(query) ||
      store.description.toLowerCase().includes(query) ||
      store.address.toLowerCase().includes(query) ||
      store.products.some(p => p.toLowerCase().includes(query));
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(store.category);
    return matchesSearch && matchesCategory;
  });

  const recentStores = [...stores]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  const categories = Array.from(new Set(stores.map(s => s.category)));

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSuggestedSearch = (term: string) => {
    setSearchQuery(term);
  };

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      toast({
        title: t("toast.locationNotSupported"),
        description: t("toast.locationNotSupportedDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (latitude > 40 && latitude < 85 && longitude > -140 && longitude < -50) {
          setUserLocation([latitude, longitude]);
          toast({
            title: t("toast.locationFound"),
            description: t("toast.locationFoundDesc"),
          });
        } else {
          toast({
            title: t("toast.locationOutside"),
            description: t("toast.locationOutsideDesc"),
            variant: "destructive",
          });
        }
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        toast({
          title: t("toast.locationError"),
          description: t("toast.locationErrorDesc"),
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <section className="w-full py-8 md:py-12 bg-white border-b">
        <div className="container mx-auto px-4 max-w-7xl space-y-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">{t("map.title")}</h1>
          <p className="text-muted-foreground max-w-2xl">
            {t("map.subtitle")}
          </p>
        </div>

        <div className="container mx-auto px-4 max-w-7xl mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("map.search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2"
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

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">{t("map.search.try")}</span>
            {suggestedSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleSuggestedSearch(term)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  searchQuery.toLowerCase() === term.toLowerCase()
                    ? "bg-black text-white border-black"
                    : "bg-white hover:bg-gray-100 border-gray-200"
                }`}
                data-testid={`suggestion-${term.toLowerCase()}`}
              >
                {term}
              </button>
            ))}
          </div>

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
                {t("map.clearFilters")}
              </Button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setViewMode("map")}
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              data-testid="button-view-map"
            >
              <Map className="w-4 h-4 mr-2" />
              {t("map.viewMap")}
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              data-testid="button-view-list"
            >
              <List className="w-4 h-4 mr-2" />
              {t("map.viewList")}
            </Button>
            <Button
              onClick={handleFindNearMe}
              variant="outline"
              size="sm"
              disabled={isLocating}
              className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
              data-testid="button-find-near-me"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 mr-2" />
              )}
              {isLocating ? t("map.finding") : t("map.findNearMe")}
            </Button>
            {userLocation && (
              <Button
                onClick={() => setUserLocation(null)}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                data-testid="button-clear-location"
              >
                <X className="w-3 h-3 mr-1" />
                {t("map.clearLocation")}
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredStores.length === 0 
              ? t("map.noResults")
              : `${t("map.showing")} ${filteredStores.length} ${filteredStores.length === 1 ? t("map.store") : t("map.stores")}`}
          </p>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex gap-6 items-stretch">
            <div className={`relative rounded-xl overflow-hidden border shadow-sm h-[450px] md:h-[550px] bg-white dark:bg-gray-900 transition-all duration-300 flex-1`}>
              {viewMode === "map" ? (
                isLoading ? (
                  <div className="h-full w-full p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                        <Skeleton className="h-4 w-32 mx-auto" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <InteractiveMap 
                    stores={filteredStores} 
                    selectedStore={selectedStore} 
                    onSelectStore={(store) => {
                      setSelectedStore(store);
                      setIsModalOpen(true);
                      setIsAdding(false);
                    }}
                    userLocation={userLocation}
                    focusStore={focusStore}
                    onResetView={handleResetView}
                  />
                )
              ) : (
                isLoading ? (
                  <div className="p-4 space-y-4 overflow-y-auto h-full">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-3">
                          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <div className="flex gap-2">
                              <Skeleton className="h-5 w-16 rounded-full" />
                              <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-3 w-48" />
                          </div>
                          <Skeleton className="h-6 w-16 rounded shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-y-auto h-full p-4">
                    {filteredStores.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MapPin className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-muted-foreground">{t("map.noStoresFound")}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredStores.map((store) => (
                          <button
                            key={store.id}
                            onClick={() => {
                              setSelectedStore(store);
                              setIsModalOpen(true);
                            }}
                            className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group"
                            data-testid={`list-store-${store.id}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1 shrink-0">
                                <div 
                                  className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                                  style={{ background: 'linear-gradient(to bottom, #1E90FF 50%, #FFD700 50%)' }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg group-hover:text-blue-700 dark:group-hover:text-blue-400">{store.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{store.description}</p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {store.products.slice(0, 3).map((product, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                                      {product}
                                    </span>
                                  ))}
                                  {store.products.length > 3 && (
                                    <span className="text-xs text-muted-foreground">+{store.products.length - 3} more</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {store.address}
                                </p>
                              </div>
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded capitalize shrink-0">
                                {store.category}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            <div className={`hidden lg:flex flex-col transition-all duration-300 shrink-0 h-[450px] md:h-[550px] ${
              isFormCollapsed ? "w-12" : "w-[350px]"
            }`}>
              <div className="flex-1 overflow-hidden rounded-xl border shadow-sm bg-white dark:bg-gray-900">
                <AddStoreForm 
                  onAdd={handleAddStore} 
                  onClose={() => {}} 
                  isCollapsed={isFormCollapsed}
                  onToggleCollapse={() => setIsFormCollapsed(!isFormCollapsed)}
                />
              </div>
            </div>

            <div className="lg:hidden">
              {!selectedStore && (
                <Button 
                  className="w-full h-12 rounded-lg bg-black text-white hover:bg-black/80 text-base font-semibold"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("map.addLocation")}
                </Button>
              )}
            </div>
          </div>

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

        {isLoading ? (
          <div className="container mx-auto px-4 max-w-7xl mt-12 pt-8 border-t">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-4 h-4 rounded shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : recentStores.length > 0 && (
          <div className="container mx-auto px-4 max-w-7xl mt-12 pt-8 border-t">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t("map.recentlyAdded")}</h2>
              <p className="text-muted-foreground text-sm">{t("map.recentlyAddedSubtitle")}</p>
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
                  className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-accent hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group"
                  data-testid={`card-recent-store-${store.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <MapPin className="w-4 h-4 text-blue-accent shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400 line-clamp-2">{store.products[0] || store.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{store.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{store.address.split(",")[0]}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </section>

      <StoreModal 
        store={selectedStore} 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStore(null);
        }}
        onSeeOnMap={handleSeeOnMap}
      />

      <HowItWorks />
      <Footer />
    </div>
  );
}
