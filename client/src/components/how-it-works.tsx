import { MapPin, Search, PlusCircle, ArrowRight, Share2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      title: 'FIND STORES ON THE MAP',
      bullets: [
        'Search & filter stores by category or province.',
        'Get directions, website links and main store info instantly.'
      ],
      icon: Search,
      image: "/icon1.png"
    },
    {
      title: 'ADD NEW LOCATIONS',
      bullets: [
        'Found a new store in your town? Add it to the map.',
        'Every new pin keeps the map updated for all.'
      ],
      icon: PlusCircle,
      image: "/icon2.png"
    },
    {
      title: 'SHARE THE MAP',
      bullets: [
        'Help your friends discover Ukrainian products in Canada.',
        'Every share helps the mission to support Ukraine\'s economy'
      ],
      icon: Share2,
      image: "/icon3.png"
    }
  ];

  return (
    <section id="how-it-works" className="pt-[196px] pb-[132px] font-sans overflow-hidden bg-white">
      <div className="boutique-width">
        {/* Section Header - Tighter Gap */}
        <div className="mb-4 max-w-4xl mx-auto flex flex-col gap-6 text-center items-center">

          <h2 className="text-[41px] font-semibold tracking-tight leading-[1.2] font-sans section-headline-reveal text-slate-900 opacity-75">
            {t('howItWorks.title') || 'How to Use this Map'}
          </h2>

        </div>

        {/* Steps Grid with Stagger Animation */}
        {/* Feature Grid - Spatial Geometry - Spanning full boutique width */}
        <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 stagger-container w-full max-w-none mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="stagger-item group flex flex-col items-center text-center px-4">

              {/* Huge Illustration Zoom - Centered Alignment */}
              <div className="h-[340px] w-full flex items-center justify-center overflow-hidden mb-6">
                <img
                  src={step.image}
                  alt={step.title}
                  className={`max-h-full w-auto object-contain transform ${index === 1 ? 'max-[1440px]:scale-[1.35] scale-[1.5]' : 'max-[1440px]:scale-[1.45] scale-[1.6]'}`}
                />
              </div>

              {/* Horizontal Header Row: Icon + Label - Centered */}
              <div className="flex items-center justify-center gap-3 mb-[28px] w-full">
                <step.icon size={26} strokeWidth={2} className="text-[#2D50A0]/60" />
                <h5 className="font-bold uppercase tracking-[0.05em] text-[#2D50A0]/60 font-sans text-[14.4px] max-[1440px]:text-xs max-[1440px]:tracking-widest">
                  {step.title}
                </h5>
              </div>

              {/* Minimalist Bullet List - Aligned Start */}
              <div className="flex flex-col items-start gap-4 max-w-[320px] w-full text-left">
                {step.bullets.map((bullet, i) => (
                  <p key={i} className="font-ui m-0 text-[16px] leading-[1.6] text-slate-900/80">
                    - {bullet}
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
