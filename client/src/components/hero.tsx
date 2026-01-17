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
    <section className="premium-parallax-hero relative z-10 w-full bg-[#F9FCD4] overflow-hidden font-sans min-h-[720px] min-[391px]:min-h-[820px] h-auto md:h-auto pt-[58px] pb-[42px] md:pt-16 md:pb-20">
      {/* Internal Content Wrapper - Perfect Frame aligned with Header and Map */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full flex flex-col justify-start md:block">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start md:items-center w-full">

          {/* Left Content - Flush Left Mobile & Desktop */}
          <div className="w-full lg:w-1/2 flex flex-col items-start justify-center order-1">
            {/* Content wrapper - Aligned with parent px-6 */}
            <div className="w-full max-w-4xl text-left">
              {/* Main Headline */}
              <h1 className="text-slate-900 leading-[40px] min-[391px]:leading-[48px] md:leading-[1.05] max-w-full min-[391px]:max-w-[323px] md:max-w-full md:mx-0">
                {/* PART 1: High-Impact Header - Reverted to 'Find and Share / Ukrainian Products' per Figma mockup */}
                <span className="block text-[32px] min-[391px]:text-[38px] md:text-[56px] font-semibold tracking-[-1.5px] min-[391px]:tracking-[-1px] md:tracking-[-1px] leading-[40px] min-[391px]:leading-[48px] md:leading-[1.05] antialiased">
                  Find and Share <br />
                  Ukrainian&nbsp;Products
                </span>

                {/* PART 2: Contextual Sub-Header */}
                {/* Aggressively reduced mt-1.5 to mt-0 to force visual tightening */}
                <span className="block text-[28px] min-[391px]:text-[32px] md:text-[42px] font-medium text-slate-700 mt-0 min-[391px]:mt-0 md:mt-2 leading-[40px] min-[391px]:leading-[48px] md:leading-[1.1] tracking-[-1px] md:tracking-[-0.01em]">
                  sold across Canada
                </span>
              </h1>

              {/* Subtext - Reduced to mt-3 (12px) on all mobile sizes */}
              <p className="hero-subtitle mt-6 text-[16px] min-[391px]:text-[18px] md:text-[18px] font-normal leading-[24px] min-[391px]:leading-[28px] md:leading-relaxed text-slate-500 font-ui text-left tracking-[-0.31px] md:tracking-normal max-w-[260px] min-[391px]:max-w-[323px] md:max-w-full">
                {t('home.hero.subtitle') || 'Support Ukraine\'s economy with every purchase or help the initiative grow by adding new stores to the map.'}
              </p>
            </div>

            {/* Mobile-Only Cinematic Asset - Square + Full Width per Figma */}
            <div
              className="block md:hidden w-full aspect-square mt-6 rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative"
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
              {/* Button Group - Stacked, Gap Reset to 12px (gap-3) */}
              <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-3 md:gap-6 mt-6 md:mt-8">
                <Link href="/map">
                  <Button className="flex items-center justify-center h-[46px] md:h-[52px] bg-black text-white rounded-full px-7 text-[16px] font-semibold gap-1.5 font-ui shadow-none hover:bg-white hover:text-black hover:ring-1 hover:ring-black transition-all">
                    {t('home.hero.explore') || 'Explore the Map'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>

                <Link href="/map" className="flex justify-center md:justify-start">
                  <Button className="flex items-center justify-center h-[46px] md:h-[52px] bg-white text-black border-[1.5px] border-black border-solid rounded-full px-7 text-[16px] font-medium gap-1.5 font-ui shadow-none hover:bg-black hover:text-white transition-all">
                    + Add a Store
                  </Button>
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
