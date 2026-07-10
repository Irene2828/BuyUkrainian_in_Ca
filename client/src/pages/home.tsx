import { useEffect } from "react";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";

import { FAQ } from "@/components/faq";
import { CommunityImpact } from "@/components/community-impact";
import { MapStats } from "@/components/map-stats";
import { Footer } from "@/components/footer";

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
    <div className="bg-white font-sans text-foreground selection:bg-yellow-accent/30">
      <Header />

      <main>
        <div className="section-reveal -mt-[1px] relative z-0">
          <Hero />
        </div>

        <div className="section-reveal bg-slate-50">
          <MapStats />
        </div>

        {/* 2. Seamless How It Works & FAQ block */}
        <div className="section-reveal bg-white">
          <HowItWorks />
        </div>

        <div className="section-reveal bg-white">
          <FAQ />
        </div>

        {/* 3. Transition into Community Impact */}
        <div className="section-reveal relative bg-white">
          <div className="relative z-10">
            <CommunityImpact />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
