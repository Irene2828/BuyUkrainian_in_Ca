import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Loader2, ArrowRight, ArrowUpRight, Plus, MapPin } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MapExplorer } from "@/components/map-explorer";
import { Store } from "@/lib/data";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GoogleMapsProvider } from "@/components/google-maps-provider";

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
    const mapElement = document.querySelector('.map-column-wrapper') || document.querySelector('.passport-map-container');
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
              <span className="text-reveal text-[11.7px] font-medium tracking-widest text-slate-600/95 uppercase whitespace-nowrap font-['Inter'] antialiased">
                LATEST COMMUNITY ADDITIONS
              </span>
            </div>
            <button
              onClick={() => {
                (document.querySelector('.map-column-wrapper') || document.querySelector('.passport-map-container'))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="text-[11px] font-medium text-slate-400 hover:text-[#0057B7] transition-colors flex items-center gap-1.5 tracking-normal font-['Inter'] uppercase"
            >
              View all <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/header-link:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="content-width">
        <div className="min-[1280px]:max-[1669px]:px-[clamp(72px,5vw,92px)] min-[1670px]:px-[clamp(52px,3.6vw,72px)] w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-8 gap-y-10 items-start ml-[1.3px]">
          {newlyAdded.slice(0, 4).map((store) => (
            <div
              key={store.id}
              className="relative group cursor-pointer"
              onClick={() => handleSeeOnMap(store)}
            >
              {/* Frosted Glass Overlay with CTA - Centered vertically and static */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none">
                <button className="flex items-center gap-2 bg-transparent backdrop-blur-md text-[#0057B7] border-0 text-[13px] font-medium tracking-normal px-6 py-2.5 rounded-none shadow-none transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-95 pointer-events-auto group/btn">
                  See on Map
                  <MapPin className="w-3 h-3 transition-transform duration-300 group-hover/btn:scale-110 text-current" />
                </button>
              </div>

              <div className="border-l-[2px] border-l-[#FFD700] pl-4 py-2 cursor-pointer transition-all duration-300 group-hover:blur-[1.5px] group-hover:opacity-45">
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 group/title">
                    <h3 className="text-slate-900 font-semibold text-[15px] tracking-tight leading-tight antialiased line-clamp-2">
                      {store.name}
                    </h3>
                    <ArrowUpRight className="w-[14px] h-[14px] text-slate-300 group-hover/title:text-[#0057B7] transition-all duration-300 -translate-y-0.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-slate-600 font-medium text-[13px] mt-1">
                    {store.city}, {getProvinceAbbreviation(store.province)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-[#0057B7]/10 mt-10" aria-hidden="true" />

      {/* Community Call to Action */}
      <div className="relative overflow-hidden flex flex-col items-center justify-center pt-[48px] md:pt-[80px] pb-0 text-center px-4 bg-white/85 backdrop-blur-xl">
        <p className="text-reveal relative z-10 text-[18px] font-medium text-slate-900 leading-relaxed text-center max-w-[40ch] mx-auto mb-6">
          Know a store we missed? Add it to the map.
        </p>
        <button
          onClick={() => setAddStoreDialogOpen(true)}
          className="relative z-10 inline-flex w-auto items-center justify-center h-[46px] px-6 text-[16px] font-medium tracking-normal rounded-none bg-transparent text-[#0057B7] border border-solid border-[#0057B7] shadow-none transition-all duration-300 hover:bg-[#0057B7] hover:border-[#0057B7] hover:text-white hover:scale-[1.02] active:scale-95 2xl:h-[54px] 2xl:text-[17px] focus-visible:ring-2 focus-visible:ring-[#0057B7]/30 gap-2.5 group/cta-btn mx-auto"
        >
          <span>Add a New Store</span>
          <Plus className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform duration-300 group-hover/cta-btn:scale-110 text-current" />
        </button>
      </div>

      <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
        <DialogContent className="max-w-[600px] p-0 border-none bg-transparent shadow-none overflow-visible">
          <GoogleMapsProvider>
            <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
          </GoogleMapsProvider>
        </DialogContent>
      </Dialog>





    </section>
  );
}
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function MapPage() {
  useScrollReveal();
  const [isZenMode, setIsZenMode] = useState(false);

  return (
    <div className={cn(
      "bg-white min-h-screen flex flex-col font-sans selection:bg-blue-100 transition-all duration-500",
      isZenMode ? "bg-[#0057B7]" : ""
    )}>
      {!isZenMode && <Header />}
      <main className="flex flex-col flex-1">
        {!isZenMode && <div className="w-full h-0 bg-white shrink-0" />}
        <div
          className={cn(
            "relative z-0 mb-0 transition-all duration-500 w-full",
            isZenMode ? "flex-1" : "h-auto"
          )}
        >
          <MapExplorer isZenMode={isZenMode} onZenModeToggle={() => setIsZenMode(!isZenMode)} />
        </div>

        {!isZenMode && (
          <>
            <div className="section-reveal relative z-10 bg-transparent pt-0 pb-0">
              <NewlyAddedStores />
            </div>
          </>
        )}
      </main>
      {!isZenMode && <Footer />}
    </div>
  );
}
