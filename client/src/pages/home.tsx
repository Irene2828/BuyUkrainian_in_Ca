import { useEffect } from "react";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";

import { FAQ } from "@/components/faq";
import { CommunityImpact } from "@/components/community-impact";
import { MapStats } from "@/components/map-stats";
import { Footer } from "@/components/footer";
import { RecentProductsMarquee } from "@/components/recent-products-marquee";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function Home() {
  useScrollReveal();

  // Handle hash scrolling on mount (e.g. for /#faq)
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="bg-white font-sans text-foreground selection:bg-yellow-accent/30 pt-[100px]">
      <Header />

      <main>
        <div className="section-reveal">
          <Hero />
          <RecentProductsMarquee />
        </div>

        {/* How It Works Content */}
        <div className="section-reveal">
          <HowItWorks />
        </div>

        {/* FAQ (Project's Mission) Content */}
        <div className="section-reveal">
          <FAQ />
        </div>



        <div className="section-reveal">
          <MapStats />
          <CommunityImpact hideBorder />
        </div>
      </main>
      <Footer />
    </div>
  );
}
