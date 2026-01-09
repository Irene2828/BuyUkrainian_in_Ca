import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Loader2, ExternalLink } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MapExplorer } from "@/components/map-explorer";
import { SpreadTheWord } from "@/components/spread-the-word";
import { PreFooter } from "@/components/pre-footer";

function NewlyAddedStores() {
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-text-secondary)]" /></div>;

  const newlyAdded = stores.slice(0, 4);

  return (
    <section className="bg-white text-center border-t border-gray-50 py-12 md:py-24 px-4 md:px-16">
      <div className="container mx-auto max-w-[1440px]">
        <h2 className="text-[28px] md:text-[42px] font-medium mb-8 md:mb-12 text-[var(--color-section-headline)] font-header section-headline-reveal">Newly added stores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 text-left">
          {newlyAdded.map((store) => (
            <div
              key={store.id}
              className="flex flex-col gap-4 md:gap-6 bg-white p-4 md:p-8 rounded-[24px] md:rounded-[40px] border border-brand-cyan transition-all h-full shadow-sm hover:shadow-md hover:border-brand-cyan group"
            >
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full overflow-hidden relative shrink-0 border border-white shadow-sm">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-brand-blue-logo"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-brand-yellow-logo" style={{ opacity: 0.8 }}></div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[18px] md:text-[20px] font-medium text-admin-text-dark truncate font-header">{store.name}</span>
                  <span className="text-[12px] md:text-[14px] text-gray-400 font-bold truncate font-ui tracking-tight">Local store</span>
                </div>
              </div>

              <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <img
                  src="/assets/kyivcake.jpeg"
                  alt="Store preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-[14px] font-bold mt-auto font-ui group cursor-pointer transition-colors hover:text-brand-cyan">
                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span>See location</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MapPage() {
  return (
    <>
      {/* Mobile: Full screen map experience with h-screen and overflow-hidden */}
      <div className="md:hidden h-screen overflow-hidden bg-background flex flex-col font-sans selection:bg-blue-100">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Compact Headline - Mobile */}
          <div className="bg-white text-center px-4 py-4">
            <h1 className="text-[20px] font-medium text-[var(--color-section-headline)] leading-tight tracking-tight font-header">
              Find Ukrainian Products
            </h1>
          </div>

          {/* Map fills remaining space */}
          <div className="flex-1 min-h-0">
            <MapExplorer />
          </div>
        </main>
      </div>

      {/* Desktop: Regular layout with all sections */}
      <div className="hidden md:flex min-h-screen bg-background flex-col font-sans selection:bg-blue-100">
        <Header />
        <main className="flex-1 flex flex-col">
          {/* Map Page Headline Section - Desktop */}
          <section className="pt-20 bg-white text-center px-16">
            <div className="container mx-auto max-w-[1440px]">
              <div className="mb-8">
                <h1 className="text-[42px] font-medium mb-8 text-[var(--color-section-headline)] leading-tight tracking-tight font-header section-headline-reveal">
                  Find Ukrainian Products Across Canada
                </h1>
                <p className="text-[18px] font-normal text-gray-500 max-w-[700px] mx-auto font-ui mb-6">
                  Browse the map or add places selling products made in Ukraine
                </p>
              </div>
            </div>
          </section>

          <MapExplorer />
          <NewlyAddedStores />
          <SpreadTheWord />
          <PreFooter />
        </main>
        <Footer />
      </div>
    </>
  );
}
