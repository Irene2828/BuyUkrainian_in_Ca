import { useState, useEffect, useRef } from "react";
import { ArrowRight, HelpCircle, ChevronDown, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { MapPeek } from "@/components/ui/map-peek";

export function Hero() {
  const [showNudge, setShowNudge] = useState(true);
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoHover = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleVideoLeave = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

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
    <section className="relative z-10 w-full bg-[#F9FCD4] overflow-hidden font-sans pt-[65px] pb-[65px] flex flex-col justify-center animate-in fade-in duration-500">
      {/* Outer Wrapper: 1600px (matches global expansion) */}
      <div className="boutique-width w-full">
        {/* Inner Content Wrapper: Full Width to align with Header/Footer */}
        <div className="w-full">
          {/* Equilibrium Grid: Perfect Vertical Centering */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center w-full">

            {/* Left Column: Text Content - Vertically Centered */}
            <div className="w-full lg:w-1/2 flex flex-col items-start order-1">
              {/* Visual Grouping: Headline + Subtext + CTAs in One Container */}
              <div className="w-full max-w-4xl">
                {/* Main Headline - Structured for equal visual spacing */}
                <h1 className="text-slate-900 flex flex-col items-start max-w-full md:max-w-full md:mx-0 mb-[24px] opacity-90">
                  {/* Line 1 & 2 */}
                  <span className="text-[32px] md:text-[48px] font-bold md:font-semibold font-instrument tracking-[-0.025em] leading-[1] text-slate-900 block mb-[8px]">
                    Discover
                  </span>
                  <span className="text-[32px] md:text-[48px] font-bold md:font-semibold font-instrument tracking-[-0.025em] leading-[1] text-slate-900 block">
                    Ukrainian&nbsp;Products
                  </span>

                  {/* Line 3 - Visual continuation */}
                  <span className="text-[24px] md:text-[28px] font-medium font-instrument text-slate-900 leading-[1.4] tracking-[-0.02em] mt-1">
                    sold across Canada
                  </span>
                </h1>

                {/* Subtext - Matching section subheaders */}
                <p className="hero-subtitle text-[18px] font-medium text-slate-900/80 font-sans text-left tracking-[-0.01em] leading-[1.5] max-w-[85%] md:max-w-[600px] mb-[32px]">
                  {t('home.hero.subtitle')}
                </p>

                {/* Mobile-Only Cinematic Asset */}
                {/* Mobile Video */}
                <div className="block md:hidden w-full mt-6">
                  <div
                    className="relative w-full h-[320px] rounded-[32px] overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer"
                    onMouseEnter={handleVideoHover}
                    onMouseLeave={handleVideoLeave}
                  >
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center center' }}
                      preload="auto"
                      muted
                      loop
                      playsInline
                    >
                      <source src="/hero-video.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                {/* Button Group - Airy buffer from subheading */}
                <div className="w-full max-w-[500px]">
                  <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-3 md:gap-6">
                    <Link href="/map">
                      <MapPeek>
                        <button className="btn-premium-action gap-2 no-invert-hover">
                          <span>{t('home.hero.explore') || "Explore the map"}</span>
                          <MapPin className="w-5 h-5 opacity-90" strokeWidth={2} />
                        </button>
                      </MapPeek>
                    </Link>

                    <Link href="/#how-it-works" className="group relative flex items-center justify-center h-[52px] px-6 !text-[16px] [&_*]:!text-[16px] font-normal text-slate-800 transition-transform duration-200 hover:text-[#111827] hover:scale-[1.02] gap-2 font-ui tracking-tight outline-none" style={{ fontSize: '16px' }}>
                      <HelpCircle className="w-5 h-5 !fill-none !stroke-current" strokeWidth={1.5} />
                      <span className="!text-[16px] font-normal" style={{ fontSize: '16px' }}>{t('home.hero.learnMore') || 'How It Works'}</span>
                      <span className="absolute bottom-[2px] left-6 right-6 h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visualization - Vertically Centered */}
            <div className="hidden md:flex w-full lg:w-1/2 order-2 justify-end items-center">
              <div className="w-full max-w-[500px] lg:w-[512px]">
                {/* Video Container */}
                <div
                  className="relative w-full h-[336px] lg:h-[384px] rounded-[32px] overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer"
                  onMouseEnter={handleVideoHover}
                  onMouseLeave={handleVideoLeave}
                >
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center center' }}
                    preload="auto"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src="/hero-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section >
  );
}
