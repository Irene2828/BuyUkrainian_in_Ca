import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { SpreadTheWord } from "@/components/spread-the-word";
import { FAQ } from "@/components/faq";
import { PreFooter } from "@/components/pre-footer";
import { Footer } from "@/components/footer";
import { RecentProductsMarquee } from "@/components/recent-products-marquee";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function Home() {
  useScrollReveal();

  return (
    <div className="bg-background font-sans text-foreground selection:bg-yellow-accent/30 overflow-x-hidden">
      <Header />
      <main>
        <div className="section-reveal">
          <Hero />
        </div>

        {/* Products Marquee - Social Proof for user flow */}
        <div className="section-reveal">
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

        {/* Spread the Word */}
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
