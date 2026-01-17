import { MapPin, Search, PlusCircle, ArrowRight } from "lucide-react";
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
      icon: MapPin
    }
  ];

  return (
    <section id="how-it-works" className="pt-20 md:pt-[100px] pb-[100px] bg-white font-sans overflow-hidden">
      <div className="mx-auto px-4 md:px-16 max-w-[1440px] relative z-20">
        <div className="mb-8 md:mb-12 max-w-[700px] mx-auto px-4">
          <h2 className="text-[28px] md:text-[36px] font-bold tracking-tight leading-tight font-header section-headline-reveal text-left md:text-center">
            {t('howItWorks.title') || 'How It Works'}
          </h2>
          <p className="mt-6 text-[16px] md:text-[18px] font-normal text-gray-600 font-ui text-left md:text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-[-24px] md:mt-[-40px]">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center bg-white rounded-[32px] p-8 h-full"
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

              {/* Technical Label - Tight Snap */}
              <h5 className="text-[12px] md:text-[13px] font-bold uppercase tracking-[0.15em] text-slate-900 mt-4 mb-3">{step.title}</h5>

              <p className="text-[15px] leading-[1.6] text-slate-600 max-w-[280px] mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button - Standardized size */}
        <div className="mt-8 mb-0 flex justify-center text-center">
          <Link
            href="/map"
            className="btn-cta inline-flex items-center justify-center bg-black text-white rounded-full h-[46px] md:h-[52px] py-3 pl-6 pr-7 text-[16px] font-semibold gap-3 font-ui shadow-none hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
          >
            {t('home.hero.explore') || 'Explore the Map'} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
