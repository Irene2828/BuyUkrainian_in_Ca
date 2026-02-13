import { MapPin, Search, PlusCircle, ArrowRight, Share2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      title: t('howItWorks.card1.title') || 'FIND STORES ON THE MAP',
      description: 'Search stores by location or product category;',
      icon: Search,
      image: "/icon1.png"
    },
    {
      title: t('howItWorks.card2.title') || 'ADD NEW LOCATIONS',
      description: 'Get store addresses, links to websites and main info about the products;',
      icon: PlusCircle,
      image: "/icon2.png"
    },
    {
      title: t('howItWorks.card3.title') || 'SHARE THE MAP',
      description: 'Make your future purchases with a benefit to Ukraine.',
      icon: Share2,
      image: "/icon3.png"
    }
  ];

  return (
    <section id="how-it-works" className="pt-[164px] pb-[110px] font-sans overflow-hidden bg-white">
      <div className="boutique-width">
        {/* Section Header - Tighter Gap */}
        <div className="mb-4 max-w-4xl mx-auto flex flex-col gap-6 text-center items-center">

          <h2 className="text-[41px] font-semibold tracking-tight leading-[1.2] font-sans section-headline-reveal text-slate-900 opacity-75">
            {t('howItWorks.title') || 'How to Use this Map'}
          </h2>
          <p className="text-[1.125rem] leading-[1.5] text-slate-500 font-medium max-w-[33.75rem] mx-auto tracking-[0.01em]">
            {t('howItWorks.subtitle') || "and help Ukraine's economy"}
          </p>
        </div>

        {/* Steps Grid with Stagger Animation */}
        {/* Feature Grid - Spatial Geometry - Spanning full boutique width */}
        <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 stagger-container w-full max-w-none mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="stagger-item group flex flex-col items-center text-center px-4">

              {/* Huge Illustration Zoom - Centered Alignment */}
              <div className="h-[340px] w-full flex items-center justify-center overflow-hidden mb-[27px]">
                <img
                  src={step.image}
                  alt={step.title}
                  className={`max-h-full w-auto object-contain transform ${index === 1 ? 'scale-[1.5]' : 'scale-[1.6]'}`}
                />
              </div>

              {/* Horizontal Header Row: Icon + Label - Centered */}
              <div className="flex items-center justify-center gap-3 mb-[28px] w-full">
                <step.icon size={26} strokeWidth={2} className="text-[#2D50A0]" />
                <h5 className="text-[14.4px] font-bold uppercase tracking-[0.05em] text-[#2D50A0]/60 font-sans">
                  {step.title}
                </h5>
              </div>

              {/* Centered Descriptions - Reverted to 16px */}
              <div className="flex flex-col items-center gap-2 mt-[6px] max-w-[320px] w-fit">
                {step.description.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                  <p key={i} className="text-[16px] leading-[1.6] text-slate-600 font-sans text-center m-0">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
