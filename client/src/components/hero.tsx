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
    <section className="premium-parallax-hero relative w-full bg-[#FDFFD7] overflow-hidden font-sans border-b border-[#E6E6E6]/10">
      {/* Container with premium px-6 mobile padding */}
      <div className="mx-auto px-6 md:px-16 max-w-[1440px] py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center w-full">

          {/* Left Content - CENTERED on mobile, LEFT-ALIGNED on desktop */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center md:items-start md:text-left justify-center order-1">
            {/* Main Headline - LOCKED typography + tracking-tight for editorial look */}
            <h1 className={cn(
              "hero-title premium-parallax-text w-full mb-4 tracking-tight font-normal antialiased whitespace-pre-wrap",
              language === 'ua' ? "text-[32px] md:text-[56px]" : "" // Slightly smaller on mobile for UA if needed, though default handled by CSS usually
            )}>
              <span className="hero-reveal-headline">
                {t('home.hero.title')}
              </span>
            </h1>

            {/* Subtext - Discovery & Contribution */}
            <p
              className="font-ui hero-reveal-subtext premium-parallax-text w-full max-w-[700px] text-[16px] md:text-[18px] text-black/70 mt-6 mb-10 leading-[1.6] text-left antialiased"
            >
              {t('home.hero.subtitle')}
            </p>

            {/* CTA Stack - Fixed width button, 16px gap. Desktop: Side-by-side (Row) */}
            <div className="flex flex-col items-center md:flex-row md:items-center gap-4 hero-reveal-cta">
              <Link href="/map">
                <Button className="btn-cta bg-black text-white rounded-full py-3 pl-6 pr-7 h-[50px] text-[16px] font-semibold inline-flex items-center justify-center gap-3 font-ui shadow-lg">
                  {t('home.hero.explore')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="/#how-it-works">
                <button className="no-invert-hover flex items-center gap-2 text-[14px] md:text-[15px] font-medium text-black/70 hover:text-black transition-colors">
                  {t('header.howItWorks')}
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
