import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Loader2, ExternalLink, ArrowLeft } from "lucide-react";
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

  const newlyAdded = stores.slice(0, 4);

  return (
    <section className="bg-white border-t border-gray-50 pt-9 pb-14 md:pt-14 md:pb-[110px] px-6 md:px-20">
      <div className="container mx-auto max-w-[1440px]">
        <div className="mb-8 md:mb-12 max-w-[700px] flex flex-col gap-3 md:gap-4 text-left">
          <h2 className="text-[28px] md:text-[24px] font-semibold md:font-medium tracking-tight md:tracking-[-0.05em] leading-tight md:leading-[52.5px] font-header section-headline-reveal text-slate-900">
            Recently Added Findings
          </h2>

        </div>
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


                <div className="w-full aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden relative">
                  <img
                    src={store.image || "/assets/kyivcake.jpeg"}
                    alt="Store preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-center mt-4 w-full">
                  <div className="flex items-center gap-2 text-black/45 text-[13px] font-medium font-ui transition-all group-hover:text-black group-hover:-translate-y-[1px] no-underline">
                    <span>{t('modal.seeDetails') || 'See details'}</span>
                    <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Terminal CTA */}
        <div className="flex justify-center mt-12 w-full z-10 relative">
          <Link
            className="flex items-center justify-center gap-2 bg-white text-black px-8 py-3 rounded-full hover:bg-gray-100 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
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
        <section className="bg-white px-6 md:px-16 section-reveal">
          <div className="container mx-auto max-w-[1440px] pt-8 pb-8 md:pt-12 md:pb-8 flex flex-col items-center justify-center">
            {/* Text-Block Anchor with Premium Binding */}
            <div className="flex flex-col gap-3 text-center items-center">
              <h2 className="text-[28px] md:text-[42px] font-semibold md:font-medium tracking-tight md:tracking-[0.03em] leading-tight md:leading-[52.5px] font-header section-headline-reveal text-slate-900">
                {t('map.headline') || 'Find Ukrainian Products Across Canada'}
              </h2>
              <p className="text-[16px] md:text-[18px] text-slate-600 max-w-2xl font-ui md:leading-[29.3px] md:tracking-[-0.44px]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
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
      </main>
      <Footer />
    </div>
  );
}
