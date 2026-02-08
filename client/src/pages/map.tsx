import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getApprovedStores } from "@/lib/api";
import { Loader2, ArrowRight, Plus, Package } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MapExplorer } from "@/components/map-explorer";
import { EditorialStoreCard } from "@/components/editorial-store-card";
import { StoreCard } from "@/components/store-card";
import { Store } from "@/lib/data";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CommunityImpact } from "@/components/community-impact";
import { cn } from "@/lib/utils";

function NewlyAddedStores() {
  const { t } = useI18n();
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
  });
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-text-secondary)]" /></div>;

  const newlyAdded = stores.slice(0, 5);

  const handleSeeOnMap = (store: Store) => {
    setSelectedStore(null);
    document.querySelector('.passport-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      const event = new CustomEvent('focusStore', { detail: store });
      window.dispatchEvent(event);
    }, 600);
  };

  return (
    <section className="bg-white pt-[36px] pb-0">
      <div className="boutique-width">
        <div className="mb-6 md:mb-9 max-w-[700px] flex flex-col text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-premium-pulse" />
            <p className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui">
              LATEST COMMUNITY ADDITIONS
            </p>
          </div>
          <p className="text-base text-[#575756] font-ui stagger-item mt-3">
            Every point on the map starts with a member of our community sharing a local find.
          </p>
        </div>
      </div>

      <div className="boutique-width group/carousel relative">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-8">
            {newlyAdded.map((store) => (
              <CarouselItem key={store.id} className="pl-8 basis-full sm:basis-1/2 md:basis-[28%] lg:basis-[22%]">
                <div className="w-full">
                  <EditorialStoreCard
                    store={store}
                    onClick={() => setSelectedStore(store)}
                  />
                </div>
              </CarouselItem>
            ))}

            {/* Final "See more" card */}
            <CarouselItem className="pl-8 basis-full sm:basis-1/2 md:basis-[28%] lg:basis-[22%]">
              <div
                className="flex flex-col items-center justify-center h-full min-h-[220px] gap-3 p-4 rounded-[20px] border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer group"
                onClick={() => {
                  document.querySelector('.passport-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-black transition-colors" />
                </div>
                <span className="text-sm font-bold text-slate-900 text-center">
                  View All Stores
                </span>
              </div>
            </CarouselItem>
          </CarouselContent>

          <div className="hidden md:block opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
            <CarouselPrevious className="absolute -left-5 top-[35%] -translate-y-1/2 w-12 h-12 bg-white text-slate-400 border-none shadow-md hover:bg-white hover:text-slate-900 transition-all disabled:opacity-0" />
            <CarouselNext className="absolute -right-5 top-[35%] -translate-y-1/2 w-12 h-12 bg-white text-slate-400 border-none shadow-md hover:bg-white hover:text-slate-900 transition-all disabled:opacity-0" />
          </div>
        </Carousel>
      </div>

      {/* Add Store CTA Button */}
      <div className="boutique-width flex flex-col items-center justify-center pb-16 pt-0">
        <p className="text-[13px] italic font-medium text-zinc-400 text-center mb-4">
          Know a store we missed? Add it!
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openAddStore'))}
          className="btn-premium-action gap-2 no-invert-hover px-10 bg-[#2D50A0] border-none text-white hover:bg-[#254285] shadow-xl shadow-[#2D50A0]/20 rounded-full"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          <span>Add a New Store</span>
        </button>
      </div>


      <AnimatePresence>
        {selectedStore && (
          <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-md px-4"
            onClick={() => setSelectedStore(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[450px]"
              onClick={(e) => e.stopPropagation()}
            >
              <StoreCard
                store={selectedStore}
                onClose={() => setSelectedStore(null)}
                onSeeOnMap={handleSeeOnMap}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function MapPage() {
  useScrollReveal();
  const { t } = useI18n();
  const [isZenMode, setIsZenMode] = useState(false);

  return (
    <div className={cn(
      "bg-white min-h-screen flex flex-col font-sans selection:bg-blue-100 transition-all duration-500",
      isZenMode ? "pt-0" : "pt-[80px]"
    )}>
      {!isZenMode && <Header />}
      <main className="flex flex-col flex-1">
        {!isZenMode && <div className="w-full h-0 bg-white shrink-0" />}
        <div className={cn(
          "relative z-0 mb-0 transition-all duration-500 w-full",
          isZenMode ? "flex-1" : "h-auto"
        )}>
          <MapExplorer isZenMode={isZenMode} onZenModeToggle={() => setIsZenMode(!isZenMode)} />
        </div>

        {!isZenMode && (
          <>
            <div className="section-reveal relative z-10 bg-transparent pt-0 pb-0">
              <NewlyAddedStores />
            </div>

            <div className="section-reveal">
              <CommunityImpact hideBorder />
            </div>
          </>
        )}
      </main>
      {!isZenMode && <Footer />}
    </div>
  );
}
