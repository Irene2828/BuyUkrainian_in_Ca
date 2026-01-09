import { MapPin, Search, PlusCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function HowItWorks() {
  const steps = [
    {
      title: "Find Locations",
      description: "Browse the map to discover stores, bakeries, and retail locations selling Ukrainian-made products across Canada.",
      icon: Search
    },
    {
      title: "Contribute Places",
      description: "Know a place that's not on the map yet? Add it! Upload photos and details to help the community grow.",
      icon: PlusCircle
    },
    {
      title: "Support Community",
      description: "Visit these businesses and support Ukrainian entrepreneurs and products in your local Canadian neighborhood.",
      icon: MapPin
    }
  ];

  return (
    <section id="how-it-works" className="py-12 md:py-20 bg-white font-sans overflow-hidden">
      <div className="mx-auto px-4 md:px-16 max-w-[1440px] relative z-20">
        <div className="text-center mb-8">
          <h2 className="text-[28px] md:text-[42px] font-medium mb-4 md:mb-6 text-[var(--color-section-headline)] font-header section-headline-reveal">How it works</h2>
          <p className="text-[16px] md:text-[18px] text-gray-500 max-w-[700px] mx-auto font-ui">
            Our mission is to build a comprehensive map of Ukrainian products in Canada.
            Join our community-driven initiative in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              {/* Placeholder - White fill with grey stroke */}
              <div className="w-full aspect-[4/3] bg-white rounded-[var(--radius-brand,40px)] mb-8 overflow-hidden border-2 border-gray-200">
              </div>

              {/* Icon Second - Scaled down */}
              <div className="mb-4 transition-transform group-hover:scale-110">
                <step.icon className="w-8 h-8 text-brand-blue-logo" />
              </div>

              <h3 className="text-[22px] font-medium mb-4 text-black font-header section-headline-reveal">{step.title}</h3>
              <p className="text-[16px] text-gray-500 leading-relaxed font-normal font-ui">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button - Black CTA changed to #D3E4FD fill */}
        <div className="mt-8 mb-0 flex justify-center text-center">
          <Link href="/map">
            <button className="px-12 h-[56px] bg-black text-white rounded-full font-medium text-[16px] hover:bg-black/90 transition-all flex items-center gap-3 shadow-sm font-ui border border-transparent hover:border-black/10">
              Explore the Map
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
