import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Hero() {
  const [activeLayer, setActiveLayer] = useState<"main" | "secondary">("main");
  const { t } = useI18n();

  return (
    <section className="relative z-10 w-full bg-[#F9FCD4] overflow-hidden font-sans py-12 md:py-0 md:h-[528px] md:flex md:items-center animate-in fade-in duration-500">
      {/* The Stage: Golden Gutter Wrapper */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
        {/* Equilibrium Grid: Perfect Vertical Centering */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 min-[1440px]:gap-[148px] items-center w-full">

          {/* Left Column: Text Content - Vertically Centered */}
          <div className="w-full lg:w-1/2 flex flex-col items-start order-1">
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
                <span className="text-[24px] md:text-[28px] font-medium font-instrument text-slate-900 leading-tight tracking-[-0.02em] mt-[11px]">
                  sold across Canada
                </span>
              </h1>

              {/* Subtext - Matching section subheaders */}
              <p className="hero-subtitle text-[16px] font-medium text-gray-600 font-sans text-left tracking-[-0.01em] leading-[26px] md:leading-[26px] max-w-[85%] md:max-w-[700px] mb-[32px]">
                Support Ukraine with every purchase. Find Ukrainian-made goods <br className="hidden md:block" />
                in Canada — or help grow the map by adding a place you know.
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
                    <Button className="btn-premium-action bg-black text-white hover:bg-slate-900 group gap-1.5 font-ui shadow-none">
                      <span>{t('home.hero.explore') || "Explore the map"}</span>
                      <ArrowRight className="w-5 h-5 !fill-none !stroke-current transition-transform duration-300 group-hover:translate-x-1 mt-[1px]" strokeWidth={2} />
                    </Button>
                  </Link>

                  <Link href="/map" className="flex justify-center md:justify-start">
                    <Button className="inline-flex items-center justify-center h-[46px] md:h-[52px] bg-transparent text-black border-none rounded-full px-7 text-[16px] font-normal gap-1.5 font-ui shadow-none transition-colors duration-300 hover:bg-transparent tracking-[-0.3125px]">
                      <Info className="w-5 h-5 !fill-none !stroke-current" strokeWidth={2} />
                      {t('home.hero.learnMore') || 'Learn More'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visualization - Vertically Centered */}
          <div className="hidden md:flex w-full lg:w-1/2 order-2 justify-end">
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
    </section>
  );
}
