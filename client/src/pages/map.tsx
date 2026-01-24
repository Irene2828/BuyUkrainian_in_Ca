import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getApprovedStores } from "@/lib/api";
import { Loader2, Maximize2, ArrowLeft, ArrowRight, Plus } from "lucide-react";
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
import { SpreadTheWord } from "@/components/spread-the-word";
import { PreFooter } from "@/components/pre-footer";
import { StoreCard } from "@/components/store-card";
import { EditorialStoreCard } from "@/components/editorial-store-card";
import { Store } from "@/lib/data";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";

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
    <section className="bg-white pb-7 md:pb-[44px]">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-4 md:mb-6 max-w-[700px] flex flex-col gap-3 md:gap-4 text-left">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-premium-pulse shrink-0" />
              <h2 className="text-[12px] md:text-[13px] font-semibold uppercase tracking-widest text-slate-400 !text-slate-400 whitespace-nowrap section-headline-reveal m-0">
                Latest community additions
              </h2>
            </div>
            <p className="text-[14px] text-slate-500 font-ui stagger-item">
              Every point on the map starts with a member of our community sharing a local find.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-6 md:px-12 group/carousel relative">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-6">
            {newlyAdded.map((store) => (
              <CarouselItem key={store.id} className="pl-6 basis-full sm:basis-1/2 lg:basis-1/4">
                <EditorialStoreCard
                  store={store}
                  onClick={() => setSelectedStore(store)}
                />
              </CarouselItem>
            ))}

            {/* Final "See more" card - Styled to match Editorial Height */}
            <CarouselItem className="pl-6 basis-full sm:basis-1/2 lg:basis-1/4">
              <div
                className="flex flex-col items-center justify-center h-full min-h-[220px] gap-3 p-4 rounded-[20px] border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer group"
                onClick={() => {
                  document.querySelector('.passport-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-black transition-colors" />
                </div>
                <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-900 text-center">
                  See all stores on map
                </span>
              </div>
            </CarouselItem>
          </CarouselContent>

          {/* Floating Navigation Arrows - Aligned with Image (35% from top) */}
          <div className="hidden md:block opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
            <CarouselPrevious className="absolute -left-5 top-[35%] -translate-y-1/2 w-12 h-12 bg-white text-slate-400 border-none shadow-md hover:bg-white hover:text-slate-900 transition-all disabled:opacity-0" />
            <CarouselNext className="absolute -right-5 top-[35%] -translate-y-1/2 w-12 h-12 bg-white text-slate-400 border-none shadow-md hover:bg-white hover:text-slate-900 transition-all disabled:opacity-0" />
          </div>
        </Carousel>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
      </div>


      {/* Centered Modal Overlay with Precision Scale Animation */}
      {/* Centered Modal Overlay with Framer Motion Physics */}
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
  const [addStoreDialogOpen, setAddStoreDialogOpen] = useState(false);

  return (
    <div className="bg-background flex flex-col font-sans selection:bg-blue-100">
      <Header />
      <main className="flex flex-col">
        {/* Map Page Headline Section - Premium Text-Block Anchor */}


        {/* Map Explorer - NO gap, directly follows headline */}
        <div className="relative z-0 section-reveal mb-0">
          <MapExplorer />
        </div>

        {/* Below-the-fold sections - Vertical Air exactly 75% of Zen Zone (0.75 * py-32 = py-24) */}
        <div className="section-reveal relative z-10 bg-white pt-24">
          <NewlyAddedStores />
        </div>

        {/* TASK 3: Tighter Whitespace for better content flow - Calibrated +10% bottom air */}
        <section className="w-full flex justify-center pt-12 pb-[44px] md:pt-20 md:pb-[72px] bg-white flex flex-col items-center">
          <div className="max-w-4xl mx-auto px-6 text-center mb-0">
            <h2 className="text-[24px] font-semibold tracking-tight leading-tight font-sans section-headline-reveal text-slate-900 mb-4 stagger-item">
              Know a place selling made in Ukraine?
            </h2>
            <p className="text-[16px] md:text-[18px] font-normal md:leading-[29.3px] md:tracking-[-0.44px] text-gray-500 font-ui mb-8 stagger-item">
              Contributing is easy and makes a difference for the community.
            </p>

            <div className="flex flex-col items-center gap-4 stagger-item">
              <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                <DialogTrigger asChild>
                  <button className="group btn-cta inline-flex items-center justify-center bg-black text-white rounded-full h-[52px] px-4 text-[16px] font-normal gap-2 font-ui shadow-lg transition-all duration-300 ease-out hover:bg-[#1e293b] hover:-translate-y-[1px] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] active:scale-95">
                    <Plus className="w-5 h-5 stroke-[2.5] transition-transform duration-300 group-hover:rotate-90" />
                    Add a store
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-xl p-0 overflow-y-auto max-h-[90vh] flex flex-col border-none bg-transparent shadow-none" hideClose>
                  <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Mission Reminder - Subtle Bridge to Footer */}
        <section className="w-full bg-[#f8fafc] py-20 md:py-24 border-t border-slate-100 section-reveal">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
              <div className="max-w-xl">
                <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-[0.2em] mb-4 font-sans">Our Mission</p>
                <h3 className="text-[28px] md:text-[32px] font-semibold text-slate-900 leading-tight mb-4 stagger-item">
                  Supporting resilience, one store at a time.
                </h3>
                <p className="text-[17px] text-slate-500 font-ui leading-relaxed max-w-lg">
                  We're creating a community-driven resource to help you find and support Ukrainian makers and entrepreneurship across Canada.
                </p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-6">
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-sm border border-slate-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-premium-pulse" />
                  <span className="text-[14px] font-medium text-slate-700 font-sans tracking-tight">Community verified</span>
                </div>
                <p className="text-[14px] text-slate-400 font-ui italic">
                  Every addition makes our community stronger.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
