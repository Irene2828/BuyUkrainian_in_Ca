import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Loader2, Maximize2, ArrowLeft, ArrowRight } from "lucide-react";
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
import { Store } from "@/lib/data";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

function NewlyAddedStores() {
  const { t } = useI18n();
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
  });
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-text-secondary)]" /></div>;

  const newlyAdded = stores.slice(0, 5);

  return (
    <section className="bg-white border-t border-gray-50 pt-7 pb-14 md:pt-[44px] md:pb-[110px]">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-4 md:mb-6 max-w-[700px] flex flex-col gap-3 md:gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-premium-pulse shrink-0" />
            <h2 className="text-[12px] md:text-[13px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap section-headline-reveal m-0">
              Recently added by the community
            </h2>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4">
            {newlyAdded.map((store) => (
              <CarouselItem key={store.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                <div
                  onClick={() => setSelectedStore(store)}
                  className="flex flex-row items-center justify-between gap-2 bg-white p-4 rounded-[16px] transition-all h-full duration-300 cursor-pointer group border border-gray-100 shadow-sm hover:scale-[1.02] hover:shadow-lg relative"
                >
                  {/* Left: Image (Smaller, approx 60% width of original full width) */}
                  <div className="w-[45%] aspect-square bg-gray-50 rounded-lg overflow-hidden relative flex-shrink-0">
                    <img
                      src={store.image || store.images?.[0] || "/assets/kyivcake.jpeg"}
                      alt="Store preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Right: Store Name - Right Aligned in Flex */}
                  <div className="flex flex-col items-start gap-1 flex-1 min-w-0 pl-2">
                    <h3 className="text-slate-900 font-semibold tracking-tight text-left text-[15px] leading-snug line-clamp-2">
                      {store.name}
                    </h3>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        document.querySelector('.passport-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => {
                          const event = new CustomEvent('focusStore', { detail: store });
                          window.dispatchEvent(event);
                        }, 600);
                      }}
                      className="flex items-center gap-2 mt-1 bg-transparent text-slate-600 text-xs sm:text-sm font-medium font-ui transition-all duration-300 hover:text-black no-underline p-0 cursor-pointer !outline-none !ring-0 !border-none focus:!outline-none focus-visible:!outline-none focus:!ring-0"
                    >
                      <Maximize2 className="w-4 h-4 !fill-none !stroke-current" strokeWidth={2} />
                      <span>{t('modal.seeOnMap') || 'See on Map'}</span>
                    </button>
                  </div>
                </div>
              </CarouselItem>
            ))}

            {/* Final "See more" card */}
            <CarouselItem className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
              <div
                className="flex flex-col items-center justify-center h-full min-h-[140px] gap-3 p-4 rounded-[16px] border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer group"
                onClick={() => {
                  document.querySelector('.passport-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover:text-slate-800 text-center">
                  See more on the map
                </span>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-4 lg:-left-8 !text-slate-400 !border-slate-200 hover:!text-slate-600 hover:!border-slate-300" />
            <CarouselNext className="-right-4 lg:-right-8 !text-slate-400 !border-slate-200 hover:!text-slate-600 hover:!border-slate-300" />
          </div>
        </Carousel>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Terminal CTA */}
        <div className="flex justify-center mt-12 w-full z-10 relative">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-white text-black px-8 py-3 rounded-full hover:bg-gray-100 transition-all font-semibold"
          >
            <ArrowLeft className="w-4 h-4 !fill-none !stroke-current" strokeWidth={2} />
            Back to Homepage
          </Link>
        </div>
      </div>


      {/* Centered Modal Overlay with Precision Scale Animation */}
      {selectedStore && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedStore(null)}
        >
          <div
            className="w-full max-w-[450px] mx-4 animate-in zoom-in-[0.98] duration-200"
            style={{ animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <StoreCard
              store={selectedStore}
              onClose={() => setSelectedStore(null)}
              onSeeOnMap={(s) => {
                // Scroll to map area smoothly
                document.querySelector('.passport-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Trigger map focus
                setTimeout(() => {
                  const event = new CustomEvent('focusStore', { detail: s });
                  window.dispatchEvent(event);
                }, 600); // Wait for scroll

                setSelectedStore(null);
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function MapPage() {
  useScrollReveal();
  const { t } = useI18n();

  return (
    <div className="bg-background flex flex-col font-sans selection:bg-blue-100">
      <Header />
      <main className="flex-1 flex flex-col">
        {/* Map Page Headline Section - Premium Text-Block Anchor */}


        {/* Map Explorer - NO gap, directly follows headline */}
        <div className="relative z-0 section-reveal mb-[55px]">
          <MapExplorer />
        </div>

        {/* Below-the-fold sections */}
        <div className="section-reveal relative z-10 bg-white">
          <NewlyAddedStores />
        </div>
      </main>
      <Footer />
    </div>
  );
}
