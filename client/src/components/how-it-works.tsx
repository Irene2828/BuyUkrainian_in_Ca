import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Search, Plus, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      title: <>Looking for authentic products<br />Made in Ukraine?</>,
      altText: "Looking for authentic products Made in Ukraine?",
      icon: Search,
      accent: "#0057B7",
      text: (
        <>
          <strong 
            onClick={() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-medium text-slate-700 hover:text-slate-600 transition-colors cursor-pointer inline-block"
          >
            Explore
          </strong> our <strong className="font-medium text-slate-700">verified directory</strong> to find exactly what you need with instant directions.
        </>
      )
    },
    {
      title: <>Found a new Ukrainian product<br />in a local store?</>,
      altText: "Found a new Ukrainian product in a local store?",
      icon: Plus,
      accent: "#0057B7",
      text: (
        <>
          <strong 
            onClick={() => window.dispatchEvent(new Event('openAddStore'))}
            className="font-medium text-slate-700 hover:text-slate-600 transition-colors cursor-pointer inline-block"
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
      accent: "#0057B7",
      text: (
        <>
          <strong 
            onClick={() => document.getElementById('share')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-medium text-slate-700 hover:text-slate-600 transition-colors cursor-pointer inline-block"
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
    <section id="how-it-works" className="pb-16 md:pb-20 pt-0 font-sans overflow-hidden bg-white">
      <div className="relative w-full h-full">
            <div className="content-width flex flex-col">
            {/* Top: Centered Section Header */}
            <div className="w-full h-full flex flex-col items-center mb-10 md:mb-16 lg:mb-20">
              <h2 className="text-[31px] md:text-[41px] font-medium font-['Lora'] tracking-tight leading-[1.1] section-headline-reveal text-slate-950 text-center antialiased">
                {t('howItWorks.title') || 'How it works'}
              </h2>
            </div>

            {/* Bottom: Steps Grid - Animated Stagger */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-0 w-full"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={gridVariants}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={columnVariants}
                  className={cn(
                    "h-full relative",
                    index === 0 && "md:pr-8 lg:pr-12",
                    index === 1 && "md:px-8 lg:px-12",
                    index === 2 && "md:pl-8 lg:pl-12"
                  )}
                >
                  {index > 0 && (
                    <div className="hidden md:block absolute left-0 top-[5%] bottom-[5%] w-[2px] bg-[#FFD700] pointer-events-none" aria-hidden="true" />
                  )}
                  {/* Feature Card: Unified Container */}
                  <div className="group flex flex-col h-full bg-white transition-all duration-300 w-full">

                    {/* Top Section: Icon Container - Glass Effect */}
                    <div className="w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-md border border-[#0057B7]/25 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
                       <step.icon 
                        className="w-5 h-5 antialiased"
                        style={{ color: "#0057B7" }}
                        strokeWidth={2}
                        aria-hidden="true"
                       />
                    </div>

                    {/* Bottom Section: Left-aligned ContentStack */}
                    <div className="flex flex-col items-start w-full">
                      <h3 className="text-slate-800 font-medium text-lg tracking-tight leading-snug mb-4 text-left">
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
