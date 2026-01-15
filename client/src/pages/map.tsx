import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Loader2, ExternalLink } from "lucide-react";
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

  const newlyAdded = stores.slice(0, 4);

  return (
    <section className="bg-white border-t border-gray-50 pt-9 pb-14 md:pt-14 md:pb-[110px] px-6 md:px-16">
      <div className="container mx-auto max-w-[1440px]">
        <span className="text-[13px] font-semibold uppercase tracking-[0.05em] text-slate-400 mb-4 block">{t('map.recentlyAdded') || 'Recently added'}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 text-left">
          {newlyAdded.map((store) => {
            const categoryLabels: Record<string, string> = {
              food: "Food & Grocery",
              clothes: "Clothing",
              retail: "Retail & Gifts",
              other: "Gifts"
            };
            const categoryLabel = categoryLabels[store.category] || store.category;
            return (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className="flex flex-col gap-4 bg-white p-4 rounded-[16px] transition-all h-full duration-200 cursor-pointer group border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0 border border-white shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-[#3C93EA]"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#F3FF0A]" style={{ opacity: 0.8 }}></div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-semibold text-black/75 truncate font-header leading-tight tracking-tight">{store.name}</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400 truncate font-ui">{categoryLabel}</span>
                  </div>
                </div>

                <div className="w-full aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden relative">
                  <img
                    src={store.image || "/assets/kyivcake.jpeg"}
                    alt="Store preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex items-center gap-2 text-black/45 text-[13px] font-medium font-ui transition-all group-hover:text-black group-hover:-translate-y-[1px] underline decoration-1 underline-offset-2">
                    <span>{t('modal.seeDetails') || 'See details'}</span>
                    <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Centered Modal Overlay with Precision Scale Animation */}
      {selectedStore && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedStore(null)}
        >
          <div
            className="w-full max-w-[400px] mx-4 animate-in zoom-in-[0.98] duration-200"
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
        {/* Map Page Headline Section - Symmetrical Balance */}
        <section className="bg-white text-center px-6 md:px-16 section-reveal">
          <div className="container mx-auto max-w-[1440px] py-16 md:py-20 flex flex-col items-center justify-center text-center">
            <h2 className="text-slate-950 font-bold tracking-tight text-4xl mb-3 leading-tight font-header section-headline-reveal">
              {t('map.headline') || 'Find Ukrainian Products Across Canada'}
            </h2>
            <p className="hidden md:block text-[20px] font-normal text-gray-600 max-w-[700px] mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
              {t('map.subheadline') || 'Browse the map or add places selling products made in Ukraine'}
            </p>
          </div>
        </section>

        {/* Map Explorer - NO gap, directly follows headline */}
        <div className="relative z-0 section-reveal mb-[110px]">
          <MapExplorer />
        </div>

        {/* Below-the-fold sections */}
        <div className="section-reveal relative z-10 bg-white">
          <NewlyAddedStores />
        </div>
        <div className="section-reveal">
          <SpreadTheWord />
        </div>
        <div className="section-reveal">
          <PreFooter />
        </div>
      </main>
      <Footer />
    </div>
  );
}
