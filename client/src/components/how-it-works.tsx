import { Search, MapPin, Share2 } from 'lucide-react';
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      icon: Search,
      title: `${t("howItWorks.cards.discover.titleLine1") || "Looking for authentic products"} ${t("howItWorks.cards.discover.titleLine2") || "Made in Ukraine?"}`,
      text: t("howItWorks.cards.discover.text") || "Explore our verified directory to find what you need with instant directions.",
    },
    {
      icon: MapPin,
      title: `${t("howItWorks.cards.add.titleLine1") || "Found a new product"} ${t("howItWorks.cards.add.titleLine2") || "on the shelf?"}`,
      text: t("howItWorks.cards.add.text") || "Add it to the map. With less than two minutes of your time, you can help the map grow, and help Ukrainian companies sell products in Canada.",
    },
    {
      icon: Share2,
      title: `${t("howItWorks.cards.share.titleLine1") || "Want to help the Ukrainian"} ${t("howItWorks.cards.share.titleLine2") || "economy?"}`,
      text: t("howItWorks.cards.share.text") || "Share the map with your network via social media, word of mouth, email, or any other way possible. The more people that use the map, the more you help Ukrainian companies sell products in Canada.",
    },
  ];

  return (
    <section id="how-it-works" className="font-sans overflow-hidden bg-white md:bg-[linear-gradient(to_right,#FFD700_0%,#FFD700_38%,#0057B7_38%,#0057B7_100%)]">
      <div className="how-it-works-rail w-full flex flex-col md:flex-row">
        
        {/* Left Column: Yellow Block (Image) - 38% width */}
        <div className="how-it-works-image-panel w-full md:w-[38%] shrink-0 bg-[#FFD700] px-4 py-10 md:px-6 md:py-12 flex items-center justify-center min-h-[450px] md:min-h-[550px]">
          {/* White Photo Frame - Centered on mobile, shifted 50% left on desktop */}
          <div className="bg-white w-full max-w-xs sm:max-w-sm aspect-square p-6 md:p-8 shadow-sm border border-slate-100/50 flex items-center justify-center relative translate-x-0 md:-translate-x-12 overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src="/about_img_2.jpg" 
                  alt="Find Ukrainian products" 
                  className="how-it-works-img w-full h-full object-contain mix-blend-multiply scale-[1.55]"
                />
            </div>
          </div>
        </div>

        {/* Right Column: Blue Block (Text) - 62% width */}
        <div className="how-it-works-copy-panel w-full md:w-[62%] shrink-0 bg-[#0057B7] px-5 py-10 md:p-12 lg:p-16 flex flex-col gap-[53px] md:gap-[64px] justify-center items-center">
          {steps.map((step, index) => (
            <div
              key={index}
              className="w-full max-w-2xl z-10 relative flex items-start gap-6"
            >
              {/* Icon Wrapper */}
              <div className="shrink-0 pt-1">
                <step.icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              
              {/* Content */}
              <div className="text-reveal flex-1 flex flex-col pt-0.5 min-w-0" style={{ transitionDelay: `${index * 80}ms` }}>
                <h3 className="how-it-works-h3 text-white font-sans font-bold text-[19px] mb-1 leading-normal md:leading-tight w-full whitespace-normal tracking-[0.015em]">
                  {step.title}
                </h3>
                <p className="how-it-works-p text-white/85 font-medium text-[16px] leading-relaxed mt-1 md:mt-1.5">
                  {typeof step.text === 'string' 
                    ? step.text.split(/\b(Explore|Add|Share)\b/g).map((part, i) => 
                        /^(Explore|Add|Share)$/.test(part) ? <u key={i} className="underline decoration-[#FFD700] underline-offset-[3px] decoration-[1.5px]">{part}</u> : part
                      )
                    : step.text}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
