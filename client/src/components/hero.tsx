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
          <div className="w-full lg:w-1/2 flex flex-col items-center md:items-start text-center md:text-left justify-center order-1">
            {/* Main Headline - Exact Typography */}
            <h1 className="hero-title premium-parallax-text w-full mb-4 text-[32px] min-[390px]:text-[36px] md:text-[48px] font-bold tracking-tight leading-[1.1] text-gray-900 antialiased whitespace-pre-wrap text-center md:text-left">
              <span className="hero-reveal-headline">
                {t('home.hero.title') || 'Find and Share Ukrainian\nProducts sold across Canada'}
              </span>
            </h1>

            {/* Subtext - Discovery & Contribution */}
            <p className="hero-subtitle mb-8 text-[16px] md:text-[18px] font-normal leading-relaxed text-slate-500 max-w-[500px] mx-auto md:mx-0 font-ui text-center md:text-left">
              {t('home.hero.subtitle') || 'Our mission is to make it easy to find Ukrainian products across Canada, from traditional foods and crafts to modern Ukrainian-made goods.'}
            </p>

            {/* Button Wrapper - Centered Mobile, Flush Left Desktop */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-10">
              <Link href="/map">
                <Button className="flex items-center justify-center h-[46px] md:h-[52px] bg-black text-white rounded-full px-7 text-[16px] font-semibold gap-3 font-ui shadow-none hover:bg-white hover:text-black hover:ring-1 hover:ring-black transition-all">
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
