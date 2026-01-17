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
      {/* Internal Content Wrapper - Perfect Frame aligned with Header and Map */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center w-full">

          {/* Left Content - Centered Mobile, Flush Left Desktop */}
          <div className="w-full lg:w-1/2 flex flex-col items-center md:items-start justify-center order-1">
            {/* Content wrapper - Aligned with parent px-6 */}
            <div className="w-full max-w-[500px] mx-auto md:mx-0 md:px-0">
              {/* Main Headline - Obsidian 5:4 Mobile Ratio with Tight Leading */}
              <h1 className="text-slate-900 leading-tight">
                {/* PART 1: High-Impact Header - text-4xl (36px) mobile */}
                <span className="block text-4xl md:text-[56px] font-bold tracking-tight leading-tight">
                  Find and Share <br className="hidden md:block" />
                  Ukrainian Products
                </span>

                {/* PART 2: Contextual Sub-Header - text-3xl (30px) mobile */}
                <span className="block text-3xl md:text-[42px] font-medium text-slate-700 mt-1 leading-tight">
                  sold across Canada
                </span>
              </h1>

              {/* Subtext - Machined spacing: mt-6 desktop, mt-4 mobile */}
              <p className="hero-subtitle mt-4 md:mt-6 text-[16px] md:text-[18px] font-normal leading-relaxed text-slate-500 font-ui text-left">
                {t('home.hero.subtitle') || 'Support Ukraine\'s economy with every purchase or help the initiative grow by adding new stores to the map.'}
              </p>
            </div>

            {/* Button Wrapper - Aligned with parent px-6 */}
            <div className="w-full max-w-[500px] mx-auto md:mx-0 md:px-0">
              {/* 
                ALIGNMENT FIX: Using items-center consistently ensures both CTAs 
                are vertically centered regardless of their internal heights.
                Never use items-start here as it causes misalignment between 
                elements with different heights (Button vs text link).
              */}
              {/* Button Group - Separate Unit with mt-8, left-aligned on mobile */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 mt-8">
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
