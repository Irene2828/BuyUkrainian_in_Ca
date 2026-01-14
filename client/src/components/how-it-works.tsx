import { MapPin, Search, PlusCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import howItWorks1 from "@/assets/how-it-works-1.png";
import howItWorks2 from "@/assets/how-it-works-2-v2.png";
import howItWorks3 from "@/assets/how-it-works-3-v2.png";

export function HowItWorks() {
  const steps = [
    {
      title: "Discover",
      description: "Find authentic Ukrainian products at local Canadian retailers or online stores.",
      icon: Search
    },
    {
      title: "Add to Map",
      description: "Submit your favorite Ukrainian stores and products, and help others discover the treasures of Ukrainian culture.",
      icon: PlusCircle
    },
    {
      title: "Spread the Word",
      description: "Share this platform with your network and help others support the mission.",
      icon: MapPin
    }
  ];

  return (
    <section id="how-it-works" className="pt-12 pb-[100px] bg-white font-sans overflow-hidden">
      <div className="mx-auto px-4 md:px-16 max-w-[1440px] relative z-20">
        <div className="text-center mb-12">
          <h2 className="text-[var(--color-section-headline)] font-header section-headline-reveal tracking-tight">How it works</h2>
          <p className="text-[16px] md:text-[18px] text-gray-500 max-w-[900px] mx-auto font-ui mt-4 leading-relaxed">
            Our mission is to make it easy to find Ukrainian products across Canada,<br />
            from traditional foods and crafts to modern Ukrainian-made goods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* Image Container */}
              <div
                className={`w-full aspect-[4/3] rounded-2xl mb-6 overflow-hidden border-2 border-gray-200 flex items-center justify-center relative bg-white`}
              >
                {index === 0 && (
                  <img
                    src={howItWorks1}
                    alt="Discover Map"
                    className="w-[90%] h-auto object-contain"
                  />
                )}
                {index === 1 && (
                  <img
                    src={howItWorks2}
                    alt="Add to Map"
                    className="w-[80%] h-auto object-contain"
                  />
                )}
                {index === 2 && (
                  <img
                    src={howItWorks3}
                    alt="Spread the Word"
                    className="w-[80%] h-auto object-contain opacity-0"
                  />
                )}
              </div>

              {/* Icon + Title Row - Centered */}
              <div className="flex flex-row items-center justify-center gap-3 mb-3">
                <step.icon className="w-7 h-7 text-brand-blue-logo" />
                <h5 className="text-black font-header">{step.title}</h5>
              </div>

              <p className="text-[16px] text-gray-500 leading-relaxed font-normal font-ui">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button - Standardized size */}
        <div className="mt-8 mb-0 flex justify-center text-center">
          <Link
            href="/map"
            className="btn-cta inline-flex items-center justify-center bg-black text-white rounded-full h-[50px] py-3 pl-6 pr-7 text-[16px] font-semibold gap-3 font-ui shadow-lg"
          >
            Explore the Map <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
