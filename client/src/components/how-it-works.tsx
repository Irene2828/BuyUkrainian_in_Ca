import { MapPin, Search, PlusCircle, ArrowRight, Share2 } from "lucide-react";
import { Link } from "wouter";
import howItWorks1 from "@/assets/how-it-works-1.png";
import howItWorks2 from "@/assets/how-it-works-2-v2.png";
import howItWorks3 from "@/assets/how-it-works-3-v2.png";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      title: t('howItWorks.card1.title') || 'Discover',
      description: t('howItWorks.card1.desc') || 'Find authentic Ukrainian products at local Canadian retailers or online stores.',
      icon: Search
    },
    {
      title: t('howItWorks.card2.title') || 'Add to Map',
      description: t('howItWorks.card2.desc') || 'Submit your favorite Ukrainian stores and products, and help others discover the treasures of Ukrainian culture.',
      icon: PlusCircle
    },
    {
      title: t('howItWorks.card3.title') || 'Spread the Word',
      description: t('howItWorks.card3.desc') || 'Share this platform with your network and help others support the mission.',
      icon: Share2
    }
  ];

  return (
    <section id="how-it-works" className="pt-20 md:pt-[100px] pb-[100px] bg-white font-sans overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-20">
        <div className="mb-16 md:mb-24 w-full max-w-4xl mx-auto flex flex-col gap-3 text-center items-center">
          <h2 className="text-[28px] md:text-[36px] font-semibold tracking-tight leading-tight font-header section-headline-reveal text-slate-900">
            {t('howItWorks.title') || 'How It Works'}
          </h2>
          <p className="hero-subtitle text-[16px] min-[391px]:text-[18px] md:text-[18px] font-normal leading-[22px] min-[391px]:leading-[28px] md:leading-relaxed text-slate-500 font-ui tracking-[-0.31px] md:tracking-normal max-w-2xl text-center line-clamp-2 md:line-clamp-none">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 gap-y-12 md:gap-12 pt-0">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group flex flex-col items-center bg-white rounded-[32px] p-8 h-full"
            >
              {/* Disciplined Image Frame */}
              <div className="h-[200px] w-full flex items-center justify-center overflow-hidden mb-4">
                {index === 0 && (
                  <img
                    src={howItWorks1}
                    alt="Discover Map"
                    className="max-h-full w-auto object-contain transform scale-110"
                  />
                )}
                {index === 1 && (
                  <img
                    src={howItWorks2}
                    alt="Add to Map"
                    className="max-h-full w-auto object-contain transform scale-110"
                  />
                )}
                {index === 2 && (
                  <img
                    src={howItWorks2}
                    alt="Spread the Word"
                    className="max-h-full w-auto object-contain transform scale-110"
                  />
                )}
              </div>

              {/* Technical Label with Optical Glyph - Machined into UI */}
              <h5 className="text-[12px] md:text-[13px] font-bold uppercase tracking-[0.15em] text-slate-900 mt-4 mb-3 w-full flex items-center justify-center">
                <step.icon size={20} strokeWidth={1.5} className="mr-2 opacity-60" />
                {step.title}
              </h5>

              <p className="text-[16px] leading-[1.6] text-slate-600 max-w-[280px] md:mx-auto text-center w-full">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button - Standardized size */}
        <div className="mt-4 mb-0 flex justify-center text-center">
          <Link
            href="/map"
            className="btn-cta inline-flex items-center justify-center bg-black text-white rounded-full h-[46px] md:h-[52px] py-3 pl-6 pr-7 text-[16px] font-semibold gap-1.5 font-ui shadow-none hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
          >
            {t('home.hero.explore') || 'Explore the Map'} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
