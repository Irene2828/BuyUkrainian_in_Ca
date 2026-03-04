# HOMEPAGE SOURCE CODE DNA AUDIT

**Target**: Full Visual & Structural Inspection
**Scope**: `app/page.tsx` + All Component Children
**Alignment Focus**: Vertical Rhythm & 1600px Constraints

---

## 1. MAIN ASSEMBLY (`client/src/pages/home.tsx`)

```tsx
import { useEffect } from "react";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { SpreadTheWord } from "@/components/spread-the-word";
import { FAQ } from "@/components/faq";
import { CommunityImpact } from "@/components/community-impact";
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
    <div className="bg-background font-sans text-foreground selection:bg-yellow-accent/30">
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

        {/* Spread the Word */}
        <div className="section-reveal">
          <SpreadTheWord />
        </div>

        <div className="section-reveal">
          <CommunityImpact />
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

## 2. HERO SECTION (`client/src/components/hero.tsx`)

```tsx
import { useState, useEffect } from "react";
import { ArrowRight, Info, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Hero() {
  const [activeLayer, setActiveLayer] = useState<"main" | "secondary">("main");
  const [showNudge, setShowNudge] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowNudge(false);
      } else {
        setShowNudge(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative z-10 w-full bg-[#F9FCD4] overflow-hidden font-sans py-2 md:py-0 md:h-[480px] md:flex md:items-center animate-in fade-in duration-500">
      {/* Outer Wrapper: 1600px (matches global expansion) */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
        {/* Inner Content Wrapper: 1280px (Focused Hero Override) */}
        <div className="max-w-7xl mx-auto w-full">
          {/* Equilibrium Grid: Perfect Vertical Centering */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center w-full">

            {/* Left Column: Text Content - Vertically Centered */}
            <div className="w-full lg:w-1/2 flex flex-col items-start order-1 lg:pl-12">
              {/* Visual Grouping: Headline + Subtext + CTAs in One Container */}
              <div className="w-full max-w-4xl">
                {/* Main Headline - Structured for equal visual spacing */}
                <h1 className="text-slate-900 flex flex-col items-start max-w-full md:max-w-full md:mx-0 mb-[24px]">
                  {/* Line 1 & 2 */}
                  <span className="text-[32px] md:text-[48px] font-bold md:font-semibold font-instrument tracking-[-0.025em] leading-[1] text-slate-900 block mb-[8px]">
                    Find and Share
                  </span>
                  <span className="text-[32px] md:text-[48px] font-bold md:font-semibold font-instrument tracking-[-0.025em] leading-[1] text-slate-900 block">
                    Ukrainian&nbsp;Products
                  </span>

                  {/* Line 3 - Visual continuation */}
                  <span className="text-[24px] md:text-[28px] font-medium font-instrument text-slate-900 leading-tight tracking-[-0.02em] mt-3">
                    sold across Canada
                  </span>
                </h1>

                {/* Subtext - Matching section subheaders */}
                <p className="hero-subtitle text-[16px] font-medium text-gray-600 font-sans text-left tracking-[-0.01em] leading-[26px] md:leading-[26px] max-w-[85%] md:max-w-[700px] mb-[32px]">
                  Find or add stores that sell Ukrainian-made products.🇺🇦🇨🇦 <br className="hidden md:block" />
                  Let's make it easy to buy Ukrainian in Canada.
                </p>

                {/* Mobile-Only Cinematic Asset */}
                <div
                  className="block md:hidden w-full aspect-square mt-6 relative"
                >
                  {/* Front Element: Main (Top-Left) */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 w-[70%] h-[70%] rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-500 ease-out",
                      activeLayer === 'main' ? "z-20 scale-[1.02]" : "z-10 scale-100 grayscale-[20%]"
                    )}
                    style={{ backgroundColor: '#FDFFD7' }}
                    onMouseEnter={() => setActiveLayer('main')}
                  >
                    <img
                      src="/madeinUA.jpg"
                      alt="Made in Ukraine"
                      className="w-full h-full object-cover scale-110"
                    />
                  </div>
                  {/* Back Element: Secondary (482) */}
                  <div
                    className={cn(
                      "absolute bottom-0 right-0 w-[75%] h-[65%] rounded-3xl overflow-hidden shadow-xl border-4 border-[#F9FCD4] transition-all duration-500 ease-out",
                      activeLayer === 'secondary' ? "z-20 scale-[1.02]" : "z-10 scale-100 grayscale-[20%]"
                    )}
                    style={{ backgroundColor: '#FDFFD7' }}
                    onMouseEnter={() => setActiveLayer('secondary')}
                  >
                    <img
                      src="/482.jpg"
                      alt="Process 482"
                      className="w-full h-full object-cover scale-110"
                    />
                  </div>
                </div>

                {/* Button Group - Airy buffer from subheading */}
                <div className="w-full max-w-[500px]">
                  <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-3 md:gap-6">
                    <Link href="/map">
                      <button className="group rounded-full bg-black hover:bg-black text-white px-8 py-3 text-base font-medium transition-all duration-300 hover:-translate-y-0.5 hover:font-semibold flex items-center gap-2 shadow-none tracking-[0.3px]">
                        <span>{t('home.hero.explore') || "Explore the map"}</span>
                        {/* Thin-Stroke Arrow (1.5px) */}
                        <svg
                          className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 10H16M16 10L11 5M16 10L11 15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </Link>

                    <Link href="/map" className="group relative flex items-center justify-center h-[52px] px-6 text-[16px] font-medium text-slate-800 transition-transform duration-200 hover:text-[#111827] hover:scale-[1.02] gap-2 font-ui tracking-tight outline-none">
                      <Info className="w-5 h-5 !fill-none !stroke-current" strokeWidth={2} />
                      <span>{t('home.hero.learnMore') || 'Learn More'}</span>
                      <span className="absolute bottom-[10px] left-6 right-6 h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visualization - Vertically Centered */}
            <div className="hidden md:flex w-full lg:w-1/2 order-2 justify-center">
              <div
                className="relative aspect-[4/3] max-h-[300px] lg:h-[384px] lg:max-h-[384px] min-[1440px]:h-[384px] min-[1440px]:max-h-none w-full max-w-[500px] lg:w-[512px] min-[1440px]:w-[636px] lg:max-w-none mx-0 min-[1440px]:aspect-auto"
              >
                {/* Front Element: Main (Top-Left) */}
                <div
                  className={cn(
                    "absolute top-0 left-0 w-[70%] h-[85%] rounded-[40px] overflow-hidden shadow-sm border border-gray-100 transition-all duration-500 ease-out",
                    activeLayer === 'main' ? "z-20 scale-[1.02]" : "z-10 scale-100 grayscale-[20%]"
                  )}
                  style={{ backgroundColor: '#FDFFD7' }}
                  onMouseEnter={() => setActiveLayer('main')}
                >
                  <img
                    src="/madeinUA.jpg"
                    alt="Made in Ukraine"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>

                {/* Back Element: Secondary (482) */}
                <div
                  className={cn(
                    "absolute bottom-[-20px] right-0 w-[75%] h-[75%] rounded-[40px] overflow-hidden shadow-2xl border-[6px] border-[#F9FCD4] transition-all duration-500 ease-out",
                    activeLayer === 'secondary' ? "z-20 scale-[1.02]" : "z-10 scale-100 grayscale-[20%]"
                  )}
                  style={{ backgroundColor: '#FDFFD7' }}
                  onMouseEnter={() => setActiveLayer('secondary')}
                >
                  <img
                    src="/482.jpg"
                    alt="Process 482"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 3. NEW FINDINGS FLICKER (`client/src/components/recent-products-marquee.tsx`)

```tsx
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export function RecentProductsMarquee() {
    const { t } = useI18n();
    const [location] = useLocation();
    const [isStuck, setIsStuck] = useState(false);

    // ... (Hover Logic)

    return (
        <>
            <div
                className={cn(
                    "w-full py-3.5 overflow-hidden font-sans transition-all duration-300",
                    isHome
                        ? "sticky top-0 z-50 bg-white/80 backdrop-blur-md"
                        : "relative z-20 bg-white"
                )}
            >
                <div className="max-w-7xl mx-auto flex items-center h-[50px] md:h-[60px] relative px-6 md:px-12">

                    {/* Fixed Live Label */}
                    <div className="sticky left-0 z-30 py-2 pr-6 flex items-center gap-3 h-full">
                        {/* Glass gradient background for label to mask marquee behind it */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/90 to-transparent pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-premium-pulse shrink-0" />
                            <span className="text-[12px] md:text-[13px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                                New Findings
                            </span>
                        </div>
                    </div>

                    {/* Infinite Scroll Ticker - REMOVED group-hover pause class to allow moving overlay */}
                    <div className="flex flex-1 overflow-hidden mask-ticker group/marquee ml-4">
                        <div className="flex animate-marquee whitespace-nowrap items-center min-w-full">
                            {repeatedStores.map((store, i) => (
                                <span
                                    key={`${store.id}-${i}`}
                                    className="group relative text-[14px] md:text-[16px] font-medium text-slate-800 hover:text-slate-950 mx-6 flex items-center gap-2.5 select-none cursor-pointer transition-colors duration-300 ease-in-out"
                                    onClick={() => window.open(`/map?store=${encodeURIComponent(store.name)}`, '_blank')}
                                    onMouseEnter={(e) => handleMouseEnter(e, store)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {/* Identity Dot: 10px, Split 50/50, Opacity 60->100 */}
                                    <span
                                        className="w-[10px] h-[10px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                                        style={{ background: 'linear-gradient(to bottom, #0057B7 50%, #FFD700 50%)' }}
                                    />
                                    {store.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* ... (Overlay Logic) */}
        </>
    );
}
```

---

## 4. HOW IT WORKS (`client/src/components/how-it-works.tsx`)

```tsx
import { MapPin, Search, PlusCircle, ArrowRight, Share2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useI18n();

  // ... (Steps Data)

  return (
    <section id="how-it-works" className="py-40 md:py-48 font-sans overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Section Header - Tighter Gap */}
        <div className="mb-12 md:mb-16 max-w-4xl mx-auto flex flex-col gap-6 text-center items-center">
          <h2 className="text-[36px] font-semibold tracking-tight leading-[1.1] font-sans section-headline-reveal text-slate-900">
            How It Works
          </h2>
          <p className="subline font-ui max-w-2xl mx-auto">
            Find new locations, contribute findings, and share the project with others.
          </p>
        </div>

        {/* Steps Grid with Stagger Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 stagger-container">
          {/* ... (Step Cards - Code truncated for brevity as logic is identical across items) */}
          {/* Step 1 */}
          <div className="stagger-item group flex flex-col items-center bg-transparent px-6 pt-8 pb-0 h-full text-center">
             {/* ... */}
          </div>
          {/* ... */}
        </div>

      </div>
    </section>
  );
}
```

---

## 5. FAQ (`client/src/components/faq.tsx`)

```tsx
// ... imports

export function FAQ() {
  // ... state

  return (
    <section id="faq" className="bg-transparent font-sans overflow-hidden pt-8 md:pt-8 pb-32 md:pb-32">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="mb-16 max-w-3xl mx-auto flex flex-col gap-6 text-center">
          <h2 className="text-[36px] font-semibold tracking-tight leading-[52.5px] font-sans section-headline-reveal text-slate-900">
            Common Questions
          </h2>
          <p className="subline font-ui max-w-2xl mx-auto">
            Frequently asked questions about the map and how to contribute.
          </p>
        </div>

        {/* Accordion - Semantic Details/Summary */}
        <div className="max-w-[680px] mx-auto w-full px-4 md:px-0 flex flex-col gap-4">
          {/* ... (FAQ Map) */}
        </div>
      </div >
    </section >
  );
}
```

---

## 6. SHARE WITH FRIENDS (`client/src/components/spread-the-word.tsx`)

```tsx
import { Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";

export function SpreadTheWord() {
  const shareMessage = "Find or add stores that sell Ukrainian-made products.🇺🇦🇨🇦\nLet’s make it easy to buy Ukrainian in Canada.";
  // ... (Share Logic)

  return (
    <section className="relative w-full bg-[#ECF6FF] py-32 md:py-32 overflow-hidden z-10 flex flex-col justify-center">
      {/* Structural Container */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full relative z-10 flex flex-col items-center">

        <div className="mb-12 max-w-3xl mx-auto flex flex-col gap-6 text-center">
          <h2 className="text-[36px] font-semibold tracking-tight leading-[52.5px] font-sans section-headline-reveal text-slate-900">
            Share with Friends
          </h2>
          <p className="subline font-ui max-w-2xl mx-auto">
            Share the map with your network and help others find Ukrainian-made products across Canada.
          </p>
        </div>

        <div className="relative w-full md:w-[790px] mx-auto">

          {/* Material Card Section - Editorial Minimalist */}
          <div className="w-full h-full md:h-[252px] bg-[#000000] backdrop-blur-xl border border-slate-800 rounded-[40px] md:rounded-[50px] flex flex-col items-center justify-center text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)] py-14 px-10 md:px-20 relative z-10 overflow-hidden isolate">

            {/* Subtle Inner Border/Glow */}
            <div className="absolute inset-0 rounded-[40px] md:rounded-[50px] ring-1 ring-white/10 pointer-events-none" />

            {/* Minimalist Editorial Quote - No SVGs */}
            <div className="px-2 md:px-0 mb-8 w-full max-w-[600px] mx-auto text-center relative z-10">
              <p className="text-lg md:text-xl font-normal italic text-white leading-relaxed tracking-wide font-sans">
                <span className="opacity-30">"</span>
                Find or add stores that sell Ukrainian-made products. 🇺🇦🇨🇦 Let's make it easy to buy Ukrainian in Canada.
                <span className="opacity-30">"</span>
              </p>
            </div>

            {/* Social Buttons - Ghost Aesthetic (15% white opacity) */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 w-full relative z-10">
               {/* ... (Buttons) */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 7. COMMUNITY IMPACT (`client/src/components/community-impact.tsx`)

```tsx
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { MapPin, Map, Package, Search } from "lucide-react";
import { Link } from "wouter";
import { StatisticCard } from "@/components/ui/statistic-card";

export function CommunityImpact() {
    // ... (Query)

    return (
        <section className="relative w-full pt-20 md:pt-32 pb-[100px] bg-white border-t border-slate-100">
            <div className="max-w-[800px] mx-auto px-6 lg:px-0 flex flex-col items-center">

                {/* High-End Stats Alignment (Tight Row) */}
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-12 md:gap-6 mb-12 border-b border-transparent">
                    <StatisticCard value={stats.stores} label="Stores" icon={MapPin} delay={0} />
                    <StatisticCard value={stats.provinces} label="Provinces" icon={Map} delay={200} />
                    <StatisticCard value={stats.products} label="Products" icon={Package} delay={400} />
                </div>

                <div className="text-center max-w-xl mb-12">
                    <p className="text-base text-slate-600 font-normal leading-relaxed text-center subline">
                        Know a place we missed? Help us grow the map.
                    </p>
                </div>

                {/* Final Action (Anchor) */}
                <Link href="/map">
                    <button className="group rounded-full bg-black hover:bg-black text-white px-8 py-3 text-base font-medium transition-all duration-300 hover:-translate-y-0.5 hover:font-semibold flex items-center gap-2 tracking-[0.3px]">
                        See What's on the Map
                        <Search className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    </button>
                </Link>

            </div>
        </section>
    );
}
```

---

## 8. FOOTER (`client/src/components/footer.tsx`)

```tsx
import { Link } from "wouter";
import { AccessibilityToggle } from "@/components/ui/accessibility-toggle";

export function Footer() {
  return (
    <footer className="bg-black text-[#fafafa] pb-10 font-sans overflow-hidden relative">
      {/* Spanning Grid - Flex Justify Between for Edge Alignment */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full pt-16 pb-12">
        <div className="flex justify-between w-full md:justify-start md:gap-20 lg:gap-32">

          {/* Column 1: Navigation (Left Edge) */}
          <div className="flex flex-col items-start text-left">
             {/* ... */}
          </div>

          {/* Right Side Group (Stacked Right on Mobile, Row Left on Desktop) */}
          <div className="flex flex-col items-end text-right gap-10 md:flex-row md:items-start md:text-left md:gap-20 lg:gap-32 md:ml-auto">
             {/* ... */}
          </div>
        </div>
      </div>

      {/* Bottom Bar - Legal/Copyright + Accessibility Toggle */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full border-t border-white/10 pt-8 mt-0 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-slate-500">
         {/* ... */}
      </div>
    </footer>
  );
}
```

