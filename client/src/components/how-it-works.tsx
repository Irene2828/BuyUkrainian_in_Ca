import { MapPin, Search, PlusCircle, ArrowRight, Share2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useI18n();

  const placeholderDesc = `- loren ipsumenr
- loren ipsum ipsumes
- loren ipsum ipsum`;

  const steps = [
    {
      title: t('howItWorks.card1.title') || 'FIND STORES',
      description: placeholderDesc,
      icon: Search,
      image: "/icon1.png"
    },
    {
      title: t('howItWorks.card2.title') || 'ADD NEW LOCATIONS',
      description: placeholderDesc,
      icon: PlusCircle,
      image: "/icon2.png"
    },
    {
      title: t('howItWorks.card3.title') || 'SHARE THE MAP',
      description: placeholderDesc,
      icon: Share2,
      image: "/icon3.png"
    }
  ];

  return (
    <section id="how-it-works" className="section-padding-airy font-sans overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="boutique-width">
        {/* Section Header - Tighter Gap */}
        <div className="mb-12 max-w-4xl mx-auto flex flex-col gap-4 text-center items-center">

          <h2 className="text-[36px] font-semibold tracking-tight leading-[52.5px] font-sans section-headline-reveal text-slate-900 opacity-75">
            {t('howItWorks.title') || 'When Every Purchase Has an Impact'}
          </h2>
          <p className="subline font-ui max-w-2xl mx-auto">
            {t('howItWorks.subtitle') || "The easiest way to support Ukraine's economy locally"}
          </p>
        </div>

        {/* Steps Grid with Stagger Animation */}
        {/* Feature Grid - Spatial Geometry */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 stagger-container text-center">
          {steps.map((step, index) => (
            <div key={index} className="stagger-item group flex flex-col items-center text-center">

              {/* Large Illustration - Centered Alignment */}
              <div className="h-[234px] w-full flex items-center justify-center overflow-hidden mb-[27px]">
                <img
                  src={step.image}
                  alt={step.title}
                  className={`max-h-full w-auto object-contain transform ${index === 1 ? 'scale-[1.01]' : 'scale-[1.12]'}`}
                />
              </div>

              {/* Horizontal Header Row: Icon + Label */}
              <div className="flex items-center justify-center gap-3 mb-[28px] w-full">
                <step.icon size={20} strokeWidth={2} className="text-slate-900" />
                <h5 className="text-[12px] font-bold uppercase tracking-[0.05em] text-slate-900 font-sans">
                  {step.title}
                </h5>
              </div>

              {/* Centered Descriptions - 3 Lines with standard text style */}
              <div className="w-full text-center flex flex-col items-center gap-1 mt-[10px]">
                {step.description.split('\n').map((line, i) => (
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
