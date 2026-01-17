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
    <section className="premium-parallax-hero relative w-full bg-[#F9FCD4] overflow-hidden font-sans h-[689px] md:h-auto py-[38px] md:pt-16 md:pb-20">
      {/* Internal Content Wrapper - Perfect Frame aligned with Header and Map */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full h-full flex flex-col justify-center md:block">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start md:items-center w-full">

          {/* Left Content - Flush Left Mobile & Desktop */}
          <div className="w-full lg:w-1/2 flex flex-col items-start justify-center order-1">
            {/* Content wrapper - Aligned with parent px-6 */}
            <div className="w-full max-w-4xl text-left">
              {/* Main Headline */}
              <h1 className="text-slate-900 leading-[37.8px] md:leading-[1.05]">
                {/* PART 1: High-Impact Header */}
                <span className="block text-[32px] md:text-[56px] font-semibold tracking-[-1.5px] md:tracking-[-0.01em] leading-[37.8px] md:leading-[1.05] antialiased">
                  Find and Share <br />
                  Ukrainian&nbsp;Products
                </span>

                {/* PART 2: Contextual Sub-Header */}
                <span className="block text-[28px] md:text-[42px] font-medium text-slate-700 mt-1 leading-[33px] md:leading-[1.1] tracking-[-1.5px] md:tracking-[-0.01em]">
                  sold across Canada
                </span>
              </h1>

              {/* Subtext - Machined spacing: mt-6 for paragraph bridge */}
              <p className="hero-subtitle mt-6 text-[16px] md:text-[18px] font-normal leading-relaxed text-slate-500 font-ui text-left max-w-[218px] md:max-w-full">
                {t('home.hero.subtitle') || 'Support Ukraine\'s economy with every purchase or help the initiative grow by adding new stores to the map.'}
              </p>
            </div>

            {/* Mobile-Only Cinematic Asset - Fixed 250x250 Left Aligned */}
            <div
              className="block md:hidden w-full h-[250px] mt-6 rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative"
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

            {/* Button Wrapper */}
            <div className="w-full max-w-[500px]">
              {/* Button Group - Stacked, Left Aligned, Gap 16px */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-start gap-4 md:gap-6 mt-6 md:mt-8">
                <Link href="/map">
                  <Button className="flex items-center justify-center h-[46px] md:h-[52px] bg-black text-white rounded-full px-7 text-[16px] font-semibold gap-1.5 font-ui shadow-none hover:bg-white hover:text-black hover:ring-1 hover:ring-black transition-all">
                    {t('home.hero.explore') || 'Explore the Map'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>

                <Link href="/#how-it-works" className="flex justify-start">
                  <button className="no-invert-hover h-[46px] md:h-[52px] pl-0 text-[15px] font-medium text-slate-900 hover:underline flex items-center gap-2">
                    {t('header.howItWorks') || 'How It Works'}
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden md:flex w-full lg:w-1/2 order-2 justify-center">
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
