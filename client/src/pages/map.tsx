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
import { AnimatedCounter } from "@/components/ui/animated-counter";

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
    <section className="bg-transparent pb-7 md:pb-[44px]">
      <div className="boutique-width">
        <div className="mb-6 md:mb-9 max-w-[700px] flex flex-col text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-premium-pulse" />
            <h2 className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui">
              LATEST COMMUNITY ADDITIONS
            </h2>
          </div>
          <p className="text-base text-slate-600 font-ui stagger-item mt-3">
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

      <div className="mt-12 flex justify-center">
        <button
          onClick={() => document.querySelector('.passport-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          className="btn-premium-action gap-2 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 no-invert-hover group"
        >
          <Plus className="w-5 h-5 mr-1" strokeWidth={2.5} />
          <span>Add a New Store to the Map</span>
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
  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
  });

  const stats = {
    stores: stores.length,
    provinces: new Set(stores.map(s => s.province)).size,
    products: stores.reduce((acc, s) => acc + (s.products?.length || 0), 0)
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans selection:bg-blue-100 pt-[100px]">
      <Header />
      <main className="flex flex-col">
        <div className="relative z-0 section-reveal mb-0">
          <MapExplorer />
        </div>

        <div className="section-reveal relative z-10 bg-white pt-10 pb-20">
          <NewlyAddedStores />
        </div>

        {/* Mission Reminder - SWAPPED style from Homepage */}
        <section className="relative w-full py-[72px] md:py-[80px] bg-white border-t border-slate-100 flex flex-col justify-center items-center section-reveal">
          <div className="boutique-width flex flex-col items-center">
            {/* Stats Header */}
            <div className="flex flex-col items-center mb-12">
              <div className="flex items-center gap-2.5">
                <span className="font-sans text-[11px] font-semibold tracking-[0.1em] text-slate-900/70 uppercase">
                  Contributions to the map by today
                </span>
              </div>
            </div>

            {/* Stats Row - Apple Editorial Style (Swapped from Homepage) */}
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 mb-14">
              <div className="flex flex-col items-center gap-3">
                <AnimatedCounter
                  end={stats.stores}
                  duration={2000}
                  className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-slate-900 leading-none opacity-50"
                />
                <div className="flex items-center gap-2 text-slate-500 mt-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  <span className="text-[13px] font-medium tracking-[0.08em] uppercase">Stores Found</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <AnimatedCounter
                  end={stats.provinces}
                  duration={2000}
                  delay={200}
                  className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-slate-900 leading-none opacity-50"
                />
                <div className="flex items-center gap-2 text-slate-500 mt-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-[13px] font-medium tracking-[0.08em] uppercase">Provinces Covered</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <AnimatedCounter
                  end={stats.products}
                  duration={2000}
                  delay={400}
                  className="font-sans text-[48px] md:text-[80px] font-medium tracking-tighter text-slate-900 leading-none opacity-50"
                />
                <div className="flex items-center gap-2 text-slate-500 mt-2">
                  <Package className="w-4 h-4 opacity-80" strokeWidth={1.5} />
                  <span className="text-[13px] font-medium tracking-[0.08em] uppercase">Products listed</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <p className="text-[15px] text-slate-500 font-ui italic text-center max-w-[40ch]">
                Every data point represents a Ukrainian entrepreneur supported by this community.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
