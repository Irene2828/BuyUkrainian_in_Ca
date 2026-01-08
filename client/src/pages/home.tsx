import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { MapExplorer } from "@/components/map-explorer";
import { RecentProductsMarquee } from "@/components/recent-products-marquee";
import { SpreadTheWord } from "@/components/spread-the-word";
import { FAQ } from "@/components/faq";
import { PreFooter } from "@/components/pre-footer";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-yellow-accent/30 overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <RecentProductsMarquee />



        {/* How It Works Content */}
        <HowItWorks />

        {/* FAQ (Project's Mission) Content */}
        <FAQ />

        {/* Full-Bleed Interstitial Map 2: Between FAQ and Spread the Word - REDUCED BY 50% */}
        <section className="interstitial-map-section bg-map-faq-to-spread" style={{ paddingTop: 0, paddingBottom: 0, minHeight: "50px" }} />

        <SpreadTheWord />
        <PreFooter />
      </main>
      <Footer />
    </div>
  );
}
