import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { MapSection } from "@/components/map-section";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-yellow-accent/30">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <MapSection />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
