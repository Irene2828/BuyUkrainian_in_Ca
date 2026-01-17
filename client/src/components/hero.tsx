import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Hero() {
  const [videoReady, setVideoReady] = useState(false);
  const { t, language } = useI18n();

  return (
    <section className="premium-parallax-hero relative w-full bg-[#F9FCD4] overflow-hidden font-sans pt-20 pb-24">
      {/* Internal Content Wrapper - Perfect Frame aligned with Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center w-full">

          {/* Left Content - Centered Mobile, Flush Left Desktop */}
          <div className="w-full lg:w-1/2 flex flex-col items-center md:items-start justify-center order-1">
            {/* Content wrapper for centered positioning on mobile with left-aligned text */}
            <div className="w-full max-w-[500px] mx-auto md:mx-0 px-4 md:px-0">
              {/* Main Headline - Exact Typography */}
              <h1 className="hero-title premium-parallax-text w-full mb-4 text-[36px] md:text-[48px] font-bold tracking-tight leading-[1.1] text-gray-900 antialiased whitespace-pre-wrap text-left">
                <span className="hero-reveal-headline">
                  {t('home.hero.title') || 'Find and Share\nUkrainian Products\nsold across Canada'}
                </span>
              </h1>

              {/* Subtext - Discovery & Contribution */}
              <p className="hero-subtitle mb-8 text-[16px] md:text-[18px] font-normal leading-relaxed text-slate-500 font-ui text-left">
                {t('home.hero.subtitle') || 'Support Ukraine\'s economy by purchasing Made in Ukraine goods in Canada or contribute to our community-sourced map yourself by adding new locations.'}
              </p>
            </div>

            {/* Button Wrapper - Centered on mobile, left-aligned on desktop */}
            <div className="w-full max-w-[500px] mx-auto md:mx-0 px-4 md:px-0">
              {/* 
                ALIGNMENT FIX: Using items-center consistently ensures both CTAs 
                are vertically centered regardless of their internal heights.
                Never use items-start here as it causes misalignment between 
                elements with different heights (Button vs text link).
              */}
              <div className="flex flex-col md:flex-row items-center gap-8 mt-5">
                <Link href="/map">
                  <Button className="flex items-center justify-center h-[46px] md:h-[52px] bg-black text-white rounded-full px-7 text-[16px] font-semibold gap-1.5 font-ui shadow-none hover:bg-white hover:text-black hover:ring-1 hover:ring-black transition-all">
                    {t('home.hero.explore') || 'Explore the Map'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>

                <Link href="/#how-it-works">
                  <button className="no-invert-hover text-[15px] font-medium text-slate-900 hover:underline flex items-center gap-2">
                    {t('header.howItWorks') || 'How It Works'}
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 order-2 flex justify-center">
            <div
              className="rounded-2xl md:rounded-[40px] overflow-hidden shadow-sm border border-gray-100 relative aspect-[4/3] max-h-[300px] lg:max-h-none w-full max-w-[500px] lg:max-w-none mx-auto"
              style={{ backgroundColor: '#FDFFD7' }}
            >
              <video
                className="w-full h-full object-cover"
                style={{
                  opacity: videoReady ? 1 : 0,
                  transition: 'opacity 0.4s ease-in-out'
                }}
                autoPlay
                muted
                loop
                playsInline
                onCanPlay={() => setVideoReady(true)}
              >
                <source src="/hero-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
