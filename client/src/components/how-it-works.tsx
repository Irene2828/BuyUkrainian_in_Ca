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
      text: (
        <>
          <strong 
            onClick={() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-semibold text-slate-900 hover:text-slate-600 transition-colors cursor-pointer inline-block"
          >
            Explore
          </strong> our <strong>verified directory</strong> to find exactly what you need with instant directions.
        </>
      )
    },
    {
      title: <>Found a new Ukrainian product<br />in a local store?</>,
      altText: "Found a new Ukrainian product in a local store?",
      icon: Plus,
      text: (
        <>
          <strong 
            onClick={() => window.dispatchEvent(new Event('openAddStore'))}
            className="font-semibold text-slate-900 hover:text-slate-600 transition-colors cursor-pointer inline-block"
          >
            Add it to the map.
          </strong> Two minutes of your time helps Ukrainian companies reach more Canadians.
        </>
      )
    },
    {
      title: <>Want to help the Ukrainian<br />economy grow?</>,
      altText: "Want to help the Ukrainian economy grow?",
      icon: Share2,
      text: (
        <>
          <strong 
            onClick={() => document.getElementById('share')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-semibold text-slate-900 hover:text-slate-600 transition-colors cursor-pointer inline-block"
          >
            Share the map
          </strong> with your network via social media, word of mouth, email, or any other way possible.
        </>
      )
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
    <section id="how-it-works" className="pt-[85px] pb-[85px] md:pt-[140px] md:pb-[140px] font-sans overflow-hidden bg-white">
      <div className="relative w-full h-full">
            <div className="max-w-6xl mx-auto w-full flex flex-col px-4 sm:px-6 lg:px-8">
            {/* Top: Centered Section Header */}
            <div className="w-full h-full flex flex-col items-center mb-10 md:mb-16 lg:mb-20">
              <h2 className="text-[31px] md:text-[41px] font-semibold font-['Lora'] tracking-tight leading-[1.1] section-headline-reveal text-slate-900 text-center">
                {t('howItWorks.title') || 'How it works'}
              </h2>
              <div className="w-16 h-1 bg-yellow-400 rounded-full mt-4 mx-auto" />
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

                    {/* Top Section: Icon Container */}
                    <div className="w-12 h-12 rounded-xl bg-transparent border border-[#0057B7] flex items-center justify-center text-[#0057B7] mb-6 shrink-0">
                       <step.icon 
                        className="w-6 h-6 antialiased"
                        strokeWidth={1}
                        aria-hidden="true"
                       />
                    </div>

                    {/* Bottom Section: Left-aligned ContentStack */}
                    <div className="flex flex-col items-start w-full">
                      <h3 className="text-slate-900 font-semibold text-lg tracking-tight leading-snug mb-4 text-left">
                        <span>{step.title}</span>
                      </h3>
                      <p className="text-slate-600/95 text-[15px] leading-relaxed font-ui w-full text-left">
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
