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
    <section className="premium-parallax-hero relative z-10 w-full bg-[#F9FCD4] overflow-hidden font-sans min-h-[720px] min-[391px]:min-h-[820px] md:min-h-0 h-auto md:h-[528px] pt-[42px] min-[391px]:pt-[52px] pb-[42px] md:p-0 md:flex md:items-center">
      {/* Internal Content Wrapper - Perfect Frame aligned with Header and Map */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full flex flex-col justify-start md:block">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 min-[1440px]:gap-[148px] items-start w-full">

          {/* Left Content - Flush Left Mobile & Desktop */}
          <div className="w-full lg:w-1/2 flex flex-col items-start justify-center order-1">
            {/* Content wrapper - Aligned with parent px-6 */}
            <div className="w-full max-w-4xl text-left">
              {/* Main Headline */}
              <h1 className="text-slate-900 leading-[36px] min-[391px]:leading-[42px] md:leading-[1.05] max-w-full min-[391px]:max-w-[323px] md:max-w-full md:mx-0">
                {/* PART 1: High-Impact Header - Reverted to 'Find and Share / Ukrainian Products' per Figma mockup */}
                <span className="block text-[32px] min-[391px]:text-[42px] md:text-[56px] min-[1440px]:text-[60px] font-bold min-[391px]:font-semibold md:font-semibold font-instrument tracking-[-0.01em] min-[391px]:tracking-[-0.01em] md:tracking-[-0.01em] min-[1440px]:tracking-[-1.5px] leading-[1.05] min-[391px]:leading-[1.05] md:leading-[1.05] antialiased">
                  Find and Share <br />
                  Ukrainian&nbsp;Products
                </span>

                {/* PART 2: Contextual Sub-Header */}
                {/* Aggressively reduced mt-1.5 to mt-0 to force visual tightening */}
                <span className="block text-[28px] min-[391px]:text-[32px] md:text-[42px] font-medium md:font-medium min-[1440px]:!font-normal text-slate-900 mt-0 min-[391px]:mt-2 md:mt-2 leading-[1.05] min-[391px]:leading-[1.05] md:leading-[1.05] tracking-[-0.01em] min-[391px]:tracking-[-0.01em] md:tracking-[-0.01em] min-[1440px]:tracking-[-2px] md:-translate-y-[10%]">
                  sold across Canada
                </span>
              </h1>

              {/* Subtext - Reduced to mt-3 (12px) on all mobile sizes */}
              <p className="hero-subtitle mt-8 text-[16px] min-[391px]:text-[18px] md:text-[18px] font-normal md:font-normal leading-[22px] min-[391px]:leading-[28px] md:leading-[29px] min-[1440px]:leading-[28px] text-[#62748E] font-ui text-left tracking-[-0.31px] md:tracking-[-0.44px] max-w-[85%] md:max-w-[440px]">
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
              <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-3 md:gap-6 mt-10">
                <Link href="/map">
                  <Button className="group flex items-center justify-center h-[46px] bg-black text-white rounded-full px-6 text-[16px] font-semibold gap-1.5 font-ui shadow-none transition-all duration-300 ease-out hover:bg-[#1A1A1A] hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] tracking-[-0.3125px]">
                    {t('home.hero.explore') || 'Explore the Map'}
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/map" className="flex justify-center md:justify-start">
                  <Button className="flex items-center justify-center h-[46px] bg-white/10 backdrop-blur-md text-black border border-black/10 rounded-full px-6 text-[16px] font-medium gap-1.5 font-ui shadow-none hover:bg-gray-100 hover:text-black transition-all tracking-[-0.3125px]">
                    + Add a Store
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden md:flex w-full lg:w-1/2 order-2 justify-center">
            <div
              className="rounded-2xl md:rounded-[40px] overflow-hidden shadow-sm border border-gray-100 relative aspect-[4/3] max-h-[300px] lg:h-[384px] lg:max-h-[384px] min-[1440px]:h-[384px] min-[1440px]:max-h-none w-full max-w-[500px] lg:w-[512px] min-[1440px]:w-[636px] lg:max-w-none mx-auto min-[1440px]:aspect-auto"
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
