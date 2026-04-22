import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Search, Plus, Share2 } from "lucide-react";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      title: <>Looking for authentic products<br />Made in Ukraine?</>,
      altText: "Looking for authentic products Made in Ukraine?",
      icon: Search,
      text: (<><strong>Explore</strong> our <strong>verified directory</strong> to find exactly what you need with instant directions.</>)
    },
    {
      title: <>Found a new Ukrainian product<br />in a local store?</>,
      altText: "Found a new Ukrainian product in a local store?",
      icon: Plus,
      text: (<><strong>Add it to the map.</strong> Two minutes of your time helps Ukrainian companies reach more Canadians.</>)
    },
    {
      title: <>Want to help the Ukrainian<br />economy grow?</>,
      altText: "Want to help the Ukrainian economy grow?",
      icon: Share2,
      text: (<><strong>Share the map</strong> with your network via social media, word of mouth, email, or any other way possible.</>)
    }
  ];

  // Grid Stagger Container
  const gridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.25,
      }
    }
  };

  const columnVariants = {
    hidden: {
      opacity: 0,
      y: 24
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  return (
    <section id="how-it-works" className="pt-[85px] pb-[52px] md:pt-[140px] md:pb-[88px] font-sans overflow-hidden bg-white">
      <div className="boutique-width relative w-full h-full">
            <div className="boutique-width w-full flex flex-col px-[22.8px] md:px-[38px] lg:px-[60.8px] min-[1280px]:max-[1669px]:px-[clamp(68.4px,4.75vw,87.4px)] min-[1670px]:px-[clamp(49.4px,3.42vw,68.4px)]">
            {/* Top: Centered Section Header */}
            <div className="w-full h-full flex flex-col items-center mb-7 md:mb-14 lg:mb-18">
              <h2 className="text-[31px] md:text-[41px] font-semibold font-['Lora'] tracking-tight leading-[1.1] section-headline-reveal text-slate-900 text-center">
                {t('howItWorks.title') || 'When to Use this Map'}
              </h2>
            </div>

            {/* Bottom: Steps Grid - Animated Stagger */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-12 lg:gap-x-20 w-full"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={gridVariants}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={columnVariants}
                  className="h-full"
                >
                  {/* Feature Card: Unified Container (Zero Padding for Flush Alignment) */}
                  <div className="group flex flex-col h-full bg-white transition-all duration-300">

                    {/* Top Section: Oversized Architectural Icon */}
                    <div className="w-full flex items-center justify-center mb-6 lg:mb-8 mt-2">
                       <step.icon 
                        className="h-[3.6rem] md:h-[4.4rem] lg:h-[5.2rem] w-auto text-slate-300/90 antialiased"
                        strokeWidth={0.75}
                        aria-hidden="true"
                       />
                    </div>

                    {/* Bottom Section: ContentStack (Centered Alignment for Icon Harmony) */}
                    <div className="flex flex-col items-center justify-center w-full">
                      <h3 className="text-slate-900 font-semibold text-[18px] min-h-[4.5rem] lg:min-h-[5rem] flex items-start justify-center text-center tracking-tight leading-relaxed w-full">
                        <span>{step.title}</span>
                      </h3>
                      <p className="text-slate-600/95 text-[16px] leading-relaxed font-ui w-full text-center max-w-[85%] mx-auto">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
        </div>
      </div>
    </section>
  );
}
