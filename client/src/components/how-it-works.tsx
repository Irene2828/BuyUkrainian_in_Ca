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
    <section id="how-it-works" className="pt-12 pb-[100px] bg-white font-sans overflow-hidden">
      <div className="mx-auto px-4 md:px-16 max-w-[1440px] relative z-20">
        <div className="text-center mb-12 md:mb-24">
          <h2 className="text-[28px] md:text-[42px] font-medium text-slate-900 tracking-tight leading-tight section-headline-reveal">{t('howItWorks.title') || 'How It Works'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center bg-white rounded-[32px] p-8 h-full"
            >
              {/* Image Container - Fixed height for vertical alignment */}
              <div
                className="w-full h-[240px] mb-6 flex items-center justify-center relative"
              >
                {index === 0 && (
                  <img
                    src={howItWorks1}
                    alt="Discover Map"
                    className="w-[100%] h-auto object-contain max-h-full"
                  />
                )}
                {index === 1 && (
                  <img
                    src={howItWorks2}
                    alt="Add to Map"
                    className="w-[90%] h-auto object-contain max-h-full"
                  />
                )}
                {index === 2 && (
                  <img
                    src={howItWorks2}
                    alt="Spread the Word"
                    className="w-[90%] h-auto object-contain opacity-100 max-h-full"
                  />
                )}
              </div>

              {/* Icon + Title Row - Centered - 80% opacity default, 100% on hover */}
              <div className="flex flex-row items-center justify-center gap-3 mb-3">
                <step.icon className="w-7 h-7 text-black" />
                <h5 className="text-black font-header">{step.title}</h5>
              </div>

              <p className="text-[16px] text-gray-500 leading-relaxed font-light font-ui max-w-[280px] mx-auto">
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
