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
    <section id="how-it-works" className="py-40 md:py-48 font-sans overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Section Header - Tighter Gap */}
        <div className="mb-12 md:mb-16 max-w-4xl mx-auto flex flex-col gap-6 text-center items-center">
          <h2 className="text-[36px] font-semibold tracking-tight leading-[1.1] font-sans section-headline-reveal text-slate-900">
            How It Works
          </h2>
          <p className="subline font-ui max-w-2xl mx-auto">
            Find new locations, contribute findings, and share the project with others.
          </p>
        </div>

        {/* Steps Grid with Stagger Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 stagger-container">
          {/* Step 1 */}
          <div className="stagger-item group flex flex-col items-center bg-transparent px-6 pt-8 pb-0 h-full text-center">

            {/* Illustration - Centered Alignment */}
            <div className="h-[216px] w-full flex items-center justify-center overflow-hidden mb-6">
              <img
                src="/icon1.png"
                alt="Find Ukrainian products"
                className="max-h-full w-auto object-contain transform scale-105"
              />
            </div>

            {/* Label - Positioned Under Illustration */}
            {/* Label - Positioned Under Illustration */}
            <h5 className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-8 w-full flex items-center justify-center gap-2 font-sans">
              <Search size={16} strokeWidth={3} className="opacity-100 fill-none stroke-current" />
              {t('howItWorks.card1.title') || 'Find'}
            </h5>

            <p className="text-[16px] leading-[1.6] text-slate-600 w-full font-sans">
              Find authentic Ukrainian-made goods at local stores.
            </p>
          </div>

          <div className="stagger-item group flex flex-col items-center bg-transparent px-6 pt-8 pb-0 h-full text-center">

            {/* Illustration - Centered Alignment */}
            <div className="h-[216px] w-full flex items-center justify-center overflow-hidden mb-6">
              <img
                src="/icon2.png"
                alt="Add a store"
                className="max-h-full w-auto object-contain transform scale-105"
              />
            </div>

            {/* Label - Positioned Under Illustration */}
            {/* Label - Positioned Under Illustration */}
            <h5 className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-8 w-full flex items-center justify-center gap-2 font-sans">
              <PlusCircle size={16} strokeWidth={3} className="opacity-100 fill-none stroke-current" />
              {t('howItWorks.card2.title') || 'Add a store'}
            </h5>

            <p className="text-[16px] leading-[1.6] text-slate-600 w-full font-sans">
              Add stores you know of that sell goods made in Ukraine to help others discover them.
            </p>
          </div>

          <div className="stagger-item group flex flex-col items-center bg-transparent px-6 pt-8 pb-0 h-full text-center">

            {/* Illustration - Centered Alignment */}
            <div className="h-[216px] w-full flex items-center justify-center overflow-hidden mb-6">
              <img
                src="/icon3.png"
                alt="Spread the Word"
                className="max-h-full w-auto object-contain transform scale-105"
              />
            </div>

            {/* Label - Positioned Under Illustration */}
            {/* Label - Positioned Under Illustration */}
            <h5 className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-8 w-full flex items-center justify-center gap-2 font-sans">
              <Share2 size={16} strokeWidth={3} className="opacity-100 fill-none stroke-current" />
              {t('howItWorks.card3.title') || 'Spread the word'}
            </h5>

            <p className="text-[16px] leading-[1.6] text-slate-600 w-full font-sans">
              Share this map with your network to help support the mission of helping Ukraine.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
