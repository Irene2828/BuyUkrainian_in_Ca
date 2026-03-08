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

const PROVINCE_TO_ABBR: Record<string, string> = {
  "Alberta": "AB",
  "British Columbia": "BC",
  "Manitoba": "MB",
  "New Brunswick": "NB",
  "Newfoundland and Labrador": "NL",
  "Nova Scotia": "NS",
  "Ontario": "ON",
  "Prince Edward Island": "PE",
  "Quebec": "QC",
  "Saskatchewan": "SK",
  "Northwest Territories": "NT",
  "Nunavut": "NU",
  "Yukon": "YT"
};

const getProvinceAbbreviation = (province: string) => {
  return PROVINCE_TO_ABBR[province] || province;
};

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
    <section className="bg-white pt-[108px] lg:pt-[135px] pb-[64px] border-t border-slate-200/50">
      <div className="boutique-width">
        <div className="flex justify-between items-center w-full mb-6 group/header-link">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-premium-pulse" />
            <p className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui">
              LATEST COMMUNITY ADDITIONS
            </p>
          </div>
          <button
            onClick={() => {
              document.querySelector('.passport-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="text-sm font-semibold text-[#0057B7]/60 hover:text-[#0047A0] transition-colors flex items-center gap-1 uppercase tracking-wide"
          >
            VIEW ALL <ArrowRight className="w-4 h-4 transition-transform group-hover/header-link:translate-x-1" />
          </button>
        </div>
      </div>

      <div className="boutique-width">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 lg:gap-8 min-h-[140px]">
          {newlyAdded.slice(0, 4).map((store) => (
            <div
              key={store.id}
              className="flex items-stretch cursor-pointer group"
              onClick={() => handleSeeOnMap(store)}
            >
              <div className="w-1 bg-[#FFD700] group-hover:bg-[#0057B7] transition-colors rounded-full mr-4 shrink-0"></div>
              <div className="flex flex-col justify-center">
                <h3 className="text-[#0A2540] font-semibold text-[15px] leading-tight mb-1 group-hover:text-[#0057B7] transition-colors line-clamp-2">
                  {store.name}
                </h3>
                <span className="text-slate-500 text-sm font-medium truncate">
                  {store.city}, {getProvinceAbbreviation(store.province)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Call to Action */}
      <div className="flex flex-col items-center justify-center mt-12 text-center px-4">
        <p className="text-[18px] font-medium text-slate-800 leading-relaxed text-center max-w-[40ch] mb-6">
          Know a store we missed? Add it to the map.
        </p>
        <button
          onClick={() => setAddStoreDialogOpen(true)}
          className="inline-flex items-center justify-center h-[46px] px-6 text-[16px] font-medium tracking-normal rounded-full bg-[#0057B7] text-white transition-all duration-200 2xl:h-[54px] 2xl:px-8 2xl:text-[16px] shadow-sm hover:opacity-90 active:opacity-100 focus-visible:ring-2 focus-visible:ring-slate-200 gap-2 2xl:gap-3 group/cta-btn"
        >
          <span>Add a New Store</span>
          <Plus className="w-4 h-4 2xl:w-5 2xl:h-5 transition-colors duration-200 group-hover/cta-btn:text-[#FFF4CC]" />
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
      isZenMode ? "pt-0" : "pt-0"
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
                <div className="flex items-center gap-2.5 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border-0 shadow-sm">
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
