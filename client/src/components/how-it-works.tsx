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
    <section id="how-it-works" className="pt-[104px] pb-[80px] font-sans overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="boutique-width">
        {/* Section Header - Tighter Gap */}
        <div className="mb-12 max-w-4xl mx-auto flex flex-col gap-4 text-center items-center">

          <h2 className="text-[36px] font-semibold tracking-tight leading-[52.5px] font-sans section-headline-reveal text-slate-900 opacity-75">
            {t('howItWorks.title') || 'Purchase Here. Support Ukraine There'}
          </h2>
          <p className="subline max-w-2xl mx-auto">
            {t('howItWorks.subtitle') || "Help Ukraine's economy from where you are. Here's how:"}
          </p>
        </div>

        {/* Steps Grid with Stagger Animation */}
        {/* Feature Grid - Spatial Geometry */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 stagger-container w-full max-w-[1280px] min-[1537px]:max-w-[1440px] mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="stagger-item group flex flex-col items-center text-center px-4">

              {/* Large Illustration - Centered Alignment (Kept for visual balance) */}
              <div className="h-[234px] w-full flex items-center justify-center overflow-hidden mb-[27px]">
                <img
                  src={step.image}
                  alt={step.title}
                  className={`max-h-full w-auto object-contain transform ${index === 1 ? 'scale-[1.01]' : 'scale-[1.12]'}`}
                />
              </div>

              {/* Horizontal Header Row: Icon + Label - Centered */}
              <div className="flex items-center justify-center gap-3 mb-[28px] w-full">
                <step.icon size={20} strokeWidth={2} className="text-[#2D50A0]" />
                <h5 className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#2D50A0] font-sans">
                  {step.title}
                </h5>
              </div>

              {/* Centered Descriptions within Container */}
              <div className="flex flex-col items-center gap-2 mt-[6px] max-w-[300px] w-fit">
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
