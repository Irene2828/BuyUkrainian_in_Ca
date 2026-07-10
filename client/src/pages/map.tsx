import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getApprovedStores } from "@/lib/api";
import { Loader2, ArrowRight, ArrowUpRight, Plus, MapPin } from "lucide-react";
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
    <section className="bg-white pt-[32px] md:pt-[40px] pb-[40px] md:pb-[60px]">
      <div className="content-width">
        <div className="min-[1280px]:max-[1669px]:px-[clamp(72px,5vw,92px)] min-[1670px]:px-[clamp(52px,3.6vw,72px)] w-full">
          <div className="flex justify-between items-center w-full mb-6 group/header-link ml-[1.3px]">
            <div className="shrink-0 flex items-center gap-2 z-10">
              <div className="relative flex h-[5px] w-[5px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-[5px] w-[5px] bg-[#FFD700]"></span>
              </div>
              <span className="text-[11.7px] font-medium tracking-widest text-slate-600/95 uppercase whitespace-nowrap font-['Inter'] antialiased">
                LATEST COMMUNITY ADDITIONS
              </span>
            </div>
            <button
              onClick={() => {
                document.querySelector('.passport-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="text-[11px] font-medium text-slate-400 hover:text-[#0057B7] transition-colors flex items-center gap-1.5 tracking-wider font-['Inter'] uppercase"
            >
              View all <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/header-link:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="content-width">
        <div className="min-[1280px]:max-[1669px]:px-[clamp(72px,5vw,92px)] min-[1670px]:px-[clamp(52px,3.6vw,72px)] w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-8 gap-y-8 items-start ml-[1.3px]">
          {newlyAdded.slice(0, 4).map((store) => (
            <div
              key={store.id}
              className="relative group cursor-pointer"
              onClick={() => handleSeeOnMap(store)}
            >
              {/* Frosted Glass Overlay with CTA - Centered vertically and static */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none rounded-xl">
                <button className="flex items-center gap-2 bg-white/95 text-slate-900 ring-1 ring-slate-200 ring-inset text-[13px] font-medium px-5 py-2.5 rounded-full shadow-md hover:bg-white hover:ring-slate-300 hover:text-black transition-all duration-300 ease-out pointer-events-auto group/btn">
                  See on Map
                  <MapPin className="w-3 h-3 transition-transform duration-300 group-hover/btn:scale-110" />
                </button>
              </div>

              <div className="border-l-[2px] border-[#FFD700] pl-4 py-2 cursor-pointer hover:opacity-80 transition-all">
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 group/title">
                    <h3 className="text-[#0057B7] font-semibold text-[15px] tracking-tight leading-tight antialiased line-clamp-2">
                      {store.name}
                    </h3>
                  </div>
                  <span className="text-slate-600 text-[13px] mt-1">
                    {store.city}, {getProvinceAbbreviation(store.province)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Community Call to Action */}
      <div className="flex flex-col items-center justify-center pt-[48px] md:pt-[80px] pb-[24px] md:pb-[40px] text-center px-4">
        <p className="text-[18px] font-medium text-slate-800 leading-relaxed text-center max-w-[40ch] mx-auto mb-6">
          Know a store we missed? Add it to the map.
        </p>
        <button
          onClick={() => setAddStoreDialogOpen(true)}
          className="inline-flex items-center justify-center h-[46px] px-6 text-[16px] font-medium tracking-tight rounded-full bg-[#FFD700] text-slate-950 border-none transition-all duration-300 hover:bg-[#FFC000] 2xl:h-[54px] 2xl:text-[17px] shadow-[0_4px_12px_0_rgba(255,215,0,0.18)] hover:shadow-[0_6px_16px_rgba(255,215,0,0.28)] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FFD700]/40 gap-2.5 group/cta-btn border-none mx-auto"
        >
          <span>Add a New Store</span>
          <Plus className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform duration-300 group-hover/cta-btn:scale-110 text-slate-950" />
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

        {!isZenMode && (
          <>
            <div className="section-reveal relative z-10 bg-transparent pt-0 pb-0">
              <NewlyAddedStores />
            </div>

            <div className="section-reveal">
              <CommunityImpact />
            </div>
          </>
        )}
      </main>
      {!isZenMode && <Footer />}
    </div>
  );
}
