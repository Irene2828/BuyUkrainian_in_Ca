import { MapPin, Search, PlusCircle, ArrowRight, Share2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      title: t('howItWorks.card1.title') || 'Find',
      description: t('howItWorks.card1.desc') || 'Find authentic Ukrainian-made products at local retailers or online stores.',
      icon: Search
    },
    {
      title: t('howItWorks.card2.title') || 'Add a store',
      description: t('howItWorks.card2.desc') || 'Add your favorite Ukrainian stores and products, and help others find Ukrainian-made goods.',
      icon: PlusCircle
    },
    {
      title: t('howItWorks.card3.title') || 'Spread the word',
      description: t('howItWorks.card3.desc') || 'Share this map with your network and help others support the mission.',
      icon: Share2
    }
  ];

  return (
    <section id="how-it-works" className="pt-36 pb-32 md:pt-36 md:pb-32 bg-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header - Centered with Obsidian Breath */}
        <div className="mb-16 max-w-4xl mx-auto flex flex-col gap-3 text-center items-center">
          <h2 className="text-[36px] font-semibold tracking-tight leading-[52.5px] font-sans section-headline-reveal text-slate-900">
            How It Works
          </h2>
          <p className="text-[16px] md:text-[18px] font-normal md:leading-[29.3px] md:tracking-[-0.44px] text-gray-600 font-ui">
            Find new locations, contribute findings, and share the project with others.
          </p>
        </div>

        {/* Steps Grid with Stagger Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 stagger-container">
          {steps.map((step, index) => (
            <div
              key={index}
              className="stagger-item group flex flex-col items-center bg-white rounded-[32px] p-8 h-full"
            >
              {/* Disciplined Image Frame */}
              <div className="h-[200px] w-full flex items-end justify-center overflow-hidden mb-4">
                {index === 0 && (
                  <img
                    src="/icon1.png"
                    alt="Find Ukrainian products"
                    className="max-h-full w-auto object-contain transform scale-110"
                  />
                )}
                {index === 1 && (
                  <img
                    src="/icon2.png"
                    alt="Add a store"
                    className="max-h-full w-auto object-contain transform scale-110"
                  />
                )}
                {index === 2 && (
                  <img
                    src="/icon3.png"
                    alt="Spread the Word"
                    className="max-h-full w-auto object-contain transform scale-110"
                  />
                )}
              </div>

              {/* Technical Label with Optical Glyph - Machined into UI */}
              <h5 className="text-[12px] md:text-[13px] font-bold uppercase tracking-[0.15em] text-slate-900 mt-4 mb-3 w-full flex items-center justify-center">
                <step.icon size={20} strokeWidth={1.5} className="mr-2 opacity-60 fill-none stroke-current" />
                {step.title}
              </h5>

              <p className="text-[16px] leading-[1.6] text-slate-600 max-w-[280px] md:mx-auto text-center w-full">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button - Standardized size */}
        <div className="mt-4 mb-0 w-full flex justify-center text-center">
          <Link href="/map">
            <Button className="btn-premium-action bg-black text-white hover:bg-slate-900 group gap-1.5 font-ui shadow-none h-[46px] md:h-[52px] rounded-full px-7">
              <span>{t('home.hero.explore') || "Explore the map"}</span>
              <ArrowRight className="w-5 h-5 !fill-none !stroke-current transition-transform duration-300 group-hover:translate-x-1 mt-[1px]" strokeWidth={2} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
