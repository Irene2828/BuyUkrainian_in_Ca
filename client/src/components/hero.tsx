import { useState, useEffect, useRef } from "react";
import { ArrowRight, Info, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const [showNudge, setShowNudge] = useState(true);
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoHover = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleVideoLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
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
    <section className="relative z-10 w-full bg-[#F9FCD4] overflow-hidden font-sans py-20 md:py-20 min-h-[420px] flex flex-col justify-center animate-in fade-in duration-500">
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
                  <span className="text-[24px] md:text-[28px] font-medium font-instrument text-slate-900 leading-tight tracking-[-0.02em] mt-1">
                    sold across Canada
                  </span>
                </h1>

                {/* Subtext - Matching section subheaders */}
                <p className="hero-subtitle text-[16px] font-medium text-gray-600 font-sans text-left tracking-[-0.01em] leading-[26px] md:leading-[26px] max-w-[85%] md:max-w-[700px] mb-[32px]">
                  Support Ukraine's economy with every purchase. Find Ukrainian-made<br className="hidden md:block" />
                  goods in Canada — or help grow the map by adding new locations.
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
                      <button className="btn-premium-action gap-2 no-invert-hover">
                        {t('home.hero.explore') || "Explore the map"}
                        <svg
                          className="w-5 h-5"
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

                    <Link href="/map" className="group relative flex items-center justify-center h-[52px] px-6 !text-[16px] [&_*]:!text-[16px] font-medium text-slate-800 transition-transform duration-200 hover:text-[#111827] hover:scale-[1.02] gap-2 font-ui tracking-tight outline-none" style={{ fontSize: '16px' }}>
                      <Info className="w-5 h-5 !fill-none !stroke-current" strokeWidth={1.5} />
                      <span className="!text-[16px]" style={{ fontSize: '16px' }}>{t('home.hero.learnMore') || 'Learn More'}</span>
                      <span className="absolute bottom-[2px] left-6 right-6 h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visualization - Vertically Centered */}
            <div className="hidden md:flex w-full lg:w-1/2 order-2 justify-center items-center">
              <div className="w-full max-w-[500px] lg:w-[512px] min-[1440px]:w-[636px]">
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


    </section>
  );
}
