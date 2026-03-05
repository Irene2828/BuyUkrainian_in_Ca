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
    <div className="bg-white font-sans text-foreground selection:bg-yellow-accent/30 pt-[80px]">
      <Header />

      <main>
        <div className="section-reveal">
          <Hero />

          {/* 1. Hero-to-How-It-Works Transition Container */}
          <div className="relative w-full bg-white pt-3 pb-12">
            <RecentProductsMarquee />
          </div>
        </div>

        {/* 2. Seamless How It Works & FAQ block */}
        <div className="section-reveal bg-white">
          <HowItWorks />
        </div>

        <div className="section-reveal bg-white">
          <FAQ />
        </div>

        {/* 3. Transition into Stats & Community */}
        <div className="section-reveal relative bg-white">
          <div className="relative z-10">
            <MapStats />
            <CommunityImpact hideBorder />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
