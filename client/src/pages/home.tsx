import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { SpreadTheWord } from "@/components/spread-the-word";
import { FAQ } from "@/components/faq";
import { PreFooter } from "@/components/pre-footer";
import { Footer } from "@/components/footer";
import { RecentProductsMarquee } from "@/components/recent-products-marquee";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-yellow-accent/30 overflow-x-hidden">
      <Header />
      <main>
        <Hero />

        {/* How It Works Content */}
        <HowItWorks />

        {/* FAQ (Project's Mission) Content */}
        <FAQ />

        {/* Spread the Word */}
        <SpreadTheWord />

        <PreFooter />

        {/* Products Marquee - above Footer */}
        <RecentProductsMarquee />
      </main>
      <Footer />
    </div>
  );
}
