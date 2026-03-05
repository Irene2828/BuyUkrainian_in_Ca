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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
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
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const [addStoreDialogOpen, setAddStoreDialogOpen] = useState(false);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-text-secondary)]" /></div>;

  const newlyAdded = stores.slice(0, 5);

  const handleSeeOnMap = (store: Store) => {
    // Determine target location to scroll to - prioritize MapExplorer
    const mapElement = document.querySelector('.passport-map-container') || document.querySelector('.map-column-wrapper');
    mapElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Dispatch event to trigger MapExplorer focus
    setTimeout(() => {
      // Option 1: Dispatch event (since we are on the same page)
      const event = new CustomEvent('focusStore', { detail: store });
      window.dispatchEvent(event);

      // Option 2: Also update URL for consistency (optional but good for history)
      // window.history.pushState({}, '', `/map?store=${encodeURIComponent(store.id)}`);
    }, 600);
  };

  return (
    <section className="bg-white pt-[108px] lg:pt-[135px] pb-[129px] border-t border-slate-200/50">
      <div className="boutique-width">
        <div className="mb-6 md:mb-9 max-w-[700px] flex flex-col text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-premium-pulse" />
            <p className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui">
              LATEST COMMUNITY ADDITIONS
            </p>
          </div>

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
                    onClick={() => handleSeeOnMap(store)}
                  />
                </div>
              </CarouselItem>
            ))}

            {/* Final "See more" card */}
            <CarouselItem className="pl-8 basis-full sm:basis-1/2 md:basis-[28%] lg:basis-[22%]">
              <div
                className="flex flex-col items-center justify-center h-full min-h-[220px] gap-3 p-4 rounded-[20px] border border-dashed border-slate-300 bg-slate-50/30 hover:bg-slate-50/50 hover:border-slate-400 transition-all cursor-pointer group"
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

      {/* Community Call to Action */}
      <div className="flex flex-col items-center justify-center mt-12 text-center px-4">
        <p className="text-[18px] font-medium text-slate-800 leading-relaxed text-center max-w-[40ch] mb-6">
          Know a store we missed? Add it to the map.
        </p>
        <button
          onClick={() => setAddStoreDialogOpen(true)}
          className="h-[48px] px-8 2xl:px-10 rounded-[32px] bg-[#0A2540] text-white font-medium text-[16px] 2xl:text-[18px] tracking-tight antialiased transition-all duration-300 shadow-sm hover:shadow-[0_4px_24px_rgba(255,232,133,0.2)] hover:bg-[#0F355C] hover:text-[#FFF4CC] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-navy/20 group/cta-btn flex items-center justify-center gap-2 2xl:gap-3"
        >
          <span>Add a New Store</span>
          <Plus className="w-4 h-4 2xl:w-5 2xl:h-5 transition-colors duration-300 group-hover/cta-btn:text-[#FFF4CC]" />
        </button>
      </div>

      <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
        <DialogContent className="max-w-[600px] p-0 border-none bg-transparent shadow-none overflow-visible">
          <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
        </DialogContent>
      </Dialog>





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
      isZenMode ? "pt-0" : "pt-[5rem] lg:pt-[80px]"
    )}>
      {!isZenMode && <Header />}
      <main className="flex flex-col flex-1">
        {!isZenMode && <div className="w-full h-0 bg-white shrink-0" />}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "relative z-0 mb-0 transition-all duration-500 w-full",
            isZenMode ? "flex-1" : "h-auto"
          )}
        >
          <MapExplorer isZenMode={isZenMode} onZenModeToggle={() => setIsZenMode(!isZenMode)} />
        </motion.div>

        {/* Trust & Origin Metadata - Integrated below map section */}
        {!isZenMode && (
          <div className="w-full bg-gradient-to-b from-white via-white to-white py-6 md:py-8 select-none pointer-events-none overflow-hidden">
            <div className="boutique-width mx-auto px-6">
              {/* Desktop Metadata */}
              <div className="hidden md:flex justify-center items-center gap-5">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  Community-driven map
                </span>
                <span className="text-slate-400 text-[10px] font-light">/</span>
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 italic">
                    Verified stores
                  </span>
                </div>
                <span className="text-slate-400 text-[10px] font-light">/</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  Made in Ukraine only
                </span>
              </div>

              {/* Mobile Metadata */}
              <div className="md:hidden flex justify-center">
                <div className="flex items-center gap-2.5 bg-slate-50/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-100">
                  <div className="w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.4)]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    Verified Ukrainian Products
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
